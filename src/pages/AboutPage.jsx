import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AdPlaceholder from '@/components/AdPlaceholder';

const AboutPage = () => {
  const { t } = useLanguage();
  return (
    <>
      <Helmet>
        <title>{t('about_title')} - {t('title')}</title>
        <meta name="description" content={t('about_p1')} />
      </Helmet>
      <div className="px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
          <div className="glass-effect p-8 md:p-12 rounded-2xl border border-white/10">
            <h1 className="text-4xl font-bold mb-6 gradient-text">{t('about_title')}</h1>
            <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')}</p>
              <p>{t('about_p4')}</p>
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

export default AboutPage;