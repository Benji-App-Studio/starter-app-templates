import * as Notifications from 'expo-notifications';
import { Linking } from 'react-native';

import type { Phase } from './timer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function hasNotificationPermission(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/**
 * Ask for permission from the Settings row. If the user declined before, iOS
 * never asks again, so the system settings are opened instead.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain) {
    await Linking.openSettings();
    return false;
  }
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

const copy: Record<Phase, (label: string) => { title: string; body: string }> = {
  focus: (label) => ({ title: 'Session done', body: `${label} is saved. Time for a break.` }),
  break: () => ({ title: 'Break over', body: 'Ready for the next session?' }),
};

/** Schedule the end-of-phase alert. Resolves to the id needed to cancel it. */
export async function scheduleEndNotification(phase: Phase, label: string, endsAt: number): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { ...copy[phase](label), sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: endsAt },
  });
}

export function cancelNotification(id: string | undefined) {
  if (id) {
    void Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
  }
}
