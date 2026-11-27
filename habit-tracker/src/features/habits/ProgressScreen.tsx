import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AnimatedNumber, Card, DotsMark, EmptyState, Icon, Screen, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { habitStats, overallRate30, perfectDayStreak, weeklyRates } from './streaks';
import { StatTile } from './StatTile';
import { useHabitData } from './useHabitData';
import { WeekDots } from './WeekDots';
import { WeeklyBars } from './WeeklyBars';

const WEEKS = 8;

export function ProgressScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const { habits, doneByHabit, loaded } = useHabitData();
  const today = new Date();

  if (!loaded || !habits) {
    return <Screen largeTitle="Progress">{null}</Screen>;
  }

  if (habits.length === 0) {
    return (
      <Screen largeTitle="Progress">
        <EmptyState
          illustration={<DotsMark size={96} filled={1} />}
          title="Nothing to chart yet"
          body="Check off a habit on Today and this week starts to fill in."
          action={{ title: 'Add a habit', onPress: () => router.push('/habit/edit') }}
        />
      </Screen>
    );
  }

  const perfectDays = perfectDayStreak(habits, doneByHabit, today);
  const weeks = weeklyRates(habits, doneByHabit, today, WEEKS);
  const rate30 = overallRate30(habits, doneByHabit, today);
  const stats = habits.map((habit) => ({ habit, stats: habitStats(habit, doneByHabit, today) }));
  const totalCheckIns = stats.reduce((sum, entry) => sum + entry.stats.total, 0);
  const best = stats.reduce((top, entry) => (entry.stats.bestStreak > top.stats.bestStreak ? entry : top), stats[0]);

  return (
    <Screen
      largeTitle="Progress"
      subtitle={`${habits.length} ${habits.length === 1 ? 'habit' : 'habits'}, last ${WEEKS} weeks`}
    >
      <Animated.View
        entering={FadeInDown.springify().damping(18)}
        style={[styles.hero, { gap: spacing.sm, paddingVertical: spacing.sm }]}
      >
        <View style={[styles.heroRow, { gap: spacing.sm }]}>
          <AnimatedNumber value={perfectDays} />
          <Icon name="flame" size={36} color={perfectDays > 0 ? colors.streak : colors.border} weight="bold" />
        </View>
        <Text variant="heading">{perfectDays === 1 ? 'perfect day in a row' : 'perfect days in a row'}</Text>
        <Text variant="caption" color="muted">
          {perfectDays > 0 ? 'Every habit done, every day it was due.' : 'Finish everything due today to start one.'}
        </Text>
      </Animated.View>

      <Card style={{ gap: spacing.md }}>
        <Text variant="heading">Completion by week</Text>
        <WeeklyBars weeks={weeks} />
      </Card>

      <View style={[styles.stats, { gap: spacing.item }]}>
        <StatTile value={`${Math.round(rate30 * 100)}%`} label="last 30 days" />
        <StatTile value={String(totalCheckIns)} label="check-ins" />
        <StatTile value={String(best.stats.bestStreak)} label="best streak" />
      </View>

      <Text variant="heading" style={{ marginTop: spacing.sm }}>
        Habits
      </Text>
      <View style={{ gap: spacing.item }}>
        {stats.map(({ habit, stats: habitStat }, index) => (
          <Animated.View
            key={habit.id}
            entering={FadeInDown.delay(index * 40)
              .springify()
              .damping(18)}
          >
            <Card onPress={() => router.push(`/habit/${habit.id}`)}>
              <View style={[styles.row, { gap: spacing.md }]}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
                  <Icon name={habit.icon} size={20} color={colors.primary} />
                </View>
                <View style={[styles.rowBody, { gap: spacing.sm }]}>
                  <Text variant="label" numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text variant="caption" color="muted" style={{ fontVariant: ['tabular-nums'] }}>
                    {habitStat.currentStreak > 0 ? `${habitStat.currentStreak}-day streak` : 'No streak yet'} · best{' '}
                    {habitStat.bestStreak}
                  </Text>
                </View>
                <WeekDots habit={habit} done={doneByHabit.get(habit.id) ?? new Set()} today={today} />
              </View>
            </Card>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  stats: { flexDirection: 'row' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0 },
});
