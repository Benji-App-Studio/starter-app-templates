import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { Children, Fragment, useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { ListRow, Row, Screen, Section, Stack, Stepper, Text } from '@/components';
import { appConfig } from '@/config/app';
import { clearAttempts, updateActiveRates } from '@/db/attempts';
import { habits } from '@/features/quit/habits';
import { formatMoney, profile as profileStore, useProfile } from '@/features/quit/profile';
import { loadSampleData } from '@/features/quit/sampleData';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { colors, radii } = theme;
  const { entitled } = useAppState();
  const profile = useProfile();
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

  function setRates(patch: { unitsPerDay?: number; costPerDay?: number }) {
    if (!profile) {
      return;
    }
    const next = { ...profile, ...patch };
    profileStore.set(patch);
    void updateActiveRates(next.unitsPerDay, next.costPerDay);
  }

  function handleClearData() {
    Alert.alert('Delete counter data?', 'Every attempt and craving is removed. Your settings stay.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void clearAttempts() },
    ]);
  }

  function handleSampleData() {
    if (profile) {
      void loadSampleData(profile);
    }
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding, the counter and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearAttempts();
            await profileStore.reset();
            await appState.reset();
          })();
        },
      },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;
  const habit = profile ? habits[profile.habit] : undefined;

  return (
    <Screen tab title="Settings">
      <Stack gap="lg">
      {profile && habit ? (
        <Group title="Your habit">
          <ListRow title="Habit" icon={habit.icon} right={<Value>{habit.label}</Value>} onPress={() => router.push('/habit')} />
          <ListRow
            title="On a typical day"
            subtitle={`${habit.unit.many} you used to have`}
            icon="perDay"
            right={
              <Stepper
                value={profile.unitsPerDay}
                label={String(profile.unitsPerDay)}
                step={profile.unitsPerDay >= 50 ? 10 : 1}
                min={1}
                max={1000}
                onChange={(unitsPerDay) => setRates({ unitsPerDay })}
              />
            }
          />
          <ListRow
            title="Daily spend"
            subtitle="what it used to cost"
            icon="money"
            right={
              <Stepper
                value={profile.costPerDay}
                label={formatMoney(profile.costPerDay, profile.currency)}
                step={profile.costPerDay >= 20 ? 1 : 0.5}
                min={0}
                max={500}
                onChange={(costPerDay) => setRates({ costPerDay })}
              />
            }
          />
          <ListRow title="Currency" icon="currency" right={<Value>{profile.currency}</Value>} onPress={() => router.push('/currency')} />
        </Group>
      ) : null}

      <Group title="Appearance">
        <ListRow
          title="Theme"
          subtitle="Follows the device setting"
          icon="palette"
          right={
            <Row gap="sm">
              <Row gap="xs">
                {[colors.primary, colors.accent, colors.text].map((color) => (
                  <View
                    key={color}
                    style={[styles.swatch, { backgroundColor: color, borderColor: colors.border, borderRadius: radii.pill }]}
                  />
                ))}
              </Row>
              <Text variant="caption" color="muted">
                {theme.scheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </Row>
          }
        />
      </Group>

      <Group title="Subscription">
        <ListRow title="Status" right={<Value color={entitled ? 'primary' : 'muted'}>{entitled ? 'Active' : 'Not subscribed'}</Value>} />
        <ListRow title={restoring ? 'Restoring…' : 'Restore purchases'} icon="restore" onPress={restoring ? undefined : handleRestore} />
        <ListRow title="Manage subscription" icon="card" onPress={handleManage} />
      </Group>

      <Group title="About">
        <ListRow title="Terms of use" icon="terms" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
        <ListRow title="Privacy policy" icon="privacy" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
        <ListRow title="Rate the app" icon="star" onPress={handleRate} />
        <ListRow title="Contact us" icon="mail" onPress={handleContact} />
        <ListRow title="Version" right={<Value>{version}</Value>} />
      </Group>

      <Group title="Data">
        <ListRow title="Delete counter data" icon="trash" destructive onPress={handleClearData} />
      </Group>

      {__DEV__ ? (
        <Group title="Development">
          <ListRow title="Load sample data" icon="sparkles" onPress={handleSampleData} />
          <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} />
        </Group>
      ) : null}
    </Stack>
    </Screen>
  );
}

function Value({ children, color = 'muted' }: { children: string; color?: 'muted' | 'primary' }) {
  return (
    <Text variant="caption" color={color}>
      {children}
    </Text>
  );
}

/** An inset group of rows with hairline dividers between them. */
function Group({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <Section title={title} variant="group" card>
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          {row}
        </Fragment>
      ))}
    </Section>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
  swatch: { width: 16, height: 16, borderWidth: StyleSheet.hairlineWidth },
});
