import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  AnimatedNumber,
  Button,
  Card,
  DotsMark,
  EmptyState,
  Icon,
  IconButton,
  Screen,
  Text,
} from '@/components';
import { createHabit } from '@/db/habits';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { syncHabitReminders } from '../reminders/reminders';
import { dayKey, formatLongDate } from './dates';
import { HabitTile } from './HabitTile';
import { defaultReminderTime, startersFor, starterToHabit, type Starter } from './starters';
import { habitStats, isScheduled, perfectDayStreak } from './streaks';
import { StreakChip } from './StreakChip';
import { TodayRing } from './TodayRing';
import { useHabitData } from './useHabitData';

export function TodayScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const { habits, doneByHabit, loaded, refresh, toggleToday } = useHabitData();
  const { onboardingAnswers } = useAppState();
  const today = new Date();

  const due = (habits ?? []).filter((habit) => isScheduled(habit, today));
  const doneCount = due.filter((habit) => doneByHabit.get(habit.id)?.has(dayKey(today))).length;
  const perfectDays = habits ? perfectDayStreak(habits, doneByHabit, today) : 0;
  const otherDays = (habits?.length ?? 0) - due.length;
  const tileWidth = (width - spacing.gutter * 2 - spacing.item) / 2;

  async function addStarter(starter: Starter) {
    const habit = await createHabit(starterToHabit(starter, defaultReminderTime(onboardingAnswers)));
    await syncHabitReminders(habit);
    await refresh();
  }

  return (
    <Screen
      largeTitle="Today"
      subtitle={formatLongDate(today)}
      headerRight={
        <IconButton
          icon="plus"
          variant="filled"
          accessibilityLabel="Add a habit"
          onPress={() => router.push('/habit/edit')}
        />
      }
    >
      {!loaded || !habits ? null : habits.length === 0 ? (
        <FirstHabits
          starters={startersFor(onboardingAnswers)}
          onAdd={addStarter}
          onCreate={() => router.push('/habit/edit')}
        />
      ) : (
        <>
          <Animated.View entering={FadeIn} style={[styles.hero, { gap: spacing.md, paddingVertical: spacing.sm }]}>
            <TodayRing total={due.length} done={doneCount}>
              <AnimatedNumber value={doneCount} />
              <Text variant="label" color="muted">
                {due.length === 0
                  ? 'nothing due today'
                  : doneCount === due.length
                    ? 'all done today'
                    : `of ${due.length} today`}
              </Text>
            </TodayRing>
            {perfectDays > 0 ? (
              <StreakChip days={perfectDays} noun={perfectDays === 1 ? 'perfect day' : 'perfect days'} />
            ) : null}
          </Animated.View>

          {due.length === 0 ? (
            <Card tone="sunken">
              <Text color="muted">Nothing is due today. Your habits are back on their next scheduled day.</Text>
            </Card>
          ) : (
            <View style={[styles.grid, { gap: spacing.item }]}>
              {due.map((habit, index) => (
                <HabitTile
                  key={habit.id}
                  habit={habit}
                  index={index}
                  width={tileWidth}
                  done={doneByHabit.get(habit.id)?.has(dayKey(today)) ?? false}
                  streak={habitStats(habit, doneByHabit, today).currentStreak}
                  onToggle={() => void toggleToday(habit)}
                  onOpen={() => router.push(`/habit/${habit.id}`)}
                />
              ))}
            </View>
          )}

          {otherDays > 0 ? (
            <Text variant="caption" color="muted" align="center">
              {otherDays === 1 ? '1 more habit on other days' : `${otherDays} more habits on other days`}
            </Text>
          ) : null}
        </>
      )}
    </Screen>
  );
}

type FirstHabitsProps = {
  starters: Starter[];
  onAdd: (starter: Starter) => Promise<void>;
  onCreate: () => void;
};

/** The empty Today: the starter habits for the chosen focus, one tap each to add. */
function FirstHabits({ starters, onAdd, onCreate }: FirstHabitsProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={{ gap: spacing.md }}>
      <EmptyState
        illustration={<DotsMark size={96} filled={0} />}
        title="Your grid is empty"
        body="Add a habit and today becomes the first dot."
      />
      <Text variant="caption" color="muted">
        QUICK ADD
      </Text>
      {starters.map((starter) => (
        <Card key={starter.name} onPress={() => void onAdd(starter)}>
          <View style={[styles.starter, { gap: spacing.md }]}>
            <View style={[styles.starterIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
              <Icon name={starter.icon} size={20} color={colors.primary} />
            </View>
            <Text variant="label" style={styles.starterName}>
              {starter.name}
            </Text>
            <Icon name="plus" size={18} color={colors.primary} weight="bold" />
          </View>
        </Card>
      ))}
      <Button title="Write my own" variant="secondary" onPress={onCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  starter: { flexDirection: 'row', alignItems: 'center' },
  starterIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  starterName: { flex: 1 },
});
