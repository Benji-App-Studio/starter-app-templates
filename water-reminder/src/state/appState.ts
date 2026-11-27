import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/** Everything the root layout needs to pick a route, plus the onboarding answers. */
export type AppState = {
  /** True once the persisted state has been read from disk. */
  hydrated: boolean;
  onboardingDone: boolean;
  /** Keyed by the onboarding question id. */
  onboardingAnswers: Record<string, string>;
  /** Last known entitlement. Refreshed by `src/purchases`. */
  entitled: boolean;
};

type PersistedState = Omit<AppState, 'hydrated'>;

const STORAGE_KEY = 'app-state/v1';

const initialState: AppState = {
  hydrated: false,
  onboardingDone: false,
  onboardingAnswers: {},
  entitled: false,
};

let state = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  const { hydrated: _hydrated, ...persisted } = state;
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted satisfies PersistedState));
}

export const appState = {
  get: () => state,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Merge a change, persist it, notify subscribers. */
  set(patch: Partial<PersistedState>) {
    state = { ...state, ...patch };
    persist();
    emit();
  },

  /** Read the persisted state once at launch. */
  async hydrate() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved: Partial<PersistedState> = raw ? JSON.parse(raw) : {};
    state = { ...initialState, ...saved, hydrated: true };
    emit();
  },

  /** Back to first launch. Used by the Settings reset in development. */
  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    state = { ...initialState, hydrated: true };
    emit();
  },
};

export function useAppState(): AppState {
  return useSyncExternalStore(appState.subscribe, appState.get, appState.get);
}
