import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, Switch, View } from 'react-native';

import { LargeTitleScroll, ListRow, OptionSheet, Screen, Text, type SheetOption } from '@/components';
import { appConfig } from '@/config/app';
import { deleteAllDayGoals } from '@/db/dayGoals';
import { deleteAllDrinks } from '@/db/drinks';
import { AmountSheet } from '@/features/hydration/AmountSheet';
import { formatHour } from '@/features/hydration/dates';
import { clampGoal, formatAmount, type Unit } from '@/features/hydration/goal';
import { reminderSlots, requestReminderPermission, syncReminders } from '@/features/hydration/reminders';
import { loadSampleData } from '@/features/hydration/sampleData';
import { hydrationSettings, useHydrationSettings, type HydrationSettings } from '@/features/hydration/settings';
import { useGoal } from '@/features/hydration/useGoal';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

const unitOptions: SheetOption<Unit>[] = [
  { id: 'ml', label: 'Millilitres', detail: 'Goal and cups in ml' },
  { id: 'oz', label: 'Fluid ounces', detail: 'Goal and cups in US oz' },
];
const intervalOptions: SheetOption<number>[] = [
  { id: 60, label: 'Every hour' },
  { id: 90, label: 'Every 1.5 hours' },
  { id: 120, label: 'Every 2 hours' },
  { id: 180, label: 'Every 3 hours' },
];
const startOptions: SheetOption<number>[] = [5, 6, 7, 8, 9, 10, 11, 12].map((hour) => ({ id: hour, label: formatHour(hour) }));
const endOptions: SheetOption<number>[] = [16, 17, 18, 19, 20, 21, 22, 23].map((hour) => ({ id: hour, label: formatHour(hour) }));

type OpenSheet = 'goal' | 'unit' | 'interval' | 'start' | 'end';

