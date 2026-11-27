import { appState, useAppState } from '@/state/appState';

export const TARGET_MIN = 1200;
export const TARGET_MAX = 5000;
export const TARGET_STEP = 50;

/** Typical maintenance for an adult by activity level, before the goal adjustment. */
const maintenanceByActivity: Record<string, number> = {
  sitting: 1800,
  light: 2000,
  active: 2300,
  very: 2600,
};

const adjustmentByGoal: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const FALLBACK_MAINTENANCE = 2000;

export type Macros = {
  protein: number;
  carbs: number;
  fat: number;
};

function clampTarget(value: number): number {
  const stepped = Math.round(value / TARGET_STEP) * TARGET_STEP;
  return Math.min(TARGET_MAX, Math.max(TARGET_MIN, stepped));
}

/** The two numbers the target is built from, shown on the plan step. */
export function targetParts(answers: Record<string, string>): { maintenance: number; adjustment: number } {
  return {
    maintenance: maintenanceByActivity[answers.activity] ?? FALLBACK_MAINTENANCE,
    adjustment: adjustmentByGoal[answers.goal] ?? 0,
  };
}

/** The daily calorie target the onboarding answers suggest. */
export function suggestedTarget(answers: Record<string, string>): number {
  const { maintenance, adjustment } = targetParts(answers);
  return clampTarget(maintenance + adjustment);
}

/** Grams per day from a 30 / 40 / 30 split of protein, carbs and fat (4, 4 and 9 kcal per gram). */
export function macroTargets(calories: number): Macros {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
}

export function useDailyTarget() {
  const { onboardingAnswers, calorieTarget } = useAppState();
  const suggested = suggestedTarget(onboardingAnswers);
  const target = calorieTarget ?? suggested;
  return { target, suggested, isCustom: calorieTarget !== undefined, macros: macroTargets(target) };
}

/** Override the suggested target, or pass undefined to go back to it. */
export function setDailyTarget(target: number | undefined) {
  appState.set({ calorieTarget: target === undefined ? undefined : clampTarget(target) });
}
