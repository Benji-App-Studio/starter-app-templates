import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Badge, Button, Fill, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { DAYS_QUESTION_ID, EXPERIENCE_QUESTION_ID } from '@/config/onboarding';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { WeekRing } from '@/features/home/WeekRing';
import { goalFromAnswer } from '@/features/home/weeklyGoal';
import { starterPlanFor } from '@/features/routines/starterRoutines';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

/** Splits "$29.99" or "29,99 €" into its number and the text around it. */
function parsePrice(price: string): { amount: number; prefix: string; suffix: string } | undefined {
  const match = price.match(/(\d+(?:[.,]\d+)?)/);
  if (!match || match.index === undefined) {
    return undefined;
  }
  const amount = Number(match[1].replace(',', '.'));
  return {
    amount,
    prefix: price.slice(0, match.index),
    suffix: price.slice(match.index + match[1].length),
  };
}

function perWeek(plan: Plan): string | undefined {
  const config = paywallConfig.plans.find((candidate) => candidate.id === plan.id);
  const parsed = parsePrice(plan.price);
  if (!config || !parsed || config.weeks <= 1) {
    return undefined;
  }
  return `${parsed.prefix}${(parsed.amount / config.weeks).toFixed(2)}${parsed.suffix} a week`;
}

/** "Save 77%" for the yearly plan against paying weekly all year. */
function saving(plans: Plan[], plan: Plan): string | undefined {
  const config = paywallConfig.plans.find((candidate) => candidate.id === plan.id);
  const weekly = plans.find((candidate) => candidate.id === 'weekly');
  const yearlyPrice = parsePrice(plan.price)?.amount;
  const weeklyPrice = weekly ? parsePrice(weekly.price)?.amount : undefined;
  if (!config || config.weeks <= 1 || !yearlyPrice || !weeklyPrice) {
    return undefined;
  }
  const percent = Math.round((1 - yearlyPrice / (weeklyPrice * config.weeks)) * 100);
  return percent > 0 ? `Save ${percent}%` : undefined;
}

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
/** The week ring on the paywall: small enough that both plans sit above the button. */
const HERO_RING_MAX = 150;

export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { onboardingAnswers, restSeconds } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();
  const goal = goalFromAnswer(onboardingAnswers[DAYS_QUESTION_ID]);
  const plan = starterPlanFor(onboardingAnswers[EXPERIENCE_QUESTION_ID]);
  const selectedPlan = plans?.find((candidate) => candidate.id === selected);

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

  const cta = selectedPlan
    ? paywallConfig.cta.replace('{price}', selectedPlan.price).replace('{period}', selectedPlan.period)
    : 'Continue';

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <Stack gap="smd">
          <Button title={cta} onPress={handlePurchase} loading={busy === 'purchase'} disabled={!plans || busy === 'restore'} />
          <Text variant="caption" color="muted" align="center">
            {paywallConfig.footnote}
          </Text>
          <Row gap="lg" justify="center">
            <Pressable accessibilityRole="button" onPress={handleRestore} disabled={busy !== undefined} style={styles.link}>
              <Text variant="caption" color="primary">
                Restore purchases
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} style={styles.link}>
              <Text variant="caption" color="muted">
                Terms
              </Text>
            </Pressable>
            <Pressable accessibilityRole="link" onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} style={styles.link}>
              <Text variant="caption" color="muted">
                Privacy
              </Text>
            </Pressable>
          </Row>
        </Stack>
      }
    >
      <Stack gap="md">
        <Stack gap="sm" align="center">
          <WeekRing
            days={Array.from({ length: 7 }, (_, index) => index < goal)}
            goal={goal}
            size={Math.min(HERO_RING_MAX, width * 0.36)}
            caption="a week"
            stagger
          />
          <Stack gap="xs" align="center">
            <Text variant="overline" color="primary" align="center">
              Your {plan.splitName} plan is ready
            </Text>
            <Text variant="caption" color="muted" align="center">
              {plan.routines.length} routines · {goal} sessions a week · rest {restSeconds} s
            </Text>
          </Stack>
        </Stack>

        <Stack gap="sm">
          <Text variant="display" numberOfLines={2}>
            {paywallConfig.headline}
          </Text>
          <Text color="muted">{paywallConfig.subheadline}</Text>
        </Stack>

        <Stack gap="md">
          {paywallConfig.benefits.map((benefit) => (
            <Row key={benefit.title} gap="md">
              <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.md }]}>
                <Icon name={benefit.icon} size={20} color={colors.accentText} />
              </View>
              <Fill>
                <Text variant="label">{benefit.title}</Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {benefit.detail}
                </Text>
              </Fill>
            </Row>
          ))}
        </Stack>

        <Stack gap="smd">
          {plans ? (
            plans.map((candidate) => {
              const isSelected = candidate.id === selected;
              const save = saving(plans, candidate);
              const weekly = perWeek(candidate);
              const badge = paywallConfig.plans.find((config) => config.id === candidate.id)?.badge;
              return (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${candidate.title}, ${candidate.price} per ${candidate.period}${save ? `, ${save}` : ''}`}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setSelected(candidate.id);
                  }}
                  style={({ pressed }) => [
                    styles.plan,
                    {
                      gap: spacing.md,
                      padding: spacing.md,
                      borderRadius: radii.lg,
                      backgroundColor: isSelected ? colors.primarySoft : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
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
                    {isSelected ? <Icon name="check" size={13} color={colors.onPrimary} /> : null}
                  </View>
                  <Fill>
                    <Row gap="sm" style={styles.wrap}>
                      <Text variant="heading" numberOfLines={1}>
                        {candidate.title}
                      </Text>
                      {save ? <Badge label={save} /> : badge ? <Badge label={badge} /> : null}
                    </Row>
                    <Text variant="caption" color="muted" numberOfLines={1}>
                      {weekly ?? `Billed every ${candidate.period}`}
                    </Text>
                  </Fill>
                  <Stack gap="xs" align="flex-end">
                    <Text variant="numeralSmall">{candidate.price}</Text>
                    <Text variant="caption" color="muted">
                      per {candidate.period}
                    </Text>
                  </Stack>
                </Pressable>
              );
            })
          ) : (
            <ActivityIndicator color={colors.textMuted} />
          )}
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  benefitIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  radio: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexWrap: 'wrap' },
  link: { minHeight: 44, justifyContent: 'center' },
});
