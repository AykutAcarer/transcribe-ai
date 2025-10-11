import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Password reset successful!",
        description: "You can now login with your new password",
      });
      navigate('/login');
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Reset Password - TranscribeAI</title>
        <meta name="description" content="Create a new password for your TranscribeAI account" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-effect p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 gradient-text">Reset Password</h1>
            <p className="text-center text-gray-400 mb-8">Enter your new password</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ResetPasswordPage;