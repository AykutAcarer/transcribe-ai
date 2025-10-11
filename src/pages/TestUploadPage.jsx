import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import TestDashboardLayout from '@/components/TestDashboardLayout';
    import TestFileUpload from '@/components/TestFileUpload';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Upload } from 'lucide-react';

    const TestUploadPage = () => {
      return (
        <>
          <Helmet>
            <title>Upload & Transcribe - TranscribeAI</title>
            <meta name="description" content="Upload and transcribe your audio and video files for free." />
          </Helmet>
          <TestDashboardLayout>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold gradient-text mb-2">Upload Your Files</h1>
                <p className="text-gray-400">Drag & drop files to transcribe. It's free and no registration is required.</p>
              </div>

              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-1 glass-effect p-1 h-auto mb-6">
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload a File
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="file">
                  <TestFileUpload />
                </TabsContent>
              </Tabs>

            </motion.div>
          </TestDashboardLayout>
        </>
      );
    };

    export default TestUploadPage;