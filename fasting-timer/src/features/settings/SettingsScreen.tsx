import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, Icon, LargeTitle, ListRow, Section, Stack, Text, useCollapsingTitle } from '@/components';
import { appConfig } from '@/config/app';
import {
  resetFastingData,
  setEndAlert,
  setStartReminder,
  setStartTime,
} from '@/features/fasting/actions';
import { preferences, usePreferences } from '@/features/fasting/preferences';
import { ProtocolPicker } from '@/features/fasting/ProtocolPicker';
import { loadSampleData } from '@/features/fasting/sampleData';
import { formatTime } from '@/features/fasting/time';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const TITLE = 'Settings';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, spacing } = theme;
  const insets = useSafeAreaInsets();
  const { entitled } = useAppState();
  const prefs = usePreferences();
  const { offset, scrollHandler } = useCollapsingTitle();
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

  function explainDenied() {
    Alert.alert(
      'Notifications are off',
      `Allow notifications for ${appConfig.name} in iOS Settings to get alerts.`,
      [{ text: 'Not now', style: 'cancel' }, { text: 'Open Settings', onPress: () => void Linking.openSettings() }],
    );
  }

  async function toggleEndAlert(on: boolean) {
    if (!(await setEndAlert(on)) && on) explainDenied();
  }

  async function toggleStartReminder(on: boolean) {
    if (!(await setStartReminder(on)) && on) explainDenied();
  }

  function shiftStartTime(minutes: number) {
    const total = (prefs.startHour * 60 + prefs.startMinute + minutes + 24 * 60) % (24 * 60);
    void setStartTime(Math.floor(total / 60), total % 60);
  }

  function handleResetData() {
    Alert.alert('Reset data?', 'Deletes every fast, your plan and reminders. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void resetFastingData() },
    ]);
  }

  function handleResetApp() {
    Alert.alert('Reset app?', 'Clears onboarding and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void appState.reset() },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;
  const startTime = new Date();
  startTime.setHours(prefs.startHour, prefs.startMinute, 0, 0);
  const switchColors = { true: colors.primary, false: colors.surfaceRaised };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <CompactHeader title={TITLE} offset={offset} />
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          // The compact header floats over the list, so the list starts below the status bar itself.
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LargeTitle title={TITLE} offset={offset} />

        <Stack gap="xl">
          <Section title="Fasting plan">
            <View style={{ marginHorizontal: -spacing.gutter }}>
              <ProtocolPicker value={prefs.protocolId} onChange={(id) => preferences.set({ protocolId: id })} />
            </View>
          </Section>

          <Section grouped title="Reminders">
            <ListRow
              title="Alert when the fast ends"
              subtitle="The moment the ring reaches its goal"
              icon="bell"
              right={<Switch value={prefs.endAlert} onValueChange={(on) => void toggleEndAlert(on)} trackColor={switchColors} />}
            />
            <ListRow
              title="Daily start reminder"
              subtitle="A nudge when your last meal is usually over"
              icon="moon"
              right={
                <Switch value={prefs.startReminder} onValueChange={(on) => void toggleStartReminder(on)} trackColor={switchColors} />
              }
            />
            <ListRow
              title="Usual start time"
              divider={false}
              right={
                <View style={[styles.adjust, { gap: spacing.sm }]}>
                  <AdjustButton icon="minus" label="Earlier by 30 minutes" onPress={() => shiftStartTime(-30)} />
                  <Text variant="label" style={[styles.adjustValue, { fontVariant: ['tabular-nums'] }]} align="center">
                    {formatTime(startTime.getTime())}
                  </Text>
                  <AdjustButton icon="plus" label="Later by 30 minutes" onPress={() => shiftStartTime(30)} />
                </View>
              }
            />
          </Section>

          <Section grouped title="Appearance">
            <ListRow
              title="Theme"
              subtitle="Follows the device setting"
              divider={false}
              right={
                <Text variant="caption" color="muted">
                  {theme.scheme === 'dark' ? 'Dark' : 'Light'}
                </Text>
              }
            />
          </Section>

          <Section grouped title="Subscription">
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
              icon="refresh"
              onPress={restoring ? undefined : handleRestore}
            />
            <ListRow title="Manage subscription" icon="card" onPress={handleManage} divider={false} />
          </Section>

          <Section grouped title="About">
            <ListRow title="Terms of use" icon="document" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
            <ListRow title="Privacy policy" icon="shield" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
            <ListRow title="Rate the app" icon="star" onPress={handleRate} />
            <ListRow title="Contact us" icon="mail" onPress={handleContact} />
            <ListRow
              title="Version"
              divider={false}
              right={
                <Text variant="caption" color="muted">
                  {version}
                </Text>
              }
            />
          </Section>

          <Section grouped title="Data">
            <ListRow title="Reset data" icon="trash" destructive divider={false} onPress={handleResetData} />
          </Section>

          {__DEV__ ? (
            <Section grouped title="Development">
              <ListRow
                title="Load sample data"
                subtitle="Two weeks of fasts for screenshots"
                icon="chart"
                onPress={() => void loadSampleData(prefs.startHour)}
              />
              <ListRow title="Reset app" icon="refresh" destructive divider={false} onPress={handleResetApp} />
            </Section>
          ) : null}
        </Stack>
      </Animated.ScrollView>
    </View>
  );
}

function AdjustButton({ icon, label, onPress }: { icon: 'minus' | 'plus'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.adjustButton, { backgroundColor: colors.surfaceRaised, opacity: pressed ? 0.5 : 1 }]}
    >
      <Icon name={icon} size={14} color={colors.text} weight="semibold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  adjust: { flexDirection: 'row', alignItems: 'center' },
  adjustButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  adjustValue: { minWidth: 76 },
});
