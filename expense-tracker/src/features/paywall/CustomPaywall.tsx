import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { formatMoney } from '@/features/expenses/money';
import { PlanPreview } from '@/features/onboarding/PlanPreview';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const WEEKS_PER_YEAR = 52;

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, sizes, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

  const currency = plans?.[0]?.currencyCode ?? 'USD';
  const weekly = plans?.find((candidate) => candidate.id === 'weekly');
  const selectedPlan = plans?.find((candidate) => candidate.id === selected);
  const trialDays = selectedPlan?.trialDays;

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

  /** Weekly cost of a plan, so the two cards compare on the same line. */
  function perWeek(candidate: Plan): string {
    const amount = candidate.id === 'yearly' ? candidate.priceAmount / WEEKS_PER_YEAR : candidate.priceAmount;
    return `${formatMoney(Math.round(amount * 100), candidate.currencyCode)} a week`;
  }

  function savings(candidate: Plan): string | undefined {
    if (candidate.id !== 'yearly' || !weekly || weekly.priceAmount <= 0) {
      return undefined;
    }
    const percent = Math.round((1 - candidate.priceAmount / (weekly.priceAmount * WEEKS_PER_YEAR)) * 100);
    return percent > 0 ? `Save ${percent}%` : undefined;
  }

  const ctaTitle = trialDays
    ? `Start my ${trialDays}-day free trial`
    : selectedPlan
      ? `${paywallConfig.cta} with ${selectedPlan.title.toLowerCase()}`
      : paywallConfig.cta;

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title={ctaTitle}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {trialDays && selectedPlan
              ? `Free for ${trialDays} days, then ${selectedPlan.price} a ${selectedPlan.period}. ${paywallConfig.footnote}`
              : paywallConfig.footnote}
          </Text>
          <View style={[styles.links, { gap: spacing.lg }]}>
            <Pressable accessibilityRole="button" onPress={handleRestore} disabled={busy !== undefined} style={[styles.link, { minHeight: sizes.hit }]}>
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} style={[styles.link, { minHeight: sizes.hit }]}>
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} style={[styles.link, { minHeight: sizes.hit }]}>
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <Stack gap="item">
        <PlanPreview answers={onboardingAnswers} currency={currency} caption="Your daily number" hideRunway />

        <Stack gap="sm">
          <Text variant="display" numberOfLines={3}>
            {paywallConfig.headline}
          </Text>
          <Text color="muted">{paywallConfig.subheadline}</Text>
        </Stack>

        <Stack gap="item">
          {paywallConfig.benefits.map((benefit) => (
            <Row key={benefit.text} gap="md">
              <View
                style={[
                  styles.benefitIcon,
                  {
                    width: sizes.iconBubble,
                    height: sizes.iconBubble,
                    backgroundColor: colors.primarySoft,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Icon name={benefit.icon} size={16} color={colors.primary} weight="semibold" />
              </View>
              <Text style={styles.grow} numberOfLines={1}>
                {benefit.text}
              </Text>
            </Row>
          ))}
        </Stack>

        <Stack gap="item">
          {plans ? (
            plans.map((candidate) => {
              const badge = savings(candidate) ?? candidate.badge;
              const isSelected = candidate.id === selected;
              return (
                <Card key={candidate.id} selected={isSelected} onPress={() => setSelected(candidate.id)}>
                  <Row gap="md">
                    <Stack gap="xs" style={styles.grow}>
                      <Row gap="sm">
                        <Text variant="label" numberOfLines={1}>
                          {candidate.title}
                        </Text>
                        {badge ? (
                          <View
                            style={{
                              backgroundColor: isSelected ? colors.primary : colors.primarySoft,
                              borderRadius: radii.pill,
                              paddingHorizontal: spacing.item,
                              paddingVertical: spacing.pillY,
                            }}
                          >
                            <Text variant="caption" color={isSelected ? 'onPrimary' : 'primary'} numberOfLines={1}>
                              {badge}
                            </Text>
                          </View>
                        ) : null}
                      </Row>
                      <Text variant="caption" color="muted" numberOfLines={2}>
                        {candidate.trialDays ? `${candidate.trialDays}-day free trial · ` : ''}
                        {perWeek(candidate)}
                      </Text>
                    </Stack>
                    <Stack gap="hairline" align="flex-end">
                      <Text variant="money" numberOfLines={1}>
                        {candidate.price}
                      </Text>
                      <Text variant="caption" color="muted">
                        per {candidate.period}
                      </Text>
                    </Stack>
                  </Row>
                </Card>
              );
            })
          ) : (
            <ActivityIndicator style={{ marginVertical: spacing.lg }} />
          )}
        </Stack>

        {trialDays && selectedPlan ? <TrialTimeline trialDays={trialDays} price={selectedPlan.price} /> : null}
      </Stack>
    </Screen>
  );
}

type TrialTimelineProps = { trialDays: number; price: string };

/** Today · still free to cancel · billed, as three dots on a line. */
function TrialTimeline({ trialDays, price }: TrialTimelineProps) {
  const { colors, radii, spacing } = useTheme();
  const lastFreeDay = Math.max(1, trialDays - 2);
  const stops = [
    { title: 'Today', body: 'Full access' },
    { title: `Day ${lastFreeDay}`, body: 'Still free to cancel' },
    { title: `Day ${trialDays}`, body: `${price} billed` },
  ];

  return (
    <View>
      <View style={styles.timeline}>
        <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
        {stops.map((stop, index) => (
          <View key={stop.title} style={styles.timelineStop}>
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: index === 0 ? colors.primary : colors.background,
                  borderColor: colors.primary,
                  borderRadius: radii.pill,
                },
              ]}
            />
            <Stack gap="hairline" align="center" style={{ marginTop: spacing.sm }}>
              <Text variant="label" align="center">
                {stop.title}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {stop.body}
              </Text>
            </Stack>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  benefitIcon: { alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
  links: { flexDirection: 'row', justifyContent: 'center' },
  link: { justifyContent: 'center' },
  timeline: { flexDirection: 'row' },
  timelineLine: { position: 'absolute', left: '16%', right: '16%', top: 6, height: 2 },
  timelineStop: { flex: 1, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderWidth: 2 },
});
