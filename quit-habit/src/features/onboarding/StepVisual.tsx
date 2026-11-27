import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Icon, Stack, Text } from '@/components';
import { CounterRing } from '@/features/quit/CounterRing';
import { Odometer } from '@/features/quit/Odometer';
import { formatUnits, habits } from '@/features/quit/habits';
import { formatMoney, profileFromAnswers } from '@/features/quit/profile';
import { projectedSavings } from '@/features/quit/savings';
import { useTheme } from '@/theme/theme';

type StepVisualProps = {
  stepId: string;
  /** Saved answers plus the option currently selected on this step. */
  answers: Record<string, string>;
  fallback: ReactNode;
};

const RING = 220;

/** The illustration slot: a live preview of the counter that reacts to each answer. */
export function StepVisual({ stepId, answers, fallback }: StepVisualProps) {
  const { colors, spacing, radii } = useTheme();
  const profile = profileFromAnswers(answers);
  const habit = habits[profile.habit];

  if (stepId === 'welcome') {
    return (
      <CounterRing size={RING} progress={0.62}>
        <Stack align="center" gap="xs">
          <Text variant="overline" color="primary">
            TIME FREE
          </Text>
          <Stack align="center" gap="none">
            <Odometer value={14} />
            <Text variant="label" color="muted">
              days
            </Text>
          </Stack>
        </Stack>
      </CounterRing>
    );
  }

  if (stepId === 'habit') {
    return (
      <Animated.View
        key={profile.habit}
        entering={FadeIn.duration(200)}
        style={[styles.habit, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.item }]}
      >
        <View style={[styles.habitIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={habit.icon} size={44} color={colors.primary} />
        </View>
        <Text variant="overline" color="primary">
          {habit.freeLabel.toUpperCase()}
        </Text>
      </Animated.View>
    );
  }

  if (stepId === 'amount') {
    const month = projectedSavings(profile.unitsPerDay, profile.costPerDay, 30);
    return (
      <Animated.View layout={LinearTransition.springify()} style={styles.figure}>
        <Stack align="center" gap="sm">
          <Stack align="center" gap="none">
            <Odometer value={profile.unitsPerDay} />
            <Text variant="label" color="muted">
              {profile.unitsPerDay === 1 ? habit.unit.one : habit.unit.many} a day
            </Text>
          </Stack>
          <Text variant="caption" color="primary" align="center">
            {answers.amount ? `${formatUnits(month.units, habit)} ${habit.avoidedLabel} in your first month` : ' '}
          </Text>
        </Stack>
      </Animated.View>
    );
  }

  if (stepId === 'spend') {
    const month = projectedSavings(profile.unitsPerDay, profile.costPerDay, 30);
    return (
      <View style={styles.figure}>
        <Stack align="center" gap="none" style={styles.fill}>
          <Text variant="numeral" tabular align="center" adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1}>
            {answers.spend ? formatMoney(month.money, profile.currency, 0) : formatMoney(0, profile.currency, 0)}
          </Text>
          <Text variant="label" color="muted">
            kept in your first month
          </Text>
        </Stack>
      </View>
    );
  }

  return <>{fallback}</>;
}

const styles = StyleSheet.create({
  habit: { alignItems: 'center', borderWidth: 1.5, minWidth: 200 },
  habitIcon: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  figure: { alignItems: 'center', alignSelf: 'stretch', minHeight: 150, justifyContent: 'center' },
  fill: { alignSelf: 'stretch' },
});
