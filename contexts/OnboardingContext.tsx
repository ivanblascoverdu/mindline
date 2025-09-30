import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

const ONBOARDING_KEY = 'has_seen_onboarding';

export const [OnboardingProvider, useOnboarding] = createContextHook(() => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOnboardingStatus = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(stored === 'true');
    } catch (error) {
      console.error('Error loading onboarding status:', error);
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  const markOnboardingComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  }, []);

  return useMemo(() => ({
    hasSeenOnboarding,
    isLoading,
    markOnboardingComplete,
    resetOnboarding,
  }), [hasSeenOnboarding, isLoading, markOnboardingComplete, resetOnboarding]);
});