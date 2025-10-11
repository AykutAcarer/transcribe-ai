import React, { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

const AdPlaceholder = ({ className }) => {
  useEffect(() => {
    toast({
      title: "Ad Integration Required",
      description: "To display ads, please provide your Google AdSense Publisher ID.",
      duration: 10000,
    });
  }, []);

  return (
    <div className={`glass-effect rounded-lg flex items-center justify-center border-dashed border-2 border-white/20 ${className}`}>
      <div className="text-center p-4">
        <p className="font-bold text-lg text-white">Advertisement</p>
        <p className="text-sm text-gray-400">Your Google Ad will be displayed here.</p>
      </div>
    </div>
  );
};

export default AdPlaceholder;