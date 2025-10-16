import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import CookiePreferences from './CookiePreferences';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    const onlyEssential = {
      essential: true,
      functional: false,
      analytics: false,
      advertising: false,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(onlyEssential));
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  const handlePreferencesClose = (consentGiven = false) => {
    setShowPreferences(false);
    if (consentGiven) {
      setShowBanner(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="container mx-auto max-w-6xl">
              <div className="glass-effect border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      We Value Your Privacy
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base mb-4">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                      By clicking "Accept All", you consent to our use of cookies.{' '}
                      <Link to="/cookies" className="text-purple-400 hover:text-purple-300 underline">
                        Learn more
                      </Link>
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleAccept}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8"
                      >
                        Accept All
                      </Button>
                      <Button
                        onClick={handleDecline}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Reject All
                      </Button>
                      <Button
                        onClick={handleCustomize}
                        variant="ghost"
                        className="text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferences isOpen={showPreferences} onClose={handlePreferencesClose} />
    </>
  );
};

export default CookieConsent;
