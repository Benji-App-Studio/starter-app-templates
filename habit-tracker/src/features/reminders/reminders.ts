import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Habit } from '@/db/habits';
import { appState } from '@/state/appState';

import { EVERY_DAY, parseTime } from '../habits/dates';

/** Reminders show as banners while the app is open too, so a check-in is never missed. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL = 'habit-reminders';

function identifier(habitId: number, weekday: number): string {
  return `habit-${habitId}-${weekday}`;
}

export async function hasReminderPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** Asks the system for permission. Only called from the Settings switch. */
export async function requestReminderPermission(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync();
  if (granted && Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Habit reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return granted;
}

export async function cancelHabitReminders(habitId: number): Promise<void> {
  await Promise.all(
    EVERY_DAY.map((day) => Notifications.cancelScheduledNotificationAsync(identifier(habitId, day))),
  );
}

/**
 * Replaces the habit's reminders with one weekly notification per scheduled day,
 * or none when reminders are off or the habit has no time.
 */
export async function syncHabitReminders(habit: Habit): Promise<void> {
  await cancelHabitReminders(habit.id);
  if (!appState.get().remindersEnabled || !habit.reminderTime) {
    return;
  }
  const { hour, minute } = parseTime(habit.reminderTime);
  await Promise.all(
    habit.days.map((day) =>
      Notifications.scheduleNotificationAsync({
        identifier: identifier(habit.id, day),
        content: { title: habit.name, body: 'Time to check in. Hold the tile to keep the streak.' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          // Expo counts weekdays from 1 = Sunday; the habit stores 0 = Sunday.
          weekday: day + 1,
          hour,
          minute,
          channelId: ANDROID_CHANNEL,
        },
      }),
    ),
  );
}

export async function syncAllReminders(habits: Habit[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Promise.all(habits.map(syncHabitReminders));
}

export function cancelAllReminders(): Promise<void> {
  return Notifications.cancelAllScheduledNotificationsAsync();
}
