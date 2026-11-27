import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type BlobProps = {
  /** Colors the mix lends to the blob; the palette fills in when the mix is empty. */
  tints: string[];
  /** 0 resting, 1 a full mix playing. Drives how far the shape breathes. */
  energy: number;
  size: number;
  style?: StyleProp<ViewStyle>;
};

const POINTS = 7;
const LAYERS = [
  { seed: 0.0, scale: 1.0, dx: 0, dy: 0, opacity: 0.95 },
  { seed: 2.1, scale: 0.86, dx: -0.07, dy: 0.06, opacity: 0.8 },
  { seed: 4.4, scale: 0.78, dx: 0.08, dy: -0.05, opacity: 0.75 },
];

/** A closed Catmull-Rom curve through seven points that wobble with time. */
function blobPath(cx: number, cy: number, r: number, amp: number, t: number, seed: number): string {
  'worklet';
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < POINTS; i += 1) {
    const angle = (i / POINTS) * Math.PI * 2;
    const wobble = 0.6 * Math.sin(t + seed + i * 1.7) + 0.4 * Math.sin(t * 0.5 + seed * 0.37 + i * 2.9);
    const radius = r * (1 + amp * wobble);
    xs.push(cx + radius * Math.cos(angle));
    ys.push(cy + radius * Math.sin(angle));
  }
  let d = `M${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`;
  for (let i = 0; i < POINTS; i += 1) {
    const p0 = (i - 1 + POINTS) % POINTS;
    const p1 = i;
    const p2 = (i + 1) % POINTS;
    const p3 = (i + 2) % POINTS;
    const c1x = xs[p1] + (xs[p2] - xs[p0]) / 6;
    const c1y = ys[p1] + (ys[p2] - ys[p0]) / 6;
    const c2x = xs[p2] - (xs[p3] - xs[p1]) / 6;
    const c2y = ys[p2] - (ys[p3] - ys[p1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${xs[p2].toFixed(1)} ${ys[p2].toFixed(1)}`;
  }
  return `${d} Z`;
}

/**
 * The hero: three soft blobs that breathe behind the player. Each sound in the mix
 * lends a color; more sounds and playback make the shape breathe deeper and slower,
 * like someone falling asleep. With Reduce Motion on, the shape holds still and only fades.
 */
export function Blob({ tints, energy, size, style }: BlobProps) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const palette = tints.length > 0 ? tints : [colors.primaryDeep, colors.primary, colors.primaryDeep];

  const time = useSharedValue(0);
  // Radians per second: a slow breath when resting, slower and deeper when a mix plays.
  const speed = useSharedValue(0.9);
  const amp = useSharedValue(0.05);
  const pulse = useSharedValue(1);

  useEffect(() => {
    speed.set(withSpring(0.9 - energy * 0.35, { damping: 20, stiffness: 60 }));
    amp.set(withSpring(0.05 + energy * 0.09, { damping: 14, stiffness: 90 }));
    pulse.set(withSequence(withTiming(0.6, { duration: 160 }), withSpring(1, { damping: 12, stiffness: 120 })));
  }, [energy, palette.join(), amp, pulse, speed]);

  useFrameCallback((frame) => {
    if (reduceMotion || frame.timeSincePreviousFrame === null) {
      return;
    }
    time.set(time.get() + (frame.timeSincePreviousFrame / 1000) * speed.get());
  });

  const center = size / 2;
  const radius = size * 0.34;

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          {LAYERS.map((layer, index) => (
            <RadialGradient key={index} id={`blob-${index}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={palette[index % palette.length]} stopOpacity={1} />
              <Stop offset="0.7" stopColor={palette[index % palette.length]} stopOpacity={0.55} />
              <Stop offset="1" stopColor={palette[index % palette.length]} stopOpacity={0.05} />
            </RadialGradient>
          ))}
        </Defs>
        {LAYERS.map((layer, index) => (
          <BlobLayer
            key={index}
            index={index}
            cx={center + layer.dx * size}
            cy={center + layer.dy * size}
            r={radius * layer.scale}
            seed={layer.seed}
            baseOpacity={layer.opacity}
            time={time}
            amp={amp}
            pulse={pulse}
          />
        ))}
      </Svg>
    </View>
  );
}

type BlobLayerProps = {
  index: number;
  cx: number;
  cy: number;
  r: number;
  seed: number;
  baseOpacity: number;
  time: SharedValue<number>;
  amp: SharedValue<number>;
  pulse: SharedValue<number>;
};

function BlobLayer({ index, cx, cy, r, seed, baseOpacity, time, amp, pulse }: BlobLayerProps) {
  const animatedProps = useAnimatedProps(() => ({
    d: blobPath(cx, cy, r, amp.get(), time.get() + seed, seed),
    opacity: baseOpacity * pulse.get(),
  }));

  return <AnimatedPath animatedProps={animatedProps} fill={`url(#blob-${index})`} />;
}
