import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AnimatedNumber, Button, EmptyState, Screen, ScreenHeader, Stack, Text } from '@/components';
import type { Meal } from '@/db/foodLogs';
import { useTheme } from '@/theme/theme';

import { CalorieRing, ringNumeralStyle } from './CalorieRing';
import { formatDay } from './days';
import { MacroLegend } from './MacroLegend';
import { MealList } from './MealList';
import { PlateIllustration } from './PlateIllustration';
import { useDailyTarget } from './target';
import { formatKcal } from './totals';
import { useDayLogs } from './useDayLogs';

const RING_SIZE = 220;

type DayDetailScreenProps = {
  day: string;
};

/** One past day in full: its rings and every logged food, editable like today. */
export function DayDetailScreen({ day }: DayDetailScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { logs, totals, remove } = useDayLogs(day);
  const { target, macros } = useDailyTarget();
  const remaining = target - totals.calories;
  const over = remaining < 0;

  function openLog(meal?: Meal) {
    router.push({ pathname: '/log', params: meal ? { day, meal } : { day } });
  }

  return (
    <Screen scroll footer={<Button title="Log food for this day" onPress={() => openLog()} />}>
      <Stack gap="md">
        <ScreenHeader title={formatDay(day, 'long')} onBack={() => router.back()} />

        <Stack gap="xl">
          <Stack gap="lg">
            <Stack align="center">
              <CalorieRing size={RING_SIZE} target={target} eaten={totals} macroTargets={macros}>
                <AnimatedNumber
                  value={Math.abs(remaining)}
                  color={over ? colors.danger : colors.text}
                  style={ringNumeralStyle(RING_SIZE)}
                />
                <Stack gap="xs" align="center">
                  <Text variant="caption" color={over ? 'danger' : 'muted'}>
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
              illustration={<PlateIllustration />}
              title="Nothing logged this day"
              body="Forgot a meal? You can add it here and the day's total updates."
            />
          ) : (
            <MealList logs={logs} onAdd={openLog} onDelete={(log) => void remove(log)} />
          )}
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabular: { fontVariant: ['tabular-nums'] },
});
