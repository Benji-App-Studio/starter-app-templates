import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

export type BreathPhase = 'in' | 'hold' | 'out';

/** Seconds per phase: a long, slow out-breath is what settles people. */
export const breathPhases: { phase: BreathPhase; seconds: number; label: string }[] = [
  { phase: 'in', seconds: 4, label: 'Breathe in' },
  { phase: 'hold', seconds: 4, label: 'Hold' },
  { phase: 'out', seconds: 6, label: 'Breathe out' },
];

export const BREATH_CYCLE_SECONDS = breathPhases.reduce((sum, step) => sum + step.seconds, 0);

type BreathingCircleProps = {
  size: number;
  phase: BreathPhase;
  /** Seconds left in this phase. */
  secondsLeft: number;
};

const SMALL = 0.58;

/** A circle that grows on the in-breath, rests, and shrinks on the out-breath. */
export function BreathingCircle({ size, phase, secondsLeft }: BreathingCircleProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(SMALL);
  const glow = useSharedValue(0.4);
  const step = breathPhases.find((candidate) => candidate.phase === phase) ?? breathPhases[0];

  useEffect(() => {
    const duration = step.seconds * 1000;
    const easing = Easing.inOut(Easing.sin);
    if (phase === 'in') {
      scale.value = reducedMotion ? 1 : withTiming(1, { duration, easing });
      glow.value = withTiming(1, { duration, easing });
    } else if (phase === 'out') {
      scale.value = reducedMotion ? SMALL : withTiming(SMALL, { duration, easing });
      glow.value = withTiming(0.4, { duration, easing });
    }
  }, [glow, phase, reducedMotion, scale, step.seconds]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[styles.layer, haloStyle]}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={center - 2} stroke={colors.primarySoft} strokeWidth={3} fill="none" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.layer, circleStyle]}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={center - 14} fill={colors.primary} />
        </Svg>
      </Animated.View>
      <View style={styles.layer}>
        <Text variant="heading" color="onPrimary">
          {step.label}
        </Text>
        <Text variant="numeralSmall" color="onPrimary" tabular>
          {secondsLeft}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
