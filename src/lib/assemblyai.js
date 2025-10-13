// AssemblyAI client-side helpers (clean minimal module)

export const FEATURE_OPTION_TO_FLAG = {
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
  speech_threshold: 'speech_threshold',
};

export const DEFAULT_TRANSCRIPTION_OPTIONS = {
  language_detection: true,
  language_code: undefined,
  punctuate: true,
  format_text: true,
  dual_channel: false,
  speaker_labels: false,
  speakers_expected: undefined,
  disfluencies: false,
  filter_profanity: false,
  auto_highlights: false,
  sentiment_analysis: false,
  sentiment_analysis_threshold: undefined,
  entity_detection: false,
  content_safety: false,
  content_safety_ai_labs: false,
  iab_categories: false,
  auto_chapters: false,
  summarization: false,
  summary_model: 'informative',
  summary_type: 'bullets',
  summary_auto_chapters: false,
  word_boost: [],
  boost_param: undefined,
  custom_spelling: [],
  redact_pii: false,
  redact_pii_policies: [],
  redact_pii_audio: false,
  redact_pii_audio_quality: 'medium',
  audio_start_from: undefined,
  audio_end_at: undefined,
  speech_threshold: undefined,
};

export const DEFAULT_CLIENT_OPTIONS = {
  pollingInterval: 4000,
  pollingTimeout: -1,
  subtitleFormats: ['srt'],
  subtitleCharsPerCaption: 32,
};

const isPlainObject = (v) => Object.prototype.toString.call(v) === '[object Object]';

const toFiniteNumber = (v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const sanitizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)));
  }
  if (typeof value === 'string') {
    try {
      const tokens = value.replaceAll('\r', '').replaceAll('|', ',').split('\n').flatMap((l) => l.split(','));
      return sanitizeStringArray(tokens);
    } catch {
      return [];
    }
  }
  return [];
};

const sanitizeCustomSpelling = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const from = sanitizeStringArray(entry?.from ?? entry?.source ?? entry?.words);
      const to = typeof entry?.to === 'string' ? entry.to.trim() : '';
      if (!from.length || !to) return null;
      return { from, to };
    })
    .filter(Boolean);
};

const sanitizeSubtitleFormats = (formats) => {
  const allow = new Set(['srt', 'vtt', 'txt']);
  const list = Array.isArray(formats) ? formats : formats ? [formats] : [];
  const filtered = list.map((s) => String(s || '').trim().toLowerCase()).filter((s) => allow.has(s));
  return filtered.length ? Array.from(new Set(filtered)) : [...DEFAULT_CLIENT_OPTIONS.subtitleFormats];
};

const sanitizeTranscriptionOptions = (options = {}) => {
  const merged = { ...DEFAULT_TRANSCRIPTION_OPTIONS, ...(isPlainObject(options) ? options : {}) };

  merged.language_detection = merged.language_detection !== false;
  if (typeof merged.language_code === 'string') {
    const lc = merged.language_code.trim();
    merged.language_code = lc || undefined;
  } else if (merged.language_code == null) {
    merged.language_code = undefined;
  }
  if (merged.language_detection && merged.language_code) merged.language_detection = false;

  merged.word_boost = sanitizeStringArray(merged.word_boost);
  merged.custom_spelling = sanitizeCustomSpelling(merged.custom_spelling);
  merged.redact_pii_policies = sanitizeStringArray(merged.redact_pii_policies);

  const speakersExpected = toFiniteNumber(merged.speakers_expected);
  merged.speakers_expected = typeof speakersExpected === 'number' && speakersExpected >= 0 ? speakersExpected : undefined;

  const audioStart = toFiniteNumber(merged.audio_start_from);
  merged.audio_start_from = typeof audioStart === 'number' && audioStart >= 0 ? audioStart : undefined;

  const audioEnd = toFiniteNumber(merged.audio_end_at);
  merged.audio_end_at = typeof audioEnd === 'number' && audioEnd >= 0 ? audioEnd : undefined;

  const speechThreshold = toFiniteNumber(merged.speech_threshold);
  merged.speech_threshold = typeof speechThreshold === 'number' ? speechThreshold : undefined;

  const sentimentThreshold = toFiniteNumber(merged.sentiment_analysis_threshold);
  merged.sentiment_analysis_threshold = typeof sentimentThreshold === 'number' && sentimentThreshold >= 0 ? sentimentThreshold : undefined;

  if (typeof merged.boost_param !== 'string' || merged.boost_param.trim().length === 0) {
    merged.boost_param = undefined;
  } else {
    merged.boost_param = merged.boost_param.trim();
  }

  const quality = String(merged.redact_pii_audio_quality || '').trim().toLowerCase();
  merged.redact_pii_audio_quality = ['low', 'medium', 'high'].includes(quality) ? quality : 'medium';

  return merged;
};

