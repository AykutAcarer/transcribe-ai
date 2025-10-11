import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { User, Mail, Lock, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const SettingsPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: formData.name }
    });

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been updated successfully',
      });
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: formData.newPassword });
    setLoading(false);
    
    if (error) {
       toast({
        title: 'Password change failed',
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: 'Password changed!',
        description: 'Your password has been changed successfully',
      });
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const handleDeleteAccount = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings - TranscribeAI</title>
        <meta name="description" content="Manage your account settings and preferences" />
      </Helmet>

      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>

          <div className="glass-effect p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  className="bg-white/5 border-white/10"
                  disabled
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </div>

          <div className="glass-effect p-8 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="bg-white/5 border-white/10"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="bg-white/5 border-white/10"
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </div>

          <div className="glass-effect p-8 rounded-2xl border border-red-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center text-red-400">
              <Trash2 className="w-5 h-5 mr-2" />
              Danger Zone
            </h2>
            <p className="text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SettingsPage;