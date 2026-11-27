import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { CountUpText, Icon, Text, type IconName } from '@/components';
import { formatHour } from '@/features/hydration/dates';
import { GLASS_ML, MAX_GOAL_ML, formatAmount, formatAmountShort, recommendedGoalMl } from '@/features/hydration/goal';
import { reminderSlots } from '@/features/hydration/reminders';
import { useHydrationSettings } from '@/features/hydration/settings';
import { WaterGlass } from '@/features/hydration/WaterGlass';
import { useTheme, spacing } from '@/theme/theme';

type PlanStepProps = {
  title: string;
  body: string;
  answers: Record<string, string>;
  /** Called once the plan is shown, so the Get started button can enable. */
  onReady: () => void;
};

const BUILD_MS = 1300;
const BUILD_STEPS: { icon: IconName; text: string; at: number }[] = [
  { icon: 'weight', text: 'Base amount from your weight', at: 150 },
  { icon: 'walk', text: 'Extra for how active you are', at: 550 },
  { icon: 'sun', text: 'Adjusted for your weather', at: 950 },
];

/**
 * The last onboarding step: the goal is computed from the answers in front of
 * the user, the glass fills to it, then the plan summary appears.
 */
export function PlanStep({ title, body, answers, onReady }: PlanStepProps) {
  const { colors, radii, spacing } = useTheme();
  const settings = useHydrationSettings();
  const reducedMotion = useReducedMotion();
  const goalMl = recommendedGoalMl(answers);
  const [ready, setReady] = useState(false);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const duration = reducedMotion ? 300 : BUILD_MS;
    const fill = setTimeout(() => setFilled(true), 120);
    const done = setTimeout(() => {
      setReady(true);
      onReady();
    }, duration);
    return () => {
      clearTimeout(fill);
      clearTimeout(done);
    };
  }, [reducedMotion, onReady]);

  const slots = reminderSlots(settings);
  const glasses = Math.round(goalMl / GLASS_ML);
  const summary: { icon: IconName; label: string; value: string }[] = [
    { icon: 'target', label: 'Daily goal', value: formatAmount(goalMl, settings.unit) },
    {
      icon: 'bell',
      label: 'Reminders',
      value: `${slots.length} a day, ${formatHour(settings.reminderStartHour)} to ${formatHour(settings.reminderEndHour)}`,
    },
    { icon: 'glass', label: 'In glasses', value: `About ${glasses} glasses of ${formatAmount(GLASS_ML, settings.unit)}` },
  ];

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={[styles.hero, { marginTop: spacing.md }]}>
        <WaterGlass level={filled ? goalMl / MAX_GOAL_ML + 0.3 : 0} size={150} sloshKey={filled ? 1 : 0} success={ready} />
        <View style={[styles.figures, { marginTop: spacing.md }]}>
          <CountUpText
            variant="numeral"
            value={filled ? goalMl : 0}
            durationMs={reducedMotion ? 0 : BUILD_MS - 200}
            format={(value) => formatAmountShort(Math.round(value / 50) * 50, settings.unit)}
          />
        </View>
        <Text variant="label" color="muted" style={{ marginTop: spacing.sm }}>
          a day
        </Text>
      </View>

      <View>
        <Text variant="title">{ready ? title : 'Building your plan'}</Text>
        <Text color="muted" style={{ marginTop: spacing.sm }}>
          {ready ? body : 'Working out a goal from your three answers.'}
        </Text>
      </View>

      {ready ? (
        <Animated.View
          entering={reducedMotion ? undefined : FadeInDown.springify().damping(18)}
          style={{ backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md }}
        >
          {summary.map((row, index) => (
            <View
              key={row.label}
              style={[
                styles.row,
                {
                  gap: spacing.md,
                  paddingVertical: spacing.sm + spacing.xs,
                  borderBottomWidth: index === summary.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft, borderRadius: radii.sm }]}>
                <Icon name={row.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.rowBody}>
                <Text variant="caption" color="muted">
                  {row.label}
                </Text>
                <Text variant="label">{row.value}</Text>
              </View>
            </View>
          ))}
        </Animated.View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {BUILD_STEPS.map((step) => (
            <Animated.View
              key={step.text}
              entering={reducedMotion ? undefined : FadeInDown.delay(step.at).springify().damping(18)}
              style={[styles.row, { gap: spacing.sm }]}
            >
              <Icon name={step.icon} size={16} color={colors.primary} />
              <Text variant="label" color="muted">
                {step.text}
              </Text>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  figures: { flexDirection: 'row', alignItems: 'baseline' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBody: { flex: 1, gap: spacing.sm },
  iconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
