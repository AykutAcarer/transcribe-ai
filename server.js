import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { AssemblyAI } from 'assemblyai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// In production use 5000, in development use 3001
const PORT = Number(process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3001));
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

const assemblyai = new AssemblyAI({
  apiKey: ASSEMBLYAI_API_KEY
});

app.use(express.json({ limit: '2mb' }));

const FORMIDABLE_OPTIONS = {
  maxFileSize: 500 * 1024 * 1024,
  allowEmptyFiles: false,
  keepExtensions: true
};

const DEFAULT_CLIENT_OPTIONS = {
  pollingInterval: 4000,
  pollingTimeout: -1,
  subtitleFormats: ['srt'],
  subtitleCharsPerCaption: 32
};

const SUBTITLE_FORMAT_WHITELIST = new Set(['srt', 'vtt', 'txt']);
const MEDIA_DOC_URL = 'https://www.assemblyai.com/docs/api-reference/upload';
const MEDIA_CONTENT_PREFIXES = ['audio/', 'video/'];
const MEDIA_EXTENSION_ALLOWLIST = new Set([
  'aac',
  'aiff',
  'flac',
  'm4a',
  'mp3',
  'ogg',
  'wav',
  'wma',
  'opus',
  'mp4',
  'mkv',
  'mov',
  'webm',
  'avi',
  'wmv',
  'm4v'
]);
const PROBE_TIMEOUT_MS = 10_000;

const FEATURE_FLAG_MAP = {
  auto_chapters: 'auto_chapters',
  auto_highlights: 'auto_highlights',
  content_safety: 'content_safety',
  iab_categories: 'iab_categories',
  entity_detection: 'entity_detection',
  sentiment_analysis: 'sentiment_analysis',
  summarization: 'summarization',
  summary_type: 'summarization',
  summary_model: 'summarization',
  summary_auto_chapters: 'summarization',
  speaker_labels: 'speaker_labels',
  speakers_expected: 'speaker_labels',
  dual_channel: 'dual_channel',
  punctuate: 'punctuate',
  format_text: 'format_text',
  filter_profanity: 'filter_profanity',
  disfluencies: 'disfluencies',
  word_boost: 'word_boost',
  boost_param: 'word_boost',
  custom_spelling: 'custom_spelling',
  redact_pii: 'redact_pii',
  redact_pii_audio: 'redact_pii_audio',
  redact_pii_policies: 'redact_pii',
  redact_pii_audio_quality: 'redact_pii_audio',
  language_detection: 'language_detection',
  language_code: 'language_code',
  sentiment_analysis_threshold: 'sentiment_analysis',
  content_safety_ai_labs: 'content_safety',
  audio_start_from: 'audio_trimming',
  audio_end_at: 'audio_trimming',
  speech_threshold: 'speech_threshold'
};

const LEMUR_MODE_MAP = {
  summary: 'summary',
  qa: 'questionAnswer',
  question_answer: 'questionAnswer',
  action_items: 'actionItems',
  task: 'task'
};

async function fetchWithTimeout(url, init = {}, timeoutMs = PROBE_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

function inferExtensionFromUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const pathname = parsed.pathname || '';
    const ext = pathname.split('.').pop();
    return ext ? ext.toLowerCase() : '';
  } catch (error) {
    return '';
  }
}

async function probeRemoteMedia(rawUrl) {
  let response;

  try {
    response = await fetchWithTimeout(rawUrl, { method: 'HEAD' });
  } catch (error) {
    return { ok: false, error: `URL erisilemedi: ${error.message}` };
  }

  if (!response.ok) {
    try {
      response?.body?.cancel?.();
    } catch {
      // ignore cleanup errors
    }

    try {
      response = await fetchWithTimeout(rawUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' }
      });
    } catch (error) {
      return { ok: false, error: `URL erisilemedi: ${error.message}` };
    }
  }

  if (!response.ok) {
    return { ok: false, status: response.status };
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  const isMediaType = MEDIA_CONTENT_PREFIXES.some((prefix) => contentType.startsWith(prefix));
  const contentLength = response.headers.get('content-length');
  const extension = inferExtensionFromUrl(rawUrl);
  const extensionLooksLikeMedia = MEDIA_EXTENSION_ALLOWLIST.has(extension);

  if (response.body) {
    try {
      await response.arrayBuffer();
    } catch {
      // ignore body read errors
    }
  }

  return {
    ok: true,
    status: response.status,
    contentType,
    contentLength: contentLength ? Number(contentLength) : null,
    isMediaType,
    extensionLooksLikeMedia
  };
}

