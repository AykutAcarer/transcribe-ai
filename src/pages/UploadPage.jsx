import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload } from 'lucide-react';

const UploadPage = () => {
  return (
    <>
      <Helmet>
        <title>Upload & Transcribe - TranscribeAI</title>
        <meta name="description" content="Upload and transcribe your audio and video files." />
      </Helmet>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Upload Your Files</h1>
            <p className="text-gray-400">Drag & drop your audio or video files to transcribe them with OpenAI Whisper.</p>
          </div>

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-1 glass-effect p-1 h-auto mb-6">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload a File
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file">
              <FileUpload />
            </TabsContent>
          </Tabs>

        </motion.div>
      </DashboardLayout>
    </>
  );
};

export default UploadPage;