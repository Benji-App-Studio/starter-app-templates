import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { CounterRing } from '@/features/quit/CounterRing';
import { formatUnits, habits } from '@/features/quit/habits';
import { formatMoney, profileFromAnswers } from '@/features/quit/profile';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
const HERO_RING = 152;

export function CustomPaywall() {
  const { colors, radii } = useTheme();
  const { onboardingAnswers } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();
  const profile = profileFromAnswers(onboardingAnswers);
  const habit = habits[profile.habit];
  const selectedPlan = plans?.find((plan) => plan.id === selected);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Could not load plans', 'Check your connection and try again.'));
  }, []);

  async function handlePurchase() {
    setBusy('purchase');
    try {
      await purchase(selected);
    } catch {
      Alert.alert('Purchase failed', 'Nothing was charged. Please try again.');
    } finally {
      setBusy(undefined);
    }
  }

  async function handleRestore() {
    setBusy('restore');
    try {
      const entitled = await restore();
      if (!entitled) {
        Alert.alert('Nothing to restore', 'No active subscription was found for this account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setBusy(undefined);
    }
  }

  const subheadline = paywallConfig.subheadline
    .replace('{money}', formatMoney(profile.costPerDay, profile.currency))
    .replace('{units}', formatUnits(profile.unitsPerDay, habit));
  const cta = selectedPlan
    ? paywallConfig.cta.replace('{price}', selectedPlan.price).replace('{period}', selectedPlan.period)
    : 'Continue';

  return (
    <Screen
      scroll
      footer={
        <Stack gap="sm">
          <Button title={cta} onPress={handlePurchase} loading={busy === 'purchase'} disabled={!plans || busy === 'restore'} />
          <Text variant="caption" color="muted" align="center">
            {paywallConfig.footnote}
          </Text>
          <Row gap="lg" justify="center">
            <FooterLink label="Restore purchases" color="primary" onPress={handleRestore} disabled={busy !== undefined} />
            <FooterLink label="Terms" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} />
            <FooterLink label="Privacy" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} />
          </Row>
        </Stack>
      }
    >
      <Stack gap="lg">
        <Stack gap="md">
          <View style={styles.hero}>
            <CounterRing size={HERO_RING} progress={1} complete>
              <Stack align="center" gap="none">
                <Text variant="overline" color="primary" numberOfLines={1}>
                  {habit.freeLabel.toUpperCase()}
                </Text>
                <Text variant="display">Day 1</Text>
                <Text variant="label" color="muted">
                  starts now
                </Text>
              </Stack>
            </CounterRing>
          </View>
          <Stack gap="sm">
            <Text variant="title" numberOfLines={3}>
              {paywallConfig.headline}
            </Text>
            <Text color="muted">{subheadline}</Text>
          </Stack>
        </Stack>

        <Stack gap="md">
          {paywallConfig.benefits.map((benefit) => (
            <Row key={benefit.title} gap="item">
              <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.sm }]}>
                <Icon name={benefit.icon} size={18} color={colors.primary} />
              </View>
              <Stack gap="xxs" style={styles.grow}>
                <Text variant="label">{benefit.title}</Text>
                <Text variant="caption" color="muted">
                  {benefit.body}
                </Text>
              </Stack>
            </Row>
          ))}
        </Stack>

        <Stack gap="item">
          {plans ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                plans={plans}
                selected={plan.id === selected}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setSelected(plan.id);
                }}
              />
            ))
          ) : (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </Stack>
      </Stack>
    </Screen>
  );
}

function FooterLink({
  label,
  onPress,
  color = 'muted',
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  color?: 'muted' | 'primary';
  disabled?: boolean;
}) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} disabled={disabled} style={styles.link}>
      <Text variant="caption" color={color}>
        {label}
      </Text>
    </Pressable>
  );
}

function PlanCard({ plan, plans, selected, onPress }: { plan: Plan; plans: Plan[]; selected: boolean; onPress: () => void }) {
  const { colors, radii, spacing } = useTheme();
  const weekly = plans.find((candidate) => candidate.id === 'weekly');
  const perWeek = plan.period === 'year' ? dividePrice(plan.price, 52) : undefined;
  const saving = plan.period === 'year' && weekly ? savingPercent(plan.price, weekly.price) : undefined;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.plan,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.md,
          padding: spacing.md,
          gap: spacing.item,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
            borderRadius: radii.pill,
          },
        ]}
      >
        {selected ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
      </View>
      <Stack gap="xxs" style={styles.grow}>
        <Row gap="sm" wrap>
          <Text variant="label">{plan.title}</Text>
          {saving !== undefined && saving > 0 ? (
            <View
              style={{
                backgroundColor: colors.accent,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.item,
                paddingVertical: spacing.sm,
              }}
            >
              <Text variant="overline" style={{ color: colors.onAccent }}>
                SAVE {saving}%
              </Text>
            </View>
          ) : null}
        </Row>
        <Text variant="caption" color="muted">
          {perWeek ? `${perWeek} a week, billed yearly` : `Billed every ${plan.period}`}
        </Text>
      </Stack>
      <Text variant="heading" tabular numberOfLines={1}>
        {plan.price}
      </Text>
    </Pressable>
  );
}

/** "$39.99" → 39.99; handles "39,99 €" too. */
function priceAmount(price: string): number | undefined {
  const digits = price.replace(/[^0-9.,]/g, '').replace(',', '.');
  const amount = Number.parseFloat(digits);
  return Number.isFinite(amount) ? amount : undefined;
}

/** Keeps the currency symbol from the original string: "$39.99" / 52 → "$0.77". */
function dividePrice(price: string, by: number): string | undefined {
  const amount = priceAmount(price);
  if (amount === undefined) {
    return undefined;
  }
  const divided = (amount / by).toFixed(2);
  return price.replace(/[0-9]+([.,][0-9]+)?/, price.includes(',') ? divided.replace('.', ',') : divided);
}

function savingPercent(yearly: string, weekly: string): number | undefined {
  const yearlyAmount = priceAmount(yearly);
  const weeklyAmount = priceAmount(weekly);
  if (yearlyAmount === undefined || weeklyAmount === undefined || weeklyAmount === 0) {
    return undefined;
  }
  return Math.round((1 - yearlyAmount / (weeklyAmount * 52)) * 100);
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  benefitIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, minHeight: 72 },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  loading: { height: 156, alignItems: 'center', justifyContent: 'center' },
  link: { minHeight: 44, justifyContent: 'center' },
});
