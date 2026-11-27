import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { ListRow, Screen, Text } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllHabits, listHabits } from '@/db/habits';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { formatTime } from '../habits/dates';
import { loadSampleData } from '../habits/sampleData';
import { CHECKIN_TIMES, checkinFor } from '../habits/starters';
import { cancelAllReminders, requestReminderPermission, syncAllReminders } from '../reminders/reminders';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const { entitled, onboardingAnswers, remindersEnabled } = useAppState();
  const [restoring, setRestoring] = useState(false);
  const checkin = checkinFor(onboardingAnswers);

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

  async function handleReminders(on: boolean) {
    if (!on) {
      appState.set({ remindersEnabled: false });
      await cancelAllReminders();
      return;
    }
    const granted = await requestReminderPermission();
    if (!granted) {
      Alert.alert('Notifications are off', `Allow notifications for ${appConfig.name} in the Settings app to get reminders.`, [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => void Linking.openSettings() },
      ]);
      return;
    }
    appState.set({ remindersEnabled: true });
    await syncAllReminders(await listHabits());
  }

  function handleCheckin() {
    Alert.alert('Check-in time', 'The reminder time new habits start with.', [
      ...Object.entries(CHECKIN_TIMES).map(([id, option]) => ({
        text: `${option.label}, ${formatTime(option.time)}`,
        onPress: () => appState.set({ onboardingAnswers: { ...onboardingAnswers, checkin: id } }),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  function handleResetHabits() {
    Alert.alert('Delete all habits?', 'Every habit and check-in is removed. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders();
          await deleteAllHabits();
        },
      },
    ]);
  }

  function handleSampleData() {
    Alert.alert('Load sample data?', 'Replaces your habits with five sample habits and a few months of check-ins.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Load', onPress: () => void loadSampleData() },
    ]);
  }

  function handleResetApp() {
    Alert.alert('Reset app?', 'Clears onboarding, the mock subscription and all habits.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await cancelAllReminders();
          await deleteAllHabits();
          await appState.reset();
        },
      },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen largeTitle="Settings">
      <Section title="Habits">
        <ListRow
          title="Reminders"
          subtitle={remindersEnabled ? 'At each habit’s time, on its days' : 'Off'}
          icon="bell"
          right={
            <Switch
              accessibilityLabel="Reminders"
              value={remindersEnabled}
              onValueChange={(on) => void handleReminders(on)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          }
        />
        <ListRow
          title="Check-in time"
          subtitle="Default reminder for new habits"
          icon="clock"
          onPress={handleCheckin}
          right={
            <Text variant="caption" color="muted">
              {checkin.label}, {formatTime(checkin.time)}
            </Text>
          }
        />
      </Section>

      <Section title="Appearance">
        <ListRow
          title="Theme"
          subtitle="Follows the device setting"
          icon="palette"
          right={
            <View style={[styles.swatches, { gap: spacing.xs }]}>
              {[colors.primary, colors.text, colors.surfaceSunken].map((color) => (
                <View
                  key={color}
                  style={[
                    styles.swatch,
                    { backgroundColor: color, borderColor: colors.border, borderRadius: radii.pill },
                  ]}
                />
              ))}
              <Text variant="caption" color="muted" style={{ marginLeft: spacing.xs }}>
                {theme.scheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </View>
          }
        />
      </Section>

      <Section title="Subscription">
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
          onPress={restoring ? undefined : handleRestore}
        />
        <ListRow title="Manage subscription" icon="card" onPress={handleManage} />
      </Section>

      <Section title="About">
        <ListRow title="Terms of use" icon="document" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
        <ListRow title="Privacy policy" icon="shield" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
        <ListRow title="Rate the app" icon="star" onPress={handleRate} />
        <ListRow title="Contact us" icon="mail" onPress={handleContact} />
        <ListRow
          title="Version"
          right={
            <Text variant="caption" color="muted">
              {version}
            </Text>
          }
        />
      </Section>

      <Section title="Data">
        <ListRow title="Delete all habits" icon="trash" destructive onPress={handleResetHabits} />
      </Section>

      {__DEV__ ? (
        <Section title="Development">
          <ListRow title="Load sample data" icon="sparkles" onPress={handleSampleData} />
          <ListRow title="Reset app" icon="trash" destructive onPress={handleResetApp} />
        </Section>
      ) : null}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text variant="caption" color="muted" style={{ marginBottom: spacing.item, marginLeft: spacing.xs }}>
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing.md,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  swatches: { flexDirection: 'row', alignItems: 'center' },
  swatch: { width: 16, height: 16, borderWidth: StyleSheet.hairlineWidth },
});
