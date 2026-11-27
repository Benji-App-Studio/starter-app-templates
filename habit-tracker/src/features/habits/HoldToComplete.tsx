import * as Haptics from 'expo-haptics';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** How long a hold takes to commit. The ring fills over exactly this time. */
export const HOLD_MS = 600;

/** Haptic ticks rise in strength as the ring fills, then a success tap on commit. */
const TICKS: { at: number; style: Haptics.ImpactFeedbackStyle }[] = [
  { at: 0.35, style: Haptics.ImpactFeedbackStyle.Light },
  { at: 0.65, style: Haptics.ImpactFeedbackStyle.Medium },
  { at: 0.9, style: Haptics.ImpactFeedbackStyle.Heavy },
];

export type HoldState = {
  /** 0..1 while holding. */
  progress: SharedValue<number>;
  /** 1 when the ring reads as done, 0 otherwise. */
  base: SharedValue<number>;
};

type HoldToCompleteProps = {
  done: boolean;
  /** Called when a hold completes: marks done, or undoes when already done. */
  onToggle: () => void;
  /** A plain tap, e.g. open the detail screen. */
  onPress?: () => void;
  accessibilityLabel: string;
  /** Receives the hold state so a `HoldRing` can draw it. */
  children: (hold: HoldState) => ReactNode;
};

/**
 * The signature interaction: press and hold for 0.6 s to check a habit off. The ring fills,
 * haptics tick harder as it fills, and the tile pops on commit. Letting go early springs back.
 * With Reduce Motion on, the ring does not animate and the commit is a plain fade.
 */
export function HoldToComplete({ done, onToggle, onPress, accessibilityLabel, children }: HoldToCompleteProps) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  /** 1 while the ring should read as done. Flipped on the UI thread at commit, before the prop catches up. */
  const base = useSharedValue(done ? 1 : 0);
  const scale = useSharedValue(1);
  const pressedOpacity = useSharedValue(1);

  useEffect(() => {
    base.value = done ? 1 : 0;
    progress.value = 0;
    // The re-render after a commit can cut the pop's settle spring short; always land back at rest.
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  }, [base, done, progress, scale]);

  function tick(index: number) {
    void Haptics.impactAsync(TICKS[index].style);
  }

  function commit() {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onToggle();
  }

  useAnimatedReaction(
    () => progress.value,
    (value, previous) => {
      if (previous === null) {
        return;
      }
      for (let index = 0; index < TICKS.length; index += 1) {
        if (previous < TICKS[index].at && value >= TICKS[index].at) {
          runOnJS(tick)(index);
        }
      }
    },
  );

  const longPress = Gesture.LongPress()
    .minDuration(HOLD_MS)
    .maxDistance(30)
    .onBegin(() => {
      if (reduceMotion) {
        pressedOpacity.value = withTiming(0.6, { duration: 150 });
      } else {
        progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.inOut(Easing.quad) });
        scale.value = withSpring(0.97, { damping: 20, stiffness: 300 });
      }
    })
    .onStart(() => {
      base.value = done ? 0 : 1;
      progress.value = 0;
      if (!reduceMotion) {
        scale.value = withSequence(
          withSpring(1.06, { damping: 9, stiffness: 420 }),
          withSpring(1, { damping: 14, stiffness: 220 }),
        );
      }
      runOnJS(commit)();
    })
    .onFinalize((_event, success) => {
      pressedOpacity.value = withTiming(1, { duration: 150 });
      if (!success) {
        progress.value = withSpring(0, { damping: 20, stiffness: 220 });
        scale.value = withSpring(1, { damping: 16, stiffness: 220 });
      }
    });

  const tap = Gesture.Tap().onEnd(() => {
    if (onPress) {
      runOnJS(onPress)();
    }
  });

  const gesture = onPress ? Gesture.Exclusive(longPress, tap) : longPress;

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pressedOpacity.value,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: done }}
        accessibilityHint={done ? 'Hold to undo. Double tap to open.' : 'Hold to mark done. Double tap to open.'}
        accessibilityActions={[{ name: 'activate' }, { name: 'longpress' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'longpress') {
            commit();
          } else {
            onPress?.();
          }
        }}
        style={containerStyle}
      >
        {children({ progress, base })}
      </Animated.View>
    </GestureDetector>
  );
}

type HoldRingProps = {
  hold: HoldState;
  done: boolean;
  size: number;
  strokeWidth?: number;
  children: ReactNode;
};

/** The ring around a habit icon. Fills with the hold; when done it is full and drains on an undo hold. */
export function HoldRing({ hold, done, size, strokeWidth = 4, children }: HoldRingProps) {
  const { colors } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Filling from empty when not done; draining from full on an undo hold.
  const fill = useDerivedValue(() => hold.base.value + (1 - 2 * hold.base.value) * hold.progress.value);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fill.value),
    opacity: fill.value < 0.01 ? 0 : 1,
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={done ? colors.onPrimary : colors.track}
          strokeOpacity={done ? 0.35 : 1}
          strokeWidth={strokeWidth}
          fill={done ? colors.onPrimary : colors.surfaceSunken}
          fillOpacity={done ? 0.16 : 1}
        />
        <AnimatedCircle
          animatedProps={ringProps}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={done ? colors.onPrimary : colors.primary}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
