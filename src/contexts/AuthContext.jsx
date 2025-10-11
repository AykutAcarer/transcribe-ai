import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === email);

      if (!foundUser || foundUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      if (!foundUser.emailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      const userData = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        plan: foundUser.plan,
        credits: foundUser.credits,
        avatar: foundUser.avatar,
        emailVerified: foundUser.emailVerified
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Welcome back!",
        description: `Logged in successfully as ${foundUser.name}`,
      });

      return userData;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.find(u => u.email === email)) {
        throw new Error('Email already registered');
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        plan: 'FREE',
        credits: 10,
        avatar: null,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      toast({
        title: "Account created!",
        description: "Your account has been created successfully. You can now log in.",
      });

      return newUser;
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};