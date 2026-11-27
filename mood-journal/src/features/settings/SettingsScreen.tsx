import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { Group as RowGroup, ListRow, Screen, Section, Text } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllCheckIns } from '@/db/checkIns';
import { formatHour } from '@/features/journal/dates';
import { loadSampleData } from '@/features/journal/sampleData';
import { defaultReminderHour, disableReminder, enableReminder, useReminder } from '@/features/reminders/reminders';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const router = useRouter();
  const { entitled, onboardingAnswers } = useAppState();
  const reminder = useReminder(defaultReminderHour(onboardingAnswers.checkInTime));
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setRestoring(true);
    try {
      const active = await restore();
      Alert.alert(
        active ? 'Purchases restored' : 'Nothing to restore',
        active ? 'Your subscription is active.' : 'No active subscription was found.',
      );
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setRestoring(false);
    }
  }

  async function handleManage() {
    const url = (await getManagementUrl()) ?? APPLE_SUBSCRIPTIONS_URL;
    await Linking.openURL(url);
  }

  async function handleRate() {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
      return;
    }
    const url = StoreReview.storeUrl();
    if (url) {
      await Linking.openURL(url);
    }
  }

  function handleContact() {
    const subject = encodeURIComponent(`${appConfig.name} feedback`);
    void Linking.openURL(`mailto:${appConfig.supportEmail}?subject=${subject}`);
  }

  async function handleReminderToggle(enabled: boolean) {
    if (!reminder) {
      return;
    }
    if (!enabled) {
      await disableReminder();
      return;
    }
    const granted = await enableReminder(reminder.hour);
    if (!granted) {
      Alert.alert('Notifications are off', `Allow notifications for ${appConfig.name} in iOS Settings to get a daily reminder.`, [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void Linking.openSettings() },
      ]);
    }
  }

  function handleErase() {
    Alert.alert('Erase every check-in?', 'All moods, tags and notes on this device are deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: () => void deleteAllCheckIns() },
    ]);
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void appState.reset() },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen tab title="Settings">
      <Group title="Journal">
        <ListRow
          title="Daily reminder"
          subtitle={reminder?.enabled ? `Every day at ${formatHour(reminder.hour)}` : 'A quiet nudge to check in'}
          icon="bell"
          right={
            <Switch
              value={reminder?.enabled ?? false}
              disabled={!reminder}
              onValueChange={(value) => void handleReminderToggle(value)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          }
        />
        <ListRow
          title="Reminder time"
          icon="clock"
          onPress={() => router.push('/reminder-time')}
          right={
            <View style={[styles.value, { gap: spacing.xs }]}>
              <Text variant="caption" color="muted">
                {reminder ? formatHour(reminder.hour) : ''}
              </Text>
            </View>
          }
        />
      </Group>

      <Group title="Appearance">
        <ListRow
          title="Theme"
          subtitle="Follows the device setting"
          right={
            <View style={[styles.swatches, { gap: spacing.xs }]}>
              {[colors.primary, colors.text, colors.surface].map((color) => (
                <View
                  key={color}
                  style={[styles.swatch, { backgroundColor: color, borderColor: colors.textMuted, borderRadius: radii.pill }]}
                />
              ))}
              <Text variant="caption" color="muted">
                {theme.scheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </View>
          }
        />
      </Group>

      <Group title="Subscription">
        <ListRow
          title="Status"
          right={
            <Text variant="caption" color={entitled ? 'primary' : 'muted'}>
              {entitled ? 'Active' : 'Not subscribed'}
            </Text>
          }
        />
        <ListRow
          title={restoring ? 'Restoring…' : 'Restore purchases'}
          icon="restore"
          onPress={restoring ? undefined : () => void handleRestore()}
        />
        <ListRow title="Manage subscription" icon="card" onPress={() => void handleManage()} />
      </Group>

      <Group title="About">
        <ListRow title="Terms of use" icon="document" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
        <ListRow title="Privacy policy" icon="shield" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
        <ListRow title="Rate the app" icon="star" onPress={() => void handleRate()} />
        <ListRow title="Contact us" icon="mail" onPress={handleContact} />
        <ListRow
          title="Version"
          right={
            <Text variant="caption" color="muted">
              {version}
            </Text>
          }
        />
      </Group>

      <Group title="Data">
        <ListRow title="Erase all check-ins" icon="eraser" destructive onPress={handleErase} />
      </Group>

      {__DEV__ ? (
        <Group title="Development">
          <ListRow title="Load sample data" icon="sparkles" onPress={() => void loadSampleData()} />
          <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} />
        </Group>
      ) : null}
    </Screen>
  );
}

/** A titled inset group of rows. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section title={title}>
      <RowGroup>{children}</RowGroup>
    </Section>
  );
}

const styles = StyleSheet.create({
  swatches: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 16, height: 16, borderWidth: 1 },
  value: { flexDirection: 'row', alignItems: 'center' },
});
