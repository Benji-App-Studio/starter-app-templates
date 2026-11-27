import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Icon, Screen, Text, type IconName } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { formatHour } from '@/features/hydration/dates';
import { formatAmountShort } from '@/features/hydration/goal';
import { useHydrationSettings } from '@/features/hydration/settings';
import { useGoal } from '@/features/hydration/useGoal';
import { WaterGlass } from '@/features/hydration/WaterGlass';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useTheme, spacing } from '@/theme/theme';

/** The number inside a localized price string, or undefined when it cannot be read. */
function priceNumber(price: string): number | undefined {
  const digits = price.replace(/[^0-9.,]/g, '');
  const normalized =
    digits.includes(',') && !digits.includes('.') ? digits.replace(',', '.') : digits.replace(/,/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** "$0.38" from "$19.99" and 52 weeks, keeping whatever currency symbol the store used. */
function perWeekPrice(price: string): string | undefined {
  const value = priceNumber(price);
  if (value === undefined) {
    return undefined;
  }
  const symbol = price.replace(/[0-9.,\s]/g, '');
  const amount = (value / 52).toFixed(2);
  return price.trim().startsWith(symbol) ? `${symbol}${amount}` : `${amount}${symbol}`;
}

function savingsPercent(weekly: Plan | undefined, yearly: Plan | undefined): number | undefined {
  const weeklyValue = weekly ? priceNumber(weekly.price) : undefined;
  const yearlyValue = yearly ? priceNumber(yearly.price) : undefined;
  if (!weeklyValue || !yearlyValue) {
    return undefined;
  }
  return Math.round((1 - yearlyValue / (weeklyValue * 52)) * 100);
}

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const { goalMl, unit } = useGoal();
  const settings = useHydrationSettings();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Could not load plans', 'Check your connection and try again.'));
  }, []);

  const selectedPlan = plans?.find((plan) => plan.id === selected);
  const yearly = plans?.find((plan) => plan.id === 'yearly');
  const weekly = plans?.find((plan) => plan.id === 'weekly');
  const savings = savingsPercent(weekly, yearly);
  const { trial } = paywallConfig;
  const hasTrial = trial.days > 0 && selected === trial.planId;
  const goalLabel = formatAmountShort(goalMl, unit);
  const replace = (text: string) =>
    text
      .replace('{goal}', goalLabel)
      .replace('{start}', formatHour(settings.reminderStartHour))
      .replace('{end}', formatHour(settings.reminderEndHour));

  function handleSelect(planId: PlanId) {
    void Haptics.selectionAsync();
    setSelected(planId);
  }

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

  const cta = hasTrial
    ? `Start my ${trial.days}-day free trial`
    : `Continue with ${selectedPlan?.title.toLowerCase() ?? 'this plan'}`;
  const footnote =
    hasTrial && selectedPlan
      ? `${trial.days} days free, then ${selectedPlan.price} a ${selectedPlan.period}. ${paywallConfig.footnote}`
      : paywallConfig.footnote;

  return (
    <Screen
      scroll
      contentStyle={[styles.content, { paddingTop: spacing.md }]}
      footer={
        <View style={{ gap: spacing.sm + spacing.xs }}>
          <Button
            title={cta}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {footnote}
          </Text>
          <View style={[styles.links, { gap: spacing.lg }]}>
            <Pressable onPress={handleRestore} disabled={busy !== undefined} hitSlop={8}>
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} hitSlop={8}>
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} hitSlop={8}>
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <View style={[styles.hero, { gap: spacing.md }]}>
        <WaterGlass level={1} size={96} success />
        <View style={{ gap: spacing.sm }}>
          <Text variant="title" align="center">
            {replace(paywallConfig.headline)}
          </Text>
          <Text color="muted" align="center">
            {paywallConfig.subheadline}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
        {paywallConfig.benefits.map((benefit) => (
          <View key={benefit.text} style={[styles.benefit, { gap: spacing.ms }]}>
            <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.sm }]}>
              <Icon name={benefit.icon} size={16} color={colors.primary} />
            </View>
            <Text variant="label" style={styles.benefitText}>
              {replace(benefit.text)}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.plans, { marginTop: spacing.lg, gap: spacing.ms }]}>
        {plans ? (
          plans.map((plan) => {
            const active = plan.id === selected;
            const weekPrice = plan.id === 'yearly' ? perWeekPrice(plan.price) : undefined;
            const badge = plan.id === 'yearly' && savings ? `Save ${savings}%` : plan.badge;
            return (
              <Pressable
                key={plan.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => handleSelect(plan.id)}
                style={[
                  styles.plan,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: radii.lg,
                    padding: spacing.md,
                    gap: spacing.xs,
                  },
                ]}
              >
                <View style={[styles.planTop, { marginBottom: spacing.sm }]}>
                  <Text variant="label">{plan.title}</Text>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary : 'transparent',
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    {active ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
                  </View>
                </View>
                <Text variant="stat" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {plan.price}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {weekPrice ? `a ${plan.period} · ${weekPrice} a week` : `a ${plan.period}`}
                </Text>
                <View style={[styles.badgeSlot, { marginTop: spacing.sm }]}>
                  {badge ? (
                    <View
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.ms,
                        paddingVertical: spacing.xs,
                      }}
                    >
                      <Text variant="caption" color="onPrimary">
                        {badge}
                      </Text>
                    </View>
                  ) : (
                    <Text variant="caption" color="muted">
                      Cancel anytime
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })
        ) : (
          <ActivityIndicator style={{ marginVertical: spacing.lg, flex: 1 }} />
        )}
      </View>

      {hasTrial && selectedPlan ? <TrialTimeline days={trial.days} price={selectedPlan.price} /> : null}
    </Screen>
  );
}

function TrialTimeline({ days, price }: { days: number; price: string }) {
  const { colors, radii, spacing } = useTheme();
  const stops: { icon: IconName; title: string; detail: string }[] = [
    { icon: 'dropOutline', title: 'Today', detail: 'Full access' },
    { icon: 'bell', title: `Day ${Math.max(1, days - 2)}`, detail: 'Reminder sent' },
    { icon: 'card', title: `Day ${days}`, detail: `${price} billed` },
  ];

  return (
    <View style={{ marginTop: spacing.lg }}>
      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      <View style={styles.timeline}>
        {stops.map((stop) => (
          <View key={stop.title} style={[styles.stop, { gap: spacing.sm }]}>
            <View style={[styles.stopIcon, { backgroundColor: colors.surface, borderColor: colors.primary, borderRadius: radii.pill }]}>
              <Icon name={stop.icon} size={14} color={colors.primary} />
            </View>
            <Text variant="label" align="center">
              {stop.title}
            </Text>
            <Text variant="caption" color="muted" align="center">
              {stop.detail}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { alignItems: 'center' },
  benefit: { flexDirection: 'row', alignItems: 'center' },
  benefitIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1 },
  plans: { flexDirection: 'row' },
  plan: { flex: 1, borderWidth: 2 },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeSlot: { minHeight: 28, alignItems: 'flex-start', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center' },
  timeline: { flexDirection: 'row' },
  stop: { flex: 1, alignItems: 'center' },
  stopIcon: { width: 32, height: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { position: 'absolute', left: '16%', right: '16%', top: 15, height: 2 },
});
