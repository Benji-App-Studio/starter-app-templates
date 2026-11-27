import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, EmptyState, Icon, LargeTitleScroll, Screen, Text } from '@/components';
import { listDayGoals } from '@/db/dayGoals';
import { listDayTotals } from '@/db/drinks';
import { useTheme, spacing } from '@/theme/theme';

import { addDays, dayKey, formatDayLabel, recentDays } from './dates';
import { formatAmount, formatAmountShort } from './goal';
import { CalendarIllustration } from './illustrations';
import { averageMl, currentStreak, summariseDays, type DaySummary } from './stats';
import { useGoal } from './useGoal';
import { WeekChart } from './WeekChart';

const HISTORY_DAYS = 30;

export function HistoryScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { goalMl, unit } = useGoal();
  const [summaries, setSummaries] = useState<DaySummary[]>();

  useFocusEffect(
    useCallback(() => {
      const today = dayKey();
      const from = addDays(today, -(HISTORY_DAYS - 1));
      void Promise.all([listDayTotals(from, today), listDayGoals(from, today)]).then(([totals, goals]) =>
        setSummaries(summariseDays(totals, goals, goalMl)),
      );
    }, [goalMl]),
  );

  if (!summaries) {
    return <Screen edges={['top']}>{null}</Screen>;
  }

  if (summaries.length === 0) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          illustration={<CalendarIllustration />}
          title="Your days will show up here"
          body="Every day you log gets a bar, and the days you reach the goal build your streak."
          action={{ title: "Log today's first glass", onPress: () => router.push('/') }}
        />
      </Screen>
    );
  }

  const today = dayKey();
  const byDay = new Map(summaries.map((entry) => [entry.day, entry]));
  const week = recentDays(7, today).map((day) => {
    const entry = byDay.get(day);
    return {
      day,
      totalMl: entry?.totalMl ?? 0,
      goalMl: entry?.goalMl ?? goalMl,
      reached: entry?.reached ?? false,
      isToday: day === today,
    };
  });
  const streak = currentStreak(summaries, today);
  const reachedCount = summaries.filter((entry) => entry.reached).length;

  return (
    <Screen edges={['top']} padded={false}>
      <LargeTitleScroll title="History" subtitle="Last 30 days">
        <Card style={{ marginBottom: spacing.ms }}>
          <View style={[styles.cardHeader, { marginBottom: spacing.ms, gap: spacing.sm }]}>
            <Text variant="label">This week</Text>
            <Text variant="caption" color="muted">
              {week.filter((entry) => entry.reached).length} of 7 days on goal
            </Text>
          </View>
          <WeekChart days={week} unit={unit} />
        </Card>

        <View style={[styles.stats, { gap: spacing.ms, marginBottom: spacing.xl }]}>
          <StatTile icon="flame" label="Streak" value={String(streak)} unit={streak === 1 ? 'day' : 'days'} />
          <StatTile icon="checkCircle" label="Goal days" value={String(reachedCount)} unit={`of ${summaries.length}`} />
          <StatTile icon="dropOutline" label="Average" value={formatAmountShort(averageMl(summaries), unit)} unit="a day" />
        </View>

        <Text variant="heading" style={{ marginBottom: spacing.ms }}>
          Day by day
        </Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md }}>
          {summaries.map((entry, index) => (
            <View
              key={entry.day}
              style={[
                styles.row,
                {
                  gap: spacing.md,
                  paddingVertical: spacing.sm + spacing.xs,
                  borderBottomWidth: index === summaries.length - 1 ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.rowBody}>
                <Text variant="label">{formatDayLabel(entry.day, today)}</Text>
                <Text variant="caption" color="muted">
                  {formatAmount(entry.totalMl, unit)} of {formatAmount(entry.goalMl, unit)}
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.surfaceRaised, borderRadius: radii.pill }]}>
                <View
                  style={{
                    width: `${Math.min(100, (entry.totalMl / entry.goalMl) * 100)}%`,
                    height: '100%',
                    borderRadius: radii.pill,
                    backgroundColor: entry.reached ? colors.primary : colors.secondary,
                  }}
                />
              </View>
              {entry.reached ? (
                <Icon name="checkCircle" size={18} color={colors.success} />
              ) : (
                <View style={styles.checkSpacer} />
              )}
            </View>
          ))}
        </View>
      </LargeTitleScroll>
    </Screen>
  );
}

type StatTileProps = {
  icon: 'flame' | 'checkCircle' | 'dropOutline';
  label: string;
  value: string;
  unit: string;
};

function StatTile({ icon, label, value, unit }: StatTileProps) {
  const { colors, spacing } = useTheme();

  return (
    <Card style={styles.tile}>
      <View style={[styles.tileHeader, { gap: spacing.sm, marginBottom: spacing.sm }]}>
        <Icon name={icon} size={13} color={colors.primary} />
        <Text variant="caption" color="muted" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text variant="stat" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      <Text variant="caption" color="muted" style={{ marginTop: spacing.sm }}>
        {unit}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row' },
  tile: { flex: 1 },
  tileHeader: { flexDirection: 'row', alignItems: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBody: { flex: 1, gap: spacing.sm },
  track: { width: 72, height: 8, overflow: 'hidden' },
  checkSpacer: { width: 18 },
});
