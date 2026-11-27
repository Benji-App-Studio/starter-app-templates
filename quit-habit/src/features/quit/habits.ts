import type { IconName } from '@/components/icons';

export type HabitId = 'smoking' | 'vaping' | 'drinking' | 'other';

export type Habit = {
  id: HabitId;
  label: string;
  icon: IconName;
  /** "Smoke-free", shown over the counter. */
  freeLabel: string;
  unit: { one: string; many: string };
  /** What "not having it" is called: "not smoked", "not drunk". */
  avoidedLabel: string;
  /** Default units per day for each `amount` onboarding answer. */
  unitsPerDayByAmount: Record<AmountId, number>;
};

export type AmountId = 'light' | 'moderate' | 'heavy' | 'constant';
export type SpendId = 'under5' | '5to10' | '10to20' | 'over20';

export const habits: Record<HabitId, Habit> = {
  smoking: {
    id: 'smoking',
    label: 'Smoking',
    icon: 'smoking',
    freeLabel: 'Smoke-free',
    unit: { one: 'cigarette', many: 'cigarettes' },
    avoidedLabel: 'not smoked',
    unitsPerDayByAmount: { light: 4, moderate: 10, heavy: 20, constant: 30 },
  },
  vaping: {
    id: 'vaping',
    label: 'Vaping',
    icon: 'vaping',
    freeLabel: 'Vape-free',
    unit: { one: 'puff', many: 'puffs' },
    avoidedLabel: 'not taken',
    unitsPerDayByAmount: { light: 40, moderate: 120, heavy: 250, constant: 400 },
  },
  drinking: {
    id: 'drinking',
    label: 'Drinking',
    icon: 'drinking',
    freeLabel: 'Alcohol-free',
    unit: { one: 'drink', many: 'drinks' },
    avoidedLabel: 'not drunk',
    unitsPerDayByAmount: { light: 1, moderate: 2, heavy: 4, constant: 7 },
  },
  other: {
    id: 'other',
    label: 'Something else',
    icon: 'other',
    freeLabel: 'Free',
    unit: { one: 'time', many: 'times' },
    avoidedLabel: 'skipped',
    unitsPerDayByAmount: { light: 1, moderate: 3, heavy: 6, constant: 12 },
  },
};

export const habitList: Habit[] = Object.values(habits);

/** Midpoint of each daily-spend band from onboarding. */
export const costPerDayBySpend: Record<SpendId, number> = {
  under5: 3,
  '5to10': 7.5,
  '10to20': 15,
  over20: 25,
};

export function isHabitId(value: string | undefined): value is HabitId {
  return value !== undefined && value in habits;
}

export function isAmountId(value: string | undefined): value is AmountId {
  return value === 'light' || value === 'moderate' || value === 'heavy' || value === 'constant';
}

export function isSpendId(value: string | undefined): value is SpendId {
  return value !== undefined && value in costPerDayBySpend;
}

/** "12 cigarettes", "1 drink". */
export function formatUnits(count: number, habit: Habit): string {
  const whole = Math.floor(count);
  return `${whole.toLocaleString()} ${whole === 1 ? habit.unit.one : habit.unit.many}`;
}

/** "Not smoked": the avoided label as a tile caption. */
export function avoidedCaption(habit: Habit): string {
  return habit.avoidedLabel.charAt(0).toUpperCase() + habit.avoidedLabel.slice(1);
}

export type CravingTrigger = { id: string; label: string; icon: IconName };

/** What set the craving off. Stored by id on the craving row. */
export const cravingTriggers: CravingTrigger[] = [
  { id: 'stress', label: 'Stress', icon: 'stress' },
  { id: 'social', label: 'Being around it', icon: 'social' },
  { id: 'boredom', label: 'Boredom', icon: 'boredom' },
  { id: 'routine', label: 'Habit moment', icon: 'routine' },
  { id: 'coffee', label: 'Coffee or a meal', icon: 'coffee' },
  { id: 'unsure', label: 'Not sure', icon: 'question' },
];

export function triggerLabel(id: string | null): string | undefined {
  return cravingTriggers.find((trigger) => trigger.id === id)?.label;
}
