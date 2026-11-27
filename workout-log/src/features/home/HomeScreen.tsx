import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Button, Card, Fill, Icon, RackIllustration, Row, Screen, Section, Stack, Text } from '@/components';
import { listRoutines, type RoutineSummary } from '@/db/routines';
import { getActiveWorkout, listWorkoutStartsSince, type Workout } from '@/db/workouts';
import { listWorkoutSets } from '@/db/workoutSets';
import { seedStarterRoutines } from '@/features/routines/starterRoutines';
import { formatAgo, formatClock, startOfWeek, weekdayIndex } from '@/features/workout/format';
import { useBeginWorkout } from '@/features/workout/useBeginWorkout';
import { useTheme } from '@/theme/theme';

import { WeekRing } from './WeekRing';
import { useWeeklyGoal } from './weeklyGoal';

type HomeData = {
  days: boolean[];
  routines: RoutineSummary[];
  active: (Workout & { setsDone: number }) | null;
};

async function loadHome(): Promise<HomeData> {
  await seedStarterRoutines();
  const now = Date.now();
  const [starts, routines, active] = await Promise.all([
    listWorkoutStartsSince(startOfWeek(now)),
    listRoutines(),
    getActiveWorkout(),
  ]);
  const days = Array.from({ length: 7 }, () => false);
  for (const start of starts) {
    days[weekdayIndex(start)] = true;
  }
  const setsDone = active ? (await listWorkoutSets(active.id)).filter((set) => set.completed).length : 0;
  return { days, routines, active: active ? { ...active, setsDone } : null };
}

/** Pick the routine that has gone longest without being done. */
function nextUp(routines: RoutineSummary[]): RoutineSummary | undefined {
  return [...routines].sort((a, b) => (a.lastPerformedAt ?? 0) - (b.lastPerformedAt ?? 0))[0];
}

function weekRangeLabel(now: number): string {
  const start = new Date(startOfWeek(now));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const format = (date: Date) => date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `${format(start)} – ${format(end)}`;
}

export function HomeScreen() {
  const router = useRouter();
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const goal = useWeeklyGoal();
  const begin = useBeginWorkout();
  const [data, setData] = useState<HomeData>();
  const [now, setNow] = useState(Date.now());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      loadHome().then((next) => {
        if (!cancelled) {
          setData(next);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    if (!data?.active) {
      return;
    }
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [data?.active]);

  if (!data) {
    return <Screen tabBar>{null}</Screen>;
  }

  const count = data.days.filter(Boolean).length;
  const upNext = nextUp(data.routines);
  const remaining = goal - count;
  const statusLine =
    remaining <= 0
      ? 'Week done. Anything extra is a bonus.'
      : upNext
        ? `${remaining} to go · ${upNext.name} is up next`
        : `${remaining} to go this week`;
  const entering = reducedMotion ? undefined : FadeInDown.springify().damping(18);

  return (
    <Screen scroll tabBar title="This week" subtitle={weekRangeLabel(now)}>
      <Stack gap="xl">
        <Stack gap="md" align="center">
          <WeekRing days={data.days} goal={goal} todayIndex={weekdayIndex(now)} size={Math.min(280, width * 0.68)} />
          <Text color="muted" align="center">
            {statusLine}
          </Text>
        </Stack>

        {data.active ? (
          <Animated.View entering={entering} layout={reducedMotion ? undefined : LinearTransition}>
            <Card selected onPress={() => router.push('/workout/active')}>
              <Row gap="smd">
                <Fill>
                  <Text variant="overline" color="primary">
                    In progress
                  </Text>
                  <Text variant="heading" numberOfLines={1}>
                    {data.active.name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {data.active.setsDone} {data.active.setsDone === 1 ? 'set' : 'sets'} done · tap to go back
                  </Text>
                </Fill>
                <Text variant="numeralSmall">{formatClock(now - data.active.startedAt)}</Text>
              </Row>
            </Card>
          </Animated.View>
        ) : null}

        <Section title="Start a workout">
          <Stack gap="smd">
            {data.routines.length === 0 ? (
              <Card>
                <Stack gap="smd" align="center">
                  <RackIllustration size={88} />
                  <Text color="muted" align="center">
                    No routines yet. Build one in the Routines tab, or start empty.
                  </Text>
                </Stack>
              </Card>
            ) : (
              <Stack gap="smd">
                {data.routines.map((routine, index) => {
                  const isNext = routine.id === upNext?.id;
                  return (
                    <Animated.View
                      key={routine.id}
                      entering={reducedMotion ? undefined : FadeInDown.delay(index * 40).springify().damping(18)}
                    >
                      <Card onPress={() => begin(routine)} selected={isNext && !data.active}>
                        <Row gap="smd">
                          <Fill>
                            {isNext ? (
                              <Text variant="overline" color="primary">
                                Up next
                              </Text>
                            ) : null}
                            <Text variant="heading" numberOfLines={1}>
                              {routine.name}
                            </Text>
                            <Text variant="caption" color="muted" numberOfLines={1}>
                              {routine.exerciseCount} exercises · {routine.setCount} sets · {formatAgo(routine.lastPerformedAt)}
                            </Text>
                          </Fill>
                          <View
                            style={[
                              styles.play,
                              { backgroundColor: isNext ? colors.primary : colors.surfaceRaised, borderRadius: radii.pill },
                            ]}
                          >
                            <Icon name="play" size={16} color={isNext ? colors.onPrimary : colors.text} />
                          </View>
                        </Row>
                      </Card>
                    </Animated.View>
                  );
                })}
              </Stack>
            )}
            <Button title="Empty workout" icon="plus" variant="ghost" size="sm" onPress={() => begin(null)} />
          </Stack>
        </Section>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  play: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
