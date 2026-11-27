import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const STROKE = 18;
const GAP = 14;

type TodayRingProps = {
  /** Habits due today; one ring segment each. */
  total: number;
  done: number;
  size?: number;
  /** Drawn in the middle of the ring. */
  children: ReactNode;
};

/**
 * The Today hero: one arc per habit due today, which fills with a spring as the habit is
 * checked off, and the whole ring gives a small pop on every completion. With nothing due,
 * a quiet dotted ring.
 */
export function TodayRing({ total, done, size = 240, children }: TodayRingProps) {
  const { colors, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const previousDone = useRef(done);

  useEffect(() => {
    if (done > previousDone.current && !reduceMotion) {
      scale.value = withSequence(
        withSpring(1.045, { damping: 10, stiffness: 320 }),
        withSpring(1, { damping: 14, stiffness: 180 }),
      );
    }
    previousDone.current = done;
  }, [done, reduceMotion, scale]);

  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = total > 1 ? GAP : 0;
  const slot = circumference / Math.max(total, 1);
  // Round caps extend each end by half the stroke, so the dash itself is shorter.
  const segment = Math.max(slot - gap - STROKE, 1);

  return (
    <Animated.View style={[{ width: size, height: size }, popStyle]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {total === 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.track}
              strokeWidth={STROKE}
              strokeDasharray={`2 ${STROKE + 6}`}
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            Array.from({ length: total }, (_, index) => (
              <Segment
                key={`${total}-${index}`}
                index={index}
                filled={index < done}
                center={size / 2}
                radius={radius}
                circumference={circumference}
                slot={slot}
                length={segment}
              />
            ))
          )}
        </G>
      </Svg>
      <View style={[styles.center, { gap: spacing.sm }]}>{children}</View>
    </Animated.View>
  );
}

type SegmentProps = {
  index: number;
  filled: boolean;
  center: number;
  radius: number;
  circumference: number;
  slot: number;
  length: number;
};

function Segment({ index, filled, center, radius, circumference, slot, length }: SegmentProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(filled ? 1 : 0);
  const offset = -(index * slot + STROKE / 2);

  useEffect(() => {
    const target = filled ? 1 : 0;
    fill.value = reduceMotion
      ? withTiming(target, { duration: 150 })
      : withSpring(target, { damping: 16, stiffness: 150, mass: 0.9 });
  }, [fill, filled, reduceMotion]);

  const fillProps = useAnimatedProps(() => ({
    strokeDasharray: `${Math.max(length * fill.value, 0.01)} ${circumference}`,
    opacity: fill.value < 0.02 ? 0 : 1,
  }));

  return (
    <>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        stroke={colors.track}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${length} ${circumference}`}
        strokeDashoffset={offset}
        fill="none"
      />
      <AnimatedCircle
        animatedProps={fillProps}
        cx={center}
        cy={center}
        r={radius}
        stroke={colors.primary}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDashoffset={offset}
        fill="none"
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
