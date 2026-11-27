import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';

type MeterBarProps = {
  /** 0..1; values above 1 fill the bar completely. */
  progress: number;
  color: string;
  height?: number;
};

/** A thin filled bar that springs to its new length. Used for budgets and category shares. */
export function MeterBar({ progress, color, height = 6 }: MeterBarProps) {
  const { colors, radii } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(0);
  const target = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    fill.value = reduceMotion
      ? target
      : withSpring(target, { damping: 20, stiffness: 140, overshootClamping: true });
  }, [fill, reduceMotion, target]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View style={[styles.track, { height, backgroundColor: colors.track, borderRadius: radii.pill }]}>
      <Animated.View style={[styles.fill, fillStyle, { backgroundColor: color, borderRadius: radii.pill }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
