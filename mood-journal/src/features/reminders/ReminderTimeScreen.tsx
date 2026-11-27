import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Group, Icon, ListRow, Stack, Text } from '@/components';
import { formatHour } from '@/features/journal/dates';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { defaultReminderHour, REMINDER_HOURS, setReminderHour, useReminder } from './reminders';

/** A sheet of hours. Picking one reschedules the reminder when it is on. */
export function ReminderTimeScreen() {
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { onboardingAnswers } = useAppState();
  const reminder = useReminder(defaultReminderHour(onboardingAnswers.checkInTime));

  function choose(hour: number) {
    void setReminderHour(hour).then(() => router.back());
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm }]}>
        <Stack gap="xs" style={styles.flex}>
          <Text variant="heading" numberOfLines={1}>
            Reminder time
          </Text>
          <Text variant="caption" color="muted" numberOfLines={2}>
            One notification a day, at the hour you pick.
          </Text>
        </Stack>
        <Pressable
          accessibilityLabel="Close"
          hitSlop={8}
          onPress={() => router.back()}
          style={[styles.close, { backgroundColor: colors.surface, borderRadius: radii.pill }]}
        >
          <Icon name="close" size={16} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: insets.bottom + spacing.xl }}>
        <Group>
          {REMINDER_HOURS.map((hour) => (
            <ListRow
              key={hour}
              title={formatHour(hour)}
              onPress={() => choose(hour)}
              right={reminder?.hour === hour ? <Icon name="check" size={18} color={colors.primary} /> : <View />}
            />
          ))}
        </Group>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
