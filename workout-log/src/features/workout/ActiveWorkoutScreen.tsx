import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import {
  Button,
  EmptyState,
  Icon,
  OptionSheet,
  ProgressBar,
  RackIllustration,
  Row,
  Screen,
  Stack,
  Stat,
  Text,
  type SheetOption,
} from '@/components';
import type { Exercise } from '@/db/exercises';
import { deleteWorkout, finishWorkout, getActiveWorkout, type Workout } from '@/db/workouts';
import {
  addWorkoutSet,
  deleteIncompleteSets,
  deleteWorkoutSet,
  findPersonalRecords,
  getBestWeights,
  listPreviousSets,
  listWorkoutSets,
  markPersonalRecords,
  removeExerciseFromWorkout,
  updateWorkoutSet,
  type SetValues,
  type WorkoutSet,
} from '@/db/workoutSets';
import { exercisePicks } from '@/features/exercises/exercisePicks';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { RestTimerSheet } from './RestTimerSheet';
import { CHECK_COLUMN, SET_COLUMN, SetRow } from './SetRow';
import { formatClock, formatSet, formatVolume, formatWeight } from './format';
import { useRestTimer } from './useRestTimer';

const DEFAULT_SETS = 3;

type ExerciseGroup = {
  position: number;
  exerciseId: string;
  name: string;
  muscleGroup: string;
  sets: WorkoutSet[];
};

type ExerciseAction = 'add-set' | 'remove-set' | 'remove-exercise';

function groupSets(sets: WorkoutSet[]): ExerciseGroup[] {
  const groups = new Map<number, ExerciseGroup>();
  for (const set of sets) {
    const group = groups.get(set.exercisePosition) ?? {
      position: set.exercisePosition,
      exerciseId: set.exerciseId,
      name: set.exerciseName,
      muscleGroup: set.muscleGroup,
      sets: [],
    };
    group.sets.push(set);
    groups.set(set.exercisePosition, group);
  }
  return [...groups.values()].sort((a, b) => a.position - b.position);
}

function exerciseActions(group: ExerciseGroup | undefined): SheetOption<ExerciseAction>[] {
  return [
    { id: 'add-set', label: 'Add a set', icon: 'plus' },
    ...((group?.sets.length ?? 0) > 1 ? [{ id: 'remove-set' as const, label: 'Remove last set', icon: 'minus' as const }] : []),
    { id: 'remove-exercise', label: 'Remove exercise', icon: 'trash', destructive: true },
  ];
}

