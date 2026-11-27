import { Row, Stack, Text } from '@/components';

import { AnimatedMoney } from './AnimatedMoney';
import { DayRunway } from './DayRunway';
import { formatMoney } from './money';

type AllowanceHeroProps = {
  spentCents: number;
  budgetCents: number;
  /** Spend per day of the budget month, one entry per day. */
  spentByDay: number[];
  /** Zero-based index of today inside the month. */
  todayIndex: number;
  daysLeft: number;
  /** Labels under the first and last day of the runway. */
  startLabel: string;
  endLabel: string;
  currency: string;
  /** Smaller numeral and runway for previews inside onboarding and the paywall. */
  compact?: boolean;
  /** Eyebrow above the number; defaults to "Left today". */
  caption?: string;
  /** The label over today's column (see DayRunway). */
  todayLabel?: string;
  /** Hide the day runway (the paywall shows the number alone, so the plans fit above the button). */
  hideRunway?: boolean;
  /** First day the budget covers, when the user started mid-month (`budgetCents` is already prorated). */
  firstDayIndex?: number;
};

/** Per-day allowance from what is left, so the number only drops as money is spent. */
export function dailyAllowance(budgetCents: number, spentCents: number, daysLeft: number): number {
  const left = Math.max(0, budgetCents - spentCents);
  return daysLeft > 0 ? Math.floor(left / daysLeft) : left;
}

const RUNWAY_HEIGHT = 120;
const RUNWAY_HEIGHT_COMPACT = 48;
/** The hero number shrinks to fit rather than wrap; it never goes below half size. */
const MIN_NUMERAL_SCALE = 0.5;

/**
 * The hero: the serif "left today" number over the month runway. Everything else on
 * the Today screen is quieter than this.
 */
export function AllowanceHero({
  spentCents,
  budgetCents,
  spentByDay,
  todayIndex,
  daysLeft,
  startLabel,
  endLabel,
  currency,
  compact = false,
  todayLabel,
  hideRunway = false,
  firstDayIndex = 0,
  caption = 'Left today',
}: AllowanceHeroProps) {
  const hasBudget = budgetCents > 0;
  const days = Math.max(1, spentByDay.length);
  const leftCents = budgetCents - spentCents;
  const over = hasBudget && leftCents < 0;
  const allowance = dailyAllowance(budgetCents, spentCents, daysLeft);
  // What the month should have used by the end of today if every day took the same share.
  const coveredDays = Math.max(1, days - firstDayIndex);
  const plannedToDate = Math.round((budgetCents * Math.max(0, todayIndex + 1 - firstDayIndex)) / coveredDays);
  const pace = plannedToDate - spentCents;

  let subline: string;
  if (!hasBudget) {
    subline = 'Set a monthly budget to see a daily number.';
  } else if (over) {
    subline = `Over by ${formatMoney(-leftCents, currency)} this month`;
  } else if (spentCents === 0) {
    subline = `${formatMoney(leftCents, currency)} to spend over ${daysLeft} days`;
  } else {
    const paceText =
      pace >= 0 ? `${formatMoney(pace, currency)} under plan` : `${formatMoney(-pace, currency)} over plan`;
    subline = `${formatMoney(leftCents, currency)} left this month · ${paceText}`;
  }

  return (
    <Stack gap={compact ? 'md' : 'lg'}>
      <Stack gap="xs">
        <Text variant="eyebrow" color="muted">
          {(hasBudget ? caption : 'Spent this month').toUpperCase()}
        </Text>
        <AnimatedMoney
          cents={hasBudget ? allowance : spentCents}
          currency={currency}
          variant={compact ? 'numeralCompact' : 'numeral'}
          color={over ? 'danger' : 'text'}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={MIN_NUMERAL_SCALE}
        />
        <Text color={over ? 'danger' : 'muted'} numberOfLines={2}>
          {subline}
        </Text>
      </Stack>

      {hideRunway ? null : (
        <DayRunway
          spentByDay={spentByDay}
          plannedDailyCents={hasBudget ? Math.floor(budgetCents / coveredDays) : 0}
          todayIndex={todayIndex}
          startLabel={startLabel}
          endLabel={endLabel}
          height={compact ? RUNWAY_HEIGHT_COMPACT : RUNWAY_HEIGHT}
          todayLabel={todayLabel}
        />
      )}

      {hasBudget && !compact ? (
        <Row justify="space-between" gap="md">
          <Text variant="caption" color="muted" numberOfLines={1}>
            Spent {formatMoney(spentCents, currency)}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1}>
            Daily plan {formatMoney(Math.floor(budgetCents / coveredDays), currency)}
          </Text>
        </Row>
      ) : null}
    </Stack>
  );
}
