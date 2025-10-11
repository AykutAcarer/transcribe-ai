import express from 'express';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Using OpenAI integration blueprint for Whisper API
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post('/api/transcribe', async (req, res) => {
  const form = formidable({
    maxFileSize: 200 * 1024 * 1024,
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
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${file.originalFilename || file.newFilename}`);

    const audioReadStream = fs.createReadStream(file.filepath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    fs.unlinkSync(file.filepath);

    const transcriptText = transcription.text || transcription.segments?.map(s => s.text).join(' ') || '';

    return res.status(200).json({
      transcription: {
        text: transcriptText,
        transcript_text: transcriptText,
        segments: transcription.segments || [],
        transcript_json: {
          segments: transcription.segments || [],
        },
        duration: transcription.duration || 0,
        language: transcription.language || 'unknown',
      },
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Transcription failed',
    });
  }
});

app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
