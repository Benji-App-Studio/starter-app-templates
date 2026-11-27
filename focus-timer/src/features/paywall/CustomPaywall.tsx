import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button, Card, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { Dial } from '@/features/focus/Dial';
import { defaultsFromAnswers } from '@/features/focus/focusSettings';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, sizes, spacing } = useTheme();
  const { height } = useWindowDimensions();
  // The finished dial fills about a quarter of the screen: the product, before the price.
  const heroSize = Math.round(Math.min(136, height * 0.15));
  const { onboardingAnswers } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => Alert.alert('Could not load plans', 'Check your connection and try again.'));
  }, []);

  const { focusMinutes } = defaultsFromAnswers(onboardingAnswers);
  const plan = plans?.find((candidate) => candidate.id === selected);
  const weekly = plans?.find((candidate) => candidate.id === 'weekly');
  const yearly = plans?.find((candidate) => candidate.id === 'yearly');
  const saving = weekly && yearly ? savingPercent(weekly.price, yearly.price) : undefined;

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
      contentStyle={styles.content}
      footer={
        <Stack gap="sm">
          <Button
            title={plan?.trialDays ? `Start my ${plan.trialDays}-day free trial` : `Subscribe for ${plan?.price ?? ''} a ${plan?.period ?? 'year'}`}
            onPress={() => void handlePurchase()}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center" numberOfLines={3}>
            {plan?.trialDays
              ? `Free for ${plan.trialDays} days, then ${plan.price} a ${plan.period}. ${paywallConfig.footnote}`
              : paywallConfig.footnote}
          </Text>
          <Row gap="lg" justify="center">
            <Pressable accessibilityRole="button" onPress={() => void handleRestore()} disabled={busy !== undefined} hitSlop={spacing.ms}>
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} hitSlop={spacing.ms}>
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} hitSlop={spacing.ms}>
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </Row>
        </Stack>
      }
    >
      <Stack gap="md">
        <View style={styles.hero}>
          <Dial minutes={focusMinutes} size={heroSize} color={colors.secondary}>
            <Icon name="check" size={28} color={colors.secondary} weight="bold" />
          </Dial>
        </View>

        <Stack gap="sm">
          <Text variant="title" numberOfLines={2}>
            Your {focusMinutes}-minute dial is ready
          </Text>
          <Text color="muted" numberOfLines={2}>
            {paywallConfig.subheadline}
          </Text>
        </Stack>

        <Stack gap="ms">
          {paywallConfig.benefits.map((benefit) => (
            <Row key={benefit.text} gap="ms">
              <View
                style={[
                  styles.benefitIcon,
                  { width: sizes.iconTile, height: sizes.iconTile, backgroundColor: colors.primarySoft, borderRadius: radii.sm },
                ]}
              >
                <Icon name={benefit.icon} size={16} color={colors.primary} weight="semibold" />
              </View>
              <Text variant="label" numberOfLines={2} style={styles.flexText}>
                {benefit.text}
              </Text>
            </Row>
          ))}
        </Stack>

        <Stack gap="ms">
          {plans ? (
            plans.map((candidate) => {
              const isYearly = candidate.id === 'yearly';
              const perWeek = isYearly ? perWeekPrice(candidate.price) : undefined;
              const isSelected = candidate.id === selected;
              return (
                <Card key={candidate.id} selected={isSelected} onPress={() => setSelected(candidate.id)}>
                  <Row gap="md">
                    <Stack gap="xs" style={styles.flexText}>
                      <Row gap="sm">
                        <Text variant="label" numberOfLines={1}>
                          {candidate.title}
                        </Text>
                        {isYearly && saving ? (
                          <View
                            style={{
                              backgroundColor: colors.secondary,
                              borderRadius: radii.pill,
                              paddingHorizontal: spacing.ms,
                              paddingVertical: spacing.xs,
                            }}
                          >
                            <Text variant="eyebrow" color="onPrimary" numberOfLines={1}>
                              SAVE {saving}%
                            </Text>
                          </View>
                        ) : null}
                      </Row>
                      <Text variant="caption" color="muted" numberOfLines={2}>
                        {candidate.trialDays ? `${candidate.trialDays} days free, then ` : ''}
                        {candidate.price} a {candidate.period}
                        {perWeek ? ` · ${perWeek} a week` : ''}
                      </Text>
                    </Stack>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderRadius: radii.pill,
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected ? <Icon name="check" size={12} color={colors.onPrimary} weight="bold" /> : null}
                    </View>
                  </Row>
                </Card>
              );
            })
          ) : (
            <ActivityIndicator color={colors.textMuted} />
          )}
        </Stack>

        {plan?.trialDays ? <TrialTimeline days={plan.trialDays} /> : null}
      </Stack>
    </Screen>
  );
}

/** Today · reminder · billed, so the trial has no surprises. */
function TrialTimeline({ days }: { days: number }) {
  const { colors, radii, spacing } = useTheme();
  const reminderDay = Math.max(1, days - 2);
  const stops = [
    { title: 'Today', body: 'Nothing charged' },
    { title: `Day ${reminderDay}`, body: 'Reminder sent' },
    { title: `Day ${days}`, body: 'First charge' },
  ];

  return (
    <Row gap="ms" align="flex-start" accessibilityLabel={stops.map((stop) => `${stop.title}: ${stop.body}`).join('. ')}>
      {stops.map((stop, index) => (
        <Stack key={stop.title} gap="sm" style={styles.flexText}>
          <Row gap="xs">
            <View
              style={[
                styles.stopDot,
                { borderRadius: radii.pill, backgroundColor: index === 0 ? colors.primary : colors.textMuted },
              ]}
            />
            {index < stops.length - 1 ? <View style={[styles.stopLine, { backgroundColor: colors.border }]} /> : null}
          </Row>
          <Stack gap="xs" style={{ paddingRight: spacing.xs }}>
            <Text variant="label" numberOfLines={1} style={styles.tabular}>
              {stop.title}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={3}>
              {stop.body}
            </Text>
          </Stack>
        </Stack>
      ))}
    </Row>
  );
}

function parsePrice(price: string): { symbol: string; amount: number } | undefined {
  const match = /^([^\d]*)([\d.,]+)/.exec(price.trim());
  if (!match) {
    return undefined;
  }
  const amount = Number(match[2].replace(/,(?=\d{3}\b)/g, '').replace(',', '.'));
  return Number.isFinite(amount) ? { symbol: match[1], amount } : undefined;
}

function perWeekPrice(yearly: string): string | undefined {
  const parsed = parsePrice(yearly);
  return parsed ? `${parsed.symbol}${(parsed.amount / 52).toFixed(2)}` : undefined;
}

function savingPercent(weekly: string, yearly: string): number | undefined {
  const week = parsePrice(weekly);
  const year = parsePrice(yearly);
  if (!week || !year || week.amount === 0) {
    return undefined;
  }
  const percent = Math.round((1 - year.amount / (week.amount * 52)) * 100);
  return percent > 0 ? percent : undefined;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { alignItems: 'center' },
  benefitIcon: { alignItems: 'center', justifyContent: 'center' },
  flexText: { flex: 1, minWidth: 0 },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stopDot: { width: 10, height: 10 },
  stopLine: { flex: 1, height: 2 },
  tabular: { fontVariant: ['tabular-nums'] },
});