const sanitizeClientOptions = (options = {}) => {
  const merged = { ...DEFAULT_CLIENT_OPTIONS, ...(isPlainObject(options) ? options : {}) };

  const pollingInterval = toFiniteNumber(merged.pollingInterval);
  merged.pollingInterval = typeof pollingInterval === 'number' && pollingInterval >= 0 ? pollingInterval : DEFAULT_CLIENT_OPTIONS.pollingInterval;

  const pollingTimeout = toFiniteNumber(merged.pollingTimeout);
  merged.pollingTimeout = typeof pollingTimeout === 'number' ? pollingTimeout : DEFAULT_CLIENT_OPTIONS.pollingTimeout;

  const charsPerCaption = toFiniteNumber(merged.subtitleCharsPerCaption);
  merged.subtitleCharsPerCaption = typeof charsPerCaption === 'number' && charsPerCaption > 0 ? charsPerCaption : DEFAULT_CLIENT_OPTIONS.subtitleCharsPerCaption;

  merged.subtitleFormats = sanitizeSubtitleFormats(merged.subtitleFormats);
  return merged;
};

export const deriveFeatureSelectionsFromOptions = (options = {}) => {
  if (!isPlainObject(options)) return {};
  const selections = {};
  Object.entries(FEATURE_OPTION_TO_FLAG).forEach(([optionKey, featureKey]) => {
    if (!(optionKey in options)) return;
    const v = options[optionKey];
    let on = false;
    if (['summary_type', 'summary_model', 'summary_auto_chapters'].includes(optionKey)) on = Boolean(options.summarization);
    else if (Array.isArray(v)) on = v.length > 0;
    else if (typeof v === 'string') on = v.trim().length > 0;
    else if (typeof v === 'number') on = Number.isFinite(v);
    else on = Boolean(v);
    selections[featureKey] = on;
  });
  return selections;
};

export const DEFAULT_ASSEMBLYAI_CONFIG = {
  transcriptionOptions: sanitizeTranscriptionOptions(DEFAULT_TRANSCRIPTION_OPTIONS),
  clientOptions: sanitizeClientOptions(DEFAULT_CLIENT_OPTIONS),
  featureSelections: deriveFeatureSelectionsFromOptions(DEFAULT_TRANSCRIPTION_OPTIONS),
};

export const normalizeAssemblyConfig = (config) => {
  if (!isPlainObject(config)) return { ...DEFAULT_ASSEMBLYAI_CONFIG };
  const transcriptionSource = config.transcriptionOptions ?? config.transcription_options ?? config.options ?? config.request_options ?? {};
  const clientSource = config.clientOptions ?? config.client_options ?? {};
  const transcriptionOptions = sanitizeTranscriptionOptions(transcriptionSource);
  const clientOptions = sanitizeClientOptions(clientSource);
  const featureSelections = { ...deriveFeatureSelectionsFromOptions(transcriptionOptions), ...(isPlainObject(config.featureSelections) ? config.featureSelections : {}) };
  return { transcriptionOptions, clientOptions, featureSelections };
};

