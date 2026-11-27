import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { AnimatedNumber, Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { CalorieRing, ringNumeralStyle } from '@/features/diary/CalorieRing';
import { macroTargets, useDailyTarget } from '@/features/diary/target';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useTheme } from '@/theme/theme';

const RING_SIZE = 144;
const WEEKS_PER_YEAR = 52;

/** Pulls the number out of a localized price string; undefined when it cannot be read. */
function priceAmount(price: string): number | undefined {
  const digits = price.replace(/[^\d.,]/g, '');
  const normalized = digits.includes('.') ? digits.replace(/,/g, '') : digits.replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Formats an amount the way the store formatted the original price (same symbol, same side). */
function formatLike(price: string, amount: number): string {
  const symbol = price.replace(/[\d.,\s]/g, '');
  const text = amount.toFixed(2);
  return /^\d/.test(price.trim()) ? `${text} ${symbol}`.trim() : `${symbol}${text}`;
}

function planDetails(plan: Plan, plans: Plan[]): { perWeek?: string; savings?: string } {
  if (plan.id !== 'yearly') {
    return {};
  }
  const yearly = priceAmount(plan.price);
  const weekly = plans.find((candidate) => candidate.id === 'weekly');
  const weeklyAmount = weekly ? priceAmount(weekly.price) : undefined;
  if (yearly === undefined) {
    return {};
  }
  const perWeek = `${formatLike(plan.price, yearly / WEEKS_PER_YEAR)} a week`;
  if (weeklyAmount === undefined) {
    return { perWeek };
  }
  const saved = Math.round((1 - yearly / (weeklyAmount * WEEKS_PER_YEAR)) * 100);
  return { perWeek, savings: saved > 0 ? `Save ${saved}%` : undefined };
}

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const { target } = useDailyTarget();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

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

  const selectedPlan = plans?.find((plan) => plan.id === selected);
  const trialDays = selectedPlan?.trialDays;
  const cta = trialDays
    ? `Start my ${trialDays}-day free trial`
    : selectedPlan
      ? `Continue with ${selectedPlan.title.toLowerCase()}`
      : 'Continue';
  const macros = macroTargets(target);
  const full = { calories: target, ...macros };

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button title={cta} onPress={handlePurchase} loading={busy === 'purchase'} disabled={!plans || busy === 'restore'} />
          <Text variant="caption" color="muted" align="center">
            {trialDays && selectedPlan
              ? `Then ${selectedPlan.price} a ${selectedPlan.period}. ${paywallConfig.footnote}`
              : paywallConfig.footnote}
          </Text>
          <View style={[styles.links, { gap: spacing.lg, paddingTop: spacing.xs }]}>
            <Pressable onPress={handleRestore} disabled={busy !== undefined} hitSlop={8}>
              <Text variant="caption" color="muted">
                Restore
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
      <Stack gap="lg">
        <View style={[styles.hero, { gap: spacing.md }]}>
          <CalorieRing size={RING_SIZE} target={target} eaten={full} macroTargets={macros}>
            <AnimatedNumber value={target} style={ringNumeralStyle(RING_SIZE)} />
            <Text variant="caption" color="muted">
              kcal a day
            </Text>
          </CalorieRing>
          <View style={{ gap: spacing.xs }}>
            <Text variant="title" align="center">
              {paywallConfig.headline.replace('{target}', target.toLocaleString())}
            </Text>
            <Text color="muted" align="center">
              {paywallConfig.subheadline}
            </Text>
          </View>
        </View>

        <Stack gap="ms">
          {paywallConfig.benefits.map((benefit) => (
            <Row key={benefit.text} gap="ms">
              <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
                <Icon name={benefit.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.grow}>{benefit.text}</Text>
            </Row>
          ))}
        </Stack>

        <Stack gap="md">
          <Stack gap="sm">
            {plans ? (
              plans.map((plan) => {
                const isSelected = plan.id === selected;
                const { perWeek, savings } = planDetails(plan, plans);
                return (
                  <Pressable
                    key={plan.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelected(plan.id)}
                    style={({ pressed }) => [
                      styles.plan,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isSelected ? colors.text : colors.border,
                        borderRadius: radii.lg,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.ms,
                        gap: spacing.ms,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: isSelected ? colors.text : colors.border,
                          backgroundColor: isSelected ? colors.text : 'transparent',
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      {isSelected ? <Icon name="check" size={12} color={colors.background} weight="bold" /> : null}
                    </View>
                    <View style={[styles.grow, { gap: spacing.xs }]}>
                      <Text variant="label" numberOfLines={1}>
                        {plan.title}
                        {plan.trialDays ? (
                          <Text variant="label" color="primary">
                            {` · ${plan.trialDays} days free`}
                          </Text>
                        ) : null}
                      </Text>
                      <Text variant="caption" color="muted">
                        {plan.price} a {plan.period}
                        {perWeek ? ` · ${perWeek}` : ''}
                      </Text>
                    </View>
                    {savings ?? plan.badge ? (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.ms,
                          paddingVertical: spacing.sm,
                        }}
                      >
                        <Text variant="caption" color="onPrimary">
                          {savings ?? plan.badge}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })
            ) : (
              <ActivityIndicator style={{ paddingVertical: spacing.lg }} />
            )}
          </Stack>

          {trialDays && selectedPlan ? <TrialTimeline days={trialDays} plan={selectedPlan} /> : null}
        </Stack>
      </Stack>
    </Screen>
  );
}

function TrialTimeline({ days, plan }: { days: number; plan: Plan }) {
  const { colors, radii, spacing } = useTheme();
  const steps = [
    { title: 'Today', body: 'Full access' },
    { title: `Day ${Math.max(days - 1, 1)}`, body: 'Last free day' },
    { title: `Day ${days}`, body: `${plan.price} billed` },
  ];

  return (
    <View style={[styles.timeline, { gap: spacing.sm }]}>
      <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
      {steps.map((step, index) => (
        <View key={step.title} style={[styles.timelineStep, { gap: spacing.xs }]}>
          <View
            style={[
              styles.timelineDot,
              {
                backgroundColor: index === 0 ? colors.primary : colors.surface,
                borderColor: index === 0 ? colors.primary : colors.border,
                borderRadius: radii.pill,
              },
            ]}
          />
          <Text variant="label" align="center">
            {step.title}
          </Text>
          <Text variant="caption" color="muted" align="center">
            {step.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  grow: { flex: 1, minWidth: 0 },
  hero: { alignItems: 'center' },
  benefitIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, minHeight: 60 },
  radio: { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center' },
  timeline: { flexDirection: 'row' },
  timelineLine: { position: 'absolute', left: '16%', right: '16%', top: 6, height: 2 },
  timelineStep: { flex: 1, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderWidth: 2 },
});
