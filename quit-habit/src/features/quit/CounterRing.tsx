import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CounterRingProps = {
  size: number;
  /** 0..1 of the way to the next milestone. */
  progress: number;
  /** Fill the ring with the primary color: the paywall and the plan step. */
  complete?: boolean;
  children?: ReactNode;
};

const STROKE = 12;

/** The hero: a ring that fills toward the next milestone, with the live counter inside. */
export function CounterRing({ size, progress, complete = false, children }: CounterRingProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const fill = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(1, Math.max(0, progress));
    fill.value = reducedMotion ? target : withSpring(target, { damping: 24, stiffness: 90 });
  }, [fill, progress, reducedMotion]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fill.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={colors.surfaceAlt} strokeWidth={STROKE} fill={colors.surface} />
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.primary}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={arcProps}
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* The next milestone sits at the top of the ring; gold once the ring is full. */}
        <Circle
          cx={center}
          cy={STROKE / 2}
          r={complete ? 9 : 7}
          fill={complete ? colors.accent : colors.surface}
          stroke={colors.accent}
          strokeWidth={3}
        />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
