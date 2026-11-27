import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1 */
  progress: number;
  color?: string;
  height?: number;
  accessibilityLabel?: string;
};

/** A thin track whose fill springs to the new value. */
export function ProgressBar({ progress, color, height = 4, accessibilityLabel }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const width = useSharedValue(progress);

  useEffect(() => {
    const clamped = Math.min(1, Math.max(0, progress));
    width.value = reducedMotion ? clamped : withSpring(clamped, { damping: 18, stiffness: 160 });
  }, [progress, reducedMotion, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[styles.track, { height, borderRadius: radii.pill, backgroundColor: colors.surfaceStrong }]}
    >
      <Animated.View
        style={[styles.fill, { borderRadius: radii.pill, backgroundColor: color ?? colors.primary }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
