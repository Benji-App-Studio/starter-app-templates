import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1 */
  progress: number;
  height?: number;
  /** Fill color; defaults to the primary color. */
  color?: string;
};

/** A thin track whose fill springs to each new value. */
export function ProgressBar({ progress, height = 4, color }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const reducedMotion = useReducedMotion();
  const fill = useSharedValue(progress);

  useEffect(() => {
    const target = Math.min(1, Math.max(0, progress));
    fill.value = reducedMotion ? target : withSpring(target, { damping: 20, stiffness: 160 });
  }, [fill, progress, reducedMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={[styles.track, { height, backgroundColor: colors.border, borderRadius: radii.pill }]}
    >
      <Animated.View
        style={[styles.fill, fillStyle, { backgroundColor: color ?? colors.primary, borderRadius: radii.pill }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
