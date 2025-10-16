import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import CookiePreferences from './CookiePreferences';

const CookieSettings = () => {
  const [showPreferences, setShowPreferences] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPreferences(true)}
        className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Cookie Settings
      </button>
      <CookiePreferences isOpen={showPreferences} onClose={() => setShowPreferences(false)} standalone={true} />
    </>
  );
};

export default CookieSettings;
