import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Text } from '@/components';
import type { ScrollViewHandle } from '@/components/Screen';
import { deleteCheckIn, getCheckIn, type CheckIn } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { CheckInEditor } from './CheckInEditor';
import { relativeDayLabel, todayKey } from './dates';
import { progressForScore } from './moods';
import { useMoodTint } from './useMoodTint';

type DayScreenProps = {
  day: string;
};

/** A past (or present) day in a sheet: edit it, or log it if it was missed. */
/** Lets the keyboard finish sliding up before scrolling to the note. */
const KEYBOARD_SETTLE_MS = 350;

export function DayScreen({ day }: DayScreenProps) {
  const scrollRef = useRef<ScrollViewHandle>(null);
  const { colors, radii, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const progress = useSharedValue(0.5);
  const tint = useMoodTint(progress);
  const [checkIn, setCheckIn] = useState<CheckIn | null>();

  useEffect(() => {
    getCheckIn(day).then((existing) => {
      if (existing) {
        progress.value = progressForScore(existing.score);
      }
      setCheckIn(existing ?? null);
    });
  }, [day, progress]);

  function handleDelete() {
    if (!checkIn) {
      return;
    }
    Alert.alert('Remove this day?', 'The mood, tags and note for this day are deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void deleteCheckIn(checkIn.id).then(() => router.back());
        },
      },
    ]);
  }

  const editable = day <= todayKey();

  return (
    <Animated.View style={[styles.root, tint]}>
      <View style={[styles.header, { paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, gap: spacing.sm }]}>
        <View style={[styles.flex, { gap: spacing.xs }]}>
          <Text variant="eyebrow" color="muted" numberOfLines={1}>
            {checkIn ? 'EDIT CHECK-IN' : 'ADD A CHECK-IN'}
          </Text>
          <Text variant="heading" numberOfLines={1}>
            {relativeDayLabel(day)}
          </Text>
        </View>
        {checkIn ? (
          <Pressable accessibilityLabel="Remove this day" hitSlop={8} onPress={handleDelete} style={styles.iconButton}>
            <Icon name="trash" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Close"
          hitSlop={8}
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: colors.surface, borderRadius: radii.pill }]}
        >
          <Icon name="close" size={16} />
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingHorizontal: spacing.gutter,
          paddingTop: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        {checkIn === undefined ? null : editable ? (
          <CheckInEditor
            day={day}
            initial={checkIn ?? undefined}
            progress={progress}
            width={width - spacing.gutter * 2}
            saveTitle={checkIn ? 'Save changes' : 'Save this day'}
            onSaved={() => router.back()}
            onNoteFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), KEYBOARD_SETTLE_MS)}
          />
        ) : (
          <Text color="muted">This day has not happened yet.</Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