export function SettingsScreen() {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;
  const { entitled } = useAppState();
  const settings = useHydrationSettings();
  const { goalMl, recommendedMl, isCustom, unit } = useGoal();
  const [restoring, setRestoring] = useState(false);
  const [sheet, setSheet] = useState<OpenSheet>();

  function updateReminders(patch: Partial<HydrationSettings>) {
    hydrationSettings.set(patch);
    void syncReminders(hydrationSettings.get());
  }

  async function handleToggleReminders(enabled: boolean) {
    if (!enabled) {
      updateReminders({ remindersEnabled: false });
      return;
    }
    const granted = await requestReminderPermission();
    if (granted) {
      updateReminders({ remindersEnabled: true });
    } else {
      Alert.alert('Notifications are off', `Allow notifications for ${appConfig.name} in the Settings app to get reminders.`);
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

  function handleDeleteDrinks() {
    Alert.alert('Delete every drink?', 'Your history is removed from this device. Your goal and reminders stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void Promise.all([deleteAllDrinks(), deleteAllDayGoals()]),
      },
    ]);
  }

  function handleReset() {
    Alert.alert('Reset app?', 'Clears onboarding, settings and the mock subscription.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => void Promise.all([hydrationSettings.reset(), appState.reset()]),
      },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;
  const slots = reminderSlots(settings).length;

  return (
    <Screen edges={['top']} padded={false}>
      <LargeTitleScroll title="Settings">
        <Section title="Hydration">
          <ListRow
            title="Daily goal"
            subtitle={isCustom ? 'Set by you' : 'Recommended from your answers'}
            icon="target"
            right={<Value>{formatAmount(goalMl, unit)}</Value>}
            onPress={() => setSheet('goal')}
          />
          <ListRow
            title="Units"
            icon="ruler"
            right={<Value>{unit === 'ml' ? 'ml' : 'oz'}</Value>}
            onPress={() => setSheet('unit')}
          />
        </Section>

        <Section title="Reminders">
          <ListRow
            title="Remind me to drink"
            subtitle={settings.remindersEnabled ? `${slots} reminders a day` : 'Off'}
            icon="bell"
            right={
              <Switch
                value={settings.remindersEnabled}
                onValueChange={(value) => void handleToggleReminders(value)}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.surface}
              />
            }
          />
          <ListRow
            title="First reminder"
            icon="sun"
            right={<Value>{formatHour(settings.reminderStartHour)}</Value>}
            onPress={() => setSheet('start')}
          />
          <ListRow
            title="Last reminder"
            icon="clock"
            right={<Value>{formatHour(settings.reminderEndHour)}</Value>}
            onPress={() => setSheet('end')}
          />
          <ListRow
            title="How often"
            icon="timer"
            right={<Value>{intervalOptions.find((option) => option.id === settings.reminderIntervalMinutes)?.label}</Value>}
            onPress={() => setSheet('interval')}
          />
        </Section>

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
            icon="refresh"
            onPress={restoring ? undefined : handleRestore}
          />
          <ListRow title="Manage subscription" icon="card" onPress={handleManage} />
        </Section>

        <Section title="About">
          <ListRow title="Terms of use" icon="document" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
          <ListRow title="Privacy policy" icon="shield" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
          <ListRow title="Rate the app" icon="star" onPress={handleRate} />
          <ListRow title="Contact us" icon="mail" onPress={handleContact} />
          <ListRow title="Version" right={<Value>{version}</Value>} />
        </Section>

        <Section title="Data">
          <ListRow title="Delete all drinks" icon="trash" destructive onPress={handleDeleteDrinks} />
        </Section>

        {__DEV__ ? (
          <Section title="Development">
            <ListRow
              title="Load sample data"
              subtitle="Three weeks of drinks for screenshots"
              icon="sparkles"
              onPress={() => void loadSampleData(goalMl)}
            />
            <ListRow title="Reset app" icon="trash" destructive onPress={handleReset} />
          </Section>
        ) : null}
      </LargeTitleScroll>

      <AmountSheet
        visible={sheet === 'goal'}
        onClose={() => setSheet(undefined)}
        title="Daily goal"
        unit={unit}
        initialMl={goalMl}
        submitLabel={(ml) => (ml > 0 ? `Set goal to ${formatAmount(clampGoal(ml), unit)}` : 'Set goal')}
        onSubmit={(ml) => hydrationSettings.set({ customGoalMl: clampGoal(ml) })}
        secondaryAction={
          isCustom
            ? { title: `Use recommended (${formatAmount(recommendedMl, unit)})`, onPress: () => hydrationSettings.set({ customGoalMl: null }) }
            : undefined
        }
      />
      <OptionSheet
        visible={sheet === 'unit'}
        onClose={() => setSheet(undefined)}
        title="Units"
        options={unitOptions}
        selected={unit}
        onSelect={(id) => hydrationSettings.set({ unit: id })}
      />
      <OptionSheet
        visible={sheet === 'start'}
        onClose={() => setSheet(undefined)}
        title="First reminder"
        options={startOptions}
        selected={settings.reminderStartHour}
        onSelect={(id) => updateReminders({ reminderStartHour: id })}
      />
      <OptionSheet
        visible={sheet === 'end'}
        onClose={() => setSheet(undefined)}
        title="Last reminder"
        options={endOptions}
        selected={settings.reminderEndHour}
        onSelect={(id) => updateReminders({ reminderEndHour: id })}
      />
      <OptionSheet
        visible={sheet === 'interval'}
        onClose={() => setSheet(undefined)}
        title="How often"
        options={intervalOptions}
        selected={settings.reminderIntervalMinutes}
        onSelect={(id) => updateReminders({ reminderIntervalMinutes: id })}
      />
    </Screen>
  );
}

function Value({ children }: { children: ReactNode }) {
  return (
    <Text variant="caption" color="muted">
      {children}
    </Text>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text variant="caption" color="muted" style={{ marginBottom: spacing.sm, marginLeft: spacing.md }}>
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