function safeParseJSON(value, fallback) {
  if (!value || typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('JSON parse error:', error.message);
    return fallback;
  }
}

function parseForm(req) {
  const form = formidable(FORMIDABLE_OPTIONS);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

function pickFile(files) {
  if (!files) return null;
  const fileField = files.file ?? files.audio ?? null;
  if (!fileField) return null;
  if (Array.isArray(fileField)) return fileField[0];
  return fileField;
}

function normalizeSubtitleFormats(formats) {
  const formatList = Array.isArray(formats)
    ? formats
    : typeof formats === 'string'
      ? formats.split(',').map((item) => item.trim())
      : [];

  const filtered = formatList
    .map((format) => format.toLowerCase())
    .filter((format) => SUBTITLE_FORMAT_WHITELIST.has(format));

  return filtered.length > 0 ? Array.from(new Set(filtered)) : DEFAULT_CLIENT_OPTIONS.subtitleFormats;
}

function deriveClientOptions(rawOptions = {}) {
  const options = { ...DEFAULT_CLIENT_OPTIONS, ...rawOptions };
  if (typeof options.pollingInterval !== 'number' || Number.isNaN(options.pollingInterval)) {
    options.pollingInterval = DEFAULT_CLIENT_OPTIONS.pollingInterval;
  }
  if (typeof options.pollingTimeout !== 'number' || Number.isNaN(options.pollingTimeout)) {
    options.pollingTimeout = DEFAULT_CLIENT_OPTIONS.pollingTimeout;
  }
  options.subtitleFormats = normalizeSubtitleFormats(options.subtitleFormats);
  if (typeof options.subtitleCharsPerCaption !== 'number' || Number.isNaN(options.subtitleCharsPerCaption)) {
    options.subtitleCharsPerCaption = DEFAULT_CLIENT_OPTIONS.subtitleCharsPerCaption;
  }
  return options;
}

function deriveFeatureSelections(transcriptionOptions = {}, providedSelections = {}) {
  if (providedSelections && Object.keys(providedSelections).length > 0) {
    return providedSelections;
  }

  const selections = {};
  Object.entries(FEATURE_FLAG_MAP).forEach(([key, feature]) => {
    if (key in transcriptionOptions) {
      selections[feature] = Boolean(transcriptionOptions[key]);
    }
  });

  return selections;
}

function secondsFromMs(ms) {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return null;
  return ms / 1000;
}


function isTranscriptEmpty(transcript) {
  try {
    const text = (transcript?.text || '').trim();
    const words = Array.isArray(transcript?.words) ? transcript.words : [];
    return text.length === 0 && words.length === 0;
  } catch {
    return false;
  }
}function buildSegments(paragraphs, words, transcriptText) {
  if (Array.isArray(paragraphs) && paragraphs.length > 0) {
    return paragraphs.map((paragraph, index) => ({
      id: paragraph.id ?? index,
      start: secondsFromMs(paragraph.start) ?? 0,
      end: secondsFromMs(paragraph.end) ?? secondsFromMs(paragraph.start) ?? 0,
      text: paragraph.text ?? '',
      speaker: paragraph.speaker ?? paragraph.speaker_label ?? null,
      words: paragraph.words ?? []
    }));
  }

  if (Array.isArray(words) && words.length > 0) {
    const grouped = [];
    let buffer = [];
    let start = words[0]?.start ?? 0;

    words.forEach((word, index) => {
      buffer.push(word.text);
      const isGroupBoundary = buffer.length >= 32 || index === words.length - 1;
      if (isGroupBoundary) {
        const end = word.end ?? start;
        grouped.push({
          id: index,
          start: secondsFromMs(start) ?? 0,
          end: secondsFromMs(end) ?? secondsFromMs(start) ?? 0,
          text: buffer.join(' '),
          speaker: word.speaker ?? null
        });
        buffer = [];
        start = words[index + 1]?.start ?? end;
      }
    });

    return grouped;
  }

  if (transcriptText) {
    return [
      {
        id: 0,
        start: 0,
        end: null,
        text: transcriptText,
        speaker: null
      }
    ];
  }

  return [];
}

async function collectTranscriptExtras(transcriptId, clientOptions) {
  const extras = {};
  const tasks = [];

  tasks.push(
    assemblyai.transcripts
      .paragraphs(transcriptId)
      .then((response) => {
        extras.paragraphs = response?.paragraphs ?? [];
      })
      .catch((error) => {
        console.warn('Paragraphs fetch failed:', error.message);
      })
  );

  tasks.push(
    assemblyai.transcripts
      .sentences(transcriptId)
      .then((response) => {
        extras.sentences = response?.sentences ?? [];
      })
      .catch((error) => {
        console.warn('Sentences fetch failed:', error.message);
      })
  );

  clientOptions.subtitleFormats.forEach((format) => {
    tasks.push(
      assemblyai.transcripts
        .subtitles(transcriptId, format, clientOptions.subtitleCharsPerCaption)
        .then((subtitle) => {
          extras.subtitles = extras.subtitles ?? {};
          extras.subtitles[format] = subtitle;
        })
        .catch((error) => {
          console.warn(`Subtitle fetch failed for ${format}:`, error.message);
        })
    );
  });

  tasks.push(
    assemblyai.transcripts
      .redactedAudio(transcriptId)
      .then((response) => {
        extras.redactedAudio = response ?? null;
      })
      .catch(() => {
        extras.redactedAudio = null;
      })
  );

  await Promise.allSettled(tasks);
  return extras;
}

function buildTranscriptionPayload({
  finalTranscript,
  finalTranscriptionOptions,
  clientOptions,
  featureSelections,
  metadata,
  extras
}) {
  const paragraphs = extras.paragraphs ?? [];
  const sentences = extras.sentences ?? [];
  const segments = buildSegments(paragraphs, transcript.words, transcript.text);

  return {
    id: transcript.id,
    status: transcript.status,
    text: transcript.text ?? '',
    confidence: transcript.confidence ?? null,
    created: transcript.created ?? null,
    updated: transcript.updated ?? null,
    audio_duration: transcript.audio_duration ?? null,
    language_code: transcript.language_code ?? null,
    language_confidence: transcript.language_confidence ?? null,
    words: transcript.words ?? [],
    utterances: transcript.utterances ?? [],
    chapters: transcript.chapters ?? [],
    auto_highlights_result: transcript.auto_highlights_result ?? null,
    content_safety_labels: transcript.content_safety_labels ?? null,
    iab_categories_result: transcript.iab_categories_result ?? null,
    sentiment_analysis_results: transcript.sentiment_analysis_results ?? [],
    entities: transcript.entities ?? [],
    summary: transcript.summary ?? null,
    summary_auto_chapters: transcript.summary_auto_chapters ?? null,
    paragraphs,
    sentences,
    segments,
    subtitles: extras.subtitles ?? {},
    redacted_audio: extras.redactedAudio ?? null,
    request_options: finalTranscriptionOptions,
    client_options: clientOptions,
    feature_selections: featureSelections,
    metadata,
    raw: transcript
  };
}

function ensureAssemblyAIKey(res) {
  if (!ASSEMBLYAI_API_KEY) {
    res.status(500).json({
      error: 'AssemblyAI API anahtari bulunamadi. L�tfen .env dosyasina ASSEMBLYAI_API_KEY ekleyin.'
    });
    return false;
  }
  return true;
}

app.post('/api/transcribe', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  let uploadedFilePath;

  try {
    const { fields, files } = await parseForm(req);
    const file = pickFile(files);

    if (!file) {
      return res.status(400).json({ error: 'Y�klenecek bir dosya bulunamadi.' });
    }

    uploadedFilePath = file.filepath;

    const {
      transcriptionOptions = {},
      clientOptions: rawClientOptions = {},
      featureSelections = {},
      metadata = {}
    } = safeParseJSON(fields.options, {});

    const clientOptions = deriveClientOptions(rawClientOptions);
    const pollingOptions = {};

    if (clientOptions.pollingInterval > 0) {
      pollingOptions.pollingInterval = clientOptions.pollingInterval;
    }
    if (clientOptions.pollingTimeout >= 0) {
      pollingOptions.pollingTimeout = clientOptions.pollingTimeout;
    }

    console.log(
      `AssemblyAI transcription started for ${file.originalFilename || file.newFilename}`
    );

    const transcript = await assemblyai.transcripts.transcribe(
      {
        audio: uploadedFilePath,
        ...transcriptionOptions
      },
      pollingOptions
    );

    console.log(`AssemblyAI transcription completed: ${transcript.id}`);

    const extras = await collectTranscriptExtras(finalTranscript.id, clientOptions);
    const features = deriveFeatureSelections(finalTranscriptionOptions, featureSelections);

    const payload = buildTranscriptionPayload({
      finalTranscript,
      finalTranscriptionOptions,
      clientOptions,
      featureSelections: features,
      metadata: {
        ...metadata,
        originalFileName: file.originalFilename ?? metadata.originalFileName,
        size: file.size ?? metadata.size
      },
      extras
    });

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({
      error: error.message || 'Transkripsiyon sirasinda bir hata olustu.',
      details: error.response?.data ?? error.stack
    });
  } finally {
    if (uploadedFilePath) {
      fs.promises
        .unlink(uploadedFilePath)
        .catch((cleanupError) => console.warn('Dosya temizleme hatasi:', cleanupError.message));
    }
  }
});

