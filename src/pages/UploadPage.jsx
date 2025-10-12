import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import FileUpload from '@/components/FileUpload';
import URLImport from '@/components/URLImport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link2, Upload } from 'lucide-react';
import { useAssemblyAIOptions } from '@/hooks/useAssemblyAIOptions';
import { useLanguage } from '@/contexts/LanguageContext';

const UploadPage = () => {
  const { config: assemblyConfig, setConfig: setAssemblyConfig } = useAssemblyAIOptions();
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t('upload_page_meta_title') || 'Upload & Transcribe - TranscribeAI'}</title>
        <meta
          name="description"
          content={t('upload_center_meta_description') || t('upload_center_description') || 'Upload a file or transcribe audio directly from a URL. Configure every AssemblyAI feature in one place.'}
        />
      </Helmet>
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {t('upload_center_title') || 'AssemblyAI Control Center'}
            </h1>
            <p className="text-gray-400">
              {t('upload_center_description') || 'Upload a file or transcribe audio directly from a URL. Configure every AssemblyAI feature in one place.'}
            </p>
          </div>

          <Tabs defaultValue="file" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-effect p-1 h-auto mb-6">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {t('upload_tab_file') || 'Upload a File'}
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                {t('upload_tab_url') || 'Import from URL'}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="file">
              <FileUpload assemblyConfig={assemblyConfig} onAssemblyConfigChange={setAssemblyConfig} />
            </TabsContent>
            <TabsContent value="url">
              <URLImport assemblyConfig={assemblyConfig} onAssemblyConfigChange={setAssemblyConfig} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </DashboardLayout>
    </>
  );
};

export default UploadPage;
