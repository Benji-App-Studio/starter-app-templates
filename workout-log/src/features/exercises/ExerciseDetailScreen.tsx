import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { EmptyState, Fill, Group, Icon, LineChart, PlatesIllustration, Row, Screen, Section, Stack, Stat, Text } from '@/components';
import { getExercise, type Exercise } from '@/db/exercises';
import { listExerciseSessions, type ExerciseSession } from '@/db/workoutSets';
import {
  estimateOneRepMax,
  formatRelativeDate,
  formatShortDate,
  formatWeightValue,
  kgToUnit,
} from '@/features/workout/format';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

const CHART_SESSIONS = 12;

/** One exercise over time: best set, estimated max, a line of every session's top weight. */
export function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const { units } = useAppState();
  const [exercise, setExercise] = useState<Exercise | null>();
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);

  useEffect(() => {
    if (!id) {
      return;
    }
    Promise.all([getExercise(id), listExerciseSessions(id)]).then(([found, history]) => {
      setExercise(found);
      setSessions(history);
    });
  }, [id]);

  if (exercise === undefined) {
    return <Screen onBack={() => router.back()}>{null}</Screen>;
  }
  if (exercise === null) {
    return (
      <Screen onBack={() => router.back()} title="Exercise">
        <Text color="muted">This exercise is no longer here.</Text>
      </Screen>
    );
  }

  const weighted = sessions.flatMap((session) => session.sets.filter((set) => set.weightKg !== null && (set.reps ?? 0) > 0));
  const best = weighted.reduce<(typeof weighted)[number] | undefined>(
    (top, set) => (top === undefined || (set.weightKg ?? 0) > (top.weightKg ?? 0) ? set : top),
    undefined,
  );
  const oneRepMax = weighted.reduce((max, set) => Math.max(max, estimateOneRepMax(set.weightKg ?? 0, set.reps ?? 0)), 0);
  const totalSets = sessions.reduce((sum, session) => sum + session.sets.length, 0);
  const chart = [...sessions]
    .reverse()
    .slice(-CHART_SESSIONS)
    .map((session) => ({
      label: formatShortDate(session.startedAt),
      value: kgToUnit(Math.max(0, ...session.sets.map((set) => set.weightKg ?? 0)), units),
    }));

  return (
    <Screen scroll title={exercise.name} subtitle={exercise.muscleGroup} onBack={() => router.back()}>
      {sessions.length === 0 ? (
        <EmptyState
          illustration={<PlatesIllustration size={96} />}
          title="No sets yet"
          body="Log this exercise in a workout and its best set, estimated max and every session show up here."
        />
      ) : (
        <Stack gap="xl">
          <Stack gap="lg">
            <Stack gap="xs">
              <Row gap="xs" align="baseline">
                <Text variant="numeral" color="pr" style={styles.shrink}>
                  {best ? formatWeightValue(best.weightKg ?? 0, units) : '–'}
                </Text>
                <Text variant="heading" color="muted">
                  {units}
                </Text>
              </Row>
              <Text variant="overline" color="muted">
                {best ? `heaviest set · ${best.reps} reps` : 'no weighted sets'}
              </Text>
            </Stack>
            <Row gap="md">
              <Stat label="Est. 1RM" value={oneRepMax > 0 ? formatWeightValue(oneRepMax, units) : '–'} unit={oneRepMax > 0 ? units : undefined} style={styles.stat} />
              <Stat label="Sessions" value={String(sessions.length)} style={styles.stat} />
              <Stat label="Sets" value={String(totalSets)} style={styles.stat} />
            </Row>
          </Stack>

          {chart.length > 1 ? (
            <Section title="Top set per session">
              <LineChart points={chart} formatValue={(value) => `${Math.round(value)} ${units}`} />
            </Section>
          ) : null}

          <Section title="Sessions">
            <Stack gap="smd">
              <Group>
                {sessions.map((session) => (
                  <Pressable
                    key={session.workoutId}
                    accessibilityRole="button"
                    onPress={() => router.push(`/workout/${session.workoutId}`)}
                    style={({ pressed }) => [
                      styles.session,
                      { gap: spacing.smd, paddingVertical: spacing.smd, opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <Fill>
                      <Text variant="label">{formatRelativeDate(session.startedAt)}</Text>
                      <Text variant="caption" color="muted" numberOfLines={2}>
                        {session.sets
                          .map(
                            (set) =>
                              `${set.weightKg === null ? '–' : formatWeightValue(set.weightKg, units)} × ${set.reps ?? '–'}${set.isPr ? ' PR' : ''}`,
                          )
                          .join('  ·  ')}
                      </Text>
                    </Fill>
                    <Icon name="forward" size={14} color={colors.textMuted} />
                  </Pressable>
                ))}
              </Group>
              <Text variant="caption" color="muted">
                Weights in {units}. Est. 1RM uses the Epley formula.
              </Text>
            </Stack>
          </Section>
        </Stack>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  stat: { flex: 1, minWidth: 0 },
  session: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
});
