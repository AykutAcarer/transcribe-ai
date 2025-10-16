import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import CookiesPage from '@/pages/CookiesPage';
import PageLayout from '@/components/PageLayout';
import FeaturesInfoPage from '@/pages/FeaturesInfoPage';
import UploadPage from '@/pages/UploadPage';
import TranscriptionsPage from '@/pages/TranscriptionsPage';
import TranscriptEditorPage from '@/pages/TranscriptEditorPage';
import CookieConsent from '@/components/CookieConsent';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features-info" element={<PageLayout><FeaturesInfoPage /></PageLayout>} />
        <Route path="/about" element={<PageLayout><AboutPage /></PageLayout>} />
        <Route path="/privacy" element={<PageLayout><PrivacyPage /></PageLayout>} />
        <Route path="/terms" element={<PageLayout><TermsPage /></PageLayout>} />
        <Route path="/cookies" element={<PageLayout><CookiesPage /></PageLayout>} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/transcriptions" element={<TranscriptionsPage />} />
        <Route path="/transcript/:id" element={<TranscriptEditorPage />} />
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
      <CookieConsent />
    </>
  );
}

export default App;