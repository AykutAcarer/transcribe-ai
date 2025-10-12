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
  audio_start_from: 'audio_trimming',
  audio_end_at: 'audio_trimming',
  speech_threshold: 'speech_threshold'
};

export const DEFAULT_TRANSCRIPTION_OPTIONS = {
  punctuate: true,
  format_text: true,
  language_detection: true,
  language_code: '',
  speaker_labels: true,
  speakers_expected: '',
  dual_channel: false,
  disfluencies: false,
  filter_profanity: false,
  auto_highlights: true,
  sentiment_analysis: true,
  entity_detection: true,
  auto_chapters: true,
  summarization: true,
  summary_model: 'informative',
  summary_type: 'bullets',
  summary_auto_chapters: false,
  content_safety: true,
  iab_categories: true,
  word_boost: [],
  boost_param: 'default',
  custom_spelling: [],
  redact_pii: false,
  redact_pii_sub: false,
  redact_pii_policies: [],
  redact_pii_audio: false,
  redact_pii_audio_quality: 'medium',
  audio_start_from: '',
  audio_end_at: '',
  speech_threshold: ''
};

export const DEFAULT_CLIENT_OPTIONS = {
  pollingInterval: 4000,
  pollingTimeout: -1,
  subtitleFormats: ['srt'],
  subtitleCharsPerCaption: 32
};

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'on']);

export function parseBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normal = value.trim().toLowerCase();
    if (normal === '') return fallback;
    if (TRUTHY_STRINGS.has(normal)) return true;
    if (normal === 'false' || normal === '0' || normal === 'off' || normal === 'no') return false;
  }
  return fallback;
}

export function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function parseCommaSeparatedList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.toString().trim()).filter(Boolean);
  return value
    .toString()
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseWordBoostInput(value) {
  return parseCommaSeparatedList(value);
}

export function parseCustomSpellingInput(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return value
    .toString()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [fromPart, toPart] = line.split('=>').map((part) => part.trim());
      if (!fromPart || !toPart) return null;
      const from = fromPart.split(',').map((item) => item.trim()).filter(Boolean);
      if (from.length === 0) return null;
      return { from, to: toPart };
    })
    .filter(Boolean);
}

export function parseRedactionPolicies(value) {
  return parseCommaSeparatedList(value);
}

export function deriveFeatureSelectionsFromOptions(options = {}) {
  const featureSelections = {};

  Object.entries(FEATURE_OPTION_TO_FLAG).forEach(([optionKey, featureKey]) => {
    if (!(optionKey in options)) return;
    const value = options[optionKey];
    let enabled;

    if (Array.isArray(value)) {
      enabled = value.length > 0;
    } else if (typeof value === 'string') {
      enabled = value.trim() !== '' && value !== '0';
    } else {
      enabled = Boolean(value);
    }

    if (enabled) {
      featureSelections[featureKey] = true;
    } else if (featureSelections[featureKey] === undefined) {
      featureSelections[featureKey] = false;
    }
  });

  return featureSelections;
}

export function buildTranscriptionOptions({
  transcriptionOptions,
  clientOptions,
  featureSelections
}) {
  const normalizedOptions = { ...transcriptionOptions };

  if (normalizedOptions.language_code && normalizedOptions.language_code.toLowerCase() === 'auto') {
    normalizedOptions.language_code = '';
  }

  ['speakers_expected'].forEach((key) => {
    const numeric = parseNumber(normalizedOptions[key]);
    if (numeric === undefined) {
      delete normalizedOptions[key];
    } else {
      normalizedOptions[key] = numeric;
    }
  });

  const optionalFloatKeys = ['speech_threshold', 'audio_start_from', 'audio_end_at'];
  optionalFloatKeys.forEach((key) => {
    const numeric = parseNumber(normalizedOptions[key]);
    if (numeric === undefined) {
      delete normalizedOptions[key];
    } else {
      normalizedOptions[key] = numeric;
    }
  });

  if (typeof normalizedOptions.language_code === 'string' && normalizedOptions.language_code.trim() === '') {
    delete normalizedOptions.language_code;
  }

  if (
    Array.isArray(normalizedOptions.word_boost) &&
    normalizedOptions.word_boost.every((item) => item.trim().length === 0)
  ) {
    delete normalizedOptions.word_boost;
  }

  if (Array.isArray(normalizedOptions.custom_spelling) && normalizedOptions.custom_spelling.length === 0) {
    delete normalizedOptions.custom_spelling;
  }

  if (Array.isArray(normalizedOptions.redact_pii_policies) && normalizedOptions.redact_pii_policies.length === 0) {
    delete normalizedOptions.redact_pii_policies;
  }

  const payload = {
    transcriptionOptions: normalizedOptions,
    clientOptions,
    featureSelections
  };

  return payload;
}

export function resolveTranscriptId(payload) {
  return (
    payload?.id ??
    payload?.transcript_id ??
    payload?.raw?.id ??
    payload?.raw?.transcript_id ??
    null
  );
}

function generateFallbackId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const DEFAULT_ASSEMBLYAI_CONFIG = {
  transcriptionOptions: DEFAULT_TRANSCRIPTION_OPTIONS,
  clientOptions: DEFAULT_CLIENT_OPTIONS,
  featureSelections: deriveFeatureSelectionsFromOptions(DEFAULT_TRANSCRIPTION_OPTIONS)
};

export function normalizeAssemblyConfig(config = DEFAULT_ASSEMBLYAI_CONFIG) {
  return {
    transcriptionOptions: {
      ...DEFAULT_TRANSCRIPTION_OPTIONS,
      ...(config?.transcriptionOptions ?? {})
    },
    clientOptions: {
      ...DEFAULT_CLIENT_OPTIONS,
      ...(config?.clientOptions ?? {})
    },
    featureSelections: {
      ...deriveFeatureSelectionsFromOptions(DEFAULT_TRANSCRIPTION_OPTIONS),
      ...(config?.featureSelections ?? {})
    }
  };
}

export function createTranscriptionRecord(apiPayload, localMeta) {
  const transcriptId = resolveTranscriptId(apiPayload) ?? localMeta?.temporaryId ?? generateFallbackId();
  const createdAt = localMeta?.uploadedAt ?? new Date().toISOString();

  return {
    id: transcriptId,
    status: apiPayload.status,
    created_at: createdAt,
    file_name: localMeta?.originalFileName ?? localMeta?.fileName ?? apiPayload.metadata?.originalFileName ?? 'Untitled audio',
    duration: apiPayload.audio_duration,
    text: apiPayload.text,
    segments: apiPayload.segments,
    summary: apiPayload.summary,
    feature_selections: apiPayload.feature_selections ?? {},
    metadata: {
      ...localMeta,
      language_code: apiPayload.language_code,
      language_confidence: apiPayload.language_confidence,
      confidence: apiPayload.confidence
    },
    assemblyai: {
      ...apiPayload,
      id: transcriptId
    }
  };
}

export function normalizeLegacyTranscription(record) {
  if (!record || record.assemblyai) {
    return record;
  }

  const segments = record.segments || record.transcript_json?.segments || [];
  const transcriptionText = record.text || record.transcript_text || '';

  return {
    ...record,
    feature_selections: record.feature_selections || {},
    text: transcriptionText,
    segments,
    assemblyai: {
      id: record.id,
      status: record.status || 'completed',
      text: transcriptionText,
      segments,
      words: [],
      feature_selections: record.feature_selections || {},
      request_options: {},
      client_options: DEFAULT_CLIENT_OPTIONS,
      raw: {}
    }
  };
}
