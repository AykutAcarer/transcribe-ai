import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Mail, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions",
      });
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password - TranscribeAI</title>
        <meta name="description" content="Reset your TranscribeAI account password" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>

          <div className="glass-effect p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
            </div>

            {!sent ? (
              <>
                <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Forgot Password?</h1>
                <p className="text-center text-gray-400 mb-8">Enter your email to receive reset instructions</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
                <p className="text-gray-400 mb-6">
                  We've sent password reset instructions to <span className="text-white font-medium">{email}</span>
                </p>
                <Link to="/login">
                  <Button variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;