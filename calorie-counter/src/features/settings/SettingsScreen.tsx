import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { ListRow, Row, Screen, Section, Stack, Stepper, Text } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllFoodLogs } from '@/db/foodLogs';
import { loadSampleData } from '@/features/diary/sampleData';
import { TARGET_MAX, TARGET_MIN, TARGET_STEP, setDailyTarget, useDailyTarget } from '@/features/diary/target';
import { formatKcal } from '@/features/diary/totals';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii } = theme;
  const { entitled } = useAppState();
  const { target, suggested, isCustom, macros } = useDailyTarget();
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

  function handleDeleteLogs() {
    Alert.alert('Delete every food log?', 'Your target and settings stay. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteAllFoodLogs() },
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
    <Screen scroll edges={['top']} title="Settings">
      <Stack gap="xl">
        <Section grouped title="Daily target">
          <ListRow
            title="Calories a day"
            subtitle={isCustom ? 'Set by you' : 'Suggested from your answers'}
            right={
              <Stepper
                label="daily calorie target"
                value={formatKcal(target)}
                onDecrement={() => setDailyTarget(target - TARGET_STEP)}
                onIncrement={() => setDailyTarget(target + TARGET_STEP)}
                canDecrement={target > TARGET_MIN}
                canIncrement={target < TARGET_MAX}
              />
            }
          />
          <ListRow
            title="Macro split"
            subtitle={`Protein ${macros.protein} g · Carbs ${macros.carbs} g · Fat ${macros.fat} g`}
          />
          {isCustom ? (
            <ListRow
              title="Back to the suggested target"
              subtitle={`${formatKcal(suggested)} kcal from your onboarding answers`}
              icon="refresh"
              onPress={() => setDailyTarget(undefined)}
            />
          ) : null}
        </Section>

        <Section grouped title="Appearance">
          <ListRow
            title="Theme"
            subtitle="Follows the device setting"
            right={
              <Row gap="sm">
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
                </Row>
                <Text variant="caption" color="muted">
                  {theme.scheme === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </Row>
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
          <ListRow title="Manage subscription" icon="card" onPress={handleManage} />
        </Section>

        <Section grouped title="About">
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

        <Section grouped title="Data">
          <ListRow title="Delete all food logs" icon="trash" destructive onPress={handleDeleteLogs} />
        </Section>

        {__DEV__ ? (
          <Section grouped title="Development">
            <ListRow
              title="Load sample data"
              icon="sparkles"
              onPress={() => void loadSampleData().then(() => Alert.alert('Sample data loaded', 'Twelve days of meals, ending today.'))}
            />
            <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} />
          </Section>
        ) : null}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  swatch: { width: 16, height: 16, borderWidth: 1 },
});
