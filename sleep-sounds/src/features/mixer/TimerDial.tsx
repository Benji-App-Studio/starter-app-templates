import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

import { Text } from '@/components';
import { spacing, useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.View;

export const DIAL_MIN = 5;
export const DIAL_MAX = 120;
const STEP = 5;
/** Degrees the dial sweeps, leaving a gap at the bottom. */
const SWEEP_DEG = 300;
const START_DEG = -SWEEP_DEG / 2;
const STROKE = 10;
const KNOB = 28;

type TimerDialProps = {
  /** Minutes, or null when the timer is off (the dial shows the last value, dimmed). */
  minutes: number | null;
  onChange: (minutes: number) => void;
  size?: number;
};

function minutesToDegrees(minutes: number): number {
  'worklet';
  return START_DEG + ((minutes - DIAL_MIN) / (DIAL_MAX - DIAL_MIN)) * SWEEP_DEG;
}

function pointToMinutes(x: number, y: number, center: number): number {
  'worklet';
  // 0° at the top, clockwise positive, clamped to the sweep.
  let degrees = (Math.atan2(y - center, x - center) * 180) / Math.PI + 90;
  if (degrees > 180) {
    degrees -= 360;
  }
  const clamped = Math.min(SWEEP_DEG / 2, Math.max(START_DEG, degrees));
  const raw = DIAL_MIN + ((clamped - START_DEG) / SWEEP_DEG) * (DIAL_MAX - DIAL_MIN);
  return Math.round(raw / STEP) * STEP;
}

/**
 * A kitchen-timer dial. Drag anywhere on it to set the minutes; every five minutes clicks.
 */
export function TimerDial({ minutes, onChange, size = 260 }: TimerDialProps) {
  const { colors, radii, typography } = useTheme();
  const value = useSharedValue(minutes ?? 45);
  const knobScale = useSharedValue(1);
  const center = size / 2;
  const radius = center - KNOB / 2;
  const circumference = 2 * Math.PI * radius;
  const sweepLength = circumference * (SWEEP_DEG / 360);

  useEffect(() => {
    if (minutes !== null) {
      value.set(withSpring(minutes, { damping: 18, stiffness: 180 }));
    }
  }, [minutes, value]);

  function tick(next: number) {
    void Haptics.selectionAsync();
    onChange(next);
  }

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((event) => {
      knobScale.set(withSpring(1.25, { damping: 12, stiffness: 220 }));
      const next = pointToMinutes(event.x, event.y, center);
      if (next !== value.get()) {
        value.set(next);
        runOnJS(tick)(next);
      }
    })
    .onUpdate((event) => {
      const next = pointToMinutes(event.x, event.y, center);
      if (next !== value.get()) {
        value.set(next);
        runOnJS(tick)(next);
      }
    })
    .onFinalize(() => {
      knobScale.set(withSpring(1, { damping: 12, stiffness: 220 }));
    });

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: sweepLength * (1 - (value.get() - DIAL_MIN) / (DIAL_MAX - DIAL_MIN)),
  }));

  const knobStyle = useAnimatedStyle(() => {
    const angle = ((minutesToDegrees(value.get()) - 90) * Math.PI) / 180;
    return {
      transform: [
        { translateX: center + radius * Math.cos(angle) - KNOB / 2 },
        { translateY: center + radius * Math.sin(angle) - KNOB / 2 },
        { scale: knobScale.get() },
      ],
    };
  });

  const ticks = Array.from({ length: (DIAL_MAX - DIAL_MIN) / STEP + 1 }, (_, index) => {
    const major = index % 3 === 0;
    const angle = ((minutesToDegrees(DIAL_MIN + index * STEP) - 90) * Math.PI) / 180;
    const inner = radius - STROKE - (major ? 14 : 8);
    const outer = radius - STROKE - 4;
    return { key: index, major, angle, inner, outer };
  });

  return (
    <GestureDetector gesture={pan}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Sleep timer"
        accessibilityValue={{ text: minutes === null ? 'Off' : `${minutes} minutes` }}
        style={{ width: size, height: size, opacity: minutes === null ? 0.45 : 1 }}
      >
        <Svg width={size} height={size} style={styles.rotated}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.surfaceRaised}
            strokeWidth={STROKE}
            strokeDasharray={`${sweepLength} ${circumference}`}
            strokeLinecap="round"
            fill="none"
          />
          <AnimatedCircle
            animatedProps={arcProps}
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary}
            strokeWidth={STROKE}
            strokeDasharray={`${sweepLength} ${circumference}`}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          {ticks.map((mark) => (
            <Line
              key={mark.key}
              x1={center + mark.inner * Math.cos(mark.angle)}
              y1={center + mark.inner * Math.sin(mark.angle)}
              x2={center + mark.outer * Math.cos(mark.angle)}
              y2={center + mark.outer * Math.sin(mark.angle)}
              stroke={mark.major ? colors.textMuted : colors.border}
              strokeWidth={mark.major ? 2 : 1.5}
              strokeLinecap="round"
            />
          ))}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[typography.numeral, { fontSize: 64, lineHeight: 68 }]} tabular>
            {minutes === null ? '—' : minutes}
          </Text>
          <Text variant="label" color="muted">
            {minutes === null ? 'timer off' : 'minutes'}
          </Text>
        </View>
        <AnimatedView
          pointerEvents="none"
          style={[
            styles.knob,
            knobStyle,
            {
              width: KNOB,
              height: KNOB,
              borderRadius: radii.pill,
              backgroundColor: colors.text,
              borderColor: colors.background,
            },
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  // The dash starts at 3 o'clock; turning the ring puts the gap at the bottom.
  rotated: { transform: [{ rotate: '120deg' }] },
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  knob: { position: 'absolute', top: 0, left: 0, borderWidth: 3 },
});
