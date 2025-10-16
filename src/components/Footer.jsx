
import React from 'react';
import { Link } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import CookieSettings from './CookieSettings';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">{t('title')}</span>
            </div>
            <p className="text-gray-400 text-sm">{t('footerDescription')}</p>
          </div>
          
          <div>
            <span className="font-bold mb-4 block">{t('product')}</span>
            <div className="space-y-2 text-sm">
              <Link to="/#features" className="text-gray-400 hover:text-white transition block">{t('features')}</Link>
              <Link to="/features-info" className="text-gray-400 hover:text-white transition block">Why Free?</Link>
            </div>
          </div>
          
          <div>
            <span className="font-bold mb-4 block">{t('company')}</span>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="text-gray-400 hover:text-white transition block">{t('about')}</Link>
            </div>
          </div>
          
          <div>
            <span className="font-bold mb-4 block">{t('legal')}</span>
            <div className="space-y-2 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition block">{t('privacy')}</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition block">{t('terms')}</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition block">Cookies</Link>
              <CookieSettings />
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-400">
          <p>© 2025 {t('title')}. {t('allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  