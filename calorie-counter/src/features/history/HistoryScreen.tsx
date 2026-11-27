import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Card, EmptyState, Icon, ListRow, Screen, Section, Stack, Text } from '@/components';
import { listDayTotals, type DayTotal } from '@/db/foodLogs';
import { formatDay, shiftDay, todayKey } from '@/features/diary/days';
import { PlateIllustration } from '@/features/diary/PlateIllustration';
import { useDailyTarget } from '@/features/diary/target';
import { formatKcal } from '@/features/diary/totals';
import { spacing as grid, useTheme } from '@/theme/theme';

import { DailyBarChart } from './DailyBarChart';

const CHART_DAYS = 14;
const LIST_DAYS = 90;

export function HistoryScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { target } = useDailyTarget();
  const today = todayKey();
  const [totals, setTotals] = useState<DayTotal[]>();

  useFocusEffect(
    useCallback(() => {
      listDayTotals(shiftDay(today, -(LIST_DAYS - 1)))
        .then(setTotals)
        .catch(() => setTotals([]));
    }, [today]),
  );

  if (!totals) {
    return <Screen edges={['top']} title="History">{null}</Screen>;
  }

  if (totals.length === 0) {
    return (
      <Screen edges={['top']} title="History">
        <EmptyState
          illustration={<PlateIllustration />}
          title="No days yet"
          body="Every day you log shows up here with its total and how it sat against your target."
          action={{ title: 'Log food', onPress: () => router.push('/log') }}
        />
      </Screen>
    );
  }

  const byDay = new Map(totals.map((row) => [row.day, row]));
  const chartDays = Array.from({ length: CHART_DAYS }, (_, index) => {
    const day = shiftDay(today, index - (CHART_DAYS - 1));
    return { day, calories: byDay.get(day)?.calories ?? 0 };
  });
  const loggedInChart = chartDays.filter((entry) => entry.calories > 0);
  const average = loggedInChart.reduce((sum, entry) => sum + entry.calories, 0) / Math.max(loggedInChart.length, 1);
  const onTarget = loggedInChart.filter((entry) => entry.calories <= target).length;

  return (
    <Screen scroll edges={['top']} title="History">
      <Stack gap="xl">
        <Card>
          <Stack gap="sm">
            <View style={styles.cardHeader}>
              <Text variant="label">Last two weeks</Text>
              <Text variant="caption" color="muted">
                kcal a day
              </Text>
            </View>
            <DailyBarChart width={width - spacing.gutter * 2 - spacing.md * 2 - 2} days={chartDays} target={target} today={today} />
            <View style={[styles.stats, { gap: spacing.sm, paddingTop: spacing.md, borderTopColor: colors.border }]}>
              <Stat value={formatKcal(average)} label="average" />
              <Stat value={String(loggedInChart.length)} label={loggedInChart.length === 1 ? 'day logged' : 'days logged'} />
              <Stat value={`${onTarget} of ${loggedInChart.length}`} label="on target" />
            </View>
          </Stack>
        </Card>

        <Section grouped title="Days">
          {totals.map((row) => {
            const over = row.calories > target;
            return (
              <ListRow
                key={row.day}
                title={formatDay(row.day)}
                subtitle={`${row.entries} ${row.entries === 1 ? 'item' : 'items'} · P ${Math.round(row.protein)} · C ${Math.round(row.carbs)} · F ${Math.round(row.fat)}`}
                onPress={() => router.push(`/day/${row.day}`)}
                right={
                  <View style={[styles.rowRight, { gap: spacing.sm }]}>
                    <Text variant="label" color={over ? 'danger' : 'text'} style={styles.tabular}>
                      {formatKcal(row.calories)}
                    </Text>
                    <Icon name="chevron" size={14} color={colors.textMuted} />
                  </View>
                }
              />
            );
          })}
        </Section>
      </Stack>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="stat" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  stats: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1, minWidth: 0, gap: grid.xs },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
});
