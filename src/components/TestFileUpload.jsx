import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const TestFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();
  const uploadControllers = useRef({});
  const [dailyUploads, setDailyUploads] = useState(0);

  const FREE_UPLOAD_LIMIT = 15;

  useEffect(() => {
    const usageData = JSON.parse(localStorage.getItem('transcribeUsage'));
    const today = new Date().toISOString().split('T')[0];

    if (usageData && usageData.date === today) {
      setDailyUploads(usageData.count);
    } else {
      localStorage.setItem('transcribeUsage', JSON.stringify({ count: 0, date: today }));
    }
  }, []);
  
  const checkAndIncrementUsage = () => {
    const usageData = JSON.parse(localStorage.getItem('transcribeUsage'));
    const today = new Date().toISOString().split('T')[0];
    
    let currentCount = 0;
    if (usageData && usageData.date === today) {
      currentCount = usageData.count;
    }

    if(currentCount >= FREE_UPLOAD_LIMIT){
        return false;
    }

    const newCount = currentCount + 1;
    localStorage.setItem('transcribeUsage', JSON.stringify({ count: newCount, date: today }));
    setDailyUploads(newCount);
    return true;
  };

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
    if(dailyUploads >= FREE_UPLOAD_LIMIT){
        toast({
            title: 'Daily limit reached',
            description: `You have used your ${FREE_UPLOAD_LIMIT} free transcriptions for today.`,
            variant: 'destructive',
            duration: 10000,
        });
        return false;
    }

     if (file.size > maxFileSize) {
      toast({
        title: 'File too large',
        description: `"${file.name}" is larger than the 500MB limit.`,
        variant: 'destructive'
      });
      return false;
    }

     if (!allowedFormats.includes(file.type)) {
      toast({
        title: 'Invalid file format',
        description: `File type "${file.type}" is not supported for "${file.name}".`,
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  const handleFiles = async (filesToProcess) => {
    for(const file of filesToProcess){
        const isValid = await validateFile(file);
        if(isValid) {
             if(checkAndIncrementUsage()){
                setFiles(prev => [...prev, {
                    id: crypto.randomUUID(),
                    file,
                    status: 'pending'
                }]);
            } else {
                 toast({
                    title: 'Daily limit reached',
                    description: `You have used your ${FREE_UPLOAD_LIMIT} free transcriptions. "${file.name}" was not added.`,
                    variant: 'destructive'
                });
                break; 
            }
        }
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleFiles(droppedFiles);
  }, [dailyUploads]);

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

  const mockTranscription = (file) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const mockText = `This is a simulated transcription for the file: ${file.name}. The content is generated locally to demonstrate the application's functionality without an external API. You can edit, copy, and download this text.`;
        const mockSegments = [
          { start: 0, end: 5, text: `This is a simulated transcription for the file: ${file.name}.` },
          { start: 5, end: 10, text: "The content is generated locally to demonstrate the application's functionality without an external API." },
          { start: 10, end: 12, text: "You can edit, copy, and download this text." }
        ];
        resolve({
          transcription: {
            transcript_text: mockText,
            transcript_json: { segments: mockSegments },
            duration: "00:00:12"
          }
        });
      }, 3000); // Simulate 3 seconds of processing
    });
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;
    setUploading(true);

    const uploadPromises = pendingFiles.map(async (fileData) => {
      try {
        setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'processing' } : f));
        
        const controller = new AbortController();
        uploadControllers.current[fileData.id] = controller;
        
        const data = await mockTranscription(fileData.file);

        if (controller.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const transcriptionId = crypto.randomUUID();

        const localTranscriptions = JSON.parse(localStorage.getItem('transcriptions') || '[]');
        localTranscriptions.unshift({
          id: transcriptionId,
          ...data.transcription,
          created_at: new Date().toISOString(),
          file_name: fileData.file.name,
          status: 'completed'
        });
        localStorage.setItem('transcriptions', JSON.stringify(localTranscriptions));

        setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'completed', id: transcriptionId } : f));
        return { status: 'completed', id: transcriptionId };

      } catch (error) {
        console.error("Upload & Transcribe Error:", error);
        if (error.name === 'AbortError' || error.message === 'Upload cancelled') {
          setFiles(prev => prev.map(f => f.id === fileData.id ? { ...f, status: 'pending' } : f));
        } else {
          toast({ title: `Error with ${fileData.file.name}`, description: error.message, variant: 'destructive' });
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
          title: 'Transcription Complete!',
          description: `${completedCount} file(s) have been successfully transcribed.`,
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
      case 'processing': return { text: 'Transcribing...', icon: <Loader2 className="w-5 h-5 animate-spin" /> };
      case 'completed': return { text: 'Completed', icon: <CheckCircle className="w-5 h-5 text-green-500" /> };
      case 'failed': return { text: 'Failed', icon: <X className="w-5 h-5 text-red-500" /> };
      default: return { text: 'Pending', icon: <File className="w-5 h-5" /> };
    }
  }

  const remainingUploads = FREE_UPLOAD_LIMIT - dailyUploads;

  return (
    <div className="space-y-6">
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
          disabled={remainingUploads <= 0}
        />
        
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">Drop files here or click to browse</h3>
        <p className="text-gray-400 mb-4">
          {FREE_UPLOAD_LIMIT} free transcriptions per day • Max 500MB per file
        </p>
         <p className="text-purple-400 font-bold mb-4">
          {remainingUploads > 0 ? `${remainingUploads} free uploads remaining today` : "Daily free limit reached"}
        </p>
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button as="span" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 pointer-events-none" disabled={remainingUploads <= 0}>
            Select Files
          </Button>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Selected Files ({files.length})</h3>
          
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
            {uploading ? 'Transcribing...' : `Transcribe ${files.filter(f => f.status === 'pending').length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestFileUpload;
