import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import type { Currency } from './money';

/** Settings the user changes after onboarding. Unset values fall back to the onboarding answers. */
export type ThemeChoice = 'system' | 'light' | 'dark';

export const themeChoices: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export type Preferences = {
  currency: Currency;
  theme: ThemeChoice;
  /** Day of the month the budget resets on. */
  periodStartDay?: number;
  /**
   * When the user finished onboarding. The month they start in only gets the days that are left,
   * so day one mid-month is not the whole month's budget spread over four days.
   */
  startedAt?: number;
};

const STORAGE_KEY = 'expenses/preferences/v1';

const defaults: Preferences = { currency: 'USD', theme: 'system' };

/** Overrides the device appearance for the whole app, native sheets and alerts included. */
function applyTheme(theme: ThemeChoice) {
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}

let state: Preferences = defaults;
let ready: Promise<void> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const preferences = {
  get: () => state,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Resolves once the saved preferences have been read. Safe to await on every load. */
  ready(): Promise<void> {
    ready ??= AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const saved: Partial<Preferences> = raw ? JSON.parse(raw) : {};
      state = { ...defaults, ...saved };
      applyTheme(state.theme);
      emit();
    });
    return ready;
  },

  set(patch: Partial<Preferences>) {
    state = { ...state, ...patch };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (patch.theme) {
      applyTheme(patch.theme);
    }
    emit();
  },

  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    state = defaults;
    applyTheme(state.theme);
    emit();
  },
};

export function usePreferences(): Preferences {
  return useSyncExternalStore(preferences.subscribe, preferences.get, preferences.get);
}