const pruneTranscriptionOptions = (opts) => Object.entries(opts).reduce((acc, [k, v]) => {
  if (v === undefined || v === null) return acc;
  if (typeof v === 'string') { const t = v.trim(); if (!t) return acc; acc[k] = t; return acc; }
  if (Array.isArray(v)) { if (!v.length) return acc; acc[k] = v; return acc; }
  acc[k] = v; return acc;
}, {});

export const buildTranscriptionOptions = (config = {}) => {
  const normalized = normalizeAssemblyConfig(config);
  return {
    transcriptionOptions: pruneTranscriptionOptions(normalized.transcriptionOptions),
    clientOptions: { ...normalized.clientOptions },
    featureSelections: { ...normalized.featureSelections },
  };
};

export const parseWordBoostInput = (input) => {
  if (typeof input !== 'string') return [];
  const parts = input.replaceAll('\r', '').split('\n').flatMap((l) => l.split(',')).map((s) => s.trim()).filter(Boolean);
  return Array.from(new Set(parts));
};

export const parseCustomSpellingInput = (input) => {
  if (typeof input !== 'string') return [];
  const lines = input.replaceAll('\r', '').split('\n').map((l) => l.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    let idx = line.indexOf('=>');
    if (idx === -1) idx = line.indexOf('->');
    if (idx === -1) continue;
    const fromPart = line.slice(0, idx).trim();
    const toPart = line.slice(idx + 2).trim();
    const from = sanitizeStringArray(fromPart.replaceAll('|', ',').split(','));
    const to = toPart;
    if (from.length && to) out.push({ from, to });
  }
  return out;
};

export const parseRedactionPolicies = (input) => {
  if (typeof input !== 'string') return [];
  const parts = input.replaceAll('\r', '').split('\n').flatMap((l) => l.split(',')).map((s) => s.trim()).filter(Boolean);
  return Array.from(new Set(parts));
};

export const resolveTranscriptId = (payload) => {
  if (!payload) return null;
  if (typeof payload === 'string') return payload;
  if (payload.id) return payload.id;
  if (payload.transcript_id) return payload.transcript_id;
  if (payload.transcriptId) return payload.transcriptId;
  if (payload.assemblyai?.id) return payload.assemblyai.id;
  if (payload.assemblyai?.transcript_id) return payload.assemblyai.transcript_id;
  if (payload.raw?.id) return payload.raw.id;
  if (payload.metadata?.temporaryId) return payload.metadata.temporaryId;
  return null;
};

const pickAssemblyPayload = (record) => {
  if (record?.assemblyai && isPlainObject(record.assemblyai)) return { ...record.assemblyai };
  if (record?.raw && isPlainObject(record.raw)) return { ...record.raw };
  return isPlainObject(record) ? { ...record } : {};
};

