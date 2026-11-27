import type { Habit } from '@/db/habits';

import { addDays, dayKey, daysBetween, startOfDay } from './dates';

/** Completed day keys per habit id. */
export type DoneByHabit = Map<number, Set<string>>;

export type HabitStats = {
  /** Scheduled days in a row that were done, ending today or yesterday. */
  currentStreak: number;
  bestStreak: number;
  /** Done ÷ scheduled over the last 30 days, 0..1. */
  rate30: number;
  total: number;
};

/** Oldest and newest day we ever look at, so a loop over days always ends. */
const MAX_LOOKBACK_DAYS = 3650;

export function createdDay(habit: Habit): Date {
  return startOfDay(new Date(habit.createdAt));
}

/** True when the habit is due on that day (a scheduled weekday on or after it was created). */
export function isScheduled(habit: Habit, date: Date): boolean {
  return habit.days.includes(date.getDay()) && daysBetween(createdDay(habit), date) >= 0;
}

export function isDone(habit: Habit, doneByHabit: DoneByHabit, date: Date): boolean {
  return doneByHabit.get(habit.id)?.has(dayKey(date)) ?? false;
}

export function habitStats(habit: Habit, doneByHabit: DoneByHabit, today: Date): HabitStats {
  const done = doneByHabit.get(habit.id) ?? new Set<string>();
  const first = createdDay(habit);
  const span = Math.min(daysBetween(first, today), MAX_LOOKBACK_DAYS);

  let currentStreak = 0;
  for (let offset = 0; offset <= span; offset += 1) {
    const date = addDays(today, -offset);
    if (!isScheduled(habit, date)) {
      continue;
    }
    if (done.has(dayKey(date))) {
      currentStreak += 1;
    } else if (offset > 0) {
      break;
    }
  }

  let bestStreak = 0;
  let run = 0;
  let scheduled30 = 0;
  let done30 = 0;
  for (let offset = span; offset >= 0; offset -= 1) {
    const date = addDays(today, -offset);
    if (!isScheduled(habit, date)) {
      continue;
    }
    const isDoneDay = done.has(dayKey(date));
    run = isDoneDay ? run + 1 : 0;
    bestStreak = Math.max(bestStreak, run);
    if (offset < 30) {
      scheduled30 += 1;
      done30 += isDoneDay ? 1 : 0;
    }
  }

  return {
    currentStreak,
    bestStreak,
    rate30: scheduled30 === 0 ? 0 : done30 / scheduled30,
    total: done.size,
  };
}

export type DaySummary = { scheduled: number; done: number };

export function daySummary(habits: Habit[], doneByHabit: DoneByHabit, date: Date): DaySummary {
  let scheduled = 0;
  let done = 0;
  for (const habit of habits) {
    if (isScheduled(habit, date)) {
      scheduled += 1;
      done += isDone(habit, doneByHabit, date) ? 1 : 0;
    }
  }
  return { scheduled, done };
}

/** Days in a row where every scheduled habit was done. Today only counts once it is complete. */
export function perfectDayStreak(habits: Habit[], doneByHabit: DoneByHabit, today: Date): number {
  if (habits.length === 0) {
    return 0;
  }
  const earliest = habits.reduce((min, habit) => Math.min(min, createdDay(habit).getTime()), Infinity);
  const span = Math.min(daysBetween(new Date(earliest), today), MAX_LOOKBACK_DAYS);

  let streak = 0;
  for (let offset = 0; offset <= span; offset += 1) {
    const { scheduled, done } = daySummary(habits, doneByHabit, addDays(today, -offset));
    if (scheduled === 0) {
      continue;
    }
    if (done === scheduled) {
      streak += 1;
    } else if (offset > 0) {
      break;
    }
  }
  return streak;
}

export type WeekRate = {
  /** The Monday that starts the week. */
  start: Date;
  /** Done ÷ scheduled for the week, or null when nothing was scheduled. */
  rate: number | null;
};

/** Completion per week for the last `weeks` weeks, oldest first, the current week last. */
export function weeklyRates(
  habits: Habit[],
  doneByHabit: DoneByHabit,
  today: Date,
  weeks: number,
): WeekRate[] {
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const thisMonday = addDays(today, -daysSinceMonday);

  return Array.from({ length: weeks }, (_, index) => {
    const start = addDays(thisMonday, -(weeks - 1 - index) * 7);
    let scheduled = 0;
    let done = 0;
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(start, offset);
      if (daysBetween(date, today) < 0) {
        break;
      }
      const summary = daySummary(habits, doneByHabit, date);
      scheduled += summary.scheduled;
      done += summary.done;
    }
    return { start, rate: scheduled === 0 ? null : done / scheduled };
  });
}

/** Average 30-day completion across habits, 0..1. */
export function overallRate30(habits: Habit[], doneByHabit: DoneByHabit, today: Date): number {
  let scheduled = 0;
  let done = 0;
  for (let offset = 0; offset < 30; offset += 1) {
    const summary = daySummary(habits, doneByHabit, addDays(today, -offset));
    scheduled += summary.scheduled;
    done += summary.done;
  }
  return scheduled === 0 ? 0 : done / scheduled;
}
