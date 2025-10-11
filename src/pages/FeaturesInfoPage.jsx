import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, FileText, Download, Languages } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-effect p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const FeaturesInfoPage = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Completely Free',
      description: 'No hidden fees, no credit card required. Get 10 free transcriptions every day.',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Large File Support',
      description: 'Upload audio or video files up to 200MB and 5 minutes long for transcription.',
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: '30+ Languages',
      description: 'Our AI supports a wide range of languages for accurate transcription.',
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Multiple Export Options',
      description: 'Download your transcripts in various formats, including TXT, DOCX, PDF, and SRT.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Features - TranscribeAI</title>
        <meta name="description" content="Discover the powerful, free features of TranscribeAI. No sign-up required." />
      </Helmet>
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold gradient-text mb-4"
        >
          Powerful Features, Zero Cost
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          TranscribeAI is designed to be simple, powerful, and accessible to everyone. No sign-up needed.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.3 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default FeaturesInfoPage;