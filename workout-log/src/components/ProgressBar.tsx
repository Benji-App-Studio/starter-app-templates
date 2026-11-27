import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1 */
  value: number;
  height?: number;
  accessibilityLabel?: string;
};

/** A thin track whose fill springs to the new value. */
export function ProgressBar({ value, height = 4, accessibilityLabel }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = reducedMotion ? value : withSpring(value, { damping: 18, stiffness: 140 });
  }, [progress, reducedMotion, value]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${Math.min(1, Math.max(0, progress.value)) * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[styles.track, { height, borderRadius: radii.pill, backgroundColor: colors.surfaceRaised }]}
    >
      <Animated.View style={[styles.fill, { borderRadius: radii.pill, backgroundColor: colors.primary }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
