import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Download, Share2, Clipboard, Loader2 } from 'lucide-react';
import TestDashboardLayout from '@/components/TestDashboardLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

const TestTranscriptEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transcription, setTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const transcriptContentRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const localData = JSON.parse(localStorage.getItem('transcriptions') || '[]');
    const currentTranscription = localData.find(t => t.id === id);

    if (!currentTranscription) {
      toast({ title: 'Error fetching transcription', description: 'Transcription not found.', variant: 'destructive' });
      navigate('/transcriptions');
    } else {
      setTranscription(currentTranscription);
    }
    setLoading(false);
  }, [id, navigate]);

  const handleCopyToClipboard = () => {
    if (transcription?.transcript_text) {
      navigator.clipboard.writeText(transcription.transcript_text);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  const formatTimestamp = (seconds) => {
      if (typeof seconds !== 'number' || isNaN(seconds)) return '00:00:00';
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
  };

  const downloadTXT = () => {
    const blob = new Blob([transcription.transcript_text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${transcription.file_name || 'transcription'}.txt`);
  };

  const downloadSRT = () => {
    let srtContent = '';
    transcription.transcript_json?.segments?.forEach((segment, index) => {
      const startTime = formatTimestamp(segment.start).replace('.',',');
      const endTime = formatTimestamp(segment.end).replace('.',',');
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime},000 --> ${endTime},000\n`;
      srtContent += `${segment.text.trim()}\n\n`;
    });
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${transcription.file_name || 'transcription'}.srt`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(16);
    doc.text(transcription.file_name || 'Transcription', 10, 20);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(transcription.transcript_text, 180);
    doc.text(splitText, 10, 30);
    doc.save(`${transcription.file_name || 'transcription'}.pdf`);
  };

  const downloadDOCX = () => {
    const paragraphs = transcription.transcript_json?.segments?.map(segment => 
      new Paragraph({
        children: [
          new TextRun({ text: `[${formatTimestamp(segment.start)}] `, bold: true }),
          new TextRun(segment.text),
        ],
        spacing: { after: 200 },
      })
    ) || [];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: transcription.file_name || 'Transcription', bold: true, size: 32 })],
            spacing: { after: 400 },
          }),
          ...paragraphs
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${transcription.file_name || 'transcription'}.docx`);
    });
  };

  if (loading) {
    return (
      <TestDashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
        </div>
      </TestDashboardLayout>
    );
  }

  if (!transcription) return null;

  return (
    <>
      <Helmet>
        <title>Edit Transcript - {transcription.file_name || 'Transcription'}</title>
        <meta name="description" content={`Edit and export transcription for ${transcription.file_name || 'a file'}`} />
      </Helmet>

      <TestDashboardLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold gradient-text truncate">{transcription.file_name || 'Transcription'}</h1>
            <p className="text-gray-400">Transcription {transcription.status}. Review and edit below.</p>
          </motion.div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleCopyToClipboard}>
              <Clipboard className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={() => toast({ title: '🚧 Feature coming soon!' })}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect">
                <DropdownMenuItem onClick={downloadTXT}>.txt</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadSRT}>.srt</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadPDF}>.pdf</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadDOCX}>.docx</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect p-8 rounded-2xl border border-white/10"
            ref={transcriptContentRef}
          >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
              {transcription.transcript_json?.segments?.map((segment, index) => (
                <div key={index} className="grid grid-cols-[100px_1fr] gap-4">
                  <div className="text-purple-400 font-semibold flex items-start">
                    <span className="bg-gray-800/50 px-2 py-1 rounded">{formatTimestamp(segment.start)}</span>
                  </div>
                  <div>
                    <p className="text-gray-300 leading-relaxed">{segment.text}</p>
                  </div>
                </div>
              ))}
              {transcription.status === 'processing' && (
                 <div className="flex justify-center items-center flex-col gap-4 p-8">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                    <p className="text-gray-400">Transcription is processing...</p>
                </div>
              )}
               {transcription.status === 'completed' && (!transcription.transcript_json?.segments || transcription.transcript_json.segments.length === 0) && (
                 <div className="flex justify-center items-center flex-col gap-4 p-8">
                    <p className="text-gray-400">Transcription complete, but no text was detected in the audio.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </TestDashboardLayout>
    </>
  );
};

export default TestTranscriptEditorPage;