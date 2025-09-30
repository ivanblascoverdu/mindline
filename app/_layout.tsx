import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { TaskProvider } from '@/contexts/TaskContext';
import SettingsOverlay from '@/components/SettingsOverlay';

export default function RootLayout() {
  const queryClientRef = useRef(new QueryClient());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', status => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClientRef.current}>
          <AuthProvider>
            <OnboardingProvider>
              <TaskProvider>
                <StatusBar style="dark" />
                <SettingsOverlay />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="professional-help" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </TaskProvider>
            </OnboardingProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
