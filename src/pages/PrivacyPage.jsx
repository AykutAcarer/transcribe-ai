import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AdPlaceholder from '@/components/AdPlaceholder';

const PrivacyPage = () => {
  const { t, language } = useLanguage();
  return (
    <>
      <Helmet>
        <title>{t('privacy_title')} - {t('title')}</title>
        <meta name="description" content={t('privacy_p1')} />
      </Helmet>
      <div className="px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
          <div className="glass-effect p-8 md:p-12 rounded-2xl border border-white/10">
            <h1 className="text-4xl font-bold mb-6 gradient-text">{t('privacy_title')}</h1>
            <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
              <p>{t('privacy_last_updated')} {new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>{t('privacy_p1')}</p>
              
              <h2 className="text-2xl font-bold text-white">{t('privacyH2_1')}</h2>
              <p>{t('privacy_p2')}</p>
              
              <h2 className="text-2xl font-bold text-white">{t('privacyH2_2')}</h2>
              <p>{t('privacy_p3')}</p>

              <h2 className="text-2xl font-bold text-white">{t('privacyH2_3')}</h2>
              <p>{t('privacy_p4')}</p>
              
              <h2 className="text-2xl font-bold text-white">{t('privacyH2_4')}</h2>
              <p>{t('privacy_p5')}</p>
            </div>
          </div>
          <div className="mt-12">
            <AdPlaceholder className="h-48" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;