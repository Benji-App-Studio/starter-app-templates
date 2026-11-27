import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { mixColors, useTheme } from '@/theme/theme';

type PlantProps = {
  /** 0 seed, 1 sprout, 2 bud, 3 bloom, 4 garden. */
  stage: number;
  size?: number;
};

const STEM_TOP = [70, 58, 44, 34, 32];

function Leaf({ x, y, angle, length, color }: { x: number; y: number; angle: number; length: number; color: string }) {
  const l = length;
  return (
    <G transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Path
        d={`M 0 0 C ${l * 0.3} ${-l * 0.45} ${l * 0.85} ${-l * 0.4} ${l} 0 C ${l * 0.85} ${l * 0.4} ${l * 0.3} ${l * 0.45} 0 0 Z`}
        fill={color}
      />
    </G>
  );
}

function Flower({ x, y, radius, petal, heart }: { x: number; y: number; radius: number; petal: string; heart: string }) {
  return (
    <G>
      {[0, 72, 144, 216, 288].map((degrees) => {
        const angle = ((degrees - 90) * Math.PI) / 180;
        return (
          <Circle key={degrees} cx={x + Math.cos(angle) * radius} cy={y + Math.sin(angle) * radius} r={radius} fill={petal} />
        );
      })}
      <Circle cx={x} cy={y} r={radius * 0.72} fill={heart} />
    </G>
  );
}

/**
 * The companion that grows with the streak, drawn in SVG: a seed in a pot,
 * then a sprout, a bud, a flower and a small garden. It springs up a little
 * each time it reaches a new stage.
 */
export function Plant({ stage, size = 72 }: PlantProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const grow = useSharedValue(1);
  const level = Math.max(0, Math.min(4, stage));

  useEffect(() => {
    if (reducedMotion) {
      grow.value = withSequence(withTiming(0.6, { duration: 0 }), withTiming(1, { duration: 220 }));
      return;
    }
    grow.value = withSequence(withTiming(0.82, { duration: 0 }), withSpring(1, { damping: 9, stiffness: 160 }));
  }, [grow, level, reducedMotion]);

  const growStyle = useAnimatedStyle(() =>
    reducedMotion ? { opacity: grow.value } : { transform: [{ scaleY: grow.value }, { scaleX: 0.5 + grow.value / 2 }] },
  );

  const top = STEM_TOP[level];
  const rim = mixColors(colors.pot, colors.shade, 0.12);
  const soil = mixColors(colors.pot, colors.shade, 0.4);
  const leafDark = mixColors(colors.leaf, colors.shade, 0.18);

  return (
    <View style={{ width: size, height: size }} accessibilityLabel="Your streak plant">
      <Animated.View style={[StyleSheet.absoluteFill, styles.origin, growStyle]}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {level === 0 ? <Ellipse cx={50} cy={67} rx={4.5} ry={3.2} fill={leafDark} /> : null}
          {level > 0 ? (
            <Path
              d={`M 50 70 C 47 ${70 - (70 - top) * 0.4} 53 ${70 - (70 - top) * 0.7} 50 ${top}`}
              stroke={leafDark}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          ) : null}
          {level === 1 ? (
            <>
              <Leaf x={50} y={60} angle={-155} length={11} color={colors.leaf} />
              <Leaf x={50} y={60} angle={-25} length={11} color={colors.leaf} />
            </>
          ) : null}
          {level >= 2 ? (
            <>
              <Leaf x={50} y={62} angle={-160} length={14} color={colors.leaf} />
              <Leaf x={50} y={58} angle={-22} length={14} color={colors.leaf} />
              <Leaf x={50} y={50} angle={-150} length={10} color={leafDark} />
            </>
          ) : null}
          {level === 2 ? <Ellipse cx={50} cy={40} rx={5} ry={6.5} fill={colors.primary} /> : null}
          {level >= 3 ? <Flower x={50} y={top - 2} radius={6} petal={colors.primary} heart={colors.mood[3]} /> : null}
          {level === 4 ? (
            <>
              <Path d="M 50 56 C 58 54 64 50 68 42" stroke={leafDark} strokeWidth={2.5} strokeLinecap="round" fill="none" />
              <Leaf x={58} y={53} angle={-70} length={9} color={colors.leaf} />
              <Flower x={69} y={39} radius={4} petal={colors.mood[4]} heart={colors.mood[3]} />
              <Path d="M 50 60 C 44 58 38 54 34 47" stroke={leafDark} strokeWidth={2.5} strokeLinecap="round" fill="none" />
              <Ellipse cx={33} cy={44} rx={3.5} ry={4.5} fill={colors.mood[0]} />
            </>
          ) : null}
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Ellipse cx={50} cy={70.5} rx={19} ry={3} fill={soil} />
        <Path d="M 31 74 L 69 74 L 64 96 Q 63.4 98 61 98 L 39 98 Q 36.6 98 36 96 Z" fill={colors.pot} />
        <Rect x={27} y={67} width={46} height={8} rx={3} fill={rim} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // The plant grows up out of the pot, so it scales from the soil line.
  origin: { transformOrigin: '50% 70%' },
});
