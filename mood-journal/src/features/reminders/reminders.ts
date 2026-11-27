import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useSyncExternalStore } from 'react';

import { appConfig } from '@/config/app';
import type { CheckInTimeAnswer } from '@/config/onboarding';

export type ReminderSettings = {
  enabled: boolean;
  /** Hour of the day, 0–23. */
  hour: number;
};

const STORAGE_KEY = 'reminder/v1';
const NOTIFICATION_ID = 'daily-check-in';

const DEFAULT_HOURS: Record<CheckInTimeAnswer, number> = {
  morning: 8,
  midday: 13,
  evening: 20,
  night: 22,
};

/** The hour the onboarding answer stands for; evening when nothing was answered. */
export function defaultReminderHour(answer: string | undefined): number {
  return answer !== undefined && answer in DEFAULT_HOURS ? DEFAULT_HOURS[answer as CheckInTimeAnswer] : 20;
}

/** Hours offered in the reminder-time sheet. */
export const REMINDER_HOURS: readonly number[] = Array.from({ length: 18 }, (_, index) => index + 6);

let settings: ReminderSettings | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Call once at launch so a reminder arriving while the app is open still shows a banner. */
export function configureReminderNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function readSettings(fallbackHour: number): Promise<ReminderSettings> {
  if (settings) {
    return settings;
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const saved: Partial<ReminderSettings> = raw ? JSON.parse(raw) : {};
  settings = { enabled: saved.enabled ?? false, hour: saved.hour ?? fallbackHour };
  emit();
  return settings;
}

async function writeSettings(next: ReminderSettings) {
  settings = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

async function schedule(hour: number) {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: 'How was today?',
      body: `Slide to your mood and write a line in ${appConfig.name}.`,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
  });
}

/** Asks for permission if needed, then schedules the daily reminder. False when permission was refused. */
export async function enableReminder(hour: number): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    return false;
  }
  await schedule(hour);
  await writeSettings({ enabled: true, hour });
  return true;
}

export async function disableReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  await writeSettings({ enabled: false, hour: settings?.hour ?? 20 });
}

export async function setReminderHour(hour: number): Promise<void> {
  const enabled = settings?.enabled ?? false;
  if (enabled) {
    await schedule(hour);
  }
  await writeSettings({ enabled, hour });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The reminder settings, loaded on first use with the onboarding answer as the default hour. */
export function useReminder(fallbackHour: number): ReminderSettings | undefined {
  const current = useSyncExternalStore(subscribe, () => settings, () => settings);
  if (current === undefined) {
    void readSettings(fallbackHour);
  }
  return current;
}
