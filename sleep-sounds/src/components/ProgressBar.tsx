import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type ProgressBarProps = {
  /** 0..1 */
  progress: number;
  accessibilityLabel: string;
};

/** A thin track whose fill springs to the new value. */
export function ProgressBar({ progress, accessibilityLabel }: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const width = useSharedValue(progress);

  useEffect(() => {
    width.set(withSpring(progress, { damping: 18, stiffness: 140 }));
  }, [progress, width]);

  const fill = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
      style={{ height: 4, borderRadius: radii.pill, backgroundColor: colors.surfaceRaised }}
    >
      <Animated.View
        style={[fill, { height: 4, borderRadius: radii.pill, backgroundColor: colors.primary }]}
      />
    </View>
  );
}
