// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsapp?: string;
    role: 'student' | 'instructor';
  }) => Promise<any>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      setError(null);
      const profileData = await apiClient.getProfile();
      setUser(profileData.user);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      // Token might be expired, clear it
      apiClient.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      setError(null);
      const profileData = await apiClient.getProfile();
      setUser(profileData.user);
    } catch (error: any) {
      console.error('Error refreshing user profile:', error);
      setError('Failed to refresh user profile');
    }
  }, [user]);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.login(email, password);
      setUser(response.user);
      return { data: response, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsapp?: string;
    role: 'student' | 'instructor';
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.register(userData);
      return { data: response, error: null };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiClient.logout();
    } catch (error: any) {
      console.error('Error during logout:', error);
      setError('Logout failed, but you will be signed out locally');
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};