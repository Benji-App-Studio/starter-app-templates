import { DAYS_QUESTION_ID } from '@/config/onboarding';
import { useAppState } from '@/state/appState';

export const DEFAULT_WEEKLY_GOAL = 3;

/** The onboarding answer is the number of days as a string ("2".."5"). */
export function goalFromAnswer(answer: string | undefined): number {
  const parsed = Number(answer);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 7 ? parsed : DEFAULT_WEEKLY_GOAL;
}

/** Sessions per week the user is aiming for: the Settings override, else the onboarding answer. */
export function useWeeklyGoal(): number {
  const { weeklyGoal, onboardingAnswers } = useAppState();
  return weeklyGoal ?? goalFromAnswer(onboardingAnswers[DAYS_QUESTION_ID]);
}
