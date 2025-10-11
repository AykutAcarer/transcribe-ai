import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Search, MoreHorizontal, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/DashboardLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const TranscriptionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const localData = JSON.parse(localStorage.getItem('transcriptions') || '[]');
    setTranscriptions(localData);
    setLoading(false);
  }, []);

  const handleDelete = async (id) => {
    const updatedTranscriptions = transcriptions.filter(t => t.id !== id);
    localStorage.setItem('transcriptions', JSON.stringify(updatedTranscriptions));
    setTranscriptions(updatedTranscriptions);
    toast({ title: 'Transcription deleted successfully' });
  };

  const filteredTranscriptions = transcriptions.filter(t =>
    t.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Transcriptions - TranscribeAI</title>
        <meta name="description" content="View and manage your transcriptions." />
      </Helmet>
      <DashboardLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold gradient-text">My Transcriptions</h1>
            <p className="text-gray-400 text-sm mt-1">These are stored in your browser. Clearing your browser data will remove them.</p>
          </motion.div>

          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search transcriptions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="glass-effect p-6 rounded-2xl border border-white/10 min-h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTranscriptions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-wrap justify-between items-center bg-gray-800/50 p-4 rounded-lg hover:bg-gray-800/80 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-grow cursor-pointer min-w-0" onClick={() => navigate(`/transcript/${item.id}`)}>
                      <FileText className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{item.file_name}</p>
                        <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-300 mt-2 sm:mt-0">
                      <span>{item.duration || ''}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-effect">
                          <DropdownMenuItem onClick={() => navigate(`/transcript/${item.id}`)}>View</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
                {filteredTranscriptions.length === 0 && (
                   <div className="text-center py-12 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No Transcriptions Found</h3>
                      <p>{searchTerm ? `Your search for "${searchTerm}" did not return any results.` : 'Upload a file to get started.'}</p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TranscriptionsPage;