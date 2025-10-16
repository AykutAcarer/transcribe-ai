import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';

const CookiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - TranscribeAI</title>
        <meta name="description" content="Learn about how we use cookies on TranscribeAI." />
      </Helmet>
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold gradient-text">Cookie Policy</h1>
          </div>
          
          <div className="glass-effect p-8 rounded-2xl border border-white/10 space-y-6 text-gray-300">
            <p className="text-lg">
              This Cookie Policy explains how TranscribeAI uses cookies and similar technologies to recognize you when you visit our website.
            </p>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">How We Use Cookies</h2>
              <p className="mb-3">We use cookies for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas.</li>
                <li><strong>Preference Cookies:</strong> These cookies remember your preferences and settings (like language preferences).</li>
                <li><strong>Analytics Cookies:</strong> We use these to understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                <li><strong>Advertising Cookies:</strong> These cookies are used to deliver advertisements relevant to you and your interests. We use Google AdSense to display ads on our website.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Third-Party Cookies</h2>
              <p className="mb-3">We use the following third-party services that may set cookies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                <li><strong>AssemblyAI:</strong> For audio transcription services</li>
                <li><strong>Supabase:</strong> For authentication and data storage (optional)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Local Storage</h2>
              <p>
                In addition to cookies, we use browser local storage to save your transcriptions locally on your device. This data remains on your device and is not transmitted to our servers unless you explicitly choose to save it to your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Managing Cookies</h2>
              <p className="mb-3">
                You can control and manage cookies in various ways. Please note that removing or blocking cookies may impact your user experience and some functionality may not work as intended.
              </p>
              <p className="mb-3">Most browsers allow you to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>View what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific sites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close your browser</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Your Consent</h2>
              <p>
                By using our website, you consent to our use of cookies in accordance with this Cookie Policy. You can withdraw your consent at any time by adjusting your cookie preferences in your browser settings.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Last updated: October 16, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesPage;
