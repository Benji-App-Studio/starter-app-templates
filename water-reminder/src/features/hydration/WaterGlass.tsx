import { useEffect } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type WaterGlassProps = {
  /** 0 (empty) to 1 (full). Values above 1 are drawn full. */
  level: number;
  /** Width in points; the glass is 1.3× as tall. */
  size?: number;
  /** Bump this number to make the water slosh, e.g. after every logged drink. */
  sloshKey?: number;
  /** Shows the goal-reached badge. */
  success?: boolean;
  /** Quarter marks on the glass, for the screens where the level is read, not just shown. */
  marks?: boolean;
};

const AMBIENT_AMPLITUDE = 2.5;
const SLOSH_AMPLITUDE = 11;
const WAVE_SEGMENTS = 32;
const WAVE_FREQUENCY = 1.4;
const TWO_PI = Math.PI * 2;
const POUR_MS = 520;
/** Where each bubble rises (fraction of the width), its size and its phase offset. */
const BUBBLES = [
  { x: 0.36, r: 0.018, offset: 0 },
  { x: 0.58, r: 0.012, offset: 0.45 },
  { x: 0.47, r: 0.024, offset: 0.75 },
];

/**
 * The SVG path of a wave-topped body of water: a sine surface at `surfaceY`
 * closed down to the bottom of the glass. Runs on the UI thread every frame.
 */
function wavePath(width: number, height: number, surfaceY: number, amplitude: number, phase: number): string {
  'worklet';
  let d = `M 0 ${height} L 0 ${surfaceY}`;
  for (let i = 0; i <= WAVE_SEGMENTS; i += 1) {
    const x = (width / WAVE_SEGMENTS) * i;
    const y = surfaceY + Math.sin((x / width) * TWO_PI * WAVE_FREQUENCY + phase) * amplitude;
    d += ` L ${x} ${y}`;
  }
  return `${d} L ${width} ${height} Z`;
}

/**
 * The hero: a tumbler that fills to the day's level. The surface is a sine wave
 * that drifts quietly all day and sloshes when a drink is poured in, then
 * settles on a spring. Reduce Motion flattens the surface and fades between levels.
 */