app.post('/api/transcribe/url', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  try {
    const {
      audioUrl,
      transcriptionOptions = {},
      clientOptions: rawClientOptions = {},
      featureSelections = {},
      metadata = {}
    } = req.body ?? {};

    if (!audioUrl) {
      return res.status(400).json({ error: 'audioUrl alani zorunludur.' });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(audioUrl);
    } catch (parseError) {
      return res.status(400).json({ error: 'Ge�erli bir http veya https URL saglayin.' });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'URL yalnizca http veya https protokollerini destekler.' });
    }

    const probe = await probeRemoteMedia(audioUrl);
    if (!probe.ok) {
      const message = probe.error ? probe.error : `URL ${probe.status || ''} durum kodu d�nd�rd�.`;
      return res.status(400).json({
        error: `${message} L�tfen herkese a�ik olarak erisilebilen bir ses/video dosyasi kullanin. Daha fazla bilgi: ${MEDIA_DOC_URL}`
      });
    }

    if (!probe.isMediaType && !probe.extensionLooksLikeMedia) {
      return res.status(400).json({
        error: `Saglanan baglanti dogrudan bir ses/video dosyasina isaret etmiyor. AssemblyAI API'si, ${MEDIA_DOC_URL} adresinde belirtildigi gibi herkese a�ik erisilebilen medya URL'leri gerektirir.`,
        documentation: MEDIA_DOC_URL
      });
    }

    const clientOptions = deriveClientOptions(rawClientOptions);
    const pollingOptions = {};

    if (clientOptions.pollingInterval > 0) {
      pollingOptions.pollingInterval = clientOptions.pollingInterval;
    }
    if (clientOptions.pollingTimeout >= 0) {
      pollingOptions.pollingTimeout = clientOptions.pollingTimeout;
    }

    const transcript = await assemblyai.transcripts.transcribe(
      {
        audio: audioUrl,
        ...transcriptionOptions
      },
      pollingOptions
    );

    
    let finalTranscript = transcript;
    let finalTranscriptionOptions = transcriptionOptions;
    if (isTranscriptEmpty(finalTranscript) && (transcriptionOptions?.language_detection !== true)) {
      try {
        const fb = { ...transcriptionOptions };
        delete fb.language_code;
        fb.language_detection = true;
        console.log('Empty transcript from URL; retrying with language_detection=true');
        const retryUrl = await assemblyai.transcripts.transcribe(
          { audio: audioUrl, ...fb },
          pollingOptions
        );
        if (!isTranscriptEmpty(retryUrl)) {
          finalTranscript = retryUrl;
          finalTranscriptionOptions = fb;
        }
      } catch (e) {
        console.warn('URL fallback language detection retry failed:', e?.message || e);
      }
    }const extras = await collectTranscriptExtras(finalTranscript.id, clientOptions);
    const features = deriveFeatureSelections(finalTranscriptionOptions, featureSelections);

    const payload = buildTranscriptionPayload({
      finalTranscript,
      finalTranscriptionOptions,
      clientOptions,
      featureSelections: features,
      metadata: {
        ...metadata,
        source: 'url',
        audioUrl,
        remoteProbe: {
          contentType: probe.contentType,
          contentLength: probe.contentLength,
          status: probe.status
        }
      },
      extras
    });

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('URL transkripsiyon hatasi:', error);
    res.status(500).json({
      error: error.message || 'Transkripsiyon sirasinda bir hata olustu.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.get('/api/transcripts/:id', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const { id } = req.params;
  const clientOptions = deriveClientOptions(req.query ?? {});

  try {
    const transcript = await assemblyai.transcripts.get(id);
    if (!transcript) {
      return res.status(404).json({ error: 'Transcript bulunamadi.' });
    }

    const extras = await collectTranscriptExtras(id, clientOptions);
    const payload = buildTranscriptionPayload({
      finalTranscript,
      transcriptionOptions: {},
      clientOptions,
      featureSelections: deriveFeatureSelections({}, {}),
      metadata: { refreshedAt: new Date().toISOString() },
      extras
    });

    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Transcript fetch error:', error);
    res.status(500).json({
      error: error.message || 'Transcript bilgileri alinamadi.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.get('/api/transcripts/:id/subtitles', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const { id } = req.params;
  const format = (req.query.format ?? 'srt').toString().toLowerCase();
  const charsPerCaption = Number(req.query.charsPerCaption ?? DEFAULT_CLIENT_OPTIONS.subtitleCharsPerCaption);

  if (!SUBTITLE_FORMAT_WHITELIST.has(format)) {
    return res.status(400).json({ error: `Desteklenmeyen altyazi formati: ${format}` });
  }

  try {
    const subtitle = await assemblyai.transcripts.subtitles(id, format, charsPerCaption);
    res.type(format === 'txt' ? 'text/plain' : 'text/plain').send(subtitle);
  } catch (error) {
    console.error('Subtitle fetch error:', error);
    res.status(500).json({
      error: error.message || 'Altyazi olusturulamadi.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.get('/api/transcripts/:id/redacted-audio', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const { id } = req.params;

  try {
    const response = await assemblyai.transcripts.redactedAudio(id);
    if (!response?.redacted_audio_url) {
      return res.status(404).json({ error: 'Redakte edilmis ses bulunamadi.' });
    }

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Redacted audio fetch error:', error);
    res.status(500).json({
      error: error.message || 'Redakte edilmis ses alinamadi.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.post('/api/transcripts/:id/word-search', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const { id } = req.params;
  const { words } = req.body ?? {};

  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'words alani zorunludur ve en az bir kelime i�ermelidir.' });
  }

  try {
    const response = await assemblyai.transcripts.wordSearch(id, words);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Word search error:', error);
    res.status(500).json({
      error: error.message || 'Kelime aramasi basarisiz oldu.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.post('/api/lemur', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const {
    mode = 'task',
    transcriptIds,
    transcripts,
    inputText,
    questions,
    prompt,
    context,
    finalAnswerFormat,
    maxOutputTokens,
    temperature,
    ...rest
  } = req.body ?? {};

  const serviceMethod = LEMUR_MODE_MAP[mode] ?? LEMUR_MODE_MAP.task;

  if (!assemblyai.lemur?.[serviceMethod]) {
    return res.status(400).json({ error: `LeMUR modu desteklenmiyor: ${mode}` });
  }

  if (serviceMethod === 'questionAnswer' && (!Array.isArray(questions) || questions.length === 0)) {
    return res.status(400).json({ error: 'Soru-cevap modunda en az bir soru belirtmelisiniz.' });
  }

  const payload = {
    transcript_ids: Array.isArray(transcriptIds)
      ? transcriptIds
      : transcriptIds
        ? [transcriptIds]
        : undefined,
    transcripts: Array.isArray(transcripts) ? transcripts : undefined,
    input_text: inputText,
    questions,
    prompt,
    context,
    final_answer_format: finalAnswerFormat,
    max_output_tokens: maxOutputTokens,
    temperature,
    ...rest
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined || payload[key] === null) {
      delete payload[key];
    }
  });

  try {
    const result = await assemblyai.lemur[serviceMethod](payload);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('LeMUR error:', error);
    res.status(500).json({
      error: error.message || 'LeMUR istegi basarisiz oldu.',
      details: error.response?.data ?? error.stack
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server �alisiyor',
    service: 'AssemblyAI',
    hasAssemblyAiKey: Boolean(ASSEMBLYAI_API_KEY)
  });
});

app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// -----------------------------
// Minimal unified upload route
// -----------------------------

function sanitizeTranscriptionOptionsMinimal(input = {}) {
  const out = {};
  const b = (v) => (typeof v === 'boolean' ? v : undefined);
  const s = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const n = (v) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : undefined;
  };
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim()) : undefined);

  out.language_code = undefined;
  out.language_detection = true;

  // Core quality toggles
  out.punctuate = b(input.punctuate) !== undefined ? b(input.punctuate) : true;
  out.format_text = b(input.format_text) !== undefined ? b(input.format_text) : true;

  // Common features
  const keysBool = [
    'speaker_labels',
    'dual_channel',
    'disfluencies',
    'filter_profanity',
    'auto_highlights',
    'sentiment_analysis',
    'entity_detection',
    'content_safety',
    'iab_categories',
    'summarization',
    'summary_auto_chapters',
    'redact_pii',
    'redact_pii_audio'
  ];
  keysBool.forEach((k) => {
    const v = b(input[k]);
    if (v !== undefined) out[k] = v;
  });

  const keysNum = ['speakers_expected', 'audio_start_from', 'audio_end_at', 'speech_threshold'];
  keysNum.forEach((k) => {
    const v = n(input[k]);
    if (v !== undefined) out[k] = v;
  });

  const keysStr = ['summary_model', 'summary_type', 'boost_param', 'redact_pii_audio_quality'];
  keysStr.forEach((k) => {
    const v = s(input[k]);
    if (v !== undefined) out[k] = v;
  });

  const keysArr = ['word_boost', 'custom_spelling', 'redact_pii_policies'];
  keysArr.forEach((k) => {
    const v = arr(input[k]);
    if (v !== undefined) out[k] = v;
  });

  return out;
}

async function transcribeWithFallback(audio, opts, pollingOptions) {
  // first attempt
  let usedOpts = { ...opts };
  let result = await assemblyai.transcripts.transcribe({ audio, ...usedOpts }, pollingOptions);

  if (isTranscriptEmpty(result) && usedOpts.language_detection !== true) {
    try {
      const fb = { ...usedOpts };
      delete fb.language_code;
      fb.language_detection = true;
      const retry = await assemblyai.transcripts.transcribe({ audio, ...fb }, pollingOptions);
      if (!isTranscriptEmpty(retry)) {
        result = retry;
        usedOpts = fb;
      }
    } catch (e) {
      console.warn('Fallback language detection retry failed:', e?.message || e);
    }
  }

  return { transcript: result, usedOptions: usedOpts };
}

app.post('/api/assemblyai/transcribe', async (req, res) => {
  if (!ensureAssemblyAIKey(res)) return;

  const contentType = req.headers['content-type'] || '';
  const pollingOptions = {};

  try {
    if (contentType.includes('application/json')) {
      const { audioUrl, options: maybeOptions = {},
        clientOptions: rawClientOptions = {},
        metadata = {}
      } = req.body ?? {};

      if (!audioUrl || typeof audioUrl !== 'string') {
        return res.status(400).json({ error: 'audioUrl is required (string).' });
      }

      const clientOptions = deriveClientOptions(rawClientOptions || {});
      if (clientOptions.pollingInterval > 0) pollingOptions.pollingInterval = clientOptions.pollingInterval;
      if (clientOptions.pollingTimeout >= 0) pollingOptions.pollingTimeout = clientOptions.pollingTimeout;

      const sanitized = sanitizeTranscriptionOptionsMinimal(options || {});
      const { transcript, usedOptions } = await transcribeWithFallback(audioUrl, sanitized, pollingOptions);

      let segments = [];
      try {
        segments = buildSegments([], Array.isArray(transcript.words) ? transcript.words : [], transcript.text || '');
      } catch {}

      const payload = {
        id: transcript.id,
        status: transcript.status,
        text: transcript.text ?? '',
        confidence: transcript.confidence ?? null,
        audio_duration: transcript.audio_duration ?? null,
        language_code: transcript.language_code ?? null,
        language_confidence: transcript.language_confidence ?? null,
        words: Array.isArray(transcript.words) ? transcript.words : [],
        utterances: Array.isArray(transcript.utterances) ? transcript.utterances : [],
        auto_highlights_result: transcript.auto_highlights_result ?? null,
        content_safety_labels: transcript.content_safety_labels ?? null,
        iab_categories_result: transcript.iab_categories_result ?? null,
        chapters: transcript.chapters ?? [],
        summary: transcript.summary ?? null,
        summary_auto_chapters: transcript.summary_auto_chapters ?? null,
        request_options: usedOptions,
        client_options: clientOptions,
        metadata: { ...metadata, source: 'url', audioUrl },
        segments,
        raw: transcript
      };

      return res.status(200).json({ success: true, data: payload });
    }

    // multipart/form-data (file upload)
    const form = formidable(FORMIDABLE_OPTIONS);
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
    });

    const fileField = files.file ?? files.audio ?? null;
    const file = Array.isArray(fileField) ? fileField[0] : fileField;
    if (!file?.filepath) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const parsedOptions = (() => {
      const raw = fields.options;
      if (!raw) return {};
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(raw?.[0] || '{}');
      } catch {
        return {};
      }
    })();

    const { transcriptionOptions: tOpts = {}, options = {}, clientOptions: rawClientOptions = {}, metadata: incomingMeta = {} } = parsedOptions;
    const optsSource2 = (options && Object.keys(options).length) ? options : (tOpts || {});
    const clientOptions = deriveClientOptions(rawClientOptions || {});
    if (clientOptions.pollingInterval > 0) pollingOptions.pollingInterval = clientOptions.pollingInterval;
    if (clientOptions.pollingTimeout >= 0) pollingOptions.pollingTimeout = clientOptions.pollingTimeout;

    const sanitized = sanitizeTranscriptionOptionsMinimal(options || {});
    const { transcript, usedOptions } = await transcribeWithFallback(file.filepath, sanitized, pollingOptions);

    let segments = [];
    try {
      segments = buildSegments([], Array.isArray(transcript.words) ? transcript.words : [], transcript.text || '');
    } catch {}

    const payload = {
      id: transcript.id,
      status: transcript.status,
      text: transcript.text ?? '',
      confidence: transcript.confidence ?? null,
      audio_duration: transcript.audio_duration ?? null,
      language_code: transcript.language_code ?? null,
      language_confidence: transcript.language_confidence ?? null,
      words: Array.isArray(transcript.words) ? transcript.words : [],
      utterances: Array.isArray(transcript.utterances) ? transcript.utterances : [],
      auto_highlights_result: transcript.auto_highlights_result ?? null,
      content_safety_labels: transcript.content_safety_labels ?? null,
      iab_categories_result: transcript.iab_categories_result ?? null,
      chapters: transcript.chapters ?? [],
      summary: transcript.summary ?? null,
      summary_auto_chapters: transcript.summary_auto_chapters ?? null,
      request_options: usedOptions,
      client_options: clientOptions,
      metadata: {
        ...incomingMeta,
        originalFileName: file.originalFilename ?? incomingMeta.originalFileName ?? file.newFilename ?? null,
        size: file.size ?? incomingMeta.size ?? null,
        source: 'file'
      },
      segments,
      raw: transcript
    };

    try { await fs.promises.unlink(file.filepath); } catch {}
    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error('Unified upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload/transcription failed.' });
  }
});

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  
  // Handle React Router - serve index.html for all non-API routes
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

