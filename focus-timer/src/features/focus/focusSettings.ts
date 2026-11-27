import { appState, useAppState } from '@/state/appState';

import { createPersistedStore, usePersistedStore } from './persistedStore';

export type FocusSettings = {
  /** Length of one focus session, 5–60. The dial sets it per session; this is the default. */
  focusMinutes: number;
  breakMinutes: number;
  /** Finished sessions that count as a full day. */
  dailyGoal: number;
  /** Notify when a session or break ends. Only true after permission was granted. */
  alerts: boolean;
};

export const FOCUS_MINUTES_RANGE = { min: 5, max: 60, step: 5 } as const;
export const BREAK_MINUTES_RANGE = { min: 5, max: 30, step: 5 } as const;
export const DAILY_GOAL_RANGE = { min: 1, max: 12, step: 1 } as const;

/** The onboarding answers become the first settings; the user refines them in Settings. */
export function defaultsFromAnswers(answers: Record<string, string>): FocusSettings {
  const focusMinutes = clamp(Number(answers.sessionLength) || 25, FOCUS_MINUTES_RANGE);
  return {
    focusMinutes,
    breakMinutes: focusMinutes >= 45 ? 10 : 5,
    dailyGoal: clamp(Number(answers.dailyGoal) || 4, DAILY_GOAL_RANGE),
    alerts: false,
  };
}

function clamp(value: number, range: { min: number; max: number }) {
  return Math.min(range.max, Math.max(range.min, value));
}

/** `null` until the user changes something; the onboarding defaults apply meanwhile. */
export const focusSettingsStore = createPersistedStore<FocusSettings | null>('focus-settings/v1', null);

export function getFocusSettings(): FocusSettings {
  return focusSettingsStore.get() ?? defaultsFromAnswers(appState.get().onboardingAnswers);
}

export function updateFocusSettings(patch: Partial<FocusSettings>) {
  focusSettingsStore.set({ ...getFocusSettings(), ...patch });
}

export function useFocusSettings(): { settings: FocusSettings; hydrated: boolean } {
  const { hydrated, value } = usePersistedStore(focusSettingsStore);
  const { onboardingAnswers } = useAppState();
  return { settings: value ?? defaultsFromAnswers(onboardingAnswers), hydrated };
}
