
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, FileUp, Download, Files, LockKeyhole } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-effect p-8 rounded-2xl border border-white/10 flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400 flex-grow">{description}</p>
  </motion.div>
);


const PricingPage = () => {
    const features = [
    {
      icon: <LockKeyhole className="w-8 h-8 text-white" />,
      title: "Completely Free, No Sign-Up",
      description: "Enjoy all features without needing to create an account. Your privacy is our priority.",
    },
    {
      icon: <FileUp className="w-8 h-8 text-white" />,
      title: "Generous 500MB File Size",
      description: "Upload larger audio and video files with no duration limits or hidden restrictions.",
    },
    {
      icon: <Files className="w-8 h-8 text-white" />,
      title: "10 Free Transcriptions Daily",
      description: "You get 10 free transcriptions every single day to power your projects.",
    },
    {
      icon: <Download className="w-8 h-8 text-white" />,
      title: "Multiple Export Formats",
      description: "Download your transcripts as TXT, DOCX, PDF, or SRT files to fit your workflow.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Completely Free Transcription - TranscribeAI</title>
        <meta name="description" content="Discover why our powerful transcription service is offered completely free, with no sign-up required." />
      </Helmet>
      <div className="pt-12 pb-20 px-4">
        <div className="container mx-auto">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">Generous, Free & Private</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We believe powerful tools should be accessible to everyone. That's why we offer our cutting-edge transcription service completely free, with no hidden costs and no need to sign up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-20">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
             <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
             <p className="text-gray-400 mb-8">No strings attached. Just fast, accurate transcriptions.</p>
             <Link to="/upload">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 glow-effect text-lg px-8 py-6">
                    Start Transcribing Now
                </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
  