/** The live set table: scrub weight and reps, check a set, rest, repeat. */
export function ActiveWorkoutScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const { units, restSeconds } = useAppState();
  const timer = useRestTimer();
  const [workout, setWorkout] = useState<Workout | null>();
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [previous, setPrevious] = useState<Record<string, SetValues[]>>({});
  const [bestBefore, setBestBefore] = useState<Record<string, number>>({});
  const [menuFor, setMenuFor] = useState<ExerciseGroup>();
  const [now, setNow] = useState(Date.now());
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    getActiveWorkout().then(async (active) => {
      if (!active) {
        setWorkout(null);
        return;
      }
      const [rows, best] = await Promise.all([listWorkoutSets(active.id), getBestWeights(active.id)]);
      const exerciseIds = [...new Set(rows.map((row) => row.exerciseId))];
      const history = await Promise.all(exerciseIds.map((id) => listPreviousSets(id, active.id)));
      setPrevious(Object.fromEntries(exerciseIds.map((id, index) => [id, history[index]])));
      setBestBefore(best);
      setSets(rows);
      setWorkout(active);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!workout) {
      return;
    }
    return exercisePicks.listen(async (picked: Exercise[]) => {
      let position = sets.reduce((max, set) => Math.max(max, set.exercisePosition), -1) + 1;
      const added: WorkoutSet[] = [];
      const history: Record<string, SetValues[]> = {};
      for (const exercise of picked) {
        history[exercise.id] = await listPreviousSets(exercise.id, workout.id);
        const count = Math.max(DEFAULT_SETS, history[exercise.id].length);
        for (let setNumber = 1; setNumber <= count; setNumber += 1) {
          added.push(await addWorkoutSet(workout.id, exercise.id, position, setNumber));
        }
        position += 1;
      }
      setPrevious((current) => ({ ...current, ...history }));
      setSets((current) => [...current, ...added]);
    });
  }, [sets, workout]);

  useEffect(() => {
    if (workout === null) {
      router.back();
    }
  }, [router, workout]);

  if (!workout) {
    return <Screen>{null}</Screen>;
  }

  // Narrowed once here; the handlers below close over the loaded workout.
  const current: Workout = workout;
  const groups = groupSets(sets);
  const doneCount = sets.filter((set) => set.completed).length;
  const volumeKg = sets.reduce((sum, set) => (set.completed ? sum + (set.weightKg ?? 0) * (set.reps ?? 0) : sum), 0);

  function patchSet(id: number, patch: Partial<SetValues> & { completed?: boolean }) {
    setSets((current) => current.map((set) => (set.id === id ? { ...set, ...patch } : set)));
    void updateWorkoutSet(id, patch);
  }

  // The same rule markPersonalRecords saves at finish. A badge can move to a later, heavier set.
  const records = findPersonalRecords(sets, bestBefore);

  function toggleSet(set: WorkoutSet) {
    if (set.completed) {
      void Haptics.selectionAsync();
      patchSet(set.id, { completed: false });
      return;
    }
    const hint = previous[set.exerciseId]?.[set.setNumber - 1];
    const weightKg = set.weightKg ?? hint?.weightKg ?? null;
    const reps = set.reps ?? hint?.reps ?? null;
    if (reps === null) {
      Alert.alert('How many reps?', 'Add the reps before checking the set off.');
      return;
    }
    const checked = { ...set, weightKg, reps, completed: true };
    patchSet(set.id, { weightKg, reps, completed: true });
    // The commit moment: a firm thud for a set, the success pattern when it is a record.
    const withChecked = sets.map((item) => (item.id === set.id ? checked : item));
    if (findPersonalRecords(withChecked, bestBefore).has(set.id)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    timer.start(restSeconds);
  }

  async function runAction(group: ExerciseGroup, action: ExerciseAction) {
    setMenuFor(undefined);
    if (action === 'add-set') {
      const added = await addWorkoutSet(current.id, group.exerciseId, group.position, group.sets.length + 1);
      setSets((current) => [...current, added]);
      return;
    }
    if (action === 'remove-set') {
      const last = group.sets[group.sets.length - 1];
      await deleteWorkoutSet(last.id);
      setSets((current) => current.filter((set) => set.id !== last.id));
      return;
    }
    await removeExerciseFromWorkout(current.id, group.position);
    setSets((current) => current.filter((set) => set.exercisePosition !== group.position));
  }

  function discard() {
    Alert.alert('Discard this workout?', 'Nothing from it will be saved.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(current.id);
          router.back();
        },
      },
    ]);
  }

  async function finish() {
    if (doneCount === 0) {
      Alert.alert('No sets checked off', 'Check a set when you finish it, or discard the workout.', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard workout', style: 'destructive', onPress: discard },
      ]);
      return;
    }
    setFinishing(true);
    timer.skip();
    await deleteIncompleteSets(current.id);
    await markPersonalRecords(current.id);
    await finishWorkout(current.id);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: '/workout/[id]', params: { id: String(current.id), celebrate: '1' } });
  }

  return (
    <>
      <Screen
        scroll
        title={current.name}
        onBack={discard}
        backIcon="close"
        headerRight={<Button title="Finish" variant="ghost" size="sm" onPress={finish} loading={finishing} />}
        footer={
          <Button
            title="Add exercise"
            icon="plus"
            variant="secondary"
            onPress={() => router.push({ pathname: '/exercise-picker', params: { exclude: '' } })}
          />
        }
        // While the rest sheet is up, the last set can still scroll above it.
        contentStyle={{ paddingBottom: timer.running ? spacing.xxl * 6 : spacing.lg }}
      >
        <Stack gap="xl">
          <Stack gap="smd">
            <Row gap="md">
              <Stat label="Time" value={formatClock(now - current.startedAt)} style={styles.stat} />
              <Stat label="Sets" value={`${doneCount}/${sets.length}`} tone={doneCount > 0 ? 'primary' : 'text'} style={styles.stat} />
              <Stat label="Volume" value={formatVolume(volumeKg, units)} unit={units} style={styles.stat} />
            </Row>
            <ProgressBar value={sets.length === 0 ? 0 : doneCount / sets.length} accessibilityLabel="Sets done" />
          </Stack>

          {groups.length === 0 ? (
            <EmptyState
              illustration={<RackIllustration size={96} />}
              title="Empty workout"
              body="Add an exercise and its sets appear here, ready to log."
            />
          ) : null}

          {groups.map((group) => {
            const last = previous[group.exerciseId] ?? [];
            const best = bestBefore[group.exerciseId];
            return (
              <Animated.View
                key={group.position}
                entering={reducedMotion ? undefined : FadeInDown.springify().damping(18)}
                exiting={reducedMotion ? undefined : FadeOut.duration(150)}
                layout={reducedMotion ? undefined : LinearTransition.springify().damping(18)}
              >
                <Stack gap="sm">
                  <Row gap="sm">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityHint="Opens this exercise's history"
                      onPress={() => router.push(`/exercise/${group.exerciseId}`)}
                      style={({ pressed }) => [styles.exerciseTitle, { gap: spacing.xs, opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text variant="heading" numberOfLines={1}>
                        {group.name}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {last.length > 0
                          ? `Last time ${last.map((set) => formatSet(set.weightKg, set.reps, units)).join(', ')}`
                          : `${group.muscleGroup} · first time`}
                      </Text>
                    </Pressable>
                    {best ? (
                      <Stack gap="xs" align="flex-end">
                        <Text variant="overline" color="muted">
                          Best
                        </Text>
                        <Text variant="label" color="pr" numberOfLines={1}>
                          {formatWeight(best, units)}
                        </Text>
                      </Stack>
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${group.name} options`}
                      onPress={() => setMenuFor(group)}
                      style={({ pressed }) => [styles.more, { opacity: pressed ? 0.5 : 1 }]}
                    >
                      <Icon name="more" size={20} color={colors.textMuted} />
                    </Pressable>
                  </Row>

                  <View style={[styles.columns, { gap: spacing.sm, paddingHorizontal: spacing.xs }]}>
                    <Text variant="overline" color="muted" align="center" style={styles.colSet}>
                      Set
                    </Text>
                    <Text variant="overline" color="muted" align="center" style={styles.colField}>
                      {units}
                    </Text>
                    <Text variant="overline" color="muted" align="center" style={styles.colField}>
                      Reps
                    </Text>
                    <View style={styles.colCheck} />
                  </View>

                  <Stack gap="xs">
                    {group.sets.map((set) => (
                      <SetRow
                        key={set.id}
                        set={set}
                        previous={last[set.setNumber - 1]}
                        units={units}
                        isRecord={records.has(set.id)}
                        onChange={(patch) => patchSet(set.id, patch)}
                        onToggle={() => toggleSet(set)}
                      />
                    ))}
                  </Stack>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add a set to ${group.name}`}
                    onPress={() => runAction(group, 'add-set')}
                    style={({ pressed }) => [
                      styles.addSet,
                      { gap: spacing.sm, borderRadius: radii.md, borderColor: colors.border, opacity: pressed ? 0.5 : 1 },
                    ]}
                  >
                    <Icon name="plus" size={14} color={colors.textMuted} />
                    <Text variant="label" color="muted">
                      Add set
                    </Text>
                  </Pressable>
                </Stack>
              </Animated.View>
            );
          })}
        </Stack>
      </Screen>

      <RestTimerSheet timer={timer} />

      <OptionSheet
        visible={menuFor !== undefined}
        title={menuFor?.name ?? ''}
        options={exerciseActions(menuFor)}
        onSelect={(action) => {
          if (menuFor) {
            void runAction(menuFor, action);
          }
        }}
        onDismiss={() => setMenuFor(undefined)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stat: { flex: 1, minWidth: 0 },
  exerciseTitle: { flex: 1, minWidth: 0 },
  more: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  columns: { flexDirection: 'row', alignItems: 'center' },
  colSet: { width: SET_COLUMN },
  colField: { flex: 1 },
  colCheck: { width: CHECK_COLUMN },
  addSet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 44, borderWidth: 1, borderStyle: 'dashed' },
});
