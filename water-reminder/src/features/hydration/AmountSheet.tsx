import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, Sheet, Text } from '@/components';
import { useTheme, spacing } from '@/theme/theme';

import { amountValue, ozToMl, type Unit } from './goal';

type AmountSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  unit: Unit;
  /** Starting value in millilitres, shown in the chosen unit. */
  initialMl: number;
  /** Label for the confirm button, given the typed amount in millilitres. */
  submitLabel: (ml: number) => string;
  onSubmit: (ml: number) => void;
  secondaryAction?: { title: string; onPress: () => void };
};

/** Type or step an amount. Used for custom drinks and for editing the daily goal. */
export function AmountSheet({
  visible,
  onClose,
  title,
  unit,
  initialMl,
  submitLabel,
  onSubmit,
  secondaryAction,
}: AmountSheetProps) {
  const { colors, radii, spacing, typography } = useTheme();
  const step = unit === 'oz' ? 2 : 50;
  const [text, setText] = useState(String(amountValue(initialMl, unit)));

  useEffect(() => {
    if (visible) {
      setText(String(amountValue(initialMl, unit)));
    }
  }, [visible, initialMl, unit]);

  const value = Number(text.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 0;
  const ml = valid ? (unit === 'oz' ? ozToMl(value) : Math.round(value)) : 0;

  function nudge(delta: number) {
    const base = valid ? value : 0;
    setText(String(Math.max(step, Math.round((base + delta) / step) * step)));
  }

  function handleSubmit() {
    if (valid) {
      onSubmit(ml);
      onClose();
    }
  }

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={[styles.inputRow, { gap: spacing.md, marginBottom: spacing.lg }]}>
        <Stepper icon="minus" onPress={() => nudge(-step)} />
        <View style={[styles.field, { backgroundColor: colors.surfaceRaised, borderRadius: radii.md }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            selectTextOnFocus
            autoFocus
            maxLength={5}
            accessibilityLabel={`Amount in ${unit}`}
            style={[typography.stat, styles.input, { color: colors.text }]}
          />
          <Text variant="label" color="muted">
            {unit}
          </Text>
        </View>
        <Stepper icon="plus" onPress={() => nudge(step)} />
      </View>
      <Button title={submitLabel(ml)} onPress={handleSubmit} disabled={!valid} />
      {secondaryAction ? (
        <Button
          variant="secondary"
          title={secondaryAction.title}
          onPress={() => {
            secondaryAction.onPress();
            onClose();
          }}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}
    </Sheet>
  );
}

function Stepper({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  const { colors, radii } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={icon === 'plus' ? 'Increase' : 'Decrease'}
      onPress={onPress}
      style={({ pressed }) => [
        styles.stepper,
        { backgroundColor: pressed ? colors.primary : colors.primarySoft, borderRadius: radii.pill },
      ]}
    >
      {({ pressed }) =>
        icon === 'plus' ? (
          <Icon name="plus" size={20} color={pressed ? colors.onPrimary : colors.primary} weight="bold" />
        ) : (
          <View style={[styles.minus, { backgroundColor: pressed ? colors.onPrimary : colors.primary }]} />
        )
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.ms,
  },
  input: { minWidth: 72, textAlign: 'right', padding: 0 },
  stepper: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  minus: { width: 18, height: 3, borderRadius: 2 },
});
