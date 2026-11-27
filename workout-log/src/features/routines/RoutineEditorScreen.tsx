import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Button, Card, Fill, Icon, Row, Screen, Scrubber, Stack, Text } from '@/components';
import type { Exercise, MuscleGroup } from '@/db/exercises';
import { listRoutineExercises, replaceRoutineExercises } from '@/db/routineExercises';
import { createRoutine, deleteRoutine, getRoutine, renameRoutine } from '@/db/routines';
import { exercisePicks } from '@/features/exercises/exercisePicks';
import { useTheme } from '@/theme/theme';

const DEFAULT_SETS = 3;

type Draft = { exerciseId: string; name: string; muscleGroup: MuscleGroup; targetSets: number };

type RoutineEditorScreenProps = {
  /** Undefined when creating a routine. */
  routineId?: number;
};

export function RoutineEditorScreen({ routineId }: RoutineEditorScreenProps) {
  const router = useRouter();
  const { colors, spacing, typography } = useTheme();
  const reducedMotion = useReducedMotion();
  const [name, setName] = useState('');
  const [items, setItems] = useState<Draft[]>([]);
  const [loaded, setLoaded] = useState(routineId === undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (routineId === undefined) {
      return;
    }
    Promise.all([getRoutine(routineId), listRoutineExercises(routineId)]).then(([routine, exercises]) => {
      setName(routine?.name ?? '');
      setItems(
        exercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          name: exercise.exerciseName,
          muscleGroup: exercise.muscleGroup,
          targetSets: exercise.targetSets,
        })),
      );
      setLoaded(true);
    });
  }, [routineId]);

  useEffect(
    () =>
      exercisePicks.listen((picked: Exercise[]) => {
        setItems((current) => [
          ...current,
          ...picked
            .filter((exercise) => !current.some((item) => item.exerciseId === exercise.id))
            .map((exercise) => ({
              exerciseId: exercise.id,
              name: exercise.name,
              muscleGroup: exercise.muscleGroup,
              targetSets: DEFAULT_SETS,
            })),
        ]);
      }),
    [],
  );

  const canSave = name.trim().length > 0 && items.length > 0 && !saving;

  async function handleSave() {
    setSaving(true);
    try {
      const id = routineId ?? (await createRoutine(name)).id;
      if (routineId !== undefined) {
        await renameRoutine(id, name);
      }
      await replaceRoutineExercises(
        id,
        items.map((item) => ({ exerciseId: item.exerciseId, targetSets: item.targetSets })),
      );
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (routineId === undefined) {
      return;
    }
    Alert.alert('Delete this routine?', 'Past workouts logged from it stay in your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRoutine(routineId);
          router.back();
        },
      },
    ]);
  }

  function openPicker() {
    router.push({ pathname: '/exercise-picker', params: { exclude: items.map((item) => item.exerciseId).join(',') } });
  }

  const totalSets = items.reduce((sum, item) => sum + item.targetSets, 0);

  return (
    <Screen
      scroll
      title={routineId === undefined ? 'New routine' : 'Edit routine'}
      subtitle={items.length > 0 ? `${items.length} exercises · ${totalSets} sets` : undefined}
      onBack={() => router.back()}
      headerRight={<Button title="Save" variant="ghost" size="sm" onPress={handleSave} disabled={!canSave} />}
      footer={<Button title="Add exercises" icon="plus" variant="secondary" onPress={openPicker} />}
    >
      {loaded ? (
        <Stack gap="lg">
          <TextInput
            accessibilityLabel="Routine name"
            value={name}
            onChangeText={setName}
            placeholder="Routine name"
            placeholderTextColor={colors.textMuted}
            autoFocus={routineId === undefined}
            returnKeyType="done"
            maxLength={40}
            maxFontSizeMultiplier={1.3}
            style={[
              styles.nameInput,
              typography.titleInput,
              { color: colors.text, borderBottomColor: colors.border, paddingVertical: spacing.sm },
            ]}
          />

          {items.length === 0 ? (
            <Text color="muted">Add the exercises in the order you do them. Three sets each to start.</Text>
          ) : (
            <Stack gap="smd">
              {items.map((item, index) => (
                <Animated.View
                  key={item.exerciseId}
                  entering={reducedMotion ? undefined : FadeInDown.springify().damping(18)}
                  exiting={reducedMotion ? undefined : FadeOut.duration(150)}
                  layout={reducedMotion ? undefined : LinearTransition.springify().damping(18)}
                >
                  <Card>
                    <Stack gap="md">
                      <Row gap="smd">
                        <Text variant="numeralSmall" color="muted" style={styles.index}>
                          {index + 1}
                        </Text>
                        <Fill>
                          <Text variant="heading" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text variant="caption" color="muted" numberOfLines={1}>
                            {item.muscleGroup}
                          </Text>
                        </Fill>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${item.name}`}
                          onPress={() => setItems((current) => current.filter((candidate) => candidate !== item))}
                          style={({ pressed }) => [styles.remove, { opacity: pressed ? 0.4 : 1 }]}
                        >
                          <Icon name="close" size={16} color={colors.textMuted} />
                        </Pressable>
                      </Row>
                      <Row gap="md" justify="space-between">
                        <Text variant="label" color="muted">
                          Sets
                        </Text>
                        <View style={styles.scrubber}>
                          <Scrubber
                            value={item.targetSets}
                            step={1}
                            min={1}
                            max={10}
                            accessibilityLabel={`${item.name} sets`}
                            onChange={(next) =>
                              setItems((current) =>
                                current.map((candidate) =>
                                  candidate === item ? { ...candidate, targetSets: next ?? 1 } : candidate,
                                ),
                              )
                            }
                          />
                        </View>
                      </Row>
                    </Stack>
                  </Card>
                </Animated.View>
              ))}
            </Stack>
          )}

          {routineId !== undefined ? (
            <Pressable
              accessibilityRole="button"
              onPress={handleDelete}
              style={({ pressed }) => [styles.delete, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Text variant="label" color="danger">
                Delete routine
              </Text>
            </Pressable>
          ) : null}
        </Stack>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameInput: { borderBottomWidth: 1 },
  index: { width: 28 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  scrubber: { width: 140 },
  delete: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
});
