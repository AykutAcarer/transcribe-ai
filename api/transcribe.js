import formidable from "formidable";
import fs from "fs";
import { AssemblyAI } from "assemblyai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const FORMIDABLE_OPTIONS = {
  maxFileSize: 500 * 1024 * 1024, // 500 MB
  allowEmptyFiles: false,
  keepExtensions: true,
};

const DEFAULT_CLIENT_OPTIONS = {
  pollingInterval: 4000,
  pollingTimeout: -1,
};

let assemblyClient;

const getAssemblyClient = () => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    throw new Error("AssemblyAI API key is not configured. Please set ASSEMBLYAI_API_KEY.");
  }

  if (!assemblyClient) {
    assemblyClient = new AssemblyAI({ apiKey });
  }

  return assemblyClient;
};

const parseJSON = (value, fallback) => {
  if (!value) return fallback;

  const raw = Array.isArray(value) ? value[0] : value;

  try {
    return typeof raw === "string" ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Failed to parse JSON field:", error);
    return fallback;
  }
};

const deriveClientOptions = (rawOptions = {}) => {
  const interval = Number(rawOptions.pollingInterval);
  const timeout = Number(rawOptions.pollingTimeout);

  return {
    ...DEFAULT_CLIENT_OPTIONS,
    ...(Number.isFinite(interval) ? { pollingInterval: interval } : {}),
    ...(Number.isFinite(timeout) ? { pollingTimeout: timeout } : {}),
  };
};

const buildPollingOptions = (clientOptions = DEFAULT_CLIENT_OPTIONS) => {
  const polling = {};

  if (clientOptions.pollingInterval > 0) {
    polling.pollingInterval = clientOptions.pollingInterval;
  }

  if (clientOptions.pollingTimeout >= 0) {
    polling.pollingTimeout = clientOptions.pollingTimeout;
  }

  return polling;
};

const normalizeFileField = (fileField) => {
  if (!fileField) return null;
  return Array.isArray(fileField) ? fileField[0] : fileField;
};
const secondsFromMs = (ms) => (typeof ms === "number" ? ms / 1000 : null);
const buildSegmentsFromWords = (words = [], transcriptText = "") => {
  if (!Array.isArray(words) || words.length === 0) return [];
  const segments = [];
  let buffer = [];
  let start = words[0]?.start ?? 0;

  words.forEach((word, index) => {
    const token = typeof word?.text === "string" ? word.text : "";
    if (token) buffer.push(token);
    const isBoundary = buffer.length >= 32 || index === words.length - 1;
    if (isBoundary) {
      const end = word?.end ?? start;
      segments.push({
        id: index,
        start: secondsFromMs(start) ?? 0,
        end: secondsFromMs(end) ?? secondsFromMs(start) ?? 0,
        text: buffer.join(" ").trim() || transcriptText || "",
        speaker: word?.speaker ?? null,
      });
      buffer = [];
      start = words[index + 1]?.start ?? end;
    }
  });
  return segments;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let tempFilePath;

  try {
    const assemblyai = getAssemblyClient();
    const form = formidable(FORMIDABLE_OPTIONS);

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fieldsResult, filesResult) => {
        if (err) reject(err);
        else resolve({ fields: fieldsResult, files: filesResult });
      });
    });

    const file = normalizeFileField(files.file);

    if (!file?.filepath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    tempFilePath = file.filepath;

    const {
      transcriptionOptions = {},
      clientOptions: rawClientOptions = {},
      featureSelections = {},
      metadata: incomingMetadata = {},
    } = parseJSON(fields.options, {});

    const clientOptions = deriveClientOptions(rawClientOptions);
    const pollingOptions = buildPollingOptions(clientOptions);

    const transcript = await assemblyai.transcripts.transcribe(
      {
        audio: tempFilePath,
        ...transcriptionOptions,
      },
      pollingOptions
    );

    const metadata = {
      ...incomingMetadata,
      originalFileName:
        file.originalFilename ?? file.newFilename ?? incomingMetadata.originalFileName ?? null,
      size: file.size ?? incomingMetadata.size ?? null,
    };

    const payload = {
  id: transcript.id,
  status: transcript.status,
  text: transcript.text ?? "",
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
  request_options: transcriptionOptions,
  client_options: clientOptions,
  feature_selections: featureSelections,
  metadata,
  raw: transcript,
};

// If AssemblyAI didn’t return pre-built segments, derive coarse segments from word timings (ms -> s)
if (!payload.segments && payload.words.length > 0) {
  payload.segments = buildSegmentsFromWords(payload.words, payload.text);
}
return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.error("AssemblyAI transcription error:", error);
    return res.status(500).json({
      error: error.message || "Transcription failed",
    });
  } finally {
    if (tempFilePath) {
      fs.promises
        .unlink(tempFilePath)
        .catch((cleanupError) => console.warn("Failed to remove temp file:", cleanupError));
    }
  }
}