export const normalizeLegacyTranscription = (record) => {
  if (!isPlainObject(record)) return record;
  const assemblyai = pickAssemblyPayload(record);
  const { options: recordOptions, metadata: recordMetadata, ...rest } = record;
  const { metadata: assemblyMetadata, request_options: assemblyRequest, client_options: assemblyClient } = assemblyai;

  const metadata = { ...(isPlainObject(assemblyMetadata) ? assemblyMetadata : {}), ...(isPlainObject(recordMetadata) ? recordMetadata : {}) };
  const optionsSource = recordOptions ?? { transcriptionOptions: assemblyRequest ?? {}, clientOptions: assemblyClient ?? {}, featureSelections: assemblyai.feature_selections ?? record.feature_selections ?? {} };
  const normalizedOptions = normalizeAssemblyConfig(optionsSource);
  const featureSelections = normalizedOptions.featureSelections;

  const transcriptId = rest.id ?? assemblyai.id ?? resolveTranscriptId(record) ?? resolveTranscriptId(assemblyai) ?? metadata.temporaryId ?? `transcript-${Date.now()}`;
  const createdAt = rest.created_at ?? metadata.uploadedAt ?? assemblyai.created_at ?? assemblyai.created ?? null;
  const fileName = rest.file_name ?? metadata.originalFileName ?? assemblyai.file_name ?? metadata.audioUrl ?? 'Untitled file';
  const duration = rest.duration ?? metadata.duration ?? assemblyai.audio_duration ?? assemblyai.duration ?? null;
  const confidence = rest.confidence ?? metadata.confidence ?? assemblyai.confidence ?? null;
  const languageCode = rest.language_code ?? metadata.language_code ?? assemblyai.language_code ?? null;

  const normalizedRecord = {
    ...rest,
    id: transcriptId,
    status: rest.status ?? assemblyai.status ?? 'processing',
    file_name: fileName,
    text: rest.text ?? assemblyai.text ?? '',
    summary: rest.summary ?? assemblyai.summary ?? null,
    duration,
    confidence,
    language_code: languageCode,
    feature_selections: featureSelections,
    metadata,
    created_at: createdAt,
    assemblyai: {
      ...assemblyai,
      id: transcriptId,
      metadata,
      request_options: normalizedOptions.transcriptionOptions,
      client_options: normalizedOptions.clientOptions,
      feature_selections: featureSelections,
    },
    options: normalizedOptions,
  };

  if (!normalizedRecord.segments && assemblyai.segments) normalizedRecord.segments = assemblyai.segments;
  if (!normalizedRecord.utterances && assemblyai.utterances) normalizedRecord.utterances = assemblyai.utterances;
  if (!normalizedRecord.words && assemblyai.words) normalizedRecord.words = assemblyai.words;

  return normalizedRecord;
};

export const createTranscriptionRecord = (apiPayload, localMeta = {}) => {
  const { options: localOptions, ...localMetadata } = isPlainObject(localMeta) ? localMeta : {};
  const apiMetadata = isPlainObject(apiPayload?.metadata) ? apiPayload.metadata : {};
  const metadata = { ...apiMetadata, ...localMetadata };

  const optionsSource = localOptions ?? { transcriptionOptions: apiPayload?.request_options ?? {}, clientOptions: apiPayload?.client_options ?? {}, featureSelections: apiPayload?.feature_selections ?? {} };
  const normalizedOptions = normalizeAssemblyConfig(optionsSource);

  const transcriptId = resolveTranscriptId(apiPayload) ?? metadata.temporaryId ?? `transcript-${Date.now()}`;

  const assemblyai = {
    ...(isPlainObject(apiPayload) ? apiPayload : {}),
    id: transcriptId,
    metadata,
    request_options: normalizedOptions.transcriptionOptions,
    client_options: normalizedOptions.clientOptions,
    feature_selections: normalizedOptions.featureSelections,
  };

  const record = {
    id: transcriptId,
    status: apiPayload?.status ?? 'processing',
    file_name: metadata.originalFileName ?? apiPayload?.file_name ?? metadata.audioUrl ?? 'Untitled file',
    text: apiPayload?.text ?? '',
    summary: apiPayload?.summary ?? null,
    duration: apiPayload?.audio_duration ?? metadata.duration ?? null,
    confidence: apiPayload?.confidence ?? metadata.confidence ?? null,
    language_code: apiPayload?.language_code ?? metadata.language_code ?? null,
    feature_selections: normalizedOptions.featureSelections,
    metadata,
    created_at: apiPayload?.created ?? metadata.uploadedAt ?? new Date().toISOString(),
    assemblyai,
    options: normalizedOptions,
  };

  if (apiPayload?.segments) record.segments = apiPayload.segments;
  if (apiPayload?.utterances) record.utterances = apiPayload.utterances;
  if (apiPayload?.words) record.words = apiPayload.words;

  return record;
};