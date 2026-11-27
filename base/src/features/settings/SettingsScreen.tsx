import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { ListRow, Screen, Text } from '@/components';
import { appConfig } from '@/config/app';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const { entitled } = useAppState();
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

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void appState.reset() },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen scroll edges={['top']}>
      <Text variant="title" style={{ marginBottom: spacing.lg }}>
        Settings
      </Text>

      <Section title="Appearance">
        <ListRow
          title="Theme"
          subtitle="Follows the device setting"
          right={
            <View style={[styles.swatches, { gap: spacing.xs }]}>
              {[colors.primary, colors.text, colors.surface].map((color) => (
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
          icon="refresh-outline"
          onPress={restoring ? undefined : handleRestore}
        />
        <ListRow title="Manage subscription" icon="card-outline" onPress={handleManage} />
      </Section>

      <Section title="About">
        <ListRow
          title="Terms of use"
          icon="document-text-outline"
          onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)}
        />
        <ListRow
          title="Privacy policy"
          icon="shield-checkmark-outline"
          onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)}
        />
        <ListRow title="Rate the app" icon="star-outline" onPress={handleRate} />
        <ListRow title="Contact us" icon="mail-outline" onPress={handleContact} />
        <ListRow
          title="Version"
          right={
            <Text variant="caption" color="muted">
              {version}
            </Text>
          }
        />
      </Section>

      {__DEV__ ? (
        <Section title="Development">
          <ListRow title="Reset app" icon="trash-outline" destructive onPress={handleReset} />
        </Section>
      ) : null}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text variant="caption" color="muted" style={{ marginBottom: spacing.xs }}>
        {title.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
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
