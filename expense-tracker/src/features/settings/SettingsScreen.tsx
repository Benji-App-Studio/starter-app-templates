import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import * as StoreReview from 'expo-store-review';
import * as WebBrowser from 'expo-web-browser';
import { Children, useState, type ReactNode } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { Chip, Icon, ListRow, Row, Screen, Stack, Text, type IconName } from '@/components';
import { appConfig } from '@/config/app';
import { resetData, useBudgetPeriod, usePeriodSummary } from '@/features/expenses/data';
import { currencies, currencySymbol, formatMoney } from '@/features/expenses/money';
import { ordinalDay, startDays } from '@/features/expenses/period';
import { preferences, themeChoices, usePreferences } from '@/features/expenses/preferences';
import { loadSampleData } from '@/features/expenses/sampleData';
import { getManagementUrl, restore } from '@/purchases';
import { appState, useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

/** Back to a first launch: no data, default settings, onboarding next. */
async function resetApp() {
  await Promise.all([resetData(), preferences.reset()]);
  await appState.reset();
}

export function SettingsScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { entitled } = useAppState();
  const { currency, theme: themeChoice } = usePreferences();
  const period = useBudgetPeriod();
  const summary = usePeriodSummary(period);
  const [restoring, setRestoring] = useState(false);
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

  function handleResetData() {
    Alert.alert('Delete all expenses?', 'Every expense goes, and budgets return to your onboarding plan.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void resetData() },
    ]);
  }

  async function handleSampleData() {
    setLoadingSample(true);
    await loadSampleData(period);
    setLoadingSample(false);
  }

  function handleResetApp() {
    Alert.alert('Reset app?', 'Clears onboarding, the mock subscription, expenses and settings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void resetApp() },
    ]);
  }

  const build = Application.nativeBuildVersion;
  const version = build ? `${appConfig.version} (${build})` : appConfig.version;

  return (
    <Screen title="Settings" edges={['top']} contentStyle={{ gap: spacing.xl }}>
      <Section title="Budget">
        <ListRow
          title="Monthly budget"
          subtitle="The sum of your category limits"
          icon="wallet"
          right={
            <Text variant="money">{summary ? formatMoney(summary.monthlyBudgetCents, currency) : ''}</Text>
          }
          onPress={() => router.navigate('/budgets')}
        />
        <ChoiceRow title="Month starts on" icon="calendar">
          {startDays.map((day) => (
            <Chip
              key={day}
              label={ordinalDay(day)}
              selected={period.startDay === day}
              onPress={() => preferences.set({ periodStartDay: day })}
            />
          ))}
        </ChoiceRow>
        <ChoiceRow title="Currency" icon="coin">
          {currencies.map((code) => (
            <Chip
              key={code}
              label={`${currencySymbol(code)} ${code}`}
              selected={currency === code}
              onPress={() => preferences.set({ currency: code })}
            />
          ))}
        </ChoiceRow>
        <ListRow title="Delete all expenses" icon="trash" destructive onPress={handleResetData} />
      </Section>

      <Section title="Appearance">
        <ChoiceRow title="Theme" icon="theme">
          {themeChoices.map((choice) => (
            <Chip
              key={choice.id}
              label={choice.label}
              selected={themeChoice === choice.id}
              onPress={() => preferences.set({ theme: choice.id })}
            />
          ))}
        </ChoiceRow>
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

      {__DEV__ ? (
        <Section title="Development">
          <ListRow
            title={loadingSample ? 'Loading…' : 'Load sample data'}
            subtitle="Six months of expenses, for screenshots"
            icon="sparkles"
            onPress={loadingSample ? undefined : handleSampleData}
          />
          <ListRow title="Reset app" icon="reset" destructive onPress={handleResetApp} />
        </Section>
      ) : null}
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Stack gap="item">
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
        {/* Grouped inset rows: a hairline between rows, none above the first. */}
        {Children.toArray(children).map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
            {child}
          </View>
        ))}
      </View>
    </Stack>
  );
}

type ChoiceRowProps = { title: string; icon: IconName; children: ReactNode };

/** A settings row whose value is picked from a strip of chips underneath the title. */
function ChoiceRow({ title, icon, children }: ChoiceRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <Stack gap="item" style={{ paddingVertical: spacing.md }}>
      <Row gap="md">
        <Icon name={icon} size={20} color={colors.primary} />
        <Text>{title}</Text>
      </Row>
      <Row gap="sm" style={styles.chips}>
        {children}
      </Row>
    </Stack>
  );
}

const styles = StyleSheet.create({
  chips: { flexWrap: 'wrap' },
  divider: { height: StyleSheet.hairlineWidth },
});
