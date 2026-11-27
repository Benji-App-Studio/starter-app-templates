import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, useSharedValue } from 'react-native-reanimated';

import { Button, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { formatHour } from '@/features/journal/dates';
import { MoodDial } from '@/features/journal/MoodDial';
import { defaultReminderHour } from '@/features/reminders/reminders';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { mixColors, useTheme } from '@/theme/theme';

/** The hero dial's widest size on the paywall. */
const HERO_MAX_WIDTH = 240;

/** "$39.99" → 39.99 and "$", so the yearly plan can show its weekly cost and the saving. */
function parsePrice(price: string): { amount: number; symbol: string } | undefined {
  const match = price.match(/^([^\d]*)(\d+(?:[.,]\d+)?)/);
  if (!match) {
    return undefined;
  }
  return { symbol: match[1].trim(), amount: Number(match[2].replace(',', '.')) };
}

function planDetail(plan: Plan, plans: Plan[]): string | undefined {
  if (plan.id !== 'yearly') {
    return undefined;
  }
  const yearly = parsePrice(plan.price);
  const weekly = plans.find((candidate) => candidate.id === 'weekly');
  const weeklyPrice = weekly ? parsePrice(weekly.price) : undefined;
  if (!yearly) {
    return undefined;
  }
  const perWeek = `${yearly.symbol}${(yearly.amount / 52).toFixed(2)} a week`;
  if (!weeklyPrice || weeklyPrice.amount === 0) {
    return perWeek;
  }
  const saving = Math.round((1 - yearly.amount / (weeklyPrice.amount * 52)) * 100);
  return saving > 0 ? `${perWeek} · Save ${saving}%` : perWeek;
}

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing, layout, scheme } = useTheme();
  const { width } = useWindowDimensions();
  const { onboardingAnswers } = useAppState();
  // The hero is the dial in its happiest state, on a warm wash of that mood.
  const great = useSharedValue(1);
  const wash = mixColors(colors.background, colors.mood[3], scheme === 'dark' ? 0.14 : 0.16);
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

  const selectedConfig = paywallConfig.plans.find((plan) => plan.id === selected);
  const selectedPlan = plans?.find((plan) => plan.id === selected);
  const trialDays = selectedConfig?.trialDays;
  const cta = trialDays
    ? `Start my ${trialDays}-day free trial`
    : selectedPlan
      ? `Continue for ${selectedPlan.price} a ${selectedPlan.period}`
      : 'Continue';
  const reminderHour = formatHour(defaultReminderHour(onboardingAnswers.checkInTime));

  return (
    <Screen
      scroll
      gap="ms"
      backgroundColor={wash}
      footer={
        <>
          <Button
            title={cta}
            onPress={() => void handlePurchase()}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {trialDays
              ? `Free for ${trialDays} days, then ${selectedPlan?.price ?? ''} a ${selectedPlan?.period ?? 'year'}. `
              : ''}
            {paywallConfig.footnote}
          </Text>
          <Row gap="lg" justify="center">
            <Pressable onPress={() => void handleRestore()} disabled={busy !== undefined} hitSlop={8}>
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
          </Row>
        </>
      }
    >
      {/* The dial in its happiest state, small enough that plans and the trial fit above the button. */}
      <Stack align="center">
        <MoodDial
          progress={great}
          width={Math.min(width - spacing.gutter * 2, HERO_MAX_WIDTH)}
          enabled={false}
          onScoreChange={() => undefined}
        />
      </Stack>

      <Stack gap="sm">
        <Text variant="display" numberOfLines={2}>
          {paywallConfig.headline}
        </Text>
        <Text color="muted" numberOfLines={3}>
          {`Your ${reminderHour} check-in is set. ${paywallConfig.subheadline}`}
        </Text>
      </Stack>

      <Stack gap="sm">
        {paywallConfig.benefits.map((benefit, index) => (
          <Animated.View
            key={benefit.title}
            entering={FadeInDown.delay(index * 60)
              .springify()
              .damping(18)}
            style={[styles.benefit, { gap: spacing.md }]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.md }]}>
              <Icon name={benefit.icon} size={20} color={colors.primary} />
            </View>
            <View style={[styles.flex, { gap: spacing.xs }]}>
              <Text variant="label" numberOfLines={1}>
                {benefit.title}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {benefit.body}
              </Text>
            </View>
          </Animated.View>
        ))}
      </Stack>

      <Stack gap="ms">
        {plans ? (
          plans.map((plan) => {
            const isSelected = plan.id === selected;
            const detail = planDetail(plan, plans);
            return (
              <Pressable
                key={plan.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setSelected(plan.id)}
                style={[
                  styles.plan,
                  {
                    borderWidth: layout.border,
                    backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radii.lg,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.ms,
                    gap: spacing.md,
                  },
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isSelected ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
                </View>
                <View style={[styles.flex, { gap: spacing.xs }]}>
                  <View style={[styles.planTitle, { gap: spacing.sm }]}>
                    <Text variant="label">{plan.title}</Text>
                    {plan.badge ? (
                      <View
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs,
                        }}
                      >
                        <Text variant="caption" color="onPrimary">
                          {plan.badge}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {detail ? (
                    <Text variant="caption" color="muted">
                      {detail}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.price, { gap: spacing.xs }]}>
                  <Text variant="label" numberOfLines={1}>
                    {plan.price}
                  </Text>
                  <Text variant="caption" color="muted">
                    {`per ${plan.period}`}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} />
        )}
      </Stack>

      {trialDays ? <TrialTimeline days={trialDays} price={selectedPlan?.price} /> : null}
    </Screen>
  );
}

function TrialTimeline({ days, price }: { days: number; price?: string }) {
  const { colors, radii, spacing } = useTheme();
  const steps = [
    { title: 'Today', body: 'Nothing charged' },
    { title: `Day ${Math.max(1, days - 2)}`, body: 'Reminder sent' },
    { title: `Day ${days}`, body: price ? `${price} billed` : 'First charge' },
  ];

  return (
    <View style={[styles.timeline, { gap: spacing.sm }]}>
      {steps.map((step, index) => (
        <View key={step.title} style={[styles.flex, { gap: spacing.xs }]}>
          {/* The dot sits on the title's line; a filled dot is today, rings are the days to come. */}
          <View style={[styles.timelineRail, { gap: spacing.sm }]}>
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: index === 0 ? colors.primary : 'transparent',
                  borderColor: colors.primary,
                  borderRadius: radii.pill,
                },
              ]}
            />
            <Text variant="label" numberOfLines={1} style={styles.flex}>
              {step.title}
            </Text>
          </View>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {step.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  benefit: { flexDirection: 'row', alignItems: 'center' },
  benefitIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center' },
  planTitle: { flexDirection: 'row', alignItems: 'center' },
  price: { alignItems: 'flex-end' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timeline: { flexDirection: 'row' },
  timelineRail: { flexDirection: 'row', alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderWidth: 2 },
});
