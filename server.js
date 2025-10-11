import express from 'express';
import OpenAI from 'openai';
import formidable from 'formidable';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';
import { AssemblyAI } from 'assemblyai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// AssemblyAI client
const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// OpenAI client (yedek olarak kalsın)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());

app.post('/api/transcribe', async (req, res) => {
  const form = formidable({
    maxFileSize: 500 * 1024 * 1024, // 500 MB (AssemblyAI için artırıldı)
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

    const fileSizeMB = file.size / 1024 / 1024;
    console.log(`Processing file: ${file.originalFilename || file.newFilename}`);
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);

    // AssemblyAI ile transcribe et
    console.log('Starting transcription with AssemblyAI...');
    
    const transcript = await assemblyai.transcripts.transcribe({
      audio: file.filepath,
      language_code: 'tr', // Türkçe için, otomatik algılama için bu satırı silin
      speaker_labels: true, // Konuşmacı tanıma
      punctuate: true, // Noktalama işaretleri
      format_text: true // Metin formatlama
    });

    console.log('Transcription completed');

    // Geçici dosyayı sil
    fs.unlinkSync(file.filepath);

    // AssemblyAI formatından projenizin formatına dönüştürün
    const segments = transcript.words ? transcript.words.map((word, index) => ({
      id: index,
      start: word.start / 1000, // millisaniye'den saniye'ye
      end: word.end / 1000,
      text: word.text,
      speaker: word.speaker || null
    })) : [];

    const transcriptText = transcript.text || '';

    return res.status(200).json({
      transcription: {
        text: transcriptText,
        transcript_text: transcriptText,
        segments: segments,
        transcript_json: {
          segments: segments,
        },
        duration: transcript.audio_duration || 0,
        language: transcript.language_code || 'unknown',
        confidence: transcript.confidence || 0
      },
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Geçici dosyayı sil (hata durumunda)
    try {
      const file = files?.file?.[0] || files?.file;
      if (file && fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return res.status(500).json({
      error: error.message || 'Transcription failed',
      details: error.toString()
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    service: 'AssemblyAI'
  });
});

app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});