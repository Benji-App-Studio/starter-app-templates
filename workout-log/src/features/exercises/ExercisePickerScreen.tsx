import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Fill, Group, Icon, OptionSheet, Screen, Section, Stack, Text } from '@/components';
import { createCustomExercise, listExercises, MUSCLE_GROUPS, type Exercise, type MuscleGroup } from '@/db/exercises';
import { useTheme } from '@/theme/theme';

import { exercisePicks } from './exercisePicks';

/** Multi-select list of the exercise library, grouped by muscle, with search and "create your own". */
export function ExercisePickerScreen() {
  const router = useRouter();
  const { exclude } = useLocalSearchParams<{ exclude?: string }>();
  const { colors, radii, spacing, typography } = useTheme();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Exercise[]>([]);
  const [creating, setCreating] = useState(false);
  const excluded = useMemo(() => new Set((exclude ?? '').split(',').filter(Boolean)), [exclude]);

  useEffect(() => {
    listExercises().then(setExercises);
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = exercises.filter((exercise) => exercise.name.toLowerCase().includes(needle));
  const groups = MUSCLE_GROUPS.map((group) => ({
    group,
    exercises: visible.filter((exercise) => exercise.muscleGroup === group),
  })).filter((entry) => entry.exercises.length > 0);
  const exactMatch = exercises.some((exercise) => exercise.name.toLowerCase() === needle);

  function toggle(exercise: Exercise) {
    void Haptics.selectionAsync();
    setSelected((current) =>
      current.some((candidate) => candidate.id === exercise.id)
        ? current.filter((candidate) => candidate.id !== exercise.id)
        : [...current, exercise],
    );
  }

  async function createExercise(group: MuscleGroup) {
    setCreating(false);
    const exercise = await createCustomExercise(query, group);
    setExercises((current) => [...current, exercise]);
    setSelected((current) => [...current, exercise]);
    setQuery('');
  }

  function confirm() {
    exercisePicks.publish(selected);
    router.back();
  }

  return (
    <Screen
      scroll
      title="Add exercises"
      onBack={() => router.back()}
      backIcon="close"
      footer={
        <Button
          title={selected.length === 0 ? 'Pick exercises' : `Add ${selected.length} ${selected.length === 1 ? 'exercise' : 'exercises'}`}
          onPress={confirm}
          disabled={selected.length === 0}
        />
      }
    >
      <Stack gap="lg">
        <View
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, gap: spacing.sm, paddingHorizontal: spacing.smd },
          ]}
        >
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            accessibilityLabel="Search exercises"
            value={query}
            onChangeText={setQuery}
            placeholder="Search or type a new exercise"
            placeholderTextColor={colors.textMuted}
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={[styles.searchInput, typography.input, { color: colors.text }]}
          />
        </View>

        {needle.length > 1 && !exactMatch ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setCreating(true)}
            style={({ pressed }) => [
              styles.create,
              { borderColor: colors.primary, borderRadius: radii.md, gap: spacing.sm, paddingHorizontal: spacing.md, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Icon name="plus" size={18} color={colors.accentText} />
            <Text variant="label" color="primary" numberOfLines={1} style={styles.shrink}>
              Create “{query.trim()}”
            </Text>
          </Pressable>
        ) : null}

        {groups.map((entry) => (
          <Section key={entry.group} title={entry.group}>
            <Group>
              {entry.exercises.map((exercise) => {
                const added = excluded.has(exercise.id);
                const isSelected = selected.some((candidate) => candidate.id === exercise.id);
                return (
                  <Pressable
                    key={exercise.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected, disabled: added }}
                    disabled={added}
                    onPress={() => toggle(exercise)}
                    style={({ pressed }) => [
                      styles.row,
                      { gap: spacing.smd, paddingVertical: spacing.smd, opacity: pressed ? 0.6 : added ? 0.45 : 1 },
                    ]}
                  >
                    <Fill>
                      <Text numberOfLines={1}>{exercise.name}</Text>
                      {exercise.isCustom ? (
                        <Text variant="caption" color="muted">
                          Your exercise
                        </Text>
                      ) : null}
                    </Fill>
                    {added ? (
                      <Text variant="caption" color="muted">
                        Added
                      </Text>
                    ) : (
                      <View
                        style={[
                          styles.check,
                          {
                            borderRadius: radii.pill,
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}
                      >
                        {isSelected ? <Icon name="check" size={13} color={colors.onPrimary} /> : null}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </Group>
          </Section>
        ))}

        {groups.length === 0 && needle.length <= 1 ? <Text color="muted">Loading exercises…</Text> : null}
      </Stack>

      <OptionSheet
        visible={creating}
        title={`Which muscle group is “${query.trim()}”?`}
        options={MUSCLE_GROUPS.map((group) => ({ id: group, label: group }))}
        onSelect={createExercise}
        onDismiss={() => setCreating(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', height: 48, borderWidth: 1 },
  searchInput: { flex: 1, height: 48 },
  create: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 48, borderWidth: 1, borderStyle: 'dashed' },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  check: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
