import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  CheckSquare, 
  Target, 
  Trophy, 
  MessageCircle, 
  BarChart3,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react-native';
import { useOnboarding } from '@/contexts/OnboardingContext';
import Colors from '@/constants/colors';



interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundColor: string;
  textColor: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to MindWell',
    description: 'Your personal companion for mental wellness and habit building. Let\'s take a quick tour to show you around!',
    icon: <CheckSquare color="white" size={60} />,
    backgroundColor: Colors.light.tint,
    textColor: 'white',
  },
  {
    id: 2,
    title: 'Track Your Tasks',
    description: 'Create and manage daily tasks to build positive habits. Check them off as you complete them and watch your progress grow.',
    icon: <CheckSquare color="white" size={60} />,
    backgroundColor: '#4CAF50',
    textColor: 'white',
  },
  {
    id: 3,
    title: 'Complete Missions',
    description: 'Take on wellness missions across different categories. Each completed mission earns you points and helps improve your mental health.',
    icon: <Target color="white" size={60} />,
    backgroundColor: '#FF9800',
    textColor: 'white',
  },
  {
    id: 4,
    title: 'Climb the Rankings',
    description: 'See how you\'re doing compared to others. Earn points, level up, and celebrate your achievements with the community.',
    icon: <Trophy color="white" size={60} />,
    backgroundColor: '#9C27B0',
    textColor: 'white',
  },
  {
    id: 5,
    title: 'Track Your Progress',
    description: 'View detailed statistics about your wellness journey. See your streaks, completed tasks, and overall progress over time.',
    icon: <BarChart3 color="white" size={60} />,
    backgroundColor: '#2196F3',
    textColor: 'white',
  },
  {
    id: 6,
    title: 'Get Support',
    description: 'Chat with our AI wellness assistant anytime you need support, guidance, or just someone to talk to about your mental health.',
    icon: <MessageCircle color="white" size={60} />,
    backgroundColor: '#E91E63',
    textColor: 'white',
  },
  {
    id: 7,
    title: 'You\'re All Set!',
    description: 'Ready to start your wellness journey? Remember, small steps lead to big changes. Let\'s begin building better habits together!',
    icon: <CheckSquare color="white" size={60} />,
    backgroundColor: Colors.light.tint,
    textColor: 'white',
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const insets = useSafeAreaInsets();
  const { markOnboardingComplete } = useOnboarding();

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const handleFinish = async () => {
    await markOnboardingComplete();
    router.replace('/(tabs)');
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: currentStepData.backgroundColor,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleSkip}
        testID="skip-button"
      >
        <X color={currentStepData.textColor} size={24} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {currentStepData.icon}
        </View>

        <Text style={[styles.title, { color: currentStepData.textColor }]}>
          {currentStepData.title}
        </Text>

        <Text style={[styles.description, { color: currentStepData.textColor }]}>
          {currentStepData.description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSteps.map((step, index) => (
            <View
              key={step.id}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentStep 
                    ? currentStepData.textColor 
                    : `${currentStepData.textColor}40`,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              currentStep === 0 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
            testID="previous-button"
          >
            <ArrowLeft 
              color={currentStep === 0 ? `${currentStepData.textColor}40` : currentStepData.textColor} 
              size={24} 
            />
            <Text 
              style={[
                styles.navButtonText, 
                { 
                  color: currentStep === 0 ? `${currentStepData.textColor}40` : currentStepData.textColor 
                }
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
            testID="next-button"
          >
            <Text style={[styles.navButtonText, { color: currentStepData.textColor }]}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <ArrowRight color={currentStepData.textColor} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.9,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 120,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  previousButton: {
    marginRight: 16,
  },
  nextButton: {
    marginLeft: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
});