export function WaterGlass({ level, size = 200, sloshKey = 0, success = false, marks = false }: WaterGlassProps) {
  const { colors, scheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const width = size;
  const height = size * 1.3;
  const rimY = height * 0.05;
  const baseY = height * 0.95;
  const inset = 4;
  const waterTop = rimY + inset * 2;
  const waterBottom = baseY - inset;

  const levelValue = useSharedValue(Math.min(1, Math.max(0, level)));
  const amplitude = useSharedValue(reducedMotion ? 0 : AMBIENT_AMPLITUDE);
  const phase = useSharedValue(0);
  // 0 → 1 drops the head of the stream from the rim to the surface, 1 → 2 drops its tail.
  const stream = useSharedValue(2);
  const bubbles = useSharedValue(0);

  useEffect(() => {
    const target = Math.min(1, Math.max(0, level));
    levelValue.value = reducedMotion
      ? withTiming(target, { duration: 350 })
      : withDelay(sloshKey > 0 ? POUR_MS * 0.4 : 0, withSpring(target, { damping: 15, stiffness: 60, mass: 1 }));
    // sloshKey changes with the level on every pour, so it is read here rather than watched.
  }, [level, reducedMotion, levelValue]);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(phase);
      amplitude.value = 0;
      return;
    }
    phase.value = withRepeat(withTiming(TWO_PI, { duration: 2800, easing: Easing.linear }), -1, false);
    bubbles.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1, false);
    return () => {
      cancelAnimation(phase);
      cancelAnimation(bubbles);
    };
  }, [reducedMotion, phase, amplitude, bubbles]);

  useEffect(() => {
    if (sloshKey === 0 || reducedMotion) {
      return;
    }
    stream.value = 0;
    stream.value = withTiming(2, { duration: POUR_MS, easing: Easing.in(Easing.quad) });
    amplitude.value = withDelay(
      POUR_MS * 0.45,
      withSequence(
        withTiming(SLOSH_AMPLITUDE, { duration: 90 }),
        withSpring(AMBIENT_AMPLITUDE, { damping: 5, stiffness: 42, mass: 1 }),
      ),
    );
  }, [sloshKey, reducedMotion, amplitude, stream]);

  const frontProps = useAnimatedProps(() => {
    const surfaceY = waterTop + (1 - levelValue.value) * (waterBottom - waterTop);
    return { d: wavePath(width, height, surfaceY, amplitude.value, phase.value) };
  });

  const backProps = useAnimatedProps(() => {
    const surfaceY = waterTop + (1 - levelValue.value) * (waterBottom - waterTop) - 4;
    return { d: wavePath(width, height, surfaceY, amplitude.value * 0.8, phase.value + Math.PI * 0.6) };
  });

  const streamWidth = Math.max(4, width * 0.05);
  const streamProps = useAnimatedProps(() => {
    const surfaceY = waterTop + (1 - levelValue.value) * (waterBottom - waterTop);
    const span = surfaceY - rimY;
    const head = rimY + span * Math.min(1, stream.value);
    const tail = rimY + span * Math.max(0, stream.value - 1);
    return { y: tail, height: Math.max(0, head - tail) };
  });

  // A slightly tapered tumbler with a rounded base.
  const left = width * 0.1;
  const right = width * 0.9;
  const baseLeft = width * 0.21;
  const baseRight = width * 0.79;
  const corner = width * 0.1;
  const glassPath = [
    `M ${left} ${rimY}`,
    `L ${right} ${rimY}`,
    `L ${baseRight + corner * 0.1} ${baseY - corner}`,
    `Q ${baseRight} ${baseY} ${baseRight - corner} ${baseY}`,
    `L ${baseLeft + corner} ${baseY}`,
    `Q ${baseLeft} ${baseY} ${baseLeft - corner * 0.1} ${baseY - corner}`,
    'Z',
  ].join(' ');

  const glassStroke = scheme === 'dark' ? '#5F7D91' : '#B9CFDD';
  const markColor = scheme === 'dark' ? 'rgba(255,255,255,0.32)' : 'rgba(15,42,61,0.18)';
  const highlight = scheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)';
  const badgeRadius = size * 0.11;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <ClipPath id="glass">
            <Path d={glassPath} />
          </ClipPath>
        </Defs>
        <Path d={glassPath} fill={colors.surfaceRaised} />
        <AnimatedPath animatedProps={backProps} fill={colors.secondary} opacity={scheme === 'dark' ? 0.9 : 0.55} clipPath="url(#glass)" />
        <AnimatedPath animatedProps={frontProps} fill={colors.primary} clipPath="url(#glass)" />
        {reducedMotion
          ? null
          : BUBBLES.map((bubble) => (
              <Bubble
                key={bubble.x}
                {...bubble}
                width={width}
                waterTop={waterTop}
                waterBottom={waterBottom}
                level={levelValue}
                clock={bubbles}
                color={scheme === 'dark' ? colors.text : colors.surface}
              />
            ))}
        <AnimatedRect
          animatedProps={streamProps}
          x={width * 0.5 - streamWidth / 2}
          width={streamWidth}
          rx={streamWidth / 2}
          fill={colors.primary}
          clipPath="url(#glass)"
        />
        {marks
          ? [0.25, 0.5, 0.75].map((mark) => {
              const y = waterTop + (1 - mark) * (waterBottom - waterTop);
              // The right wall runs from (right, rimY) to (baseRight, baseY); sit the mark just inside it.
              const wallX = right - ((y - rimY) / (baseY - rimY)) * (right - baseRight);
              const tick = mark === 0.5 ? width * 0.09 : width * 0.055;
              return (
                <Line
                  key={mark}
                  x1={wallX - 5 - tick}
                  x2={wallX - 5}
                  y1={y}
                  y2={y}
                  stroke={markColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        <Path
          d={`M ${left + inset * 3} ${rimY + inset * 4} L ${baseLeft + inset * 2} ${baseY - corner * 1.1}`}
          stroke={highlight}
          strokeWidth={inset}
          strokeLinecap="round"
          fill="none"
        />
        <Path d={glassPath} stroke={glassStroke} strokeWidth={3} strokeLinejoin="round" fill="none" />
        {success ? (
          <>
            <Circle cx={right - 2} cy={rimY + 2} r={badgeRadius} fill={colors.success} />
            <Path
              d={`M ${right - 2 - badgeRadius * 0.45} ${rimY + 2} l ${badgeRadius * 0.3} ${badgeRadius * 0.3} l ${badgeRadius * 0.6} -${badgeRadius * 0.6}`}
              stroke={colors.onPrimary}
              strokeWidth={badgeRadius * 0.22}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        ) : null}
      </Svg>
    </View>
  );
}

type BubbleProps = (typeof BUBBLES)[number] & {
  width: number;
  waterTop: number;
  waterBottom: number;
  level: SharedValue<number>;
  /** 0 → 1 on a loop; each bubble rises once per lap, offset from the others. */
  clock: SharedValue<number>;
  color: string;
};

/** One bubble drifting up through the water and fading at the surface. Hidden when the glass is nearly empty. */
function Bubble({ x, r, offset, width, waterTop, waterBottom, level, clock, color }: BubbleProps) {
  const animatedProps = useAnimatedProps(() => {
    const surfaceY = waterTop + (1 - level.value) * (waterBottom - waterTop);
    const t = (clock.value + offset) % 1;
    const depth = waterBottom - surfaceY;
    return {
      cy: waterBottom - 6 - t * Math.max(0, depth - 10),
      opacity: depth > 24 ? Math.sin(t * Math.PI) * 0.5 : 0,
    };
  });

  return <AnimatedCircle animatedProps={animatedProps} cx={width * x} r={width * r} fill={color} clipPath="url(#glass)" />;
}
