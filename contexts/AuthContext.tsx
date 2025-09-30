import createContextHook from '@nkzw/create-context-hook';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  AuthState,
  User,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordData,
} from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

const DEFAULT_AUTH_STATE: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

const mapProfileToUser = (profile: any, fallbackEmail?: string): User => ({
  id: profile.id,
  email: profile.email ?? fallbackEmail ?? '',
  name: profile.full_name ?? profile.name ?? '',
  avatar: profile.avatar_url ?? undefined,
  isPremium: Boolean(profile.is_premium),
  premiumExpiresAt: profile.premium_expires_at ? new Date(profile.premium_expires_at) : undefined,
  createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
});

const fetchProfile = async (userId: string, fallbackEmail?: string): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, is_premium, premium_expires_at, created_at')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  if (!data) {
    const { data: newProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: fallbackEmail ?? '',
        full_name: '',
        is_premium: false,
      })
      .select()
      .single();

    if (upsertError || !newProfile) {
      throw new Error(upsertError?.message ?? 'No profile data available.');
    }

    return mapProfileToUser(newProfile, fallbackEmail);
  }

  return mapProfileToUser(data, fallbackEmail);
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'myapp',
});

const ensureSupabaseConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>(DEFAULT_AUTH_STATE);
  const mountedRef = useRef(true);

  const setStateSafe = useCallback((updater: AuthState | ((prev: AuthState) => AuthState)) => {
    if (!mountedRef.current) return;
    setAuthState(prev => (typeof updater === 'function' ? (updater as (p: AuthState) => AuthState)(prev) : updater));
  }, []);

  const hydrateSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      setStateSafe(prev => ({ ...prev, isLoading: true }));

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? undefined);
        setStateSafe({ user: profile, isAuthenticated: true, isLoading: false });
      } else {
        setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      console.error('Error hydrating auth session:', err);
      setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [setStateSafe]);

  useEffect(() => {
    hydrateSession();

    if (!isSupabaseConfigured) {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      try {
        setStateSafe(prev => ({ ...prev, isLoading: true }));
        const profile = await fetchProfile(session.user.id, session.user.email ?? undefined);
        setStateSafe({ user: profile, isAuthenticated: true, isLoading: false });
      } catch (authError) {
        console.error('Error updating auth state:', authError);
        setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return () => {
      mountedRef.current = false;
      subscription?.unsubscribe();
    };
  }, [hydrateSession, setStateSafe]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    ensureSupabaseConfigured();

    try {
      setStateSafe(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No se pudo iniciar sesion. Intenta de nuevo.');
      }

      const profile = await fetchProfile(data.user.id, data.user.email ?? credentials.email);
      setStateSafe({ user: profile, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setStateSafe(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [setStateSafe]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    ensureSupabaseConfigured();

    try {
      setStateSafe(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const user = data.user;

      if (!user) {
        throw new Error('Registro pendiente de confirmacion. Revisa tu correo.');
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email ?? credentials.email,
        full_name: credentials.name,
        is_premium: false,
        created_at: new Date().toISOString(),
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      const profile = await fetchProfile(user.id, user.email ?? credentials.email);
      setStateSafe({ user: profile, isAuthenticated: true, isLoading: false });
    } catch (error) {
      setStateSafe(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [setStateSafe]);

  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    ensureSupabaseConfigured();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: redirectUri,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const logout = useCallback(async () => {
    ensureSupabaseConfigured();

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    setStateSafe({ user: null, isAuthenticated: false, isLoading: false });
  }, [setStateSafe]);

  const loginWithGoogle = useCallback(async () => {
    ensureSupabaseConfigured();

    try {
      setStateSafe(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error('No se pudo iniciar el flujo de Google.');
      }

      const result = await (AuthSession as any).startAsync({
        authUrl: data.url,
        returnUrl: redirectUri,
      });

      if (result.type !== 'success') {
        throw new Error('Inicio de sesion cancelado.');
      }

      setStateSafe(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setStateSafe(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [setStateSafe]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      ensureSupabaseConfigured();

      if (!authState.user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name ?? authState.user.name,
          avatar_url: updates.avatar ?? authState.user.avatar ?? null,
          is_premium: updates.isPremium ?? authState.user.isPremium,
          premium_expires_at: updates.premiumExpiresAt?.toISOString() ?? authState.user.premiumExpiresAt?.toISOString() ?? null,
        })
        .eq('id', authState.user.id);

      if (error) {
        throw new Error(error.message);
      }

      const refreshedProfile = await fetchProfile(authState.user.id, authState.user.email);
      setStateSafe(prev => ({
        ...prev,
        user: refreshedProfile,
      }));
    },
    [authState.user, setStateSafe]
  );

  return useMemo(
    () => ({
      ...authState,
      login,
      register,
      forgotPassword,
      loginWithGoogle,
      logout,
      updateUser,
      isSupabaseConfigured,
    }),
    [authState, forgotPassword, login, loginWithGoogle, logout, register, updateUser]
  );
});
