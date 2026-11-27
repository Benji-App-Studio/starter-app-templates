import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { AnimatedNumber, Badge, Fill, Group, Icon, Row, Screen, Stack, Stat, Text } from '@/components';
import { deleteWorkout, getWorkoutSummary, type WorkoutSummary } from '@/db/workouts';
import { listWorkoutSets, type WorkoutSet } from '@/db/workoutSets';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { formatDuration, formatRelativeDate, formatSet, formatTime, formatVolume, kgToUnit } from './format';

type Block = { exerciseId: string; name: string; muscleGroup: string; sets: WorkoutSet[] };

function blocks(sets: WorkoutSet[]): Block[] {
  const map = new Map<number, Block>();
  for (const set of sets) {
    const block = map.get(set.exercisePosition) ?? {
      exerciseId: set.exerciseId,
      name: set.exerciseName,
      muscleGroup: set.muscleGroup,
      sets: [],
    };
    block.sets.push(set);
    map.set(set.exercisePosition, block);
  }
  return [...map.values()];
}

/** A finished workout: the summary numbers, every set, and the records it set. Also the post-finish screen. */
export function WorkoutDetailScreen() {
  const router = useRouter();
  const { id, celebrate } = useLocalSearchParams<{ id: string; celebrate?: string }>();
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const { units } = useAppState();
  const [workout, setWorkout] = useState<WorkoutSummary | null>();
  const [sets, setSets] = useState<WorkoutSet[]>([]);

  useEffect(() => {
    const workoutId = Number(id);
    Promise.all([getWorkoutSummary(workoutId), listWorkoutSets(workoutId)]).then(([summary, rows]) => {
      setWorkout(summary);
      setSets(rows);
    });
  }, [id]);

  function remove() {
    if (!workout) {
      return;
    }
    Alert.alert('Delete this workout?', 'Its sets and any records from it are removed from your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(workout.id);
          router.back();
        },
      },
    ]);
  }

  if (workout === undefined) {
    return <Screen onBack={() => router.back()}>{null}</Screen>;
  }
  if (workout === null) {
    return (
      <Screen onBack={() => router.back()} title="Workout">
        <Text color="muted">This workout is no longer here.</Text>
      </Screen>
    );
  }

  const records = sets.filter((set) => set.isPr);
  const groups = blocks(sets);

  return (
    <Screen
      scroll
      title={workout.name}
      subtitle={`${formatRelativeDate(workout.startedAt)} · ${formatTime(workout.startedAt)}`}
      onBack={() => router.back()}
    >
      <Stack gap="xl">
        <Stack gap="lg">
          <Stack gap="xs">
            {celebrate ? (
              <Text variant="overline" color="primary">
                Workout saved
              </Text>
            ) : null}
            <Row gap="xs" align="baseline">
              <AnimatedNumber
                value={kgToUnit(workout.volumeKg, units)}
                format={(value) => formatVolume(value, 'kg')}
                variant="numeral"
                style={styles.shrink}
              />
              <Text variant="heading" color="muted">
                {units}
              </Text>
            </Row>
            <Text variant="overline" color="muted">
              total volume
            </Text>
          </Stack>
          <Row gap="md">
            <Stat label="Time" value={formatDuration(workout.finishedAt - workout.startedAt)} style={styles.stat} />
            <Stat label="Sets" value={String(workout.setCount)} style={styles.stat} />
            <Stat label="Exercises" value={String(workout.exerciseCount)} style={styles.stat} />
            <Stat label="Records" value={String(workout.prCount)} tone={workout.prCount > 0 ? 'pr' : 'text'} style={styles.stat} />
          </Row>
        </Stack>

        {records.length > 0 ? (
          <Animated.View
            entering={reducedMotion ? undefined : FadeInDown.springify().damping(16)}
            style={[styles.records, { backgroundColor: colors.surface, borderColor: colors.pr, borderRadius: radii.lg, padding: spacing.md }]}
          >
            <Stack gap="sm">
              <Row gap="sm">
                <Icon name="trophy" size={18} color={colors.pr} />
                <Text variant="overline" color="pr">
                  {records.length === 1 ? 'New record' : `${records.length} new records`}
                </Text>
              </Row>
              {records.map((set) => (
                <Row key={set.id} gap="smd" justify="space-between">
                  <Text numberOfLines={1} style={styles.shrink}>
                    {set.exerciseName}
                  </Text>
                  <Text variant="numeralSmall" color="pr">
                    {formatSet(set.weightKg, set.reps, units)}
                  </Text>
                </Row>
              ))}
            </Stack>
          </Animated.View>
        ) : null}

        {groups.map((block) => (
          <Stack key={block.exerciseId + block.sets[0]?.id} gap="smd">
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Opens this exercise's history"
              onPress={() => router.push(`/exercise/${block.exerciseId}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Row gap="smd">
                <Fill>
                  <Text variant="heading" numberOfLines={1}>
                    {block.name}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {block.muscleGroup}
                  </Text>
                </Fill>
                <Icon name="forward" size={14} color={colors.textMuted} />
              </Row>
            </Pressable>
            <Group>
              {block.sets.map((set) => (
                <Row key={set.id} gap="smd" style={styles.setRow}>
                  <Text variant="caption" color="muted" style={styles.setNumber}>
                    {set.setNumber}
                  </Text>
                  <Text variant="numeralSmall" style={styles.setValue}>
                    {formatSet(set.weightKg, set.reps, units)}
                  </Text>
                  {set.isPr ? <Badge label="PR" tone="pr" /> : null}
                </Row>
              ))}
            </Group>
          </Stack>
        ))}

        <Pressable accessibilityRole="button" onPress={remove} style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.5 : 1 }]}>
          <Text variant="label" color="danger">
            Delete workout
          </Text>
        </Pressable>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shrink: { flexShrink: 1 },
  stat: { flex: 1, minWidth: 0 },
  records: { borderWidth: 1 },
  setRow: { minHeight: 48 },
  setNumber: { width: 24 },
  setValue: { flex: 1, minWidth: 0 },
  delete: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
});
