
    import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { BarChart, Upload, FileText, CreditCard } from 'lucide-react';
    import TestDashboardLayout from '@/components/TestDashboardLayout';

    const StatCard = ({ title, value, icon, color }) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-effect p-6 rounded-2xl flex items-center space-x-4 border border-white/10"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </motion.div>
    );

    const TestDashboardPage = () => {
      const recentFiles = [
        { name: 'Meeting_2025_10_10.mp3', duration: '25:10', date: '2 hours ago', status: 'Completed' },
        { name: 'Podcast_Interview_Final.wav', duration: '58:32', date: '1 day ago', status: 'Completed' },
        { name: 'Lecture_Quantum_Physics.m4a', duration: '1:12:45', date: '3 days ago', status: 'Completed' },
      ];

      const stats = {
        transcriptions: 12,
        uploads: 5,
        minutesUsed: 430,
        creditsRemaining: 9999
      };

      return (
        <>
          <Helmet>
            <title>Test Dashboard - TranscribeAI</title>
            <meta name="description" content="A test version of the TranscribeAI dashboard." />
          </Helmet>
          
          <TestDashboardLayout>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div>
                  <h1 className="text-3xl font-bold gradient-text mb-2">Test Dashboard</h1>
                  <p className="text-gray-400">Welcome, Test User! Explore the features.</p>
                </div>
                <Link to="/test-upload">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 glow-effect">
                    <Upload className="w-4 h-4 mr-2" />
                    New Transcription
                  </Button>
                </Link>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Transcriptions" value={stats.transcriptions} icon={<FileText className="w-6 h-6 text-white" />} color="bg-purple-500" />
                <StatCard title="This Month's Uploads" value={stats.uploads} icon={<Upload className="w-6 h-6 text-white" />} color="bg-pink-500" />
                <StatCard title="Minutes Transcribed" value={stats.minutesUsed} icon={<BarChart className="w-6 h-6 text-white" />} color="bg-blue-500" />
                <StatCard title="Credits Remaining" value={stats.creditsRemaining} icon={<CreditCard className="w-6 h-6 text-white" />} color="bg-green-500" />
              </div>

              <div className="glass-effect p-8 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold mb-6">Recent Files</h2>
                <div className="space-y-4">
                  {recentFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-wrap justify-between items-center bg-gray-800/50 p-4 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-gray-400">
                        <span>{file.duration}</span>
                        <span>{file.date}</span>
                        <span className="text-green-400 font-semibold">{file.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TestDashboardLayout>
        </>
      );
    };

    export default TestDashboardPage;
  