import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, Text } from '@/components';
import { appConfig } from '@/config/app';
import { paywallConfig, type PlanId } from '@/config/paywall';
import { Blob } from '@/features/mixer/Blob';
import { formatTimer } from '@/features/mixer/format';
import { buildNightPlan } from '@/features/mixer/plan';
import { soundById } from '@/features/mixer/sounds';
import { getPlans, purchase, restore, type Plan } from '@/purchases';
import { useAppState } from '@/state/appState';
import { spacing, useTheme } from '@/theme/theme';

import { perWeek, savingPercent } from './pricing';

const BLOB_SIZE = 128;

/**
 * The built-in paywall. Shown when no RevenueCat key is set (mock purchases),
 * or when `paywallConfig.ui` is 'custom'. There is no close button on purpose.
 */
export function CustomPaywall() {
  const { colors, radii, spacing } = useTheme();
  const { onboardingAnswers } = useAppState();
  const [plans, setPlans] = useState<Plan[]>();
  const [selected, setSelected] = useState<PlanId>(paywallConfig.defaultPlan);
  const [busy, setBusy] = useState<'purchase' | 'restore'>();
  const plan = buildNightPlan(onboardingAnswers);
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

  // A no-break space keeps "45 min" together when the line wraps.
  const fade =
    plan.timerMinutes === null
      ? 'all night'
      : `fades out after ${formatTimer(plan.timerMinutes).replace(' ', '\u00A0')}`;

  const cta = trialDays
    ? paywallConfig.trialCta.replace('{days}', String(trialDays))
    : paywallConfig.cta;

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <View style={{ gap: spacing.sm }}>
          <Button
            title={cta}
            onPress={handlePurchase}
            loading={busy === 'purchase'}
            disabled={!plans || busy === 'restore'}
          />
          <Text variant="caption" color="muted" align="center">
            {trialDays && selectedPlan
              ? `Free for ${trialDays} days, then ${selectedPlan.price} per ${selectedPlan.period}. ${paywallConfig.footnote}`
              : paywallConfig.footnote}
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
      <View style={styles.hero}>
        <View style={{ width: BLOB_SIZE, height: BLOB_SIZE }}>
          <Blob
            tints={plan.sounds.map((entry) => soundById[entry.id].tint)}
            energy={0.85}
            size={BLOB_SIZE}
            style={StyleSheet.absoluteFill}
          />
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <Icon name="moonStars" size={28} color={colors.text} weight="light" />
          </View>
        </View>
      </View>

      <Text variant="title">{paywallConfig.headline}</Text>
      <Text color="muted" style={{ marginTop: spacing.sm }}>
        {plan.title} · {fade}. {paywallConfig.subheadline}
      </Text>

      <View style={{ marginTop: spacing.lg, gap: spacing.item }}>
        {paywallConfig.benefits.map((benefit) => (
          <View key={benefit.title} style={[styles.benefit, { gap: spacing.md }]}>
            <View
              style={[
                styles.benefitIcon,
                { backgroundColor: colors.primarySoft, borderRadius: radii.md, borderCurve: 'continuous' },
              ]}
            >
              <Icon name={benefit.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.benefitText}>
              <Text variant="label">{benefit.title}</Text>
              <Text variant="caption" color="muted">
                {benefit.body}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ marginTop: spacing.lg, gap: spacing.item }}>
        {plans ? (
          plans.map((candidate) => {
            const weekly = perWeek(candidate);
            const cheapest = plans.reduce((best, other) =>
              (savingPercent(other, best) ?? 0) > 0 ? other : best,
            );
            const dearest = plans.find((other) => other.id !== candidate.id);
            const saving = dearest ? savingPercent(candidate, dearest) : null;
            const isSelected = candidate.id === selected;
            return (
              <Card key={candidate.id} selected={isSelected} onPress={() => setSelected(candidate.id)}>
                <View style={[styles.planRow, { gap: spacing.md }]}>
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
                  <View style={styles.planBody}>
                    <View style={[styles.planTitle, { gap: spacing.sm }]}>
                      <Text variant="label">{candidate.title}</Text>
                      {candidate.trialDays ? (
                        <Text variant="caption" color="primary">
                          {candidate.trialDays} days free
                        </Text>
                      ) : null}
                    </View>
                    <Text variant="caption" color="muted">
                      {candidate.price} per {candidate.period}
                      {candidate.weeks > 1 && weekly ? ` · ${weekly} a week` : ''}
                    </Text>
                    {candidate.id === cheapest.id && saving ? (
                      <Text variant="caption" color={isSelected ? 'text' : 'muted'}>
                        {saving}% less than paying weekly
                      </Text>
                    ) : null}
                  </View>
                  {candidate.badge ? (
                    <View
                      style={{
                        backgroundColor: isSelected ? colors.primary : colors.surfaceRaised,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.item,
                        paddingVertical: spacing.xs,
                      }}
                    >
                      <Text variant="caption" color={isSelected ? 'onPrimary' : 'text'}>
                        {candidate.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Card>
            );
          })
        ) : (
          <ActivityIndicator style={{ marginVertical: spacing.lg }} />
        )}
      </View>

      {trialDays ? <TrialTimeline days={trialDays} /> : null}
    </Screen>
  );
}

/** Today · reminder · first charge, so the trial has no surprise at the end. */
function TrialTimeline({ days }: { days: number }) {
  const { colors, radii, spacing } = useTheme();
  const reminderDay = Math.max(1, days - 2);
  const points = [
    { icon: 'lock', title: 'Today', body: 'Full access, nothing charged' },
    { icon: 'bell', title: `Day ${reminderDay}`, body: 'A reminder before the trial ends' },
    { icon: 'card', title: `Day ${days}`, body: 'First charge, cancel anytime before' },
  ] as const;

  return (
    <View style={{ marginTop: spacing.lg, gap: spacing.xs }}>
      {points.map((point, index) => (
        <View key={point.title} style={[styles.timelineRow, { gap: spacing.md }]}>
          <View style={styles.timelineRail}>
            <View
              style={[
                styles.timelineDot,
                {
                  borderRadius: radii.pill,
                  backgroundColor: index === 0 ? colors.primary : colors.surfaceRaised,
                },
              ]}
            >
              <Icon name={point.icon} size={14} color={index === 0 ? colors.onPrimary : colors.textMuted} />
            </View>
            {index < points.length - 1 ? (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            ) : null}
          </View>
          <View style={[styles.timelineText, { paddingBottom: index < points.length - 1 ? spacing.md : 0 }]}>
            <Text variant="label">{point.title}</Text>
            <Text variant="caption" color="muted">
              {point.body}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  hero: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  benefit: { flexDirection: 'row', alignItems: 'center' },
  benefitIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, gap: spacing.sm },
  links: { flexDirection: 'row', justifyContent: 'center' },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planBody: { flex: 1, gap: spacing.sm },
  planTitle: { flexDirection: 'row', alignItems: 'baseline' },
  radio: { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  timelineRow: { flexDirection: 'row' },
  timelineRail: { width: 28, alignItems: 'center' },
  timelineDot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { width: 2, flex: 1, marginVertical: spacing.xs },
  timelineText: { flex: 1, gap: spacing.sm, paddingTop: spacing.xs },
});
