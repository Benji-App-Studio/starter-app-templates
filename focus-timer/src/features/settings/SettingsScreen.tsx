import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { Children, Fragment, useEffect, useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { ListRow, Row, Screen, Stack, Stepper, Text } from '@/components';
import { appConfig } from '@/config/app';
import { createSession, deleteAllSessions } from '@/db/sessions';
import {
  BREAK_MINUTES_RANGE,
  DAILY_GOAL_RANGE,
  FOCUS_MINUTES_RANGE,
  focusSettingsStore,
  updateFocusSettings,
  useFocusSettings,
} from '@/features/focus/focusSettings';
import { hasNotificationPermission, requestNotificationPermission } from '@/features/focus/notifications';
import { timer } from '@/features/focus/timer';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const { entitled } = useAppState();
  const { settings } = useFocusSettings();
  const [restoring, setRestoring] = useState(false);

  // Permission can be revoked in iOS Settings; show the switch off in that case.
  useEffect(() => {
    if (settings.alerts) {
      void hasNotificationPermission().then((granted) => {
        if (!granted) {
          updateFocusSettings({ alerts: false });
        }
      });
    }
  }, [settings.alerts]);

  async function handleAlerts(enabled: boolean) {
    if (!enabled) {
      updateFocusSettings({ alerts: false });
      return;
    }
    const granted = await requestNotificationPermission();
    updateFocusSettings({ alerts: granted });
    if (!granted) {
      Alert.alert('Alerts are off', 'Allow notifications for this app in iOS Settings to hear when the dial runs out.');
    }
  }

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

  function handleDeleteSessions() {
    Alert.alert('Delete all sessions?', 'Your history, totals and streak start from zero. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          timer.stop();
          void deleteAllSessions();
        },
      },
    ]);
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding, the mock subscription and your focus settings. Sessions are kept.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => void Promise.all([appState.reset(), focusSettingsStore.reset(), timer.reset()]),
      },
    ]);
  }

  async function handleSampleData() {
    await insertSampleSessions(settings.focusMinutes);
    Alert.alert('Sample data added', 'Two weeks of sessions are in your history.');
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen scroll edges={['top']} title="Settings">
      <Stack gap="lg">
        <Section title="Focus">
          <ListRow
            title="Focus length"
            subtitle="Where the dial starts"
            right={
              <Stepper
                value={settings.focusMinutes}
                onChange={(focusMinutes) => updateFocusSettings({ focusMinutes })}
                unit="min"
                accessibilityLabel="Focus length"
                {...FOCUS_MINUTES_RANGE}
              />
            }
          />
          <ListRow
            title="Break length"
            right={
              <Stepper
                value={settings.breakMinutes}
                onChange={(breakMinutes) => updateFocusSettings({ breakMinutes })}
                unit="min"
                accessibilityLabel="Break length"
                {...BREAK_MINUTES_RANGE}
              />
            }
          />
          <ListRow
            title="Daily goal"
            subtitle="Sessions that make a full day"
            right={
              <Stepper
                value={settings.dailyGoal}
                onChange={(dailyGoal) => updateFocusSettings({ dailyGoal })}
                accessibilityLabel="Daily goal"
                {...DAILY_GOAL_RANGE}
              />
            }
          />
          <ListRow
            title="Alert when the dial runs out"
            subtitle="A notification at the end of each session and break"
            icon="bell"
            right={
              <Switch
                accessibilityLabel="Alert when the dial runs out"
                value={settings.alerts}
                onValueChange={(value) => void handleAlerts(value)}
                trackColor={{ true: colors.primary, false: colors.surfaceStrong }}
                thumbColor={colors.surface}
              />
            }
          />
        </Section>

        <Section title="Appearance">
          <ListRow
            title="Theme"
            subtitle="Follows the device setting"
            right={
              <Row gap="xs">
                {[colors.primary, colors.text, colors.surface].map((color) => (
                  <View
                    key={color}
                    style={[
                      styles.swatch,
                      { backgroundColor: color, borderColor: colors.textMuted, borderRadius: radii.pill },
                    ]}
                  />
                ))}
                <Text variant="caption" color="muted" style={{ paddingLeft: spacing.xs }}>
                  {theme.scheme === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </Row>
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
            onPress={restoring ? undefined : () => void handleRestore()}
          />
          <ListRow title="Manage subscription" icon="card" onPress={() => void handleManage()} />
        </Section>

        <Section title="About">
          <ListRow
            title="Terms of use"
            icon="document"
            onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)}
          />
          <ListRow
            title="Privacy policy"
            icon="shield"
            onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)}
          />
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
        </Section>

        <Section title="Data">
          <ListRow title="Delete all sessions" icon="trash" destructive onPress={handleDeleteSessions} />
        </Section>

        {__DEV__ ? (
          <Section title="Development">
            <ListRow title="Load sample data" icon="sparkles" onPress={() => void handleSampleData()} />
            <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} />
          </Section>
        ) : null}
      </Stack>
    </Screen>
  );
}

/** Two weeks of believable sessions, for screenshots and for seeing the history filled. */
async function insertSampleSessions(focusMinutes: number) {
  const labels = ['Deep work', 'Reading', 'Writing', 'Planning'];
  const perDay = [3, 4, 2, 0, 5, 3, 1, 4, 2, 3, 0, 4, 3, 2];
  const now = new Date();
  for (let daysAgo = perDay.length - 1; daysAgo >= 0; daysAgo -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - daysAgo);
    day.setHours(9, 0, 0, 0);
    for (let index = 0; index < perDay[daysAgo]; index += 1) {
      const startedAt = day.getTime() + index * (focusMinutes + 20) * 60_000;
      const endedAt = startedAt + focusMinutes * 60_000;
      if (endedAt < now.getTime()) {
        await createSession({ label: labels[(daysAgo + index) % labels.length], minutes: focusMinutes, startedAt, endedAt });
      }
    }
  }
}

/** A grouped inset list: an eyebrow 12 pt above a rounded panel, hairlines between rows. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();
  const rows = Children.toArray(children);

  return (
    <Stack gap="ms">
      <Text variant="eyebrow" color="muted" style={{ paddingHorizontal: spacing.xs }}>
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
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
  swatch: { width: 16, height: 16, borderWidth: 1 },
});
