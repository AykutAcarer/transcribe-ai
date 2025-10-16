import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Database } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const SecurityPage = () => {
  const { t } = useLanguage();
  return (
    <>
      <Helmet>
        <title>{t('security_title')} - {t('title')}</title>
        <meta name="description" content={t('security_p1')} />
      </Helmet>
      <div className="px-4 py-12">
        <div className="container mx-auto max-w-3xl">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
          <div className="glass-effect p-8 md:p-12 rounded-2xl border border-white/10">
            <h1 className="text-4xl font-bold mb-6 gradient-text">{t('securityAt')} {t('title')}</h1>
            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              <p>{t('security_p1')}</p>
              
              <div className="flex items-start space-x-4">
                <Lock className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white mt-0">{t('securityH2_1')}</h2>
                  <p>{t('security_p2')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <ShieldCheck className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white mt-0">{t('securityH2_2')}</h2>
                  <p>{t('security_p3')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Database className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white mt-0">{t('securityH2_3')}</h2>
                  <p>{t('security_p4')}</p>
                </div>
              </div>

              <p>{t('security_p5')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SecurityPage;