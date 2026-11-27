import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { Unit } from './goal';

/** The user's hydration preferences. Drinks themselves live in SQLite. */
export type HydrationSettings = {
  unit: Unit;
  /** A goal the user typed in Settings; null means "use the recommendation from onboarding". */
  customGoalMl: number | null;
  remindersEnabled: boolean;
  /** First and last reminder, as hours of the day (0–23). */
  reminderStartHour: number;
  reminderEndHour: number;
  reminderIntervalMinutes: number;
};

const STORAGE_KEY = 'hydration-settings/v1';

export const defaultSettings: HydrationSettings = {
  unit: 'ml',
  customGoalMl: null,
  remindersEnabled: false,
  reminderStartHour: 8,
  reminderEndHour: 22,
  reminderIntervalMinutes: 120,
};

let state = defaultSettings;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const hydrationSettings = {
  get: () => state,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Merge a change, persist it, notify subscribers. */
  set(patch: Partial<HydrationSettings>) {
    state = { ...state, ...patch };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    emit();
  },

  /** Read the saved settings once at launch. */
  async hydrate() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved: Partial<HydrationSettings> = raw ? JSON.parse(raw) : {};
    state = { ...defaultSettings, ...saved };
    emit();
  },

  /** Back to defaults. Used by the Settings reset in development. */
  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    state = defaultSettings;
    emit();
  },
};

export function useHydrationSettings(): HydrationSettings {
  return useSyncExternalStore(hydrationSettings.subscribe, hydrationSettings.get, hydrationSettings.get);
}
