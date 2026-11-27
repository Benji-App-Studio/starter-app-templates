import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { AnimatedNumber, Button, EmptyState, Screen, Stack, Text } from '@/components';
import { listDayTotals, type Meal } from '@/db/foodLogs';
import { useTheme } from '@/theme/theme';

import { CalorieRing, ringNumeralStyle } from './CalorieRing';
import { parseDayKey, todayKey, weekOf } from './days';
import { MacroLegend } from './MacroLegend';
import { MealList } from './MealList';
import { mealForTime, mealLabel } from './meals';
import { PlateIllustration } from './PlateIllustration';
import { useDailyTarget } from './target';
import { formatKcal } from './totals';
import { useDayLogs } from './useDayLogs';
import { WeekStrip } from './WeekStrip';

const MAX_RING_SIZE = 300;

export function TodayScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const today = todayKey();
  const week = useMemo(() => weekOf(today), [today]);
  const { logs, totals, remove } = useDayLogs(today);
  const { target, macros } = useDailyTarget();
  const [weekCalories, setWeekCalories] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      listDayTotals(week[0])
        .then((rows) => setWeekCalories(Object.fromEntries(rows.map((row) => [row.day, row.calories]))))
        .catch(() => undefined);
    }, [week]),
  );

  function openLog(meal: Meal = mealForTime()) {
    router.push({ pathname: '/log', params: { day: today, meal } });
  }

  function openDay(day: string) {
    if (day !== today) {
      router.push(`/day/${day}`);
    }
  }

  const remaining = target - totals.calories;
  const over = remaining < 0;
  const ringSize = Math.min(width - spacing.gutter * 2 - spacing.xl * 2, MAX_RING_SIZE);
  const dateLabel = parseDayKey(today).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen
      scroll
      edges={['top']}
      title="Today"
      subtitle={dateLabel}
      footer={<Button title="Log food" onPress={() => openLog()} />}
    >
      <Stack gap="xl">
        <WeekStrip
          days={week}
          today={today}
          caloriesByDay={{ ...weekCalories, [today]: totals.calories }}
          target={target}
          onSelect={openDay}
        />

        <Stack gap="lg">
          <Stack align="center">
            <CalorieRing size={ringSize} target={target} eaten={totals} macroTargets={macros}>
              <AnimatedNumber
                value={Math.abs(remaining)}
                color={over ? colors.danger : colors.text}
                style={ringNumeralStyle(ringSize)}
              />
              <Stack gap="xs" align="center">
                <Text variant="label" color={over ? 'danger' : 'muted'}>
                  {over ? 'kcal over' : 'kcal left'}
                </Text>
                <Text variant="caption" color="muted" style={styles.tabular}>
                  {formatKcal(totals.calories)} of {formatKcal(target)}
                </Text>
              </Stack>
            </CalorieRing>
          </Stack>
          <MacroLegend eaten={totals} targets={macros} />
        </Stack>

        {logs === undefined ? null : logs.length === 0 ? (
          <EmptyState
            layout="inline"
            illustration={<PlateIllustration size={64} />}
            title="Nothing logged yet"
            body={`Add your ${mealLabel(mealForTime()).toLowerCase()} and the rings start moving.`}
          />
        ) : (
          <MealList logs={logs} onAdd={openLog} onDelete={(log) => void remove(log)} />
        )}
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
});
