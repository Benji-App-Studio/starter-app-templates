import * as Notifications from 'expo-notifications';

import { appConfig } from '@/config/app';

const FAST_END_ID = 'fast-end';
const START_REMINDER_ID = 'fast-start-reminder';

/** Call once at launch so a notification that fires while the app is open still shows. */
export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** True when notifications are allowed. Asks only when the user has not answered yet. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

/** One alert at the moment the running fast reaches its goal. Replaces any earlier one. */
export async function scheduleFastEndAlert(endsAt: number, goalHours: number) {
  await cancelFastEndAlert();
  if (endsAt <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: FAST_END_ID,
    content: {
      title: `${goalHours} hours done`,
      body: `Your fast reached its goal. Open ${appConfig.name} to end it and keep the streak.`,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: endsAt },
  });
}

export function cancelFastEndAlert() {
  return Notifications.cancelScheduledNotificationAsync(FAST_END_ID);
}

/** A daily nudge at the usual start time. Replaces any earlier one. */
export async function scheduleStartReminder(hour: number, minute: number) {
  await cancelStartReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: START_REMINDER_ID,
    content: {
      title: 'Time to start your fast',
      body: 'Last meal done? Start the timer and the ring takes it from here.',
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export function cancelStartReminder() {
  return Notifications.cancelScheduledNotificationAsync(START_REMINDER_ID);
}
