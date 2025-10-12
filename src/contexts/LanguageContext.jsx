import React, { createContext, useContext, useMemo } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  const mergedTranslations = useMemo(() => translations.en, []);
  const availableLanguages = useMemo(() => ['en'], []);

  const value = {
    language: 'en',
    setLanguage: () => {},
    t: (key) => mergedTranslations[key] ?? key,
    translations: mergedTranslations,
    availableLanguages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
