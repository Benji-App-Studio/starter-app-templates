import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Button, Card, Icon, Row, Screen, Stack, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { FastingRing } from '@/features/fasting/FastingRing';
import { defaultsFromAnswers } from '@/features/fasting/preferences';
import { getProtocol } from '@/features/fasting/protocols';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { spacing, useTheme } from '@/theme/theme';

// Caption links are 18 pt tall; the slop brings each touch target to 44 pt.
const HIT_SLOP = { top: 13, bottom: 13, left: 8, right: 8 };

/** "$39.99" → 39.99. Localized strings with a comma decimal work too. */
function parsePrice(price: string): number | undefined {
  const digits = price.replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '').replace(',', '.');
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function formatMoney(amount: number, like: string): string {
  const symbol = like.replace(/[\d.,\s]/g, '') || '$';
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 * The plan cards live in the pinned footer so they are never below the fold.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();

  const protocol = getProtocol(defaultsFromAnswers(onboardingAnswers).protocolId);

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

  const weeklyPrice = parsePrice(plans?.find((plan) => plan.id === 'weekly')?.price ?? '');
  const yearlyPrice = parsePrice(plans?.find((plan) => plan.id === 'yearly')?.price ?? '');
  const saving =
    weeklyPrice && yearlyPrice ? Math.round((1 - yearlyPrice / (weeklyPrice * 52)) * 100) : undefined;
  const selectedPlan = plans?.find((plan) => plan.id === selected);
  const cta = selectedPlan
    ? paywallConfig.cta.replace('{price}', selectedPlan.price).replace('{period}', selectedPlan.period)
    : 'Continue';

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <Stack gap="ms">
          {plans ? (
            plans.map((plan) => {
              const price = parsePrice(plan.price);
              const perWeek = plan.id === 'yearly' && price ? formatMoney(price / 52, plan.price) : undefined;
              const isSelected = plan.id === selected;
              return (
                <Card key={plan.id} selected={isSelected} onPress={() => setSelected(plan.id)} style={styles.plan}>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected ? <Icon name="checkSmall" size={12} color={colors.onPrimary} weight="bold" /> : null}
                  </View>
                  <Stack gap="xs" fill>
                    <Row gap="sm">
                      <Text variant="label" numberOfLines={1}>
                        {plan.title}
                      </Text>
                      {plan.badge ? (
                        <View style={[styles.badge, { backgroundColor: colors.goldSoft, borderRadius: radii.pill }]}>
                          <Text variant="caption" color="gold" numberOfLines={1}>
                            {plan.badge}
                          </Text>
                        </View>
                      ) : null}
                    </Row>
                    <Text variant="caption" color="muted" numberOfLines={1}>
                      {perWeek
                        ? `${perWeek} a week${saving && saving > 0 ? ` · save ${saving}%` : ''}`
                        : `Billed every ${plan.period}`}
                    </Text>
                  </Stack>
                  <Text variant="heading" numberOfLines={1} style={styles.tabular}>
                    {plan.price}
                  </Text>
                </Card>
              );
            })
          ) : (
            <ActivityIndicator style={{ marginVertical: spacing.lg }} />
          )}
          <Button
            title={cta}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Stack gap="sm">
            <Text variant="caption" color="muted" align="center">
              {paywallConfig.footnote}
            </Text>
            <Row gap="lg" justify="center">
              <Pressable onPress={handleRestore} disabled={busy !== undefined} hitSlop={HIT_SLOP}>
                <Text variant="caption" color="primary">
                  Restore purchases
                </Text>
              </Pressable>
              <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.termsUrl)} hitSlop={HIT_SLOP}>
                <Text variant="caption" color="muted">
                  Terms
                </Text>
              </Pressable>
              <Pressable onPress={() => WebBrowser.openBrowserAsync(appConfig.privacyUrl)} hitSlop={HIT_SLOP}>
                <Text variant="caption" color="muted">
                  Privacy
                </Text>
              </Pressable>
            </Row>
          </Stack>
        </Stack>
      }
    >
      <Stack gap="lg">
        <View style={styles.hero}>
          <FastingRing size={152} progress={1} goalHours={protocol.fastHours} reached>
            <Text variant="stat">{protocol.id}</Text>
            <Text variant="caption" color="gold">
              ready
            </Text>
          </FastingRing>
        </View>

        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <Stack gap="sm">
            <Text variant="title" numberOfLines={3}>
              {paywallConfig.headline.replace('{plan}', protocol.id)}
            </Text>
            <Text color="muted">{paywallConfig.subheadline}</Text>
          </Stack>
        </Animated.View>

        <Stack gap="md">
          {paywallConfig.benefits.map((benefit, index) => (
            <Animated.View key={benefit.title} entering={FadeInDown.delay(60 + index * 50).springify().damping(18)}>
              <Row gap="md">
                <View style={[styles.benefitIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.sm }]}>
                  <Icon name={benefit.icon} size={18} color={colors.primary} />
                </View>
                <Stack gap="xs" fill>
                  <Text variant="label" numberOfLines={1}>
                    {benefit.title}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={2}>
                    {benefit.detail}
                  </Text>
                </Stack>
              </Row>
            </Animated.View>
          ))}
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { alignItems: 'center' },
  benefitIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', gap: spacing.ms, minHeight: 72 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
  // An inline label on the plan title, not a tappable chip: 4 pt vertical keeps the plan row at 72 pt.
  badge: { paddingHorizontal: spacing.ms, paddingVertical: spacing.xs },
});
