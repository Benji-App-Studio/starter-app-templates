import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line } from 'react-native-svg';

import { spacing, useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type FastingRingProps = {
  size: number;
  /** 0..1 of the goal. Values above 1 keep the ring full. */
  progress: number;
  /** One tick per hour of the goal, around the outside. */
  goalHours: number;
  /** Lights the marker at the top gold. */
  reached: boolean;
  /** Dims the ring while nothing is running. */
  idle?: boolean;
  children?: ReactNode;
};

const STROKE = 14;
const TICK_GAP = 10;
const TICK_LENGTH = 7;
/** Share of the hole's diameter the centre labels may use. */
const HOLE_FILL = 0.84;
/** Below this size the centre labels sit closer together. */
const COMPACT_SIZE = 220;

/**
 * The hero: a ring that fills clockwise from the top as the fast runs. The arc
 * glows, hour ticks sit outside it, and the goal marker at twelve o'clock turns
 * gold once the goal is reached.
 */
export function FastingRing({
  size,
  progress,
  goalHours,
  reached,
  idle = false,
  children,
}: FastingRingProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const fill = useSharedValue(Math.min(progress, 1));
  const marker = useSharedValue(1);

  const padding = TICK_GAP + TICK_LENGTH + 2;
  const center = size / 2;
  const radius = center - padding - STROKE / 2;
  const circumference = 2 * Math.PI * radius;
  const holeBox = (radius - STROKE / 2) * 2 * HOLE_FILL;

  useEffect(() => {
    const target = Math.min(progress, 1);
    if (reducedMotion) {
      fill.set(target);
      return;
    }
    // Small steps are the one-second tick: glide linearly. Big steps (start, reset) spring.
    const isTick = Math.abs(target - fill.get()) < 0.02;
    fill.set(
      isTick
        ? withTiming(target, { duration: 1000, easing: Easing.linear })
        : withSpring(target, { damping: 20, stiffness: 90 }),
    );
  }, [progress, fill, reducedMotion]);

  useEffect(() => {
    if (reached && !reducedMotion) {
      marker.set(withSequence(withSpring(1.5, { damping: 8, stiffness: 220 }), withSpring(1)));
    }
  }, [reached, marker, reducedMotion]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fill.get()),
  }));
  const markerStyle = useAnimatedStyle(() => ({ transform: [{ scale: marker.get() }] }));

  const ticks = Array.from({ length: goalHours }, (_, index) => {
    const angle = (index / goalHours) * 2 * Math.PI - Math.PI / 2;
    const inner = radius + STROKE / 2 + TICK_GAP;
    const outer = inner + TICK_LENGTH;
    const passed = index / goalHours < Math.min(progress, 1) && !idle;
    return (
      <Line
        key={index}
        x1={center + inner * Math.cos(angle)}
        y1={center + inner * Math.sin(angle)}
        x2={center + outer * Math.cos(angle)}
        y2={center + outer * Math.sin(angle)}
        stroke={passed ? colors.primary : colors.border}
        strokeWidth={index % 6 === 0 ? 2.5 : 1.5}
        strokeLinecap="round"
      />
    );
  });

  const markerSize = STROKE + 10;
  const markerColor = reached ? colors.gold : idle ? colors.surfaceRaised : colors.background;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {ticks}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceRaised}
          strokeWidth={STROKE}
          fill="none"
        />
        <G rotation={-90} origin={`${center}, ${center}`}>
          <AnimatedCircle
            animatedProps={arcProps}
            cx={center}
            cy={center}
            r={radius}
            stroke={reached ? colors.gold : colors.primary}
            strokeOpacity={0.18}
            strokeWidth={STROKE * 1.9}
            strokeDasharray={`${circumference} ${circumference}`}
            // Butt ends: a round cap this wide reads as a blob at the start of the arc.
            strokeLinecap="butt"
            fill="none"
          />
          <AnimatedCircle
            animatedProps={arcProps}
            cx={center}
            cy={center}
            r={radius}
            stroke={reached ? colors.gold : colors.primary}
            strokeWidth={STROKE}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.marker,
          {
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            top: padding + STROKE / 2 - markerSize / 2,
            left: center - markerSize / 2,
            backgroundColor: markerColor,
            borderColor: reached ? colors.gold : colors.primary,
            shadowColor: colors.gold,
            shadowOpacity: reached ? 0.7 : 0,
          },
          markerStyle,
        ]}
      />
      {/* The labels live inside the hole (a square inscribed in it), so they never touch the arc or the marker. */}
      <View
        style={[styles.center, { inset: center - holeBox / 2, gap: size < COMPACT_SIZE ? spacing.xs : spacing.sm }]}
        pointerEvents="none"
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    borderWidth: 3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
