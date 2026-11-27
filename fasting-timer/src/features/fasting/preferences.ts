import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { appState } from '@/state/appState';

import { DEFAULT_PROTOCOL, protocols, type ProtocolId } from './protocols';

/** What the user can change in Settings. Until they do, each value comes from onboarding. */
export type Preferences = {
  protocolId: ProtocolId;
  /** When the fast usually starts: the end of the last meal. */
  startHour: number;
  startMinute: number;
  /** A notification the moment the fast reaches its goal. */
  endAlert: boolean;
  /** A daily notification at the start time. */
  startReminder: boolean;
};

const STORAGE_KEY = 'fasting-preferences/v1';

/** Onboarding "How much have you fasted before?" → a starting plan. */
const protocolByExperience: Record<string, ProtocolId> = {
  new: '14:10',
  some: '16:8',
  regular: '18:6',
  advanced: '20:4',
};

/** Onboarding "When do you usually finish your last meal?" → the hour the fast starts. */
export function defaultsFromAnswers(answers: Record<string, string>): Preferences {
  const lastMeal = Number(answers.lastMeal);
  return {
    protocolId: protocolByExperience[answers.experience ?? ''] ?? DEFAULT_PROTOCOL,
    startHour: Number.isInteger(lastMeal) ? lastMeal : 20,
    startMinute: 0,
    endAlert: false,
    startReminder: false,
  };
}

let saved: Partial<Preferences> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function isProtocolId(value: unknown): value is ProtocolId {
  return protocols.some((protocol) => protocol.id === value);
}

// `useSyncExternalStore` needs the same object back until something changed.
let snapshot: { answers: Record<string, string>; saved: Partial<Preferences>; value: Preferences } | undefined;

function resolve(): Preferences {
  const answers = appState.get().onboardingAnswers;
  if (snapshot && snapshot.answers === answers && snapshot.saved === saved) {
    return snapshot.value;
  }
  const defaults = defaultsFromAnswers(answers);
  const protocolId = isProtocolId(saved.protocolId) ? saved.protocolId : defaults.protocolId;
  snapshot = { answers, saved, value: { ...defaults, ...saved, protocolId } };
  return snapshot.value;
}

export const preferences = {
  get: resolve,

  subscribe(listener: () => void) {
    listeners.add(listener);
    const unsubscribeAppState = appState.subscribe(listener);
    return () => {
      listeners.delete(listener);
      unsubscribeAppState();
    };
  },

  set(patch: Partial<Preferences>) {
    saved = { ...saved, ...patch };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    emit();
  },

  /** Read the saved overrides once at launch. */
  async hydrate() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    saved = raw ? (JSON.parse(raw) as Partial<Preferences>) : {};
    emit();
  },

  /** Back to the onboarding-derived defaults. */
  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    saved = {};
    emit();
  },
};

/** The resolved preferences; re-renders when they or the onboarding answers change. */
export function usePreferences(): Preferences {
  return useSyncExternalStore(preferences.subscribe, preferences.get, preferences.get);
}
