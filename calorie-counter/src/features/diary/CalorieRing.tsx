import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

import type { Macros } from './target';
import type { Totals } from './totals';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SPRING = { damping: 18, stiffness: 110, mass: 1 };

type RingProps = {
  center: number;
  radius: number;
  stroke: number;
  color: string;
  track: string;
  /** 0..1; values above 1 fill the ring. */
  progress: number;
};

function Ring({ center, radius, stroke, color, track, progress }: RingProps) {
  const reduceMotion = useReducedMotion();
  const circumference = 2 * Math.PI * radius;
  const shown = useSharedValue(0);

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    shown.value = reduceMotion ? withTiming(clamped, { duration: 200 }) : withSpring(clamped, SPRING);
  }, [progress, reduceMotion, shown]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - shown.value),
    // A zero-length dash with round caps still draws a dot; hide it until there is progress.
    opacity: shown.value > 0.004 ? 1 : 0,
  }));

  return (
    <>
      <Circle cx={center} cy={center} r={radius} stroke={track} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        animatedProps={animatedProps}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </>
  );
}

type CalorieRingProps = {
  size: number;
  target: number;
  eaten: Totals;
  macroTargets: Macros;
  /** Drawn in the middle of the rings. */
  children?: ReactNode;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Ring radii for a given diameter. Strokes follow the size so a small ring keeps room for its number. */
function ringGeometry(size: number) {
  const outerStroke = clamp(size * 0.048, 8, 14);
  const innerStroke = clamp(size * 0.02, 3.5, 6);
  const gap = clamp(size * 0.017, 3, 5);
  const outerRadius = (size - outerStroke) / 2;
  const proteinRadius = outerRadius - outerStroke / 2 - gap - innerStroke / 2;
  const carbsRadius = proteinRadius - innerStroke - gap;
  const fatRadius = carbsRadius - innerStroke - gap;
  return { outerStroke, innerStroke, outerRadius, proteinRadius, carbsRadius, fatRadius, hole: (fatRadius - innerStroke / 2) * 2 };
}

/**
 * Type for the number in the middle of a ring of this size. A four-digit
 * number with its comma ("2,450") takes about 0.75 of the hole, so it never
 * touches the inner ring whatever the ring's size.
 */
export function ringNumeralStyle(size: number): TextStyle {
  const fontSize = Math.round(ringGeometry(size).hole * 0.29);
  return { fontSize, lineHeight: Math.round(fontSize * 1.08), letterSpacing: -fontSize * 0.04 };
}

/**
 * The hero: calories eaten against the target on the outer ring, protein,
 * carbs and fat on three thin rings inside it. Each ring springs to its new
 * value when a log is added or removed.
 */
export function CalorieRing({ size, target, eaten, macroTargets, children }: CalorieRingProps) {
  const { colors } = useTheme();
  const { outerStroke, innerStroke, outerRadius, proteinRadius, carbsRadius, fatRadius } = ringGeometry(size);
  const center = size / 2;
  const over = eaten.calories > target;

  return (
    <View
      accessibilityLabel={`${Math.round(eaten.calories)} of ${target} calories eaten`}
      style={[styles.root, { width: size, height: size }]}
    >
      <Svg width={size} height={size}>
        <Ring
          center={center}
          radius={outerRadius}
          stroke={outerStroke}
          color={over ? colors.danger : colors.primary}
          track={colors.border}
          progress={eaten.calories / target}
        />
        <Ring
          center={center}
          radius={proteinRadius}
          stroke={innerStroke}
          color={colors.protein}
          track={`${colors.protein}2E`}
          progress={eaten.protein / macroTargets.protein}
        />
        <Ring
          center={center}
          radius={carbsRadius}
          stroke={innerStroke}
          color={colors.carbs}
          track={`${colors.carbs}2E`}
          progress={eaten.carbs / macroTargets.carbs}
        />
        <Ring
          center={center}
          radius={fatRadius}
          stroke={innerStroke}
          color={colors.fat}
          track={`${colors.fat}2E`}
          progress={eaten.fat / macroTargets.fat}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
