import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Upload, FileText, Clock, Zap, TrendingUp } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Transcriptions', value: '0', icon: <FileText className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { label: 'Credits Remaining', value: user?.user_metadata?.credits || 10, icon: <Zap className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Hours Transcribed', value: '0h', icon: <Clock className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { label: 'This Month', value: '0', icon: <TrendingUp className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ];

  const recentTranscriptions = [];

  return (
    <>
      <Helmet>
        <title>Dashboard - TranscribeAI</title>
        <meta name="description" content="Manage your transcriptions and view your account statistics" />
      </Helmet>

      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back, {user?.user_metadata?.full_name || 'User'}! 👋</h1>
            <p className="text-gray-400">Here's what's happening with your transcriptions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-effect p-6 rounded-2xl border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="glass-effect p-8 rounded-2xl border border-white/10 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Ready to transcribe?</h2>
              <p className="text-gray-400 mb-6">Upload your audio or video files, or import from a URL to get started</p>
              <Link to="/upload">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Upload className="w-5 h-5 mr-2" />
                  Start New Transcription
                </Button>
              </Link>
            </div>
          </div>

          {recentTranscriptions.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Transcriptions</h2>
              <div className="space-y-4">
                {recentTranscriptions.map((transcription, index) => (
                  <div key={index} className="glass-effect p-6 rounded-2xl border border-white/10">
                    {/* Transcription item */}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-effect p-12 rounded-2xl border border-white/10 text-center">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No transcriptions yet</h3>
              <p className="text-gray-400">Upload your first file to get started!</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default DashboardPage;