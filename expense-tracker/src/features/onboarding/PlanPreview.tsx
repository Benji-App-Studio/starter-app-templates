import { Stack, Text } from '@/components';
import { AllowanceHero } from '@/features/expenses/AllowanceHero';
import { planFromAnswers } from '@/features/expenses/budgetPlan';
import { categoryById } from '@/features/expenses/categories';
import { formatMoney } from '@/features/expenses/money';
import { daysInPeriod, ordinalDay, periodContaining } from '@/features/expenses/period';
import { useTheme } from '@/theme/theme';

type PlanPreviewProps = {
  /** Saved answers merged with the option currently highlighted on this step. */
  answers: Record<string, string>;
  currency: string;
  /** Eyebrow above the number. */
  caption?: string;
  /** Hide the day runway (the paywall). */
  hideRunway?: boolean;
};

/** The hero on day one of the plan, recomputed as the user picks options. */
export function PlanPreview({ answers, currency, caption = 'Left today, on day one', hideRunway = false }: PlanPreviewProps) {
  const { colors, radii, spacing } = useTheme();
  const plan = planFromAnswers(answers);
  // Drawn as the first day of a month on the chosen reset day: nothing spent, every day ahead.
  const period = periodContaining(Date.now(), plan.startDay);
  const days = daysInPeriod(period);
  const top = plan.budgets.find((budget) => budget.categoryId === plan.topCategoryId);

  return (
    <Stack
      gap={hideRunway ? 'sm' : 'md'}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.xl,
        padding: spacing.md,
      }}
    >
      <AllowanceHero
        compact
        caption={caption}
        spentCents={0}
        budgetCents={plan.monthlyCents}
        spentByDay={new Array<number>(days).fill(0)}
        todayIndex={0}
        daysLeft={days}
        // A preview of day one, not of today's date: label the days, not the calendar.
        hideRunway={hideRunway}
        todayLabel="Day 1"
        startLabel="Day 1"
        endLabel={`Day ${days}`}
        currency={currency}
      />
      <Text variant="caption" color="muted" numberOfLines={2}>
        Resets on the {ordinalDay(plan.startDay)}
        {top ? ` · ${categoryById(plan.topCategoryId).label} gets ${formatMoney(top.limitCents, currency)}` : ''}
      </Text>
    </Stack>
  );
}
