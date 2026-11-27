import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { Group, ListRow, OptionSheet, Row, Screen, Section, SegmentedControl, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllData, deleteAllWorkouts } from '@/db/workouts';
import { useWeeklyGoal } from '@/features/home/weeklyGoal';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState, type WeightUnit } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { loadSampleData } from './sampleData';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const REST_OPTIONS = [30, 45, 60, 90, 120, 150, 180];
const GOAL_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

type Picker = 'rest' | 'goal';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii } = theme;
  const { entitled, units, restSeconds } = useAppState();
  const weeklyGoal = useWeeklyGoal();
  const [restoring, setRestoring] = useState(false);
  const [picker, setPicker] = useState<Picker>();
  const [loadingSample, setLoadingSample] = useState(false);

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

  function handleDeleteWorkouts() {
    Alert.alert('Delete all workouts?', 'Every logged session and record goes. Routines stay. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete workouts', style: 'destructive', onPress: () => void deleteAllWorkouts() },
    ]);
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding, the mock subscription, routines and workouts.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          await appState.reset();
        },
      },
    ]);
  }

  async function handleSampleData() {
    setLoadingSample(true);
    try {
      await loadSampleData();
      Alert.alert('Sample data loaded', 'Five weeks of workouts are in your history.');
    } finally {
      setLoadingSample(false);
    }
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen scroll tabBar title="Settings">
      <Stack gap="xl">
        <Section title="Training">
          <Group>
            <ListRow
              title="Units"
              subtitle="Weights are kept in kg and converted"
              right={
                <View style={styles.units}>
                  <SegmentedControl<WeightUnit>
                    size="sm"
                    segments={[
                      { id: 'kg', label: 'kg' },
                      { id: 'lb', label: 'lb' },
                    ]}
                    value={units}
                    onChange={(next) => appState.set({ units: next })}
                  />
                </View>
              }
            />
            <ListRow
              title="Rest timer"
              subtitle="Starts when you check a set"
              onPress={() => setPicker('rest')}
              right={<Value>{`${restSeconds} s`}</Value>}
            />
            <ListRow
              title="Weekly goal"
              subtitle="Sessions on the week ring"
              onPress={() => setPicker('goal')}
              right={<Value>{`${weeklyGoal} ${weeklyGoal === 1 ? 'day' : 'days'}`}</Value>}
            />
          </Group>
        </Section>

        <Section title="Appearance">
          <Group>
            <ListRow
              title="Theme"
              subtitle="Follows the device setting"
              right={
                <Row gap="xs">
                  {[colors.primary, colors.text, colors.surfaceRaised].map((color) => (
                    <View
                      key={color}
                      style={[styles.swatch, { backgroundColor: color, borderColor: colors.textMuted, borderRadius: radii.pill }]}
                    />
                  ))}
                  <Text variant="caption" color="muted">
                    {theme.scheme === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                </Row>
              }
            />
          </Group>
        </Section>

        <Section title="Subscription">
          <Group>
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
          </Group>
        </Section>

        <Section title="About">
          <Group>
            <ListRow title="Terms of use" icon="document" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
            <ListRow title="Privacy policy" icon="privacy" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
            <ListRow title="Rate the app" icon="star" onPress={handleRate} />
            <ListRow title="Contact us" icon="mail" onPress={handleContact} />
            <ListRow title="Version" right={<Value>{version}</Value>} />
          </Group>
        </Section>

        <Section title="Data">
          <Group>
            <ListRow title="Delete all workouts" icon="trash" destructive onPress={handleDeleteWorkouts} />
          </Group>
        </Section>

        {__DEV__ ? (
          <Section title="Development">
          <Group>
              <ListRow
                title={loadingSample ? 'Loading…' : 'Load sample data'}
                subtitle="Five weeks of workouts for screenshots"
                icon="bolt"
                onPress={loadingSample ? undefined : handleSampleData}
              />
              <ListRow title="Reset app" icon="reset" destructive onPress={handleReset} />
            </Group>
        </Section>
        ) : null}
      </Stack>

      <OptionSheet
        visible={picker === 'rest'}
        title="Rest between sets"
        options={REST_OPTIONS.map((seconds) => ({ id: String(seconds), label: `${seconds} seconds` }))}
        value={String(restSeconds)}
        onSelect={(id) => {
          appState.set({ restSeconds: Number(id) });
          setPicker(undefined);
        }}
        onDismiss={() => setPicker(undefined)}
      />
      <OptionSheet
        visible={picker === 'goal'}
        title="Sessions a week"
        options={GOAL_OPTIONS.map((days) => ({ id: String(days), label: `${days} ${days === 1 ? 'day' : 'days'}` }))}
        value={String(weeklyGoal)}
        onSelect={(id) => {
          appState.set({ weeklyGoal: Number(id) });
          setPicker(undefined);
        }}
        onDismiss={() => setPicker(undefined)}
      />
    </Screen>
  );
}

function Value({ children }: { children: string }) {
  return (
    <Text variant="caption" color="muted">
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  units: { width: 112 },
  swatch: { width: 16, height: 16, borderWidth: 1 },
});
