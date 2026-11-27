import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { HABIT_ICONS, Icon, Screen, Text, type IconName } from '@/components';
import { createHabit, getHabit, updateHabit, type Habit, type HabitInput } from '@/db/habits';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { syncHabitReminders } from '../reminders/reminders';
import { EVERY_DAY, WEEK_ORDER, WEEKDAY_LETTER, WEEKDAY_SHORT, WEEKDAYS, WEEKENDS } from './dates';
import { defaultReminderTime } from './starters';
import { TimeStepper } from './TimeStepper';

type HabitEditorScreenProps = {
  /** Absent for a new habit. */
  id?: number;
};

const MAX_NAME_LENGTH = 40;

const DAY_PRESETS: { label: string; days: number[] }[] = [
  { label: 'Every day', days: EVERY_DAY },
  { label: 'Weekdays', days: WEEKDAYS },
  { label: 'Weekends', days: WEEKENDS },
];

/** Add or edit a habit. Presented as a form sheet over the tabs. */
export function HabitEditorScreen({ id }: HabitEditorScreenProps) {
  const router = useRouter();
  const { colors, radii, spacing, typography } = useTheme();
  const { onboardingAnswers, remindersEnabled } = useAppState();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<IconName>(HABIT_ICONS[0]);
  const [days, setDays] = useState<number[]>(EVERY_DAY);
  const [reminderTime, setReminderTime] = useState<string | null>(defaultReminderTime(onboardingAnswers));
  const [ready, setReady] = useState(id === undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id === undefined) {
      return;
    }
    getHabit(id).then((habit) => {
      if (habit) {
        setName(habit.name);
        setIcon(habit.icon);
        setDays(habit.days);
        setReminderTime(habit.reminderTime);
      }
      setReady(true);
    });
  }, [id]);

  const trimmed = name.trim();
  const canSave = ready && trimmed.length > 0 && days.length > 0 && !saving;

  function toggleDay(day: number) {
    void Haptics.selectionAsync();
    setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]));
  }

  function sameDays(a: number[], b: number[]) {
    return a.length === b.length && b.every((day) => a.includes(day));
  }

  async function save() {
    if (!canSave) {
      return;
    }
    setSaving(true);
    const input: HabitInput = { name: trimmed, icon, days, reminderTime };
    let saved: Habit | undefined;
    if (id === undefined) {
      saved = await createHabit(input);
    } else {
      await updateHabit(id, input);
      saved = await getHabit(id);
    }
    if (saved) {
      await syncHabitReminders(saved);
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const fieldStyle = {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  };

  return (
    <Screen scroll edges={['bottom']} contentStyle={{ gap: spacing.lg, paddingTop: spacing.lg }}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => router.back()} style={styles.headerSide}>
          <Text variant="label" color="muted">
            Cancel
          </Text>
        </Pressable>
        <Text variant="heading" align="center">
          {id === undefined ? 'New habit' : 'Edit habit'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          hitSlop={8}
          onPress={() => void save()}
          style={[styles.headerSide, styles.headerRight, { opacity: canSave ? 1 : 0.4 }]}
        >
          <Text variant="label" color="primary">
            Save
          </Text>
        </Pressable>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="muted">
          NAME
        </Text>
        <TextInput
          accessibilityLabel="Habit name"
          autoFocus={id === undefined}
          value={name}
          onChangeText={(text) => setName(text.slice(0, MAX_NAME_LENGTH))}
          placeholder="Walk 20 minutes"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          style={[typography.body, fieldStyle, styles.input, { color: colors.text }]}
        />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="muted">
          ICON
        </Text>
        <View style={[styles.iconGrid, { gap: spacing.sm }]}>
          {HABIT_ICONS.map((candidate) => {
            const selected = candidate === icon;
            return (
              <Pressable
                key={candidate}
                accessibilityRole="button"
                accessibilityLabel={candidate}
                accessibilityState={{ selected }}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setIcon(candidate);
                }}
                style={[
                  styles.iconCell,
                  {
                    borderRadius: radii.pill,
                    backgroundColor: selected ? colors.primary : colors.surfaceSunken,
                  },
                ]}
              >
                <Icon name={candidate} size={20} color={selected ? colors.onPrimary : colors.text} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="muted">
          REPEAT
        </Text>
        <View style={[styles.presets, { gap: spacing.sm }]}>
          {DAY_PRESETS.map((preset) => {
            const selected = sameDays(days, preset.days);
            return (
              <Pressable
                key={preset.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setDays(preset.days);
                }}
                style={[
                  styles.preset,
                  {
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    backgroundColor: selected ? colors.primarySoft : colors.surfaceSunken,
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
              >
                <Text variant="caption" color={selected ? 'primary' : 'text'}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.days, { gap: spacing.sm }]}>
          {WEEK_ORDER.map((day) => {
            const selected = days.includes(day);
            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={WEEKDAY_SHORT[day]}
                accessibilityState={{ selected }}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayCell,
                  {
                    borderRadius: radii.pill,
                    backgroundColor: selected ? colors.primary : colors.surfaceSunken,
                  },
                ]}
              >
                <Text variant="label" color={selected ? 'onPrimary' : 'muted'}>
                  {WEEKDAY_LETTER[day]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="caption" color="muted">
          REMINDER
        </Text>
        <View style={[fieldStyle, { gap: spacing.md, paddingVertical: spacing.sm }]}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Remind me</Text>
            <Switch
              accessibilityLabel="Remind me"
              value={reminderTime !== null}
              onValueChange={(on) => setReminderTime(on ? defaultReminderTime(onboardingAnswers) : null)}
              trackColor={{ true: colors.primary, false: colors.border }}
              thumbColor={colors.surface}
            />
          </View>
          {reminderTime !== null ? (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={{ paddingBottom: spacing.sm }}>
              <TimeStepper value={reminderTime} onChange={setReminderTime} />
            </Animated.View>
          ) : null}
        </View>
        {reminderTime !== null && !remindersEnabled ? (
          <Text variant="caption" color="muted">
            Reminders are off for the app. Turn them on in Settings to be notified at this time.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerSide: { width: 64, minHeight: 44, justifyContent: 'center' },
  headerRight: { alignItems: 'flex-end' },
  input: { height: 52 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  iconCell: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  presets: { flexDirection: 'row' },
  preset: { height: 36, justifyContent: 'center', borderWidth: 1.5 },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 36 },
  switchLabel: { flex: 1 },
});
