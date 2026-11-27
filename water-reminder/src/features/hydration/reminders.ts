import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

import type { HydrationSettings } from './settings';

export type ReminderSlot = { hour: number; minute: number };

/** Every reminder time between the first and last reminder, at the chosen interval. */
export function reminderSlots(settings: HydrationSettings): ReminderSlot[] {
  const start = settings.reminderStartHour * 60;
  const end = settings.reminderEndHour * 60;
  const slots: ReminderSlot[] = [];
  for (let minutes = start; minutes <= end; minutes += settings.reminderIntervalMinutes) {
    slots.push({ hour: Math.floor(minutes / 60), minute: minutes % 60 });
  }
  return slots;
}

/**
 * Ask for notification permission. Returns true when reminders can fire.
 * iOS asks only once, so a denied answer sends the user to the system settings.
 */
export async function requestReminderPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (current.canAskAgain) {
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  }
  await Linking.openSettings();
  return false;
}

const bodies = [
  'A glass now keeps today on track.',
  'Time for a sip. Your glass is waiting.',
  'Top up before the afternoon gets busy.',
  'A quick drink and you are a step closer to the goal.',
];

/**
 * Replace every scheduled reminder with the current schedule. Called whenever
 * reminder settings change and once at launch, so a reinstall restores them.
 */
export async function syncReminders(settings: HydrationSettings): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!settings.remindersEnabled) {
    return;
  }
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    return;
  }

  const slots = reminderSlots(settings);
  await Promise.all(
    slots.map((slot, index) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: index === 0 ? 'Good morning, start with a glass' : 'Time for some water',
          body: bodies[index % bodies.length],
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: slot.hour,
          minute: slot.minute,
        },
      }),
    ),
  );
}
