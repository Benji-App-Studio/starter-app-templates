import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { listCompletions, toggleCompletion, type Completion } from '@/db/completions';
import { listHabits, type Habit } from '@/db/habits';

import { dayKey } from './dates';
import type { DoneByHabit } from './streaks';

type Loaded = { habits: Habit[]; completions: Completion[] };

/**
 * Habits and check-ins for a screen. Reloads whenever the screen gains focus,
 * so edits made on another screen show up on return.
 */
export function useHabitData() {
  const [data, setData] = useState<Loaded>();

  const refresh = useCallback(async () => {
    const [habits, completions] = await Promise.all([listHabits(), listCompletions()]);
    setData({ habits, completions });
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const doneByHabit = useMemo<DoneByHabit>(() => {
    const map: DoneByHabit = new Map();
    for (const completion of data?.completions ?? []) {
      const days = map.get(completion.habitId) ?? new Set<string>();
      days.add(completion.day);
      map.set(completion.habitId, days);
    }
    return map;
  }, [data]);

  const toggleToday = useCallback(
    async (habit: Habit) => {
      await toggleCompletion(habit.id, dayKey(new Date()));
      await refresh();
    },
    [refresh],
  );

  return { habits: data?.habits, doneByHabit, loaded: data !== undefined, refresh, toggleToday };
}
