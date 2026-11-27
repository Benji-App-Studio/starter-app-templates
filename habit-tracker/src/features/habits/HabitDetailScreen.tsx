import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AnimatedNumber, Button, Card, Icon, IconButton, ListRow, Screen, Text } from '@/components';
import { deleteHabit } from '@/db/habits';
import { useTheme } from '@/theme/theme';

import { cancelHabitReminders } from '../reminders/reminders';
import { addDays, dayKey, describeDays, formatTime, WEEKDAY_SHORT } from './dates';
import { HoldRing, HoldToComplete } from './HoldToComplete';
import { habitStats, isScheduled } from './streaks';
import { StatTile } from './StatTile';
import { useHabitData } from './useHabitData';
import { YearGrid } from './YearGrid';

type HabitDetailScreenProps = {
  id: number;
};

export function HabitDetailScreen({ id }: HabitDetailScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { habits, doneByHabit, loaded, toggleToday } = useHabitData();
  const today = new Date();
  const habit = habits?.find((candidate) => candidate.id === id);

  useEffect(() => {
    if (loaded && !habit) {
      router.back();
    }
  }, [habit, loaded, router]);

  if (!habit) {
    return <Screen>{null}</Screen>;
  }

  const done = doneByHabit.get(habit.id) ?? new Set<string>();
  const stats = habitStats(habit, doneByHabit, today);
  const dueToday = isScheduled(habit, today);
  const doneToday = done.has(dayKey(today));
  const nextDue = Array.from({ length: 7 }, (_, offset) => addDays(today, offset + 1)).find((date) =>
    isScheduled(habit, date),
  );

  function confirmDelete() {
    Alert.alert(`Delete ${habit?.name}?`, 'Its check-ins and streak go with it.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cancelHabitReminders(id);
          await deleteHabit(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen scroll edges={['top', 'bottom']} contentStyle={{ gap: spacing.md }}>
      <View style={[styles.header, { gap: spacing.sm }]}>
        <IconButton icon="back" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text variant="label" numberOfLines={1} style={styles.headerTitle} align="center">
          {habit.name}
        </Text>
        <IconButton icon="edit" accessibilityLabel="Edit habit" onPress={() => router.push(`/habit/edit?id=${id}`)} />
      </View>

      <Animated.View entering={FadeIn} style={[styles.hero, { gap: spacing.sm, paddingVertical: spacing.sm }]}>
        <View style={[styles.heroRow, { gap: spacing.sm }]}>
          <AnimatedNumber value={stats.currentStreak} />
          <Icon name="flame" size={36} color={stats.currentStreak > 0 ? colors.streak : colors.border} weight="bold" />
        </View>
        <Text variant="heading">{stats.currentStreak === 1 ? 'day streak' : 'day streak'}</Text>
        <Text variant="caption" color="muted">
          {stats.currentStreak > 0
            ? doneToday
              ? 'Done today. The streak holds.'
              : dueToday
                ? 'Check off today to keep it going.'
                : `Next up ${nextDue ? WEEKDAY_SHORT[nextDue.getDay()] : 'soon'}.`
            : dueToday
              ? 'Hold below to start a streak today.'
              : `Starts ${nextDue ? WEEKDAY_SHORT[nextDue.getDay()] : 'on its next day'}.`}
        </Text>
      </Animated.View>

      {dueToday ? (
        <HoldToComplete
          done={doneToday}
          onToggle={() => void toggleToday(habit)}
          accessibilityLabel={`${habit.name} today`}
        >
          {(hold) => (
            <Card style={doneToday ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined}>
              <View style={[styles.holdRow, { gap: spacing.md }]}>
                <HoldRing hold={hold} done={doneToday} size={64} strokeWidth={5}>
                  <Icon name={habit.icon} size={26} color={doneToday ? colors.onPrimary : colors.primary} />
                </HoldRing>
                <View style={styles.holdBody}>
                  <Text variant="label" style={doneToday ? { color: colors.onPrimary } : undefined}>
                    {doneToday ? 'Done today' : 'Hold to mark done'}
                  </Text>
                  <Text
                    variant="caption"
                    color={doneToday ? undefined : 'muted'}
                    style={doneToday ? { color: colors.onPrimary, opacity: 0.8 } : undefined}
                  >
                    {doneToday ? 'Hold again to undo.' : 'Keep holding until the ring closes.'}
                  </Text>
                </View>
                {doneToday ? <Icon name="check" size={20} color={colors.onPrimary} weight="bold" /> : null}
              </View>
            </Card>
          )}
        </HoldToComplete>
      ) : null}

      <View style={[styles.stats, { gap: spacing.item }]}>
        <StatTile value={String(stats.bestStreak)} label="best streak" />
        <StatTile value={`${Math.round(stats.rate30 * 100)}%`} label="last 30 days" />
        <StatTile value={String(stats.total)} label="check-ins" />
      </View>

      <Card style={{ gap: spacing.md }}>
        <Text variant="heading">This year</Text>
        <YearGrid habit={habit} done={done} today={today} />
      </Card>

      <Card style={{ paddingVertical: 0 }}>
        <ListRow
          icon="calendar"
          title="Repeat"
          right={
            <Text variant="caption" color="muted">
              {describeDays(habit.days)}
            </Text>
          }
        />
        <ListRow
          icon={habit.reminderTime ? 'bell' : 'bellOff'}
          title="Reminder"
          right={
            <Text variant="caption" color="muted">
              {habit.reminderTime ? formatTime(habit.reminderTime) : 'Off'}
            </Text>
          }
        />
      </Card>

      <Button title="Delete habit" variant="destructive" onPress={confirmDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1 },
  hero: { alignItems: 'center' },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  holdRow: { flexDirection: 'row', alignItems: 'center' },
  holdBody: { flex: 1, minWidth: 0 },
  stats: { flexDirection: 'row' },
});
