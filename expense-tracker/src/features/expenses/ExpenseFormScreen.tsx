import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

import { Button, Chip, Keypad, Row, Screen, SheetHeader, Text, type KeypadKey } from '@/components';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { planFromAnswers } from './budgetPlan';
import { categories } from './categories';
import { removeExpense, saveExpense, useExpense } from './data';
import { applyKey, centsToTyped, formatTyped, typedToCents } from './money';
import { DAY_MS, dayLabel, startOfDay } from './period';
import { usePreferences } from './preferences';

type ExpenseFormScreenProps = {
  /** Set when editing; absent for a new expense. */
  id?: number;
};

type DayOption = { key: number; label: string; spentAt: number };

/**
 * The add/edit sheet: amount on the in-app keypad, a category strip, an optional
 * note and the day. Saving springs the Home allowance down.
 */
export function ExpenseFormScreen({ id }: ExpenseFormScreenProps) {
  const router = useRouter();
  const { colors, radii, sizes, spacing, typography } = useTheme();
  const { currency } = usePreferences();
  const { onboardingAnswers } = useAppState();
  const existing = useExpense(id);
  const editing = id !== undefined;

  const [typed, setTyped] = useState('');
  const [categoryId, setCategoryId] = useState(() => planFromAnswers(onboardingAnswers).topCategoryId);
  const [note, setNote] = useState('');
  const [spentAt, setSpentAt] = useState(() => Date.now());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setTyped(centsToTyped(existing.amountCents));
      setCategoryId(existing.categoryId);
      setNote(existing.note);
      setSpentAt(existing.spentAt);
    }
  }, [existing]);

  const now = Date.now();
  const dayOptions: DayOption[] = [
    { key: startOfDay(now), label: 'Today', spentAt: now },
    { key: startOfDay(now - DAY_MS), label: 'Yesterday', spentAt: now - DAY_MS },
  ];
  const originalDay = existing ? startOfDay(existing.spentAt) : undefined;
  if (existing && originalDay !== undefined && !dayOptions.some((option) => option.key === originalDay)) {
    dayOptions.push({ key: originalDay, label: dayLabel(existing.spentAt, now), spentAt: existing.spentAt });
  }
  const selectedDay = startOfDay(spentAt);

  const amountCents = typedToCents(typed);
  const canSave = amountCents > 0 && !saving && (!editing || existing !== undefined);

  function handleKey(key: KeypadKey) {
    setTyped((current) => applyKey(current, key));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveExpense({ amountCents, categoryId, note: note.trim(), spentAt }, id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again.');
    }
  }

  function handleDelete() {
    if (id === undefined) {
      return;
    }
    Alert.alert('Delete this expense?', 'It is removed from this month’s total.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeExpense(id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen sheet contentStyle={{ gap: spacing.md }}>
      <SheetHeader
        title={editing ? 'Edit expense' : 'New expense'}
        onClose={() => router.back()}
        action={editing ? { icon: 'trash', label: 'Delete expense', destructive: true, onPress: handleDelete } : undefined}
      />

      <Text
        variant="numeralSheet"
        color={typed ? 'text' : 'muted'}
        align="center"
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
        accessibilityLabel={`Amount ${formatTyped(typed, currency)}`}
      >
        {formatTyped(typed, currency)}
      </Text>

      {/* A wrapped row, not a horizontal ScrollView: inside this fitToContents form sheet the
          native sheet took the scroller over and drew the chips at the top, over the header. */}
      <Row gap="sm" style={styles.chips}>
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.label}
            icon={category.icon}
            selected={category.id === categoryId}
            onPress={() => setCategoryId(category.id)}
          />
        ))}
      </Row>

      <Row gap="sm">
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Add a note"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          maxLength={60}
          accessibilityLabel="Note"
          style={[
            typography.input,
            styles.note,
            {
              height: sizes.hit,
              color: colors.text,
              backgroundColor: colors.background,
              borderRadius: radii.md,
              paddingHorizontal: spacing.md,
            },
          ]}
        />
        {dayOptions.map((option) => (
          <Chip
            key={option.key}
            label={option.label}
            selected={option.key === selectedDay}
            onPress={() => setSpentAt(option.spentAt)}
          />
        ))}
      </Row>

      <Keypad onKey={handleKey} onClear={() => setTyped('')} />

      <Button
        title={editing ? 'Save changes' : 'Add expense'}
        onPress={handleSave}
        disabled={!canSave}
        loading={saving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { flex: 1, minWidth: 0 },
  chips: { flexWrap: 'wrap' },
});
