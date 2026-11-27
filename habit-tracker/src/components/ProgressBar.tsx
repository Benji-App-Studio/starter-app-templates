import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1 */
  value: number;
  /** Fill color; defaults to the accent. */
  color?: string;
  height?: number;
  accessibilityLabel?: string;
};

/** A thin track that springs to its new value. */
export function ProgressBar({ value, color, height = 6, accessibilityLabel }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = withSpring(Math.min(1, Math.max(0, value)), { damping: 18, stiffness: 160 });
  }, [progress, value]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[styles.track, { height, borderRadius: radii.pill, backgroundColor: colors.border }]}
    >
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { borderRadius: radii.pill, backgroundColor: color ?? colors.primary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
