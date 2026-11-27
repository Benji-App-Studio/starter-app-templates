import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type GoalDotsProps = {
  goal: number;
  done: number;
  size?: number;
  color?: string;
};

/** One dot per planned session; filled dots are finished. */
export function GoalDots({ goal, done, size = 10, color }: GoalDotsProps) {
  const { colors, radii, spacing } = useTheme();
  const fill = color ?? colors.primary;

  return (
    <Animated.View
      layout={LinearTransition}
      accessibilityLabel={`${Math.min(done, goal)} of ${goal} sessions`}
      style={[styles.row, { gap: size >= 14 ? spacing.sm : spacing.xs }]}
    >
      {Array.from({ length: goal }, (_, index) => {
        const filled = index < done;
        return (
          <Animated.View
            key={index}
            entering={FadeIn}
            style={{
              width: size,
              height: size,
              borderRadius: radii.pill,
              backgroundColor: filled ? fill : colors.surfaceStrong,
              borderWidth: filled ? 0 : 1,
              borderColor: colors.border,
            }}
          />
        );
      })}
      {done > goal ? (
        <View
          style={{
            paddingHorizontal: size / 2,
            height: size,
            borderRadius: radii.pill,
            backgroundColor: fill,
            justifyContent: 'center',
          }}
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
