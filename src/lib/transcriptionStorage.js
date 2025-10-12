import {
  createTranscriptionRecord,
  normalizeLegacyTranscription,
  resolveTranscriptId
} from '@/lib/assemblyai';

const STORAGE_KEY = 'transcriptions';

export function loadStoredTranscriptions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeLegacyTranscription(item));
  } catch (error) {
    console.warn('Transcription storage parse error:', error);
    return [];
  }
}

export function saveTranscriptions(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Transcription storage save error:', error);
  }
}

export function addTranscriptionFromApi(apiPayload, localMeta) {
  if (!apiPayload || typeof apiPayload !== 'object') {
    throw new Error('Invalid AssemblyAI response payload.');
  }
  const record = createTranscriptionRecord(apiPayload, localMeta);
  const current = loadStoredTranscriptions();

  const normalizedRecord = normalizeLegacyTranscription(record);
  const existingIndex = current.findIndex(
    (item) => resolveTranscriptId(item.assemblyai ?? item) === resolveTranscriptId(apiPayload)
  );
  if (existingIndex >= 0) {
    current.splice(existingIndex, 1);
  }

  current.unshift(normalizedRecord);
  saveTranscriptions(current);
  return normalizedRecord;
}

export function updateStoredTranscription(id, updater) {
  const items = loadStoredTranscriptions();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated = updater(items[index]);
  items[index] = normalizeLegacyTranscription(updated);
  saveTranscriptions(items);
  return items[index];
}

export function deleteTranscription(id) {
  const items = loadStoredTranscriptions();
  const filtered = items.filter((item) => item.id !== id);
  saveTranscriptions(filtered);
  return filtered;
}
