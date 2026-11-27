import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Badge, Icon, Scrubber, Text } from '@/components';
import type { SetValues, WorkoutSet } from '@/db/workoutSets';
import type { WeightUnit } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { kgToUnit, unitToKg, WEIGHT_STEP } from './format';

/** Width of the set-number column; the PR badge takes the same slot. */
export const SET_COLUMN = 40;
/** The check button: a full 44 pt target. */
export const CHECK_COLUMN = 44;

type SetRowProps = {
  set: WorkoutSet;
  /** The matching set from the last session: shown faintly in the fields and used to fill blanks. */
  previous?: SetValues;
  units: WeightUnit;
  /** True once this set's weight beats the exercise's best before today. */
  isRecord: boolean;
  onChange: (patch: Partial<SetValues>) => void;
  onToggle: () => void;
};

function toUnit(kg: number | null | undefined, units: WeightUnit): number | null {
  return kg === null || kg === undefined ? null : Math.round(kgToUnit(kg, units) * 10) / 10;
}

/** One line of the live set table: number (or PR), weight, reps, done. */
export function SetRow({ set, previous, units, isRecord, onChange, onToggle }: SetRowProps) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const pop = useSharedValue(1);
  const mounted = useRef(false);

  useEffect(() => {
    // Pop only when the user checks the set, not when a resumed workout renders checked rows.
    const wasMounted = mounted.current;
    mounted.current = true;
    if (wasMounted && set.completed && !reducedMotion) {
      pop.value = withSequence(withSpring(1.18, { damping: 8, stiffness: 400 }), withSpring(1, { damping: 12, stiffness: 260 }));
    }
  }, [pop, reducedMotion, set.completed]);

  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInDown.springify().damping(18)}
      exiting={reducedMotion ? undefined : FadeOut.duration(120)}
      layout={reducedMotion ? undefined : LinearTransition.springify().damping(18)}
      style={[
        styles.row,
        {
          gap: spacing.sm,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.xs,
          borderRadius: radii.md,
          backgroundColor: set.completed ? colors.primarySoft : 'transparent',
        },
      ]}
    >
      <View
        style={styles.number}
        accessible
        accessibilityLabel={isRecord ? `Set ${set.setNumber}, personal record` : `Set ${set.setNumber}`}
      >
        {isRecord ? (
          <Animated.View entering={reducedMotion ? undefined : ZoomIn.springify().damping(9).stiffness(260)}>
            <Badge label="PR" tone="pr" width={SET_COLUMN} />
          </Animated.View>
        ) : (
          <Text variant="numeralSmall" color={set.completed ? 'primary' : 'muted'}>
            {set.setNumber}
          </Text>
        )}
      </View>
      <View style={styles.field}>
        <Scrubber
          value={toUnit(set.weightKg, units)}
          placeholder={toUnit(previous?.weightKg, units)}
          step={WEIGHT_STEP[units]}
          decimals={1}
          max={999}
          muted={set.completed}
          accessibilityLabel={`Set ${set.setNumber} weight in ${units}`}
          onChange={(next) => onChange({ weightKg: next === null ? null : unitToKg(next, units) })}
        />
      </View>
      <View style={styles.field}>
        <Scrubber
          value={set.reps}
          placeholder={previous?.reps}
          step={1}
          max={200}
          muted={set.completed}
          accessibilityLabel={`Set ${set.setNumber} reps`}
          onChange={(next) => onChange({ reps: next === null ? null : Math.round(next) })}
        />
      </View>
      <Animated.View style={checkStyle}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: set.completed }}
          accessibilityLabel={`Set ${set.setNumber} done`}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.check,
            {
              borderRadius: radii.md,
              backgroundColor: set.completed ? colors.primary : colors.surfaceRaised,
              borderColor: set.completed ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Icon name="check" size={18} color={set.completed ? colors.onPrimary : colors.textMuted} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  number: { width: SET_COLUMN, alignItems: 'center' },
  field: { flex: 1, minWidth: 0 },
  check: { width: CHECK_COLUMN, height: CHECK_COLUMN, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
