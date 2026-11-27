import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Badge, Fill, Icon, Row, Stack, Text } from '@/components';
import { CHECK_COLUMN, SET_COLUMN } from '@/features/workout/SetRow';
import { useTheme } from '@/theme/theme';

type PreviewSet = { weight: string; reps: string; done: boolean; record?: boolean };

const SETS: PreviewSet[] = [
  { weight: '60', reps: '8', done: true },
  { weight: '62.5', reps: '8', done: true, record: true },
  { weight: '62.5', reps: '8', done: false },
];

/**
 * The welcome step's hero: a slice of the live set table, so the first screen shows the
 * product rather than a picture of a barbell. Rows land one by one, the PR badge pops,
 * and the rest bar drains once.
 */
export function SetTablePreview() {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const rest = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      rest.value = 0.35;
      return;
    }
    rest.value = withDelay(900, withTiming(0.35, { duration: 4000, easing: Easing.linear }));
  }, [reducedMotion, rest]);

  const restStyle = useAnimatedStyle(() => ({ width: `${rest.value * 100}%` }));

  return (
    <View
      accessible
      accessibilityLabel="Bench press, three sets, the second one a personal record"
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.md },
      ]}
    >
      <Stack gap="smd">
        <Row gap="sm">
          <Fill>
            <Text variant="heading" numberOfLines={1}>
              Bench press
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              Last time 60 × 8, 60 × 8, 60 × 7
            </Text>
          </Fill>
          <Icon name="barbell" size={20} color={colors.textMuted} />
        </Row>
        <Stack gap="xs">
          {SETS.map((set, index) => (
            <Animated.View
              key={index}
              entering={reducedMotion ? undefined : FadeInDown.delay(150 + index * 140).springify().damping(16)}
              style={[
                styles.row,
                {
                  gap: spacing.sm,
                  padding: spacing.xs,
                  borderRadius: radii.md,
                  backgroundColor: set.done ? colors.primarySoft : 'transparent',
                },
              ]}
            >
              <View style={styles.number}>
                {set.record ? (
                  <Animated.View entering={reducedMotion ? undefined : ZoomIn.delay(700).springify().damping(9).stiffness(260)}>
                    <Badge label="PR" tone="pr" width={SET_COLUMN} />
                  </Animated.View>
                ) : (
                  <Text variant="numeralSmall" color={set.done ? 'primary' : 'muted'}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {[set.weight, set.reps].map((value, column) => (
                <View
                  key={column}
                  style={[styles.field, { backgroundColor: colors.surfaceRaised, borderColor: colors.border, borderRadius: radii.md }]}
                >
                  <Text variant="stepper" color={set.done ? 'muted' : 'text'}>
                    {value}
                  </Text>
                </View>
              ))}
              <View
                style={[
                  styles.check,
                  {
                    borderRadius: radii.md,
                    backgroundColor: set.done ? colors.primary : colors.surfaceRaised,
                    borderColor: set.done ? colors.primary : colors.border,
                  },
                ]}
              >
                <Icon name="check" size={18} color={set.done ? colors.onPrimary : colors.textMuted} />
              </View>
            </Animated.View>
          ))}
        </Stack>
        <Row gap="smd">
          <Text variant="overline" color="muted">
            Rest
          </Text>
          <View style={[styles.track, { backgroundColor: colors.surfaceRaised, borderRadius: radii.pill }]}>
            <Animated.View style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radii.pill }, restStyle]} />
          </View>
        </Row>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 360, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  number: { width: SET_COLUMN, alignItems: 'center' },
  field: { flex: 1, height: CHECK_COLUMN, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  check: { width: CHECK_COLUMN, height: CHECK_COLUMN, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 6, overflow: 'hidden' },
  fill: { height: '100%' },
});
