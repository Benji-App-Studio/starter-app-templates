import * as Application from 'expo-application';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { ListRow, Screen, Text } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllMixes } from '@/db/mixes';
import { loadSampleData } from '@/db/sample';
import { deleteAllSessions } from '@/db/sessions';
import { mixer } from '@/features/mixer/engine';
import { formatTimer } from '@/features/mixer/format';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const FADE_OPTIONS = [30, 60, 120, 180];

export function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const { entitled, timerMinutes, fadeSeconds } = useAppState();
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

  function handleFade() {
    void Haptics.selectionAsync();
    const index = FADE_OPTIONS.indexOf(fadeSeconds);
    appState.set({ fadeSeconds: FADE_OPTIONS[(index + 1) % FADE_OPTIONS.length] });
  }

  function handleClearData() {
    Alert.alert('Clear saved mixes and nights?', 'The sound library stays. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await Promise.all([deleteAllMixes(), deleteAllSessions()]);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          mixer.clear();
          void appState.reset();
        },
      },
    ]);
  }

  async function handleSampleData() {
    await loadSampleData();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Sample data loaded', 'Three saved mixes and ten nights are in the log.');
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen scroll tabs edges={['top']} title="Settings">
      <Section title="Nights">
        <ListRow
          title="Default sleep timer"
          subtitle="What every new mix starts with"
          icon="timer"
          right={<Value>{formatTimer(timerMinutes)}</Value>}
          onPress={() => router.push('/timer?target=default')}
        />
        <ListRow
          title="Fade-out"
          subtitle="How gently the mix goes quiet"
          icon="speaker"
          right={<Value>{fadeSeconds < 60 ? `${fadeSeconds} s` : formatTimer(fadeSeconds / 60)}</Value>}
          onPress={handleFade}
          divider
        />
        <ListRow
          title="Clear saved mixes and nights"
          icon="trash"
          destructive
          onPress={handleClearData}
          divider
        />
      </Section>

      <Section title="Appearance">
        <ListRow
          title="Theme"
          subtitle="Follows the device setting"
          right={
            <View style={[styles.swatches, { gap: spacing.xs }]}>
              {[colors.primary, colors.text, colors.surfaceRaised].map((color) => (
                <View
                  key={color}
                  style={[
                    styles.swatch,
                    { backgroundColor: color, borderColor: colors.border, borderRadius: radii.pill },
                  ]}
                />
              ))}
              <Value>{theme.scheme === 'dark' ? 'Dark' : 'Light'}</Value>
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
          icon="refresh"
          onPress={restoring ? undefined : handleRestore}
          divider
        />
        <ListRow title="Manage subscription" icon="card" onPress={handleManage} divider />
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
          divider
        />
        <ListRow title="Rate the app" icon="star" onPress={handleRate} divider />
        <ListRow title="Contact us" icon="mail" onPress={handleContact} divider />
        <ListRow title="Version" right={<Value>{version}</Value>} divider />
      </Section>

      {__DEV__ ? (
        <Section title="Development">
          <ListRow title="Load sample data" icon="sparkles" onPress={handleSampleData} />
          <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} divider />
        </Section>
      ) : null}
    </Screen>
  );
}

function Value({ children }: { children: string }) {
  return (
    <Text variant="caption" color="muted" tabular>
      {children}
    </Text>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text variant="caption" color="muted" style={{ marginBottom: spacing.item, marginLeft: spacing.md }}>
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderCurve: 'continuous',
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
