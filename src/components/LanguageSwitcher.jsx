import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const LanguageSwitcher = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  const languageNames = {
    en: 'English',
    tr: 'Türkçe',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-effect border-white/10">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            className={`cursor-pointer ${language === lang ? 'bg-purple-500/20' : ''}`}
            onSelect={() => setLanguage(lang)}
          >
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;