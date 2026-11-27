import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { formatTime, parseTime, toTimeString } from './dates';

const MINUTE_STEP = 5;

type TimeStepperProps = {
  /** 'HH:MM' */
  value: string;
  onChange: (value: string) => void;
};

/** Hour and minute steppers with a tick per step. No system picker, so it matches the app. */
export function TimeStepper({ value, onChange }: TimeStepperProps) {
  const { spacing } = useTheme();
  const { hour, minute } = parseTime(value);

  function step(deltaHours: number, deltaMinutes: number) {
    void Haptics.selectionAsync();
    const total = ((((hour + deltaHours) * 60 + minute + deltaMinutes) % 1440) + 1440) % 1440;
    onChange(toTimeString(Math.floor(total / 60), total % 60));
  }

  return (
    <View style={[styles.root, { gap: spacing.md }]}>
      <Text variant="numeralSmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.time}>
        {formatTime(value)}
      </Text>
      <View style={[styles.columns, { gap: spacing.sm }]}>
        <Stepper label="Hour" onDown={() => step(-1, 0)} onUp={() => step(1, 0)} />
        <Stepper
          label={`Minutes, in ${MINUTE_STEP}s`}
          onDown={() => step(0, -MINUTE_STEP)}
          onUp={() => step(0, MINUTE_STEP)}
        />
      </View>
    </View>
  );
}

type StepperProps = { label: string; onDown: () => void; onUp: () => void };

function Stepper({ label, onDown, onUp }: StepperProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <View style={[styles.stepper, { gap: spacing.sm }]}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <View style={[styles.buttons, { borderRadius: radii.md, backgroundColor: colors.surfaceSunken }]}>
        <StepButton icon="back" label={`${label} down`} onPress={onDown} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <StepButton icon="forward" label={`${label} up`} onPress={onUp} />
      </View>
    </View>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'back' | 'forward'; label: string; onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Icon name={icon} size={16} color={colors.text} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'stretch' },
  time: { textAlign: 'center' },
  columns: { flexDirection: 'row' },
  stepper: { flex: 1 },
  buttons: { flexDirection: 'row', alignItems: 'center', height: 48 },
  button: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center' },
  divider: { width: StyleSheet.hairlineWidth, height: 24 },
});
