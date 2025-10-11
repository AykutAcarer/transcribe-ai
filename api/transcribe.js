import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

// Using OpenAI integration blueprint for Whisper API
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({
    maxFileSize: 200 * 1024 * 1024, // 200 MB
    keepExtensions: true,
  });

  try {
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const audioReadStream = fs.createReadStream(file.filepath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "verbose_json",
    });

    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      transcription: {
        text: transcription.text,
        duration: transcription.duration || 0,
        language: transcription.language || "unknown",
        segments: transcription.segments || [],
      },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return res.status(500).json({
      error: error.message || "Transcription failed",
    });
  }
}
