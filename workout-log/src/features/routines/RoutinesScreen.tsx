import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, LinearTransition, useReducedMotion } from 'react-native-reanimated';

import { Button, Card, EmptyState, Fill, Icon, RackIllustration, Row, Screen, Section, Stack, Text } from '@/components';
import { listRoutines, type RoutineSummary } from '@/db/routines';
import { formatAgo } from '@/features/workout/format';
import { useBeginWorkout } from '@/features/workout/useBeginWorkout';
import { useTheme } from '@/theme/theme';

import { seedStarterRoutines } from './starterRoutines';

/** The routine that has waited longest. */
function upNext(routines: RoutineSummary[]): RoutineSummary | undefined {
  return [...routines].sort((a, b) => (a.lastPerformedAt ?? 0) - (b.lastPerformedAt ?? 0))[0];
}

export function RoutinesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const begin = useBeginWorkout();
  const [routines, setRoutines] = useState<RoutineSummary[]>();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      seedStarterRoutines()
        .then(listRoutines)
        .then((next) => {
          if (!cancelled) {
            setRoutines(next);
          }
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const addButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="New routine"
      hitSlop={8}
      onPress={() => router.push('/routine/new')}
      style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Icon name="plus" size={22} color={colors.accentText} />
    </Pressable>
  );

  if (!routines) {
    return <Screen tabBar title="Routines" headerRight={addButton}>{null}</Screen>;
  }

  if (routines.length === 0) {
    return (
      <Screen tabBar title="Routines" headerRight={addButton}>
        <EmptyState
          illustration={<RackIllustration />}
          title="No routines yet"
          body="A routine is the list of exercises and sets you repeat. Build your first one."
          action={{ title: 'New routine', onPress: () => router.push('/routine/new') }}
        />
      </Screen>
    );
  }

  const next = upNext(routines);

  return (
    <Screen scroll tabBar title="Routines" subtitle={`${routines.length} saved`} headerRight={addButton}>
      <Stack gap="xl">
        {next ? (
          <Card selected>
            <Stack gap="md">
              <Stack gap="xs">
                <Text variant="overline" color="primary">
                  Up next
                </Text>
                <Text variant="display" numberOfLines={2}>
                  {next.name}
                </Text>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {next.exerciseCount} exercises · {next.setCount} sets · {formatAgo(next.lastPerformedAt)}
                </Text>
              </Stack>
              <Button title={`Start ${next.name}`} icon="play" onPress={() => begin(next)} />
            </Stack>
          </Card>
        ) : null}

        <Section title="All routines">
          <Stack gap="smd">
            {routines.map((routine, index) => (
              <Animated.View
                key={routine.id}
                entering={reducedMotion ? undefined : FadeInDown.delay(index * 40).springify().damping(18)}
                layout={reducedMotion ? undefined : LinearTransition}
              >
                <Card onPress={() => router.push(`/routine/${routine.id}`)}>
                  <Row gap="smd">
                    <Fill>
                      <Text variant="heading" numberOfLines={1}>
                        {routine.name}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {routine.exerciseCount} exercises · {routine.setCount} sets · {formatAgo(routine.lastPerformedAt)}
                      </Text>
                    </Fill>
                    <Text variant="caption" color="muted">
                      Edit
                    </Text>
                    <Icon name="forward" size={14} color={colors.textMuted} />
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
  addButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
