export const createTranscriptionRecord = (apiPayload, localMeta = {}) => {
  const { options: localOptions, ...localMetadata } = isPlainObject(localMeta) ? localMeta : {};
  const apiMetadata = isPlainObject(apiPayload?.metadata) ? apiPayload.metadata : {};
  const metadata = { ...apiMetadata, ...localMetadata };

  const optionsSource = localOptions ?? {
    transcriptionOptions: apiPayload?.request_options ?? {},
    clientOptions: apiPayload?.client_options ?? {},
    featureSelections: apiPayload?.feature_selections ?? {}
  };

  const normalizedOptions = normalizeAssemblyConfig(optionsSource);

  const transcriptId =
    resolveTranscriptId(apiPayload) ??
    metadata.temporaryId ??
    generateLocalId();

  const assemblyai = {
    ...(isPlainObject(apiPayload) ? apiPayload : {}),
    id: transcriptId,
    metadata,
    request_options: normalizedOptions.transcriptionOptions,
    client_options: normalizedOptions.clientOptions,
    feature_selections: normalizedOptions.featureSelections
  };

  const record = {
    id: transcriptId,
    status: apiPayload?.status ?? 'processing',
    file_name:
      metadata.originalFileName ??
      apiPayload?.file_name ??
      metadata.audioUrl ??
      'Untitled file',
    text: apiPayload?.text ?? '',
    summary: apiPayload?.summary ?? null,
    duration: apiPayload?.audio_duration ?? metadata.duration ?? null,
    confidence: apiPayload?.confidence ?? metadata.confidence ?? null,
    language_code: apiPayload?.language_code ?? metadata.language_code ?? null,
    feature_selections: normalizedOptions.featureSelections,
    metadata,
    created_at: apiPayload?.created ?? metadata.uploadedAt ?? new Date().toISOString(),
    assemblyai,
    options: normalizedOptions
  };

  if (apiPayload?.segments) {
    record.segments = apiPayload.segments;
  }
  if (apiPayload?.utterances) {
    record.utterances = apiPayload.utterances;
  }
  if (apiPayload?.words) {
    record.words = apiPayload.words;
  }

  return record;
};


