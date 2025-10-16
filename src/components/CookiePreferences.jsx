import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const CookiePreferences = ({ isOpen, onClose, standalone = false }) => {
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    functional: true,
    analytics: true,
    advertising: true,
  });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('cookiePreferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferences({ ...preferences, ...parsed, essential: true });
        } catch (e) {
          console.error('Failed to parse cookie preferences', e);
        }
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    localStorage.setItem('cookieConsent', 'customized');
    onClose(true);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsent', 'accepted');
    onClose(true);
  };

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
    };
    setPreferences(onlyEssential);
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential));
    localStorage.setItem('cookieConsent', 'declined');
    onClose(true);
  };
  
  const handleModalClose = () => {
    onClose(standalone);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleModalClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative glass-effect border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Cookie Preferences</h2>
                <p className="text-sm text-gray-400">Manage your privacy settings</p>
              </div>
            </div>
            <button
              onClick={handleModalClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Essential Cookies</h3>
                    <Checkbox checked={true} disabled className="opacity-50" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Required for the website to function properly. These cannot be disabled.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <Cookie className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Functional Cookies</h3>
                    <Checkbox
                      checked={preferences.functional}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, functional: checked })
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Enable enhanced functionality and personalization, such as remembering your preferences.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Analytics Cookies</h3>
                    <Checkbox
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analytics: checked })
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Help us understand how visitors interact with our website by collecting anonymous information.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <Megaphone className="w-5 h-5 text-pink-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">Advertising Cookies</h3>
                    <Checkbox
                      checked={preferences.advertising}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, advertising: checked })
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Used to deliver personalized advertisements and track their effectiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
            >
              Accept All
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Save Preferences
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Reject All
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookiePreferences;
