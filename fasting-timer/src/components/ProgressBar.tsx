import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1. */
  progress: number;
  accessibilityLabel: string;
};

/** A thin bar that springs to the new value. Used at the top of onboarding. */
export function ProgressBar({ progress, accessibilityLabel }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const width = useSharedValue(progress);

  useEffect(() => {
    width.set(withSpring(progress, { damping: 18, stiffness: 160 }));
  }, [progress, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { backgroundColor: colors.surfaceRaised, borderRadius: radii.pill }]}
    >
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radii.pill }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, overflow: 'hidden' },
  fill: { height: '100%' },
});
