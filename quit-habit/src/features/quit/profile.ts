import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useSyncExternalStore } from 'react';

import { appState } from '@/state/appState';

import { costPerDayBySpend, habits, isAmountId, isHabitId, isSpendId, type HabitId } from './habits';

export const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR'] as const;
export type Currency = (typeof currencies)[number];

/** What the counter needs to turn time into money and units. Editable in Settings. */
export type Profile = {
  habit: HabitId;
  unitsPerDay: number;
  costPerDay: number;
  currency: Currency;
};

const STORAGE_KEY = 'quit-profile/v1';

let profileState: Profile | undefined;
let hydration: Promise<void> | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** First-launch defaults, computed from the onboarding answers. */
export function profileFromAnswers(answers: Record<string, string>): Profile {
  const habit = isHabitId(answers.habit) ? answers.habit : 'smoking';
  const amount = isAmountId(answers.amount) ? answers.amount : 'moderate';
  const spend = isSpendId(answers.spend) ? answers.spend : '5to10';
  return {
    habit,
    unitsPerDay: habits[habit].unitsPerDayByAmount[amount],
    costPerDay: costPerDayBySpend[spend],
    currency: 'USD',
  };
}

export const profile = {
  get: () => profileState,

  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Reads the saved profile once; builds it from the onboarding answers the first time. */
  hydrate(): Promise<void> {
    hydration ??= AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      profileState = raw
        ? (JSON.parse(raw) as Profile)
        : profileFromAnswers(appState.get().onboardingAnswers);
      emit();
    });
    return hydration;
  },

  set(patch: Partial<Profile>) {
    if (!profileState) {
      return;
    }
    profileState = { ...profileState, ...patch };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profileState));
    emit();
  },

  /** Forgets the profile so the next launch rebuilds it from onboarding. */
  async reset() {
    await AsyncStorage.removeItem(STORAGE_KEY);
    profileState = undefined;
    hydration = undefined;
    emit();
  },
};

/** The profile, or undefined until it has been read from disk. */
export function useProfile(): Profile | undefined {
  const value = useSyncExternalStore(profile.subscribe, profile.get, profile.get);
  useEffect(() => {
    if (!value) {
      void profile.hydrate();
    }
  }, [value]);
  return value;
}

export function formatMoney(amount: number, currency: Currency, fractionDigits = 2): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}
