import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  count: number;
  /** Zero-based. */
  current: number;
};

/** Onboarding progress: a thin bar that springs forward with each step. */
export function ProgressDots({ count, current }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const progress = useSharedValue((current + 1) / count);

  useEffect(() => {
    progress.value = withSpring((current + 1) / count, { damping: 18, stiffness: 140 });
  }, [count, current, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      accessibilityLabel={`Step ${current + 1} of ${count}`}
      style={[styles.track, { backgroundColor: colors.border, borderRadius: radii.pill }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radii.pill }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, overflow: 'hidden' },
  fill: { height: 4 },
});
