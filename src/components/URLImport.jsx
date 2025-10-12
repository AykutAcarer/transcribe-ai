import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Loader2, PlayCircle } from 'lucide-react';
import AssemblyAIOptions from '@/components/AssemblyAIOptions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { buildTranscriptionOptions, normalizeAssemblyConfig } from '@/lib/assemblyai';
import { addTranscriptionFromApi } from '@/lib/transcriptionStorage';
import { useLanguage } from '@/contexts/LanguageContext';

const parseJsonResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  const message = text?.trim().slice(0, 200) || `Unexpected response (${response.status})`;
  throw new Error(message);
};

const URLImport = ({ assemblyConfig, onAssemblyConfigChange }) => {
  const normalizedConfig = normalizeAssemblyConfig(assemblyConfig);
  const [audioUrl, setAudioUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const trimmedUrl = audioUrl.trim();

      if (!trimmedUrl) {
        toast({
          title: t('url_import_error_missing_title') || 'URL required',
          description: t('url_import_error_missing_description') || 'Please provide an accessible audio or video URL.',
          variant: 'destructive'
        });
        return;
      }

      try {
        setLoading(true);

        const configSnapshot = normalizeAssemblyConfig(assemblyConfig);
        const optionsPayload = buildTranscriptionOptions(configSnapshot);
        const temporaryId =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `url-${Date.now()}`;
        const metadata = {
          originalFileName: displayName || trimmedUrl,
          source: 'url',
          audioUrl: trimmedUrl,
          uploadedAt: new Date().toISOString(),
          temporaryId
        };

        const response = await fetch('/api/transcribe/url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioUrl: trimmedUrl,
            ...optionsPayload,
            metadata
          })
        });

        const responseBody = await parseJsonResponse(response);
        if (!response.ok || responseBody?.success === false) {
          const message =
            responseBody?.error ||
            responseBody?.message ||
            t('url_import_unknown_error')?.replace('{status}', response.status) ||
            `Server responded with status ${response.status}.`;
          throw new Error(message);
        }

        const apiPayload = responseBody?.data || responseBody?.transcription || responseBody;

        addTranscriptionFromApi(apiPayload, {
          ...metadata,
          options: optionsPayload
        });

        toast({
          title: t('url_import_success_title') || 'Transcription ready',
          description: t('url_import_success_description') || 'The remote media file was processed successfully.'
        });

        setAudioUrl('');
        setDisplayName('');
        navigate('/transcriptions');
      } catch (error) {
        console.error('Remote transcription error:', error);
        toast({
          title: t('url_import_error_title') || 'Transcription failed',
          description: error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    },
    [audioUrl, assemblyConfig, displayName, navigate, t]
  );

  return (
    <div className="space-y-6">
      <AssemblyAIOptions value={normalizedConfig} onChange={onAssemblyConfigChange} />

      <form onSubmit={handleSubmit} className="space-y-4 glass-effect border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-purple-600/20 text-purple-300 p-3">
            <Link2 className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <label htmlFor="remote-url" className="text-sm font-medium text-white">
              {t('url_import_heading') || 'Remote media URL'}
            </label>
            <Input
              id="remote-url"
              placeholder="https://..."
              value={audioUrl}
              onChange={(event) => setAudioUrl(event.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-gray-400">
              {t('url_import_hint') || 'Provide an HTTPS-accessible audio or video link.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="rounded-full bg-blue-600/20 text-blue-300 p-3">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <label htmlFor="remote-name" className="text-sm font-medium text-white">
              {t('url_import_display_name') || 'Display name (optional)'}
            </label>
            <Input
              id="remote-name"
              placeholder={t('url_import_display_placeholder') || 'Meeting recording - Oct 12'}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {loading ? (t('url_import_button_loading') || 'Transcribing...') : (t('url_import_button') || 'Transcribe URL')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default URLImport;
