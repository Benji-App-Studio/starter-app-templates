import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Icon, Text } from '@/components';
import { planFromAnswers } from '@/features/expenses/budgetPlan';
import { categoryById } from '@/features/expenses/categories';
import { formatMoney } from '@/features/expenses/money';
import { daysInPeriod, ordinalDay, periodContaining } from '@/features/expenses/period';
import { useTheme } from '@/theme/theme';

import { PlanPreview } from './PlanPreview';

type PlanStepProps = {
  answers: Record<string, string>;
  currency: string;
  /** Called once every line of the plan is on screen; enables the Get started button. */
  onReady: () => void;
};

const LINE_DELAY_MS = 340;

/** The last onboarding step: the plan, line by line, computed from the answers. */
export function PlanStep({ answers, currency, onReady }: PlanStepProps) {
  const { colors, radii, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const plan = planFromAnswers(answers);
  const days = daysInPeriod(periodContaining(Date.now(), plan.startDay));
  const topThree = [...plan.budgets].sort((a, b) => b.limitCents - a.limitCents).slice(0, 3);

  const lines = [
    `${formatMoney(plan.monthlyCents, currency)} to spend each month`,
    `${formatMoney(Math.floor(plan.monthlyCents / days), currency)} a day, over ${days} days`,
    `Month resets on the ${ordinalDay(plan.startDay)}`,
    `Biggest budgets: ${topThree
      .map((budget) => `${categoryById(budget.categoryId).label} ${formatMoney(budget.limitCents, currency)}`)
      .join(', ')}`,
  ];

  const [shown, setShown] = useState(reduceMotion ? lines.length : 0);

  useEffect(() => {
    if (shown >= lines.length) {
      onReady();
      return;
    }
    const timer = setTimeout(() => setShown((count) => count + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [shown, lines.length, onReady]);

  return (
    <View style={{ gap: spacing.md }}>
      <PlanPreview answers={answers} currency={currency} />
      <View style={{ gap: spacing.sm }}>
        {/* Above the lines, so a line sliding in never passes over it. */}
        <Text variant="caption" color="muted">
          {shown < lines.length ? 'Building your plan…' : 'Built from your answers'}
        </Text>
        {lines.slice(0, shown).map((line) => (
          <Animated.View
            key={line}
            entering={reduceMotion ? undefined : FadeInDown.springify().damping(18)}
            style={[styles.line, { gap: spacing.sm }]}
          >
            <View style={[styles.check, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
              <Icon name="check" size={12} color={colors.primary} weight="bold" />
            </View>
            <Text style={styles.lineText}>{line}</Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', alignItems: 'flex-start' },
  check: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  lineText: { flex: 1 },
});
