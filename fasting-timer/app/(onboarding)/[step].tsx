import { Redirect, useLocalSearchParams } from 'expo-router';

import { onboardingSteps } from '@/config/onboarding';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';

export default function OnboardingStep() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Number(step);

  if (!Number.isInteger(index) || index < 0 || index >= onboardingSteps.length) {
    return <Redirect href="/" />;
  }

  return <OnboardingScreen step={index} />;
}
