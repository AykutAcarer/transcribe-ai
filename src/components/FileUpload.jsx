import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import AssemblyAIOptions from '@/components/AssemblyAIOptions';
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

const FileUpload = ({ assemblyConfig, onAssemblyConfigChange }) => {
  const normalizedConfig = normalizeAssemblyConfig(assemblyConfig);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const uploadControllers = useRef({});
  const { t } = useLanguage();
  
  const API_URL = '/api/transcribe';

  const handleAssemblyConfigChange = useCallback(
    (nextConfig) => {
      onAssemblyConfigChange?.(nextConfig);
    },
    [onAssemblyConfigChange]
  );

  const allowedFormats = [
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/flac', 'audio/ogg',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
    'audio/x-m4a', 'audio/mp3'
  ];
  const maxFileSize = 500 * 1024 * 1024; // 500 MB

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const validateFile = async (file) => {
    if (file.size > maxFileSize) {
      toast({
        title: t('file_upload_error_large_title') || 'File too large',
        description:
          t('file_upload_error_large_description')?.replace('{name}', file.name) ||
          `"${file.name}" is larger than the 500MB limit.`,
        variant: 'destructive'
      });
      return { valid: false };
    }

    if (file.type && !allowedFormats.includes(file.type)) {
      toast({
        title: t('file_upload_error_format_title') || 'Invalid file format',
        description:
          t('file_upload_error_format_description')
            ?.replace('{type}', file.type || '')
            ?.replace('{name}', file.name) ||
          `File type "${file.type}" is not supported for "${file.name}".`,
        variant: 'destructive'
      });
      return { valid: false };
    }

    return { valid: true };
  };

  const handleFiles = async (filesToProcess) => {
    for (const file of filesToProcess) {
      const { valid } = await validateFile(file);
      if (valid) {
        const uploadedAt = new Date().toISOString();
        setFiles((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            file,
            status: 'pending',
            uploadedAt
          }
        ]);
      }
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  }, []);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await handleFiles(selectedFiles);
    e.target.value = null;
  };

  const removeFile = (id) => {
    if(uploadControllers.current[id]) {
        uploadControllers.current[id].abort();
        delete uploadControllers.current[id];
    }
    setFiles(prev => prev.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;
    setUploading(true);

    const configSnapshot = normalizeAssemblyConfig(assemblyConfig);

    const uploadPromises = pendingFiles.map(async (fileData) => {
      try {
        setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'processing' } : f));
        
        const controller = new AbortController();
        uploadControllers.current[fileData.id] = controller;

        const formData = new FormData();
        formData.append('file', fileData.file);

        const uploadStartedAt = new Date().toISOString();
        const optionsPayload = buildTranscriptionOptions(configSnapshot);
        const metadata = {
          originalFileName: fileData.file.name,
          size: fileData.file.size,
          type: fileData.file.type,
          uploadedAt: uploadStartedAt,
          source: 'file',
          temporaryId: fileData.id
        };

        formData.append(
          'options',
          JSON.stringify({
            ...optionsPayload,
            metadata
          })
        );

        const response = await fetch(API_URL, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });

        if (controller.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const responseBody = await parseJsonResponse(response);

        if (!response.ok || responseBody?.success === false) {
          const errorMessage =
            responseBody?.error ||
            responseBody?.message ||
            `Server responded with ${response.status}`;
          throw new Error(errorMessage);
        }

        const apiPayload = responseBody?.data || responseBody?.transcription || responseBody;

        const storedRecord = addTranscriptionFromApi(apiPayload, {
          ...metadata,
          options: optionsPayload
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id
              ? { ...f, status: 'completed', transcriptId: storedRecord.id }
              : f
          )
        );
        return { status: 'completed', id: storedRecord.id };

      } catch (error) {
        console.error("Upload & Transcribe Error:", error);
        if (error.name === 'AbortError' || error.message === 'Upload cancelled') {
          setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'pending' } : f));
        } else {
          toast({
            title: t('file_upload_error_toast_title') || `Error with ${fileData.file.name}`,
            description: error.message,
            variant: 'destructive'
          });
          setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'failed' } : f));
        }
        return { status: 'failed' };
      } finally {
        delete uploadControllers.current[fileData.id];
      }
    });

    const results = await Promise.all(uploadPromises);
    
    setUploading(false);
    const completedCount = results.filter(r => r && r.status === 'completed').length;
    if(completedCount > 0) {
        toast({
          title: t('file_upload_toast_success_title') || 'Transcription Complete!',
          description:
            t('file_upload_toast_success_description')
              ?.replace('{count}', completedCount) ||
            `${completedCount} file(s) have been successfully transcribed.`,
        });
        navigate('/transcriptions');
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getStatusTextAndIcon = (status) => {
    switch (status) {
      case 'processing': return { text: t('file_upload_status_processing') || 'Transcribing...', icon: <Loader2 className="w-5 h-5 animate-spin" /> };
      case 'completed': return { text: t('file_upload_status_completed') || 'Completed', icon: <CheckCircle className="w-5 h-5 text-green-500" /> };
      case 'failed': return { text: t('file_upload_status_failed') || 'Failed', icon: <X className="w-5 h-5 text-red-500" /> };
      default: return { text: t('file_upload_status_pending') || 'Pending', icon: <File className="w-5 h-5" /> };
    }
  }

  return (
    <div className="space-y-6">
      <AssemblyAIOptions value={normalizedConfig} onChange={handleAssemblyConfigChange} />

      <div
        className={`glass-effect border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
          dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept={allowedFormats.join(',')}
          onChange={handleFileSelect}
        />
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">{t('file_upload_drop_title') || 'Drop files here or click to browse'}</h3>
        <p className="text-gray-400 mb-4">
          {t('file_upload_drop_hint') || 'Max 500MB per file'}
        </p>
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button as="span" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 pointer-events-none">
            {t('file_upload_select_button') || 'Select Files'}
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">
            {(t('file_upload_selected_files') || 'Selected Files') + ` (${files.length})`}
          </h3>
          
          {files.map((fileData) => {
              const { text, icon } = getStatusTextAndIcon(fileData.status);
              return (
                <motion.div
                  key={fileData.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect p-4 rounded-xl border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{fileData.file.name}</p>
                        <p className="text-sm text-gray-400">{formatFileSize(fileData.file.size)}</p>
                      </div>
                    </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(fileData.id)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                  </div>
                  
                  {(fileData.status === 'processing' || fileData.status === 'completed' || fileData.status === 'failed') && (
                    <div className="mt-2 space-y-1">
                      <span className="text-sm text-gray-400">{text}</span>
                    </div>
                  )}
                </motion.div>
              )
          })}

          <Button
            onClick={handleUpload}
            disabled={uploading || files.every(f => f.status !== 'pending')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {uploading
              ? t('file_upload_transcribing_label') || 'Transcribing...'
              : `${t('file_upload_transcribe_label') || 'Transcribe'} ${files.filter(f => f.status === 'pending').length} ${t('file_upload_transcribe_suffix') || 'file(s)'}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
