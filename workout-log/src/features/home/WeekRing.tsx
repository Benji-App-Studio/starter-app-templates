import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { AnimatedNumber, Text } from '@/components';
import { useTheme } from '@/theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const GAP_DEGREES = 7;

type WeekRingProps = {
  /** Monday..Sunday: true when a workout was finished that day. */
  days: boolean[];
  goal: number;
  /** 0..6, highlights the current day's segment and letter. Omit for previews. */
  todayIndex?: number;
  size?: number;
  /** Text under the number, e.g. "this week". */
  caption?: string;
  /** Stagger the fill of each segment (first appearance, paywall). */
  stagger?: boolean;
};

function polar(cx: number, cy: number, r: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(radians), y: cy + r * Math.sin(radians) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const from = polar(cx, cy, r, start);
  const to = polar(cx, cy, r, end);
  return `M ${from.x} ${from.y} A ${r} ${r} 0 0 1 ${to.x} ${to.y}`;
}

/**
 * The home hero: seven arc segments, one per weekday, that fill in the accent on days
 * you trained, around the count of sessions this week against the goal.
 */
export function WeekRing({ days, goal, todayIndex, size = 260, caption = 'this week', stagger = false }: WeekRingProps) {
  const { colors, spacing } = useTheme();
  const strokeWidth = size * 0.065;
  const radius = size / 2 - strokeWidth / 2 - 2;
  const center = size / 2;
  const segment = 360 / 7;
  const count = days.filter(Boolean).length;
  const reached = count >= goal;

  return (
    <View style={{ alignItems: 'center', gap: spacing.sm }}>
      <View
        accessibilityRole="image"
        accessibilityLabel={`${count} of ${goal} sessions this week`}
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size}>
          {days.map((done, index) => {
            const start = index * segment + GAP_DEGREES / 2;
            const end = (index + 1) * segment - GAP_DEGREES / 2;
            const length = ((end - start) * Math.PI * radius) / 180;
            const d = arcPath(center, center, radius, start, end);
            return (
              <Segment
                key={index}
                d={d}
                length={length}
                done={done}
                delay={stagger ? index * 70 : 0}
                strokeWidth={strokeWidth}
                trackColor={index === todayIndex ? colors.border : colors.surfaceRaised}
                fillColor={colors.primary}
              />
            );
          })}
          {todayIndex !== undefined ? (
            <Circle
              {...polar(center, center, radius - strokeWidth, todayIndex * segment + segment / 2)}
              r={3}
              fill={days[todayIndex] ? colors.primary : colors.textMuted}
            />
          ) : null}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <View style={styles.countRow}>
            <AnimatedNumber value={count} variant="numeral" style={{ fontSize: size * 0.33, lineHeight: size * 0.33 }} />
            <Text variant="numeralSmall" color="muted" style={{ fontSize: size * 0.1, lineHeight: size * 0.12 }}>
              /{goal}
            </Text>
          </View>
          <Text variant="overline" color={reached ? 'primary' : 'muted'}>
            {reached ? 'goal reached' : caption}
          </Text>
        </View>
      </View>
      <View style={[styles.letters, { width: size * 0.78 }]}>
        {DAY_LETTERS.map((letter, index) => (
          <Text
            key={index}
            variant="caption"
            color={days[index] ? 'primary' : index === todayIndex ? 'text' : 'muted'}
            style={styles.letter}
          >
            {letter}
          </Text>
        ))}
      </View>
    </View>
  );
}

type SegmentProps = {
  d: string;
  length: number;
  done: boolean;
  delay: number;
  strokeWidth: number;
  trackColor: string;
  fillColor: string;
};

function Segment({ d, length, done, delay, strokeWidth, trackColor, fillColor }: SegmentProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(done && reducedMotion ? 1 : 0);

  useEffect(() => {
    const target = done ? 1 : 0;
    progress.value = reducedMotion ? target : withDelay(delay, withSpring(target, { damping: 16, stiffness: 110 }));
  }, [delay, done, progress, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
    opacity: progress.value === 0 ? 0 : 1,
  }));

  return (
    <>
      <Path d={d} stroke={trackColor} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
      <AnimatedPath
        d={d}
        stroke={fillColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${length} ${length}`}
        animatedProps={animatedProps}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'baseline' },
  letters: { flexDirection: 'row', justifyContent: 'space-between' },
  letter: { width: 16, textAlign: 'center' },
});
