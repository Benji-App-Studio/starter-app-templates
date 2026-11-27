import { useAppState } from '@/state/appState';

import { recommendedGoalMl } from './goal';
import { useHydrationSettings } from './settings';

/** The goal in force: a custom value from Settings, else the onboarding recommendation. */
export function useGoal() {
  const { onboardingAnswers } = useAppState();
  const { customGoalMl, unit } = useHydrationSettings();
  const recommendedMl = recommendedGoalMl(onboardingAnswers);
  return {
    goalMl: customGoalMl ?? recommendedMl,
    recommendedMl,
    isCustom: customGoalMl !== null,
    unit,
  };
}
