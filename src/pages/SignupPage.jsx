
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Mic, Mail, Lock, User, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
const GoogleIcon = () => <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,30.433,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>;
const SignupPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: ''
  });
  const {
    signUp
  } = useAuth();
  const navigate = useNavigate();
  const handleOAuth = () => {
    toast({
      title: '🚧 Coming Soon!',
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };
  const validatePassword = password => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    Object.values(checks).forEach(check => {
      if (check) score++;
    });
    let text = '';
    if (score <= 2) text = 'Weak';else if (score <= 3) text = 'Medium';else text = 'Strong';
    return {
      score,
      text,
      checks
    };
  };
  const handlePasswordChange = password => {
    setFormData({
      ...formData,
      password
    });
    setPasswordStrength(validatePassword(password));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    const validation = validatePassword(formData.password);
    if (!Object.values(validation.checks).every(check => check)) {
      toast({
        title: "Weak password",
        description: "Please meet all password requirements",
        variant: "destructive"
      });
      return;
    }
    if (!formData.acceptTerms) {
      toast({
        title: "Accept terms",
        description: "Please accept the terms and conditions",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, {
        data: {
          full_name: formData.name
        }
      });
      if (!error) {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };
  const strengthColor = passwordStrength.score <= 2 ? 'bg-red-500' : passwordStrength.score <= 3 ? 'bg-yellow-500' : 'bg-green-500';
  return <>
      <Helmet>
        <title>{t('signup')} - {t('title')}</title>
        <meta name="description" content={t('signup_desc')} />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>

          <div className="glass-effect p-8 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Mic className="w-7 h-7 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 gradient-text">{t('createAccount')}</h1>
            <p className="text-center text-gray-400 mb-6">{t('signup_free_credits')}</p>

            <Button variant="outline" className="w-full mb-6" onClick={handleOAuth}>
              <GoogleIcon />
              <span className="ml-2">{t('continueWithGoogle')}</span>
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-gray-400">{t('orContinueWith')}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} className="pl-10 bg-white/5 border-white/10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({
                  ...formData,
                  email: e.target.value
                })} className="pl-10 bg-white/5 border-white/10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={e => handlePasswordChange(e.target.value)} className="pl-10 bg-white/5 border-white/10" required />
                </div>
                {formData.password && <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{t('passwordStrength')}:</span>
                      <span className={passwordStrength.score <= 2 ? 'text-red-400' : passwordStrength.score <= 3 ? 'text-yellow-400' : 'text-green-400'}>
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strengthColor} transition-all`} style={{
                    width: `${passwordStrength.score / 5 * 100}%`
                  }} />
                    </div>
                  </div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData({
                  ...formData,
                  confirmPassword: e.target.value
                })} className="pl-10 bg-white/5 border-white/10" required />
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={checked => setFormData({
                ...formData,
                acceptTerms: checked
              })} />
                <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                  {t('iAccept')} <Link to="/terms" className="text-purple-400 hover:underline">{t('termsOfService')}</Link> {t('and')} <Link to="/privacy" className="text-purple-400 hover:underline">{t('privacyPolicy')}</Link>
                </label>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={loading}>
                {loading ? t('creatingAccount') : t('createAccount')}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              {t('alreadyHaveAccount')}{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                {t('login')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>;
};
export default SignupPage;
