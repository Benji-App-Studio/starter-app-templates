import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0 to 1. */
  progress: number;
  height?: number;
};

/** A thin track with an animated fill, e.g. the step indicator at the top of onboarding. */
export function ProgressBar({ progress, height = 4 }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const width = useSharedValue(progress);

  useEffect(() => {
    width.value = reducedMotion
      ? withTiming(progress, { duration: 200 })
      : withSpring(progress, { damping: 20, stiffness: 160 });
  }, [progress, reducedMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(1, Math.max(0, width.value)) * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[styles.track, { height, backgroundColor: colors.border, borderRadius: radii.pill }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radii.pill }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  fill: { height: '100%' },
});
