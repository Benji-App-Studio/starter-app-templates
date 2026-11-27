import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button, Card, Icon, Screen, Text, type IconName } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { listHabits } from '@/db/habits';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { fonts, useTheme } from '@/theme/theme';

import { formatTime } from '../habits/dates';
import { checkinFor } from '../habits/starters';
import { TodayRing } from '../habits/TodayRing';

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();
  const [habitCount, setHabitCount] = useState(0);
  const checkin = checkinFor(useAppState().onboardingAnswers);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Could not load plans', 'Check your connection and try again.'));
    listHabits().then((habits) => setHabitCount(habits.length));
  }, []);

  const selectedPlan = plans?.find((plan) => plan.id === selected);
  const weekly = plans?.find((plan) => plan.id === 'weekly');
  const yearly = plans?.find((plan) => plan.id === 'yearly');
  const comparison = weekly && yearly ? compare(weekly.price, yearly.price) : undefined;
  const cta = selectedPlan?.trialDays ? `Start my ${selectedPlan.trialDays}-day free trial` : paywallConfig.cta;

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

  return (
    <Screen
      scroll
      contentStyle={[styles.content, { gap: spacing.lg }]}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title={cta}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {selectedPlan?.trialDays
              ? `Free for ${selectedPlan.trialDays} days, then ${selectedPlan.price} a ${selectedPlan.period}. ${paywallConfig.footnote}`
              : paywallConfig.footnote}
          </Text>
          <View style={[styles.links, { gap: spacing.md }]}>
            <Pressable
              hitSlop={spacing.item}
              accessibilityRole="button"
              onPress={handleRestore}
              disabled={busy !== undefined}
            >
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable
              hitSlop={spacing.item}
              accessibilityRole="link"
              onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)}
            >
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable
              hitSlop={spacing.item}
              accessibilityRole="link"
              onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)}
            >
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <Animated.View entering={FadeIn} style={[styles.hero, { gap: spacing.md }]}>
        <TodayRing total={Math.max(habitCount, 4)} done={Math.max(habitCount, 4)} size={120}>
          <Icon name="flame" size={22} color={colors.streak} weight="bold" />
          <Text variant="numeralSmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            Day 1
          </Text>
        </TodayRing>
        <View style={{ gap: spacing.sm }}>
          <Text variant="title" align="center">
            {habitCount > 0
              ? `Your ${habitCount} ${habitCount === 1 ? 'habit is' : 'habits are'} ready`
              : paywallConfig.headline}
          </Text>
          <Text color="muted" align="center">
            {habitCount > 0
              ? `${checkin.label} check-in at ${formatTime(checkin.time)}. ${paywallConfig.subheadline}`
              : paywallConfig.subheadline}
          </Text>
        </View>
      </Animated.View>

      <View style={{ gap: spacing.item }}>
        {paywallConfig.benefits.map((benefit, index) => (
          <Animated.View
            key={benefit.text}
            entering={FadeInDown.delay(index * 50)
              .springify()
              .damping(18)}
            style={[styles.benefit, { gap: spacing.md }]}
          >
            <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
              <Icon name={benefit.icon as IconName} size={16} color={colors.primary} />
            </View>
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </Animated.View>
        ))}
      </View>

      <View style={{ gap: spacing.item }}>
        {plans ? (
          plans.map((plan) => {
            const isSelected = plan.id === selected;
            const perWeek = plan.id === 'yearly' ? comparison?.yearlyPerWeek : undefined;
            return (
              <Card key={plan.id} selected={isSelected} onPress={() => setSelected(plan.id)}>
                <View style={[styles.planRow, { gap: spacing.md }]}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
                  </View>
                  <View style={styles.planBody}>
                    <View style={[styles.planTitle, { gap: spacing.sm }]}>
                      <Text variant="label">{plan.title}</Text>
                      {plan.badge && comparison?.savings ? (
                        <View
                          style={[
                            {
                              backgroundColor: colors.streakSoft,
                              borderRadius: radii.pill,
                              paddingHorizontal: spacing.item,
                              paddingVertical: spacing.xs + spacing.xxs,
                            },
                          ]}
                        >
                          <Text variant="caption" style={{ color: colors.text, fontFamily: fonts.semibold }}>
                            Save {comparison.savings}%
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text variant="caption" color="muted">
                      {plan.trialDays ? `${plan.trialDays} days free, then ` : ''}
                      {plan.price} / {plan.period}
                      {perWeek ? ` · ${perWeek} a week` : ''}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} />
        )}
      </View>

      {selectedPlan?.trialDays ? (
        <TrialTimeline days={selectedPlan.trialDays} price={selectedPlan.price} period={selectedPlan.period} />
      ) : null}
    </Screen>
  );
}

/** Today · midway · billing day, as three dots on a line. */
function TrialTimeline({ days, price, period }: { days: number; price: string; period: string }) {
  const { colors, radii, spacing } = useTheme();
  const midway = Math.max(2, days - 2);
  const points = [
    { title: 'Today', body: 'Full access, free' },
    { title: `Day ${midway}`, body: 'Cancel anytime' },
    { title: `Day ${days}`, body: `${price} a ${period}` },
  ];

  return (
    <Animated.View entering={FadeIn} style={[styles.timeline, { gap: spacing.sm }]}>
      <View style={[styles.timelineLine, { backgroundColor: colors.border, borderRadius: radii.pill }]} />
      {points.map((point, index) => (
        <View key={point.title} style={[styles.timelinePoint, { gap: spacing.sm }]}>
          <View
            style={[
              styles.timelineDot,
              {
                borderRadius: radii.pill,
                backgroundColor: index === 0 ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          />
          <Text variant="label" align="center">
            {point.title}
          </Text>
          <Text variant="caption" color="muted" align="center">
            {point.body}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
}

/** Per-week price of the yearly plan and the saving against paying weekly, from the price strings. */
function compare(weeklyPrice: string, yearlyPrice: string): { yearlyPerWeek: string; savings: number } | undefined {
  const weekly = parsePrice(weeklyPrice);
  const yearly = parsePrice(yearlyPrice);
  if (!weekly || !yearly || weekly.amount === 0) {
    return undefined;
  }
  const perWeek = yearly.amount / 52;
  return {
    yearlyPerWeek: yearlyPrice.replace(yearly.digits, perWeek.toFixed(2)),
    savings: Math.round((1 - perWeek / weekly.amount) * 100),
  };
}

function parsePrice(price: string): { amount: number; digits: string } | undefined {
  const match = price.match(/\d+(?:[.,]\d+)?/);
  if (!match) {
    return undefined;
  }
  const amount = Number(match[0].replace(',', '.'));
  return Number.isFinite(amount) ? { amount, digits: match[0] } : undefined;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { alignItems: 'center' },
  benefit: { flexDirection: 'row', alignItems: 'center' },
  benefitIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, minWidth: 0 },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planBody: { flex: 1, minWidth: 0 },
  planTitle: { flexDirection: 'row', alignItems: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  links: { flexDirection: 'row', justifyContent: 'center' },
  timeline: { flexDirection: 'row' },
  timelineLine: { position: 'absolute', left: '16%', right: '16%', top: 6, height: 2 },
  timelinePoint: { flex: 1, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderWidth: 2 },
});
