import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Upload, FileText, Menu, X, Info, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { translations } = useLanguage();

  const navigation = [
    { name: translations.sidebar.home, href: '/', icon: <Home className="w-5 h-5" /> },
    { name: translations.sidebar.upload, href: '/upload', icon: <Upload className="w-5 h-5" /> },
    { name: translations.sidebar.transcriptions, href: '/transcriptions', icon: <FileText className="w-5 h-5" /> },
    { name: translations.sidebar.features, href: '/features-info', icon: <Info className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen">
      <nav className="glass-effect fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/upload" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">TranscribeAI</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                    location.pathname === item.href
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                    location.pathname === item.href
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
      
      <main className="pt-28 pb-16 container mx-auto px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
