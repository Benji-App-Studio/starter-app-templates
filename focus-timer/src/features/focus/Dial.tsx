import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Full turn of the dial, like a kitchen timer. */
export const DIAL_MAX_MINUTES = 60;
const DEGREES_PER_MINUTE = 360 / DIAL_MAX_MINUTES;

type DialProps = {
  /** Minutes shown by the wedge, 0..60. May be fractional while a session runs. */
  minutes: number;
  /** Drag to set. Off while a session runs, so the wedge only unwinds. */
  interactive?: boolean;
  /** Called with whole minutes (1..60) as the user turns the dial. */
  onChange?: (minutes: number) => void;
  /** Wedge color; the break uses the secondary color. */
  color?: string;
  size?: number;
  /** Rendered in the middle of the dial: the digits, the label. */
  children?: ReactNode;
};

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(max, Math.max(min, value));
}

/** Radius of the cap in the middle of a dial of this size; the digits sit on it, never on the wedge. */
export function dialHubRadius(size: number) {
  const scale = size / 300;
  const wedgeRadius = size / 2 - 6 - Math.max(18, 30 * scale);
  return wedgeRadius * 0.66;
}

/** SVG path of a wedge from 12 o'clock clockwise through `degrees`. */
function wedgePath(cx: number, cy: number, r: number, degrees: number) {
  'worklet';
  if (degrees <= 0.01) {
    return '';
  }
  if (degrees >= 359.99) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }
  const rad = (degrees * Math.PI) / 180;
  const x = cx + r * Math.sin(rad);
  const y = cy - r * Math.cos(rad);
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${degrees > 180 ? 1 : 0} 1 ${x} ${y} Z`;
}

/**
 * The hero: a kitchen-timer dial. Idle, you drag the knob around to set minutes,
 * one haptic click per minute. Running, the wedge unwinds toward zero.
 */
export function Dial({ minutes, interactive = false, onChange, color, size = 300, children }: DialProps) {
  const { colors } = useTheme();
  const reducedMotion = useReducedMotion();
  const wedgeColor = color ?? colors.primary;

  const center = size / 2;
  const outerRadius = center - 6;
  // The tick band, knob and hub scale with the dial so small previews keep the same proportions.
  const scale = size / 300;
  const wedgeRadius = outerRadius - Math.max(18, 30 * scale);
  const knobRadius = Math.max(8, 13 * scale);
  // A cap in the middle, like the knob of a kitchen timer.
  const hubRadius = dialHubRadius(size);

  const degrees = useSharedValue(minutes * DEGREES_PER_MINUTE);
  const dragging = useSharedValue(false);
  const lastAngle = useSharedValue(0);
  const lastMinute = useSharedValue(Math.round(minutes));

  useEffect(() => {
    if (dragging.value) {
      return;
    }
    const target = clamp(minutes, 0, DIAL_MAX_MINUTES) * DEGREES_PER_MINUTE;
    lastMinute.value = Math.round(minutes);
    if (reducedMotion) {
      degrees.value = target;
    } else if (interactive) {
      degrees.value = withSpring(target, { damping: 16, stiffness: 140 });
    } else {
      // Running: glide between one-second updates so the wedge unwinds smoothly.
      degrees.value = withTiming(target, { duration: 1000, easing: Easing.linear });
    }
  }, [minutes, interactive, reducedMotion, degrees, dragging, lastMinute]);

  function tick(minute: number) {
    void Haptics.selectionAsync();
    onChange?.(minute);
  }

  /** Letting go sets the length: a firmer click than the per-minute ticks. */
  function release() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function angleOf(x: number, y: number) {
    'worklet';
    const angle = (Math.atan2(x - center, center - y) * 180) / Math.PI;
    return angle < 0 ? angle + 360 : angle;
  }

  const pan = Gesture.Pan()
    .enabled(interactive)
    .minDistance(0)
    .onBegin((event) => {
      dragging.value = true;
      lastAngle.value = angleOf(event.x, event.y);
    })
    .onUpdate((event) => {
      const angle = angleOf(event.x, event.y);
      let delta = angle - lastAngle.value;
      if (delta > 180) {
        delta -= 360;
      } else if (delta < -180) {
        delta += 360;
      }
      lastAngle.value = angle;
      degrees.value = clamp(degrees.value + delta, DEGREES_PER_MINUTE, 360);
      const minute = Math.round(degrees.value / DEGREES_PER_MINUTE);
      if (minute !== lastMinute.value) {
        lastMinute.value = minute;
        scheduleOnRN(tick, minute);
      }
    })
    .onFinalize((_event, success) => {
      dragging.value = false;
      if (success) {
        scheduleOnRN(release);
      }
      const snapped = lastMinute.value * DEGREES_PER_MINUTE;
      degrees.value = reducedMotion ? snapped : withSpring(snapped, { damping: 18, stiffness: 220 });
    });

  const wedgeProps = useAnimatedProps(() => ({
    d: wedgePath(center, center, wedgeRadius, degrees.value),
  }));

  const knobProps = useAnimatedProps(() => {
    const rad = (degrees.value * Math.PI) / 180;
    return {
      cx: center + wedgeRadius * Math.sin(rad),
      cy: center - wedgeRadius * Math.cos(rad),
      opacity: degrees.value > 0.5 || interactive ? 1 : 0,
    };
  });

  const ticks = Array.from({ length: DIAL_MAX_MINUTES }, (_, index) => {
    const major = index % 5 === 0;
    const rad = (index * DEGREES_PER_MINUTE * Math.PI) / 180;
    const inner = outerRadius - Math.max(major ? 8 : 5, (major ? 16 : 9) * scale);
    return (
      <Line
        key={index}
        x1={center + inner * Math.sin(rad)}
        y1={center - inner * Math.cos(rad)}
        x2={center + outerRadius * Math.sin(rad)}
        y2={center - outerRadius * Math.cos(rad)}
        stroke={major ? colors.text : colors.textMuted}
        strokeOpacity={major ? 0.85 : 0.35}
        strokeWidth={Math.max(1, (major ? 2.5 : 1.5) * Math.min(1, scale + 0.2))}
        strokeLinecap="round"
      />
    );
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible={interactive}
        accessibilityRole={interactive ? 'adjustable' : undefined}
        accessibilityLabel={interactive ? 'Session length' : undefined}
        accessibilityValue={interactive ? { min: 1, max: DIAL_MAX_MINUTES, now: Math.round(minutes) } : undefined}
        accessibilityActions={interactive ? [{ name: 'increment' }, { name: 'decrement' }] : undefined}
        onAccessibilityAction={(event) => {
          const next = clamp(Math.round(minutes) + (event.nativeEvent.actionName === 'increment' ? 1 : -1), 1, DIAL_MAX_MINUTES);
          onChange?.(next);
        }}
        style={{ width: size, height: size }}
      >
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={wedgeRadius} fill={colors.surface} stroke={colors.border} strokeWidth={1.5} />
          {ticks}
          <AnimatedPath animatedProps={wedgeProps} fill={wedgeColor} />
          <Circle cx={center} cy={center} r={hubRadius} fill={colors.surface} stroke={colors.border} strokeWidth={1.5} />
          <AnimatedCircle
            animatedProps={knobProps}
            r={knobRadius}
            fill={colors.surface}
            stroke={wedgeColor}
            strokeWidth={Math.max(2.5, 4 * scale)}
          />
        </Svg>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center]}>
          <View style={[styles.center, { width: hubRadius * 1.8 }]}>{children}</View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
