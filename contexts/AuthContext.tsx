import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthState, User, LoginCredentials, RegisterCredentials, ForgotPasswordData } from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = 'user_data';
const TOKEN_KEY = 'auth_token';

// Mock authentication functions - replace with real API calls
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (credentials.email === 'test@example.com' && credentials.password === 'password') {
    const user: User = {
      id: '1',
      email: credentials.email,
      name: 'Test User',
      isPremium: false,
      createdAt: new Date(),
    };
    return { user, token: 'mock_token_123' };
  }
  throw new Error('Invalid credentials');
};

const mockRegister = async (credentials: RegisterCredentials): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user: User = {
    id: Date.now().toString(),
    email: credentials.email,
    name: credentials.name,
    isPremium: false,
    createdAt: new Date(),
  };
  return { user, token: 'mock_token_' + Date.now() };
};

const mockForgotPassword = async (data: ForgotPasswordData): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (data.email?.trim()) {
    console.log('Password reset email sent to:', data.email);
  }
};

const mockGoogleLogin = async (): Promise<{ user: User; token: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const user: User = {
    id: 'google_' + Date.now(),
    email: 'user@gmail.com',
    name: 'Google User',
    avatar: 'https://via.placeholder.com/100',
    isPremium: false,
    createdAt: new Date(),
  };
  return { user, token: 'google_token_' + Date.now() };
};

const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadStoredAuth = useCallback(async () => {
    try {
      const [userData, token] = await Promise.all([
        storage.getItem(STORAGE_KEY),
        storage.getItem(TOKEN_KEY),
      ]);

      if (userData && token) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { user, token } = await mockLogin(credentials);
      
      await Promise.all([
        storage.setItem(STORAGE_KEY, JSON.stringify(user)),
        storage.setItem(TOKEN_KEY, token),
      ]);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { user, token } = await mockRegister(credentials);
      
      await Promise.all([
        storage.setItem(STORAGE_KEY, JSON.stringify(user)),
        storage.setItem(TOKEN_KEY, token),
      ]);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    return mockForgotPassword(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        storage.removeItem(STORAGE_KEY),
        storage.removeItem(TOKEN_KEY),
      ]);

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // For now, use mock Google login
      // In production, you would implement real Google OAuth here
      const { user, token } = await mockGoogleLogin();
      
      await Promise.all([
        storage.setItem(STORAGE_KEY, JSON.stringify(user)),
        storage.setItem(TOKEN_KEY, token),
      ]);

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    
    await storage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  }, [authState.user]);

  return useMemo(() => ({
    ...authState,
    login,
    register,
    forgotPassword,
    loginWithGoogle,
    logout,
    updateUser,
  }), [authState, login, register, forgotPassword, loginWithGoogle, logout, updateUser]);
});