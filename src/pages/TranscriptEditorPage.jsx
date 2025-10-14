import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  DownloadCloud,
  Share2,
  Clipboard,
  Loader2,
  Sparkles,
  ListChecks,
  ShieldCheck,
  Bookmark,
  Music,
  Search,
  FileText,
  Clock3,
  Languages,
  GaugeCircle,
  Tag,
  Users,
  ArrowRightCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph as DocxParagraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { loadStoredTranscriptions, updateStoredTranscription } from '@/lib/transcriptionStorage';

/**
 * Convert words array to segments if segments are missing
 */
const convertWordsToSegments = (words = [], fullText = '') => {
  if (!words || words.length === 0) {
    if (fullText) {
      return [{
        text: fullText,
        start: 0,
        end: 0,
        confidence: 1.0
      }];
    }
    return [];
  }

  const segments = [];
  let currentSegment = {
    text: '',
    start: words[0].start,
    end: words[0].end,
    words: []
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];
    
    currentSegment.words.push(word.text);
    currentSegment.end = word.end;
    
    // Start new segment on: long pause, punctuation, or last word
    const hasLongPause = nextWord && (nextWord.start - word.end) > 1000;
    const hasPunctuation = word.text && /[.!?]$/.test(word.text.trim());
    const isLastWord = i === words.length - 1;
    
    if (hasLongPause || hasPunctuation || isLastWord) {
      segments.push({
        text: currentSegment.words.join(' '),
        start: currentSegment.start / 1000, // ms to seconds
        end: currentSegment.end / 1000,
        confidence: word.confidence || 0.9
      });
      
      if (nextWord) {
        currentSegment = {
          text: '',
          start: nextWord.start,
          end: nextWord.end,
          words: []
        };
      }
    }
  }

  return segments;
};

const REMOTE_MEDIA_DOC = 'https://www.assemblyai.com/docs/api-reference/upload';

const formatTimestamp = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return '00:00:00';
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${secs}`;
};

const toSeconds = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 0;
  // If value is large (>100), assume it's in milliseconds and convert
  // Otherwise it's already in seconds
  return value > 100 ? value / 1000 : value;
};

const summariseText = (summary) => {
  if (!summary) return '';
  if (typeof summary === 'string') return summary;

  if (Array.isArray(summary)) {
    return summary
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item?.text) return item.text;
        if (item?.summary) return item.summary;
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }

  if (typeof summary === 'object') {
    if (Array.isArray(summary?.summaries)) {
      return summary.summaries
        .map((entry) => entry?.text || entry?.summary || '')
        .filter(Boolean)
        .join(' ');
    }
    if (summary?.text) return summary.text;
  }

  return '';
};

const buildSrtFromSegments = (segments = []) =>
  segments
    .map((segment, index) => {
      const start = formatTimestamp(Math.floor(segment.start ?? 0));
      const end = formatTimestamp(Math.floor(segment.end ?? segment.start ?? 0));
      return `${index + 1}\n${start},000 --> ${end},000\n${segment.text?.trim() ?? ''}\n`;
    })
    .join('\n');

const buildVttFromSegments = (segments = []) => {
  const header = 'WEBVTT\n';
  const body = segments
    .map((segment) => {
      const start = formatTimestamp(Math.floor(segment.start ?? 0));
      const end = formatTimestamp(Math.floor(segment.end ?? segment.start ?? 0));
      return `${start}.000 --> ${end}.000\n${segment.text?.trim() ?? ''}\n`;
    })
    .join('\n');
  return `${header}\n${body}`;
};

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-full bg-gray-800/60 px-3 py-1 text-xs text-gray-200">
    <Icon className="h-3.5 w-3.5 text-purple-300" />
    <span className="font-medium text-white">{value || '—'} </span>
    <span className="text-gray-400">{label}</span>
  </div>
);

const InsightCard = ({ title, icon: Icon, children, description }) => (
  <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-6 backdrop-blur">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-white font-semibold">
          <Icon className="h-5 w-5 text-purple-300" />
          <span>{title}</span>
        </div>
        {description ? <p className="mt-1 text-xs text-gray-400">{description}</p> : null}
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);
const TranscriptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subtitleDownload, setSubtitleDownload] = useState(null);
  const [wordQuery, setWordQuery] = useState('');
  const [wordResults, setWordResults] = useState(null);
  const [wordLoading, setWordLoading] = useState(false);
  const [lemurInputs, setLemurInputs] = useState({
    summaryContext: '',
    questions: '',
    qaContext: '',
    taskPrompt: '',
    taskContext: ''
  });
  const [lemurOutput, setLemurOutput] = useState({
    summary: null,
    qa: null,
    task: null
  });
  const [lemurLoading, setLemurLoading] = useState(null);

  useEffect(() => {
    setLoading(true);
    const stored = loadStoredTranscriptions();
    const record = stored.find((entry) => entry.id === id);
    if (!record) {
      toast({
        title: 'Transkripsiyon bulunamadı',
        description: 'Kayıt yerel bellekte mevcut değil.',
        variant: 'destructive'
      });
      navigate('/transcriptions');
      return;
    }
    setTranscription(record);
    setLoading(false);
  }, [id, navigate]);

  const persistTranscriptionUpdate = useCallback((updater) => {
    setTranscription((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      updateStoredTranscription(prev.id, () => updated);
      return updated;
    });
  }, []);

  const assembly = transcription?.assemblyai ?? {};
  const transcriptText =
    transcription?.text ??
    assembly.text ??
    transcription?.transcript_text ??
    '';
  let segments =
  transcription?.segments ??
  assembly.segments ??
  assembly.transcript_json?.segments ??
  [];
  const paragraphs = assembly.paragraphs ?? [];
  const highlights = assembly.auto_highlights_result?.results ?? [];
  const sentiment = assembly.sentiment_analysis_results ?? [];
  const entities = assembly.entities ?? [];
  const contentSafety = assembly.content_safety_labels?.results ?? [];
  const iabCategories = assembly.iab_categories_result?.summary ?? [];
  const chapters = assembly.chapters ?? [];
  const subtitles = assembly.subtitles ?? {};
  const redactedAudio =
    assembly.redacted_audio ??
    (assembly.redacted_audio_url ? { redacted_audio_url: assembly.redacted_audio_url } : null);
  const featureSelections = transcription?.feature_selections ?? assembly.feature_selections ?? {};
  const requestOptions = assembly.request_options ?? {};

  // Build UI segments: prefer paragraphs, else segments, else derive from words or fallback to full text
  const uiSegments = useMemo(() => {
    if (Array.isArray(paragraphs) && paragraphs.length > 0) return paragraphs;
    if (Array.isArray(segments) && segments.length > 0) return segments;
    const baseWords = Array.isArray(assembly.words)
      ? assembly.words
      : Array.isArray(transcription?.words)
        ? transcription.words
        : [];
    return convertWordsToSegments(baseWords, transcriptText || '');
  }, [paragraphs, segments, assembly.words, transcription?.words, transcriptText]);

  const summaryText = useMemo(
    () => summariseText(transcription?.summary ?? assembly.summary),
    [assembly.summary, transcription?.summary]
  );

  const metaInfo = useMemo(() => {
    if (!transcription) {
      return [];
    }

    const meta = transcription.metadata ?? {};
    const durationInSeconds =
      meta.duration ??
      assembly.audio_duration ??
      transcription?.audio_duration ??
      (segments.length ? segments[segments.length - 1].end : null);

    const confidence =
      meta.confidence ??
      assembly.confidence ??
      (Array.isArray(segments) && segments.length > 0 ? assembly.confidence : null);

    const languageCode =
      meta.language_code ||
      assembly.language_code ||
      transcription.language_code ||
      '—';

    return [
      {
        label: 'Duration',
        value: durationInSeconds ? formatTimestamp(toSeconds(durationInSeconds)) : '—',
        icon: Clock3
      },
      {
        label: 'Language',
        value: typeof languageCode === 'string' ? languageCode.toUpperCase() : '—',
        icon: Languages
      },
      {
        label: 'Confidence',
        value: confidence ? `${(confidence * 100).toFixed(1)}%` : '—',
        icon: GaugeCircle
      },
      {
        label: 'Status',
        value: transcription.status,
        icon: Bookmark
      }
    ];
  }, [assembly, segments, transcription]);
  const handleCopyToClipboard = useCallback(() => {
    if (!transcriptText) return;
    navigator.clipboard
      .writeText(transcriptText)
      .then(() => toast({ title: 'Panoya kopyalandı!' }))
      .catch(() =>
        toast({
          title: 'Kopyalama başarısız',
          description: 'Metni kopyalamak için tarayıcı izinlerini kontrol edin.',
          variant: 'destructive'
        })
      );
  }, [transcriptText]);

  const downloadTXT = useCallback(() => {
    const blob = new Blob([transcriptText || ''], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${transcription?.file_name || 'transcription'}.txt`);
  }, [transcription?.file_name, transcriptText]);

  const downloadPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(16);
    doc.text(transcription?.file_name || 'Transkripsiyon', 10, 20);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(transcriptText || '', 180);
    doc.text(splitText, 10, 30);
    doc.save(`${transcription?.file_name || 'transcription'}.pdf`);
  }, [transcription?.file_name, transcriptText]);

  const downloadDOCX = useCallback(() => {
    const paragraphNodes = (paragraphs.length ? paragraphs : segments).map((segment) =>
      new DocxParagraph({
        children: [
          new TextRun({
            text: `[${formatTimestamp(toSeconds(segment.start))}] `,
            bold: true
          }),
          new TextRun(segment.text ?? '')
        ],
        spacing: { after: 200 }
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new DocxParagraph({
              children: [
                new TextRun({
                  text: transcription?.file_name || 'Transkripsiyon',
                  bold: true,
                  size: 32
                })
              ],
              spacing: { after: 400 }
            }),
            ...paragraphNodes
          ]
        }
      ]
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${transcription?.file_name || 'transcription'}.docx`);
    });
  }, [paragraphs, segments, transcription?.file_name]);
  const downloadSubtitle = useCallback(
    async (format) => {
      if (!transcription) return;
      const filename = `${transcription.file_name || 'transcription'}.${format}`;

      try {
        let content = subtitles[format];

        if (!content) {
          setSubtitleDownload(format);
          const response = await fetch(`/api/transcripts/${transcription.id}/subtitles?format=${format}`);
          if (!response.ok) {
            throw new Error(`Altyazı (${format}) alınamadı.`);
          }
          content = await response.text();
          persistTranscriptionUpdate((prev) => ({
            ...prev,
            assemblyai: {
              ...prev.assemblyai,
              subtitles: {
                ...(prev.assemblyai?.subtitles ?? {}),
                [format]: content
              }
            }
          }));
        }

        if (!content && format === 'srt') {
          content = buildSrtFromSegments(segments);
        }
        if (!content && format === 'vtt') {
          content = buildVttFromSegments(segments);
        }

        if (!content) {
          throw new Error('Altyazı içeriği oluşturulamadı.');
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
      } catch (error) {
        console.error('Subtitle download error:', error);
        toast({
          title: 'Altyazı indirilemedi',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setSubtitleDownload(null);
      }
    },
    [persistTranscriptionUpdate, segments, subtitles, transcription]
  );

  const handleWordSearch = useCallback(async () => {
    if (!transcription || !wordQuery.trim()) return;
    const terms = wordQuery
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (terms.length === 0) {
      toast({
        title: 'Kelime gerekli',
        description: 'Aramak istediğiniz kelimeleri virgülle ayırarak girin.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setWordLoading(true);
      const response = await fetch(`/api/transcripts/${transcription.id}/word-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: terms })
      });
      const data = await response.json();
      if (!response.ok || data?.success === false) {
        throw new Error(data.error || 'Kelime araması başarısız oldu.');
      }
      setWordResults(data.data || data);
    } catch (error) {
      console.error('Word search error:', error);
      toast({
        title: 'Kelime araması başarısız',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setWordLoading(false);
    }
  }, [transcription, wordQuery]);
  const runLemur = useCallback(
    async (mode) => {
      if (!transcription) return;
      try {
        setLemurLoading(mode);
        const payload = {
          mode,
          transcriptIds: [transcription.id]
        };

        if (mode === 'summary') {
          if (lemurInputs.summaryContext) {
            payload.context = lemurInputs.summaryContext;
          }
          if (requestOptions.summary_type) {
            payload.summary_type = requestOptions.summary_type;
          }
          if (requestOptions.summary_model) {
            payload.summary_model = requestOptions.summary_model;
          }
        } else if (mode === 'qa') {
          const questions = lemurInputs.questions
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
          if (!questions.length) {
            throw new Error('En az bir soru girin.');
          }
          payload.questions = questions;
          if (lemurInputs.qaContext) {
            payload.context = lemurInputs.qaContext;
          }
        } else if (mode === 'task') {
          if (!lemurInputs.taskPrompt.trim()) {
            throw new Error('Serbest istem için bir talimat girin.');
          }
          payload.prompt = lemurInputs.taskPrompt;
          if (lemurInputs.taskContext.trim()) {
            payload.context = lemurInputs.taskContext;
          }
        }

        const response = await fetch('/api/lemur', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data.error || 'LeMUR isteği başarısız oldu.');
        }

        const result = data.data || data;
        setLemurOutput((prev) => ({
          ...prev,
          [mode === 'task' ? 'task' : mode]: result
        }));

        toast({
          title: 'LeMUR sonucu hazır',
          description: 'AssemblyAI LeMUR isteğiniz tamamlandı.'
        });
      } catch (error) {
        console.error('LeMUR error:', error);
        toast({
          title: 'LeMUR isteği başarısız',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLemurLoading(null);
      }
    },
    [lemurInputs, requestOptions, transcription]
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!transcription) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Transkripsiyon - {transcription.file_name || 'Transcription'}</title>
        <meta
          name="description"
          content={`AssemblyAI ile işlenen ${transcription.file_name || 'bir dosya'} için transkripsiyon ve zekâ analizleri`}
        />
      </Helmet>

      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold gradient-text truncate">
                {transcription.file_name || 'Transkripsiyon'}
              </h1>
              <p className="text-sm text-gray-400">
                AssemblyAI ile analiz edilen dosyanız için tam transkript, özet ve güvenlik içgörüleri.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {metaInfo.map((item) => (
                  <MetaChip key={item.label} {...item} />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleCopyToClipboard}>
                <Clipboard className="w-4 h-4 mr-2" />
                Kopyala
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: 'Paylaşım yakında',
                    description: 'Bu özellik üzerinde çalışıyoruz.'
                  })
                }
              >
                <Share2 className="w-4 h-4 mr-2" />
                Paylaş
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Download className="w-4 h-4 mr-2" />
                    Dışa aktar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-effect">
                  <DropdownMenuItem onClick={downloadTXT}>.txt</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadSubtitle('srt')}>
                    {subtitleDownload === 'srt' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    .srt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadSubtitle('vtt')}>
                    {subtitleDownload === 'vtt' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    .vtt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadPDF}>.pdf</DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadDOCX}>.docx</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {redactedAudio?.redacted_audio_url ? (
                <Button
                  variant="outline"
                  onClick={() => window.open(redactedAudio.redacted_audio_url, '_blank')}
                >
                  <DownloadCloud className="w-4 h-4 mr-2" />
                  Redakte ses
                </Button>
              ) : null}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-6 backdrop-blur">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Transkript</h2>
                    <p className="text-xs text-gray-400">
                      Zaman damgalarını kullanarak konuşmanın belirli anlarına hızlıca ulaşın.
                    </p>
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-2">
                  {uiSegments.map((segment, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/5 bg-gray-900/60 p-4 hover:border-purple-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
                        <span>{formatTimestamp(toSeconds(segment.start))}</span>
                        {segment.speaker ? (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Users className="h-3.5 w-3.5" />
                            {segment.speaker}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm text-gray-200 leading-relaxed">{segment.text}</p>
                    </div>
                  ))}
                  {uiSegments.length === 0 && (
                    transcriptText ? (
                      <div className="rounded-xl border border-white/5 bg-gray-900/60 p-6">
                        <p className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{transcriptText}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-gray-900/40 py-12 text-gray-400">
                        <FileText className="h-10 w-10" />
                        <p>Metin bulunamadi.</p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-6 backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Search className="h-5 w-5 text-sky-300" />
                      Kelime araması
                    </h3>
                    <p className="text-xs text-gray-400">Anahtar kelimeleri virgülle ayırarak arayın.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="Örn. AssemblyAI, yapay zeka"
                      value={wordQuery}
                      onChange={(event) => setWordQuery(event.target.value)}
                    />
                    <Button onClick={handleWordSearch} disabled={wordLoading}>
                      {wordLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Ara
                    </Button>
                  </div>
                </div>
                {wordResults ? (
                  <div className="mt-4 space-y-3">
                    {wordResults.matches?.map((match) => (
                      <div
                        key={match.text}
                        className="rounded-xl border border-white/5 bg-gray-900/60 px-4 py-3 text-sm text-gray-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-white">{match.text}</span>
                          <span className="text-xs text-purple-300 font-medium">{match.count} eşleşme</span>
                        </div>
                        {match.timestamps?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {match.timestamps.slice(0, 5).map(([start]) => (
                              <span key={start} className="rounded-full bg-gray-800/60 px-2 py-1 text-xs text-gray-300">
                                {formatTimestamp(start / 1000)}
                              </span>
                            ))}
                            {match.timestamps.length > 5 ? (
                              <span className="text-xs text-gray-400">
                                +{match.timestamps.length - 5} zaman damgası
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">
                    Henüz bir arama yapmadınız. Lütfen yukarıdaki alana aramak istediğiniz kelimeleri girin.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <InsightCard
                title="Özet ve öne çıkanlar"
                icon={Sparkles}
                description="AssemblyAI tarafından oluşturulan hızlı özet ve anahtar ifadeler."
              >
                {summaryText ? (
                  <p className="text-sm text-gray-300 leading-relaxed">{summaryText}</p>
                ) : (
                  <p className="text-sm text-gray-500">Özet modeli etkin değil veya veri bulunamadı.</p>
                )}
                {highlights.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {highlights.slice(0, 15).map((item) => (
                      <span key={`${item.text}-${item.rank}`} className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-200">
                        {item.text}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(featureSelections)
                    .filter(([, enabled]) => enabled)
                    .map(([feature]) => (
                      <span key={feature} className="rounded-full bg-gray-800/60 px-2.5 py-1 text-2xs uppercase tracking-wide text-gray-400">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    ))}
                </div>
              </InsightCard>
              <InsightCard
                title="Duygu analizi"
                icon={ListChecks}
                description="Cümle bazında pozitif, negatif veya nötr duygu analizi."
              >
                {sentiment.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {sentiment.map((item, idx) => (
                      <div
                        key={`${item.text}-${idx}`}
                        className="rounded-lg border border-white/5 bg-gray-900/50 px-3 py-2 text-sm text-gray-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="pr-4">{item.text}</span>
                          <span
                            className={`text-xs font-semibold ${
                              item.sentiment === 'POSITIVE'
                                ? 'text-green-300'
                                : item.sentiment === 'NEGATIVE'
                                ? 'text-red-300'
                                : 'text-yellow-200'
                            }`}
                          >
                            {item.sentiment}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Duygu analizi etkin değil.</p>
                )}
              </InsightCard>

              <InsightCard
                title="Varlık tanıma"
                icon={Tag}
                description="Konuşmada geçen marka, kişi, yer gibi varlıklar."
              >
                {entities.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {entities.map((entity, idx) => (
                      <div
                        key={`${entity.entity_type}-${entity.text}-${idx}`}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-gray-900/50 px-3 py-2 text-sm text-gray-200"
                      >
                        <span>{entity.text}</span>
                        <span className="text-xs text-purple-300 font-semibold">{entity.entity_type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Varlık verisi bulunamadı.</p>
                )}
              </InsightCard>

              <InsightCard
                title="İçerik güvenliği & IAB kategorileri"
                icon={ShieldCheck}
                description="Zararlı içerik etiketleri ve konu başlıkları."
              >
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Güvenlik etiketleri</p>
                    {contentSafety.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {contentSafety.map((item, idx) => (
                          <div
                            key={`${item.label}-${idx}`}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-gray-900/50 px-3 py-2 text-sm text-gray-200"
                          >
                            <span>{item.label}</span>
                            <span className="text-xs text-red-300 font-semibold">%{(item.confidence * 100).toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">İçerik güvenliği etiketi yok.</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-2">IAB konu başlıkları</p>
                    {iabCategories.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {iabCategories.map((item, idx) => (
                          <div
                            key={`${item.label}-${idx}`}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-gray-900/50 px-3 py-2 text-sm text-gray-200"
                          >
                            <span>{item.label}</span>
                            <span className="text-xs text-sky-300 font-semibold">%{(item.score * 100).toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">IAB kategorisi bulunamadı.</p>
                    )}
                  </div>
                </div>
              </InsightCard>

              <InsightCard
                title="Bölümler"
                icon={Bookmark}
                description="Özetlenmiş başlıklarla otomatik bölümleme."
              >
                {chapters.length > 0 ? (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {chapters.map((chapter, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/5 bg-gray-900/50 p-4 text-sm text-gray-200 shadow-inner"
                      >
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium">
                          <span className="flex items-center gap-1 text-purple-300">
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            {formatTimestamp(chapter.start ?? 0)} - {formatTimestamp(chapter.end ?? 0)}
                          </span>
                          {chapter.headline ? <span>• {chapter.headline}</span> : null}
                        </div>
                        <p className="mt-2 leading-relaxed">{chapter.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Bölüm bilgisi bulunamadı.</p>
                )}
              </InsightCard>

              <div className="rounded-2xl border border-white/10 bg-gray-900/40 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-purple-300" />
                  AssemblyAI LeMUR Asistanı
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Transkripti özetlemek, farklı sorulara yanıt almak veya özel görevler üretmek için LeMUR’u kullanın.
                </p>
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="glass-effect p-1 grid grid-cols-3 mb-4">
                    <TabsTrigger value="summary">Özet</TabsTrigger>
                    <TabsTrigger value="qa">Soru-Cevap</TabsTrigger>
                    <TabsTrigger value="task">Serbest İstem</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="space-y-3">
                    <textarea
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                      placeholder="Ör. 'Teknik kararları vurgula ve aksiyon maddeleri üret.'"
                      value={lemurInputs.summaryContext}
                      onChange={(event) => setLemurInputs((prev) => ({ ...prev, summaryContext: event.target.value }))}
                    />
                    <Button onClick={() => runLemur('summary')} disabled={lemurLoading === 'summary'}>
                      {lemurLoading === 'summary' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Özet oluştur
                    </Button>
                    {lemurOutput.summary ? (
                      <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-sm text-gray-300">
                        {lemurOutput.summary.summaries ? (
                          <ul className="list-disc list-inside space-y-1">
                            {lemurOutput.summary.summaries.map((entry, idx) => (
                              <li key={idx}>{entry.text || entry.summary}</li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="whitespace-pre-wrap text-xs text-gray-300">
                            {JSON.stringify(lemurOutput.summary, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : null}
                  </TabsContent>
                  <TabsContent value="qa" className="space-y-3">
                    <textarea
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]"
                      placeholder={'Ör.\n• Toplantının ana kararları nelerdi?\n• Finans departmanı için aksiyon maddeleri nelerdir?'}
                      value={lemurInputs.questions}
                      onChange={(event) => setLemurInputs((prev) => ({ ...prev, questions: event.target.value }))}
                    />
                    <Input
                      placeholder="Ek bağlam (opsiyonel)"
                      value={lemurInputs.qaContext}
                      onChange={(event) => setLemurInputs((prev) => ({ ...prev, qaContext: event.target.value }))}
                    />
                    <Button onClick={() => runLemur('qa')} disabled={lemurLoading === 'qa'}>
                      {lemurLoading === 'qa' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Soruları yanıtla
                    </Button>
                    {lemurOutput.qa ? (
                      <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-sm text-gray-300 space-y-3">
                        {Array.isArray(lemurOutput.qa.answers) ? (
                          lemurOutput.qa.answers.map((answer, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="font-semibold text-white">{answer.question}</p>
                              <p>{answer.answer}</p>
                            </div>
                          ))
                        ) : (
                          <pre className="whitespace-pre-wrap text-xs text-gray-300">
                            {JSON.stringify(lemurOutput.qa, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : null}
                  </TabsContent>
                  <TabsContent value="task" className="space-y-3">
                    <textarea
                      className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[140px]"
                      placeholder="Ör. 'Transkripti 3 maddelik aksiyon planına dönüştür.'"
                      value={lemurInputs.taskPrompt}
                      onChange={(event) => setLemurInputs((prev) => ({ ...prev, taskPrompt: event.target.value }))}
                    />
                    <Input
                      placeholder="Ek bağlam (opsiyonel)"
                      value={lemurInputs.taskContext}
                      onChange={(event) => setLemurInputs((prev) => ({ ...prev, taskContext: event.target.value }))}
                    />
                    <Button onClick={() => runLemur('task')} disabled={lemurLoading === 'task'}>
                      {lemurLoading === 'task' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Görevi çalıştır
                    </Button>
                    {lemurOutput.task ? (
                      <div className="rounded-xl border border-white/10 bg-gray-900/50 p-4 text-sm text-gray-300">
                        {lemurOutput.task.response_text ? (
                          <pre className="whitespace-pre-wrap">{lemurOutput.task.response_text}</pre>
                        ) : (
                          <pre className="whitespace-pre-wrap text-xs text-gray-300">
                            {JSON.stringify(lemurOutput.task, null, 2)}
                          </pre>
                        )}
                      </div>
                    ) : null}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    </>
  );
};

export default TranscriptEditorPage;
