import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import {
  AnimatedNumber,
  BarChart,
  Card,
  EmptyState,
  Fill,
  Icon,
  PlatesIllustration,
  Row,
  Screen,
  Section,
  SegmentedControl,
  Stack,
  StopwatchIllustration,
  Text,
  type BarDatum,
} from '@/components';
import { listFinishedWorkouts, type WorkoutSummary } from '@/db/workouts';
import { listRecords, type ExerciseRecord } from '@/db/workoutSets';
import {
  formatDuration,
  formatRelativeDate,
  formatShortDate,
  formatVolume,
  formatWeight,
  kgToUnit,
  startOfWeek,
} from '@/features/workout/format';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const WEEKS_IN_CHART = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Segment = 'workouts' | 'records';

function weeklyVolume(workouts: WorkoutSummary[], now: number): BarDatum[] {
  const thisWeek = startOfWeek(now);
  return Array.from({ length: WEEKS_IN_CHART }, (_, index) => {
    const start = thisWeek - (WEEKS_IN_CHART - 1 - index) * WEEK_MS;
    const value = workouts
      .filter((workout) => workout.startedAt >= start && workout.startedAt < start + WEEK_MS)
      .reduce((sum, workout) => sum + workout.volumeKg, 0);
    return { label: formatShortDate(start), value, highlight: index === WEEKS_IN_CHART - 1 };
  });
}

export function HistoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const { units } = useAppState();
  const [segment, setSegment] = useState<Segment>('workouts');
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>();
  const [records, setRecords] = useState<ExerciseRecord[]>();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([listFinishedWorkouts(), listRecords()]).then(([nextWorkouts, nextRecords]) => {
        if (!cancelled) {
          setWorkouts(nextWorkouts);
          setRecords(nextRecords);
        }
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const control = (
    <SegmentedControl<Segment>
      segments={[
        { id: 'workouts', label: 'Workouts' },
        { id: 'records', label: 'Records' },
      ]}
      value={segment}
      onChange={setSegment}
    />
  );

  if (!workouts || !records) {
    return <Screen tabBar title="History">{null}</Screen>;
  }

  if (segment === 'records') {
    const latest = records[0];
    if (records.length === 0) {
      return (
        <Screen tabBar title="History">
          {control}
          <EmptyState
            illustration={<PlatesIllustration />}
            title="No records yet"
            body="Your heaviest set of every exercise lands here. Finish a workout with weights to start."
          />
        </Screen>
      );
    }
    return (
      <Screen scroll tabBar title="History" subtitle={`${records.length} ${records.length === 1 ? 'record' : 'records'}`}>
        <Stack gap="xl">
          {control}
          <Stack gap="xs">
            <Row gap="sm" align="baseline">
              <AnimatedNumber value={records.length} variant="numeral" />
              <Text variant="heading" color="muted">
                {records.length === 1 ? 'record' : 'records'}
              </Text>
            </Row>
            {latest ? (
              <Text color="muted" numberOfLines={2}>
                Latest: {latest.exerciseName} {formatWeight(latest.bestWeightKg, units)} × {latest.bestWeightReps},{' '}
                {formatRelativeDate(latest.bestWeightAt).toLowerCase()}
              </Text>
            ) : null}
          </Stack>
          <Stack gap="smd">
            {records.map((record, index) => (
              <Animated.View
                key={record.exerciseId}
                entering={reducedMotion ? undefined : FadeInDown.delay(Math.min(index, 10) * 30).springify().damping(18)}
              >
                <Card onPress={() => router.push(`/exercise/${record.exerciseId}`)}>
                  <Row gap="smd">
                    <Fill>
                      <Text variant="heading" numberOfLines={1}>
                        {record.exerciseName}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        est. 1RM {formatWeight(record.bestOneRepMaxKg, units)} · {record.sessions}{' '}
                        {record.sessions === 1 ? 'session' : 'sessions'}
                      </Text>
                    </Fill>
                    <Stack gap="xs" align="flex-end">
                      <Text variant="numeralSmall" color="pr">
                        {formatWeight(record.bestWeightKg, units)}
                      </Text>
                      <Text variant="caption" color="muted">
                        × {record.bestWeightReps}
                      </Text>
                    </Stack>
                  </Row>
                </Card>
              </Animated.View>
            ))}
          </Stack>
        </Stack>
      </Screen>
    );
  }

  if (workouts.length === 0) {
    return (
      <Screen tabBar title="History">
        {control}
        <EmptyState
          illustration={<StopwatchIllustration />}
          title="No workouts yet"
          body="Finished workouts stack up here with their volume, sets and records."
          action={{ title: 'Start a workout', onPress: () => router.navigate('/') }}
        />
      </Screen>
    );
  }

  const now = Date.now();
  const chart = weeklyVolume(workouts, now);
  const thisWeek = chart[chart.length - 1];
  const sessionsThisWeek = workouts.filter((workout) => workout.startedAt >= startOfWeek(now)).length;

  return (
    <Screen scroll tabBar title="History" subtitle={`${workouts.length} ${workouts.length === 1 ? 'workout' : 'workouts'}`}>
      <Stack gap="xl">
        {control}
        <Stack gap="lg">
          <Stack gap="xs">
            <Row gap="xs" align="baseline">
              <AnimatedNumber
                value={kgToUnit(thisWeek.value, units)}
                format={(value) => formatVolume(value, 'kg')}
                variant="numeral"
                style={styles.shrink}
              />
              <Text variant="heading" color="muted">
                {units}
              </Text>
            </Row>
            <Text variant="overline" color="muted">
              volume this week · {sessionsThisWeek} {sessionsThisWeek === 1 ? 'session' : 'sessions'}
            </Text>
          </Stack>
          <BarChart
            data={chart.map((datum) => ({ ...datum, value: kgToUnit(datum.value, units) }))}
            formatValue={(value) => `${formatVolume(value, 'kg')} ${units}`}
          />
        </Stack>

        <Section title="Sessions">
          <Stack gap="smd">
            {workouts.map((workout, index) => (
              <Animated.View
                key={workout.id}
                entering={reducedMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 30).springify().damping(18)}
              >
                <Card onPress={() => router.push(`/workout/${workout.id}`)}>
                  <Row gap="smd">
                    <Fill>
                      <Text variant="heading" numberOfLines={1}>
                        {workout.name}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {formatRelativeDate(workout.startedAt)} · {formatDuration(workout.finishedAt - workout.startedAt)} ·{' '}
                        {workout.setCount === 1 ? '1 set' : `${workout.setCount} sets`}
                      </Text>
                    </Fill>
                    <Stack gap="xs" align="flex-end">
                      <Text variant="numeralSmall">{formatVolume(workout.volumeKg, units)}</Text>
                      {workout.prCount > 0 ? (
                        <Row gap="xs">
                          <Icon name="trophy" size={12} color={colors.pr} />
                          <Text variant="caption" color="pr">
                            {workout.prCount} {workout.prCount === 1 ? 'PR' : 'PRs'}
                          </Text>
                        </Row>
                      ) : (
                        <Text variant="caption" color="muted">
                          {units}
                        </Text>
                      )}
                    </Stack>
                  </Row>
                </Card>
              </Animated.View>
            ))}
          </Stack>
        </Section>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
});
