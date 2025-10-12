import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Search, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { loadStoredTranscriptions, deleteTranscription } from '@/lib/transcriptionStorage';

const FEATURE_LABELS = {
  summarization: 'Özet',
  auto_highlights: 'Anahtar ifadeler',
  sentiment_analysis: 'Duygu analizi',
  entity_detection: 'Varlık tanıma',
  content_safety: 'Güvenlik',
  iab_categories: 'IAB',
  auto_chapters: 'Bölümler',
  speaker_labels: 'Konuşmacılar',
  dual_channel: 'Çift kanal',
  redact_pii: 'PII',
  redact_pii_audio: 'PII Ses',
  word_boost: 'Boost',
  custom_spelling: 'Özel yazım'
};

const formatDuration = (seconds) => {
  if (!seconds || Number.isNaN(Number(seconds))) return '—';
  const totalSeconds = Math.round(Number(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
};

const summariseText = (summary) => {
  if (!summary) return '';

  if (typeof summary === 'string') {
    return summary;
  }

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

const TranscriptionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const stored = loadStoredTranscriptions();
    setTranscriptions(stored);
    setLoading(false);
  }, []);

  const handleDelete = async (id) => {
    const updatedTranscriptions = deleteTranscription(id);
    setTranscriptions(updatedTranscriptions);
    toast({ title: 'Transkripsiyon silindi' });
  };

  const filteredTranscriptions = transcriptions.filter(t => {
    const haystack = `${t.file_name ?? ''} ${t.text ?? ''}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  const statusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Transcriptions - TranscribeAI</title>
        <meta name="description" content="View and manage your transcriptions." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold gradient-text">My Transcriptions</h1>
            <p className="text-gray-400 text-sm mt-1">These are stored in your browser. Clearing your browser data will remove them.</p>
          </motion.div>

          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transcriptions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl border border-white/10 min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTranscriptions.map((item, index) => {
                  const activeFeatures = Object.entries(item.feature_selections || {})
                    .filter(([, value]) => Boolean(value))
                    .map(([key]) => FEATURE_LABELS[key] ?? key);
                  const summarySnippet = summariseText(item.summary ?? item.assemblyai?.summary);
                  const durationLabel = formatDuration(item.duration ?? item.assemblyai?.audio_duration);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-800/50 p-5 rounded-xl hover:bg-gray-800/80 transition-colors space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div
                          className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(`/transcript/${item.id}`)}
                        >
                          <FileText className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                          <div className="min-w-0 space-y-1">
                            <p className="font-semibold text-white truncate">{item.file_name || 'Adsız dosya'}</p>
                            <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
                              <span>{formatDate(item.created_at)}</span>
                              <span>•</span>
                              <span>{durationLabel}</span>
                              {item.metadata?.language_code && (
                                <>
                                  <span>•</span>
                                  <span>{item.metadata.language_code.toUpperCase()}</span>
                                </>
                              )}
                            </div>
                            {summarySnippet && (
                              <p className="text-sm text-gray-300 line-clamp-2 pt-1">{summarySnippet}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(item.status)}`}>
                            {item.status}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-effect">
                              <DropdownMenuItem onClick={() => navigate(`/transcript/${item.id}`)}>Görüntüle</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {activeFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeFeatures.slice(0, 8).map((feature) => (
                            <span key={feature} className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-300">
                              {feature}
                            </span>
                          ))}
                          {activeFeatures.length > 8 && (
                            <span className="text-xs text-gray-400">
                              +{activeFeatures.length - 8} özellik
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {filteredTranscriptions.length === 0 && (
                   <div className="text-center py-12 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">Transkripsiyon bulunamadi</h3>
                      <p>{searchTerm ? `Aramaniz "${searchTerm}" i�in sonu� bulunamadi.` : 'Transkripsiyon olusturmak i�in bir dosya y�kleyin veya bir URL ekleyin.'}</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TranscriptionsPage;
