
import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const PageLayout = ({ children }) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass-effect sticky top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">{t('title')}</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features-info" className="text-gray-300 hover:text-white transition">Why Free?</Link>
              <Link to="/#how-it-works" className="text-gray-300 hover:text-white transition">{t('howItWorks')}</Link>
              <Link to="/#features" className="text-gray-300 hover:text-white transition">{t('features')}</Link>
              <Link to="/#testimonials" className="text-gray-300 hover:text-white transition">{t('testimonials')}</Link>
            </div>

            <div className="flex items-center space-x-2">
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Transcribing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
  
