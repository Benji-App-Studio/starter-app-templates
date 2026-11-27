import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { useTheme } from '@/theme/theme';

/** Points of horizontal drag per step. */
const PX_PER_STEP = 14;

type ScrubberProps = {
  value: number | null;
  /** Shown faintly when there is no value, e.g. last session's number. */
  placeholder?: number | null;
  step: number;
  min?: number;
  max?: number;
  /** Decimal places accepted when typing. */
  decimals?: number;
  onChange: (value: number | null) => void;
  accessibilityLabel: string;
  /** Dims the control once the set is done. */
  muted?: boolean;
};

function format(value: number, decimals: number): string {
  return Number(value.toFixed(decimals)).toString();
}

/**
 * A number field for the set table: tap − / + for one step, type a value, or drag
 * anywhere on it horizontally to scrub with a haptic tick per step. The − / + targets are
 * 28 × 44 so two of them and a weight like 102.5 fit a set row on a 375 pt phone; the whole
 * field is also a drag target, so nothing depends on hitting them exactly.
 */
export function Scrubber({
  value,
  placeholder,
  step,
  min = 0,
  max = 9999,
  decimals = 0,
  onChange,
  accessibilityLabel,
  muted = false,
}: ScrubberProps) {
  const { colors, radii, typography } = useTheme();
  // A lineHeight would push the single-line field's text off centre on iOS.
  const { lineHeight: _lineHeight, ...stepperFont } = typography.stepper;
  const reducedMotion = useReducedMotion();
  const [text, setText] = useState(value === null ? '' : format(value, decimals));
  const [editing, setEditing] = useState(false);
  const active = useSharedValue(0);
  const dragStart = useSharedValue(0);
  const lastSteps = useSharedValue(0);

  useEffect(() => {
    if (!editing) {
      setText(value === null ? '' : format(value, decimals));
    }
  }, [decimals, editing, value]);

  function clamp(next: number): number {
    return Math.min(max, Math.max(min, Number(next.toFixed(decimals))));
  }

  function nudge(direction: 1 | -1) {
    void Haptics.selectionAsync();
    onChange(clamp((value ?? placeholder ?? 0) + direction * step));
  }

  function commitText(raw: string) {
    const normalized = raw.replace(',', '.').trim();
    if (normalized === '') {
      onChange(null);
      return;
    }
    const parsed = Number(normalized);
    onChange(Number.isFinite(parsed) ? clamp(parsed) : value);
  }

  const pan = usePanGesture({
    runOnJS: true,
    activeOffsetX: [-10, 10],
    failOffsetY: [-12, 12],
    onActivate: () => {
      dragStart.value = value ?? placeholder ?? 0;
      lastSteps.value = 0;
      active.value = reducedMotion ? 1 : withSpring(1, { damping: 16, stiffness: 240 });
    },
    onUpdate: (event) => {
      const steps = Math.round(event.translationX / PX_PER_STEP);
      if (steps !== lastSteps.value) {
        lastSteps.value = steps;
        void Haptics.selectionAsync();
        onChange(clamp(dragStart.value + steps * step));
      }
    },
    onFinalize: () => {
      active.value = reducedMotion ? 0 : withSpring(0, { damping: 16, stiffness: 240 });
    },
  });

  const frameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + active.value * 0.04 }],
    borderColor: active.value > 0.5 ? colors.primary : colors.border,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.frame,
          { backgroundColor: colors.surfaceRaised, borderRadius: radii.md, opacity: muted ? 0.55 : 1 },
          frameStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${accessibilityLabel}`}
          onPress={() => nudge(-1)}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.4 : 1 }]}
        >
          <Icon name="minus" size={14} color={colors.textMuted} />
        </Pressable>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          value={text}
          placeholder={placeholder === null || placeholder === undefined ? '–' : format(placeholder, decimals)}
          placeholderTextColor={colors.textMuted}
          onChangeText={setText}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            setEditing(false);
            commitText(text);
          }}
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          returnKeyType="done"
          selectTextOnFocus
          maxFontSizeMultiplier={1.3}
          style={[styles.input, stepperFont, { color: colors.text }]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${accessibilityLabel}`}
          onPress={() => nudge(1)}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.4 : 1 }]}
        >
          <Icon name="plus" size={14} color={colors.textMuted} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
  },
  button: { width: 28, height: 44, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    textAlign: 'center',
    padding: 0,
  },
});
