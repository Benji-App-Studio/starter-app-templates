import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { Button, Row, Screen, Stack, Text } from '@/components';
import type { ScrollViewHandle } from '@/components/Screen';
import { getCheckIn, listCheckInDays, type CheckIn } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { CheckInEditor } from './CheckInEditor';
import { CheckInSummary } from './CheckInSummary';
import { formatDayLong, todayKey } from './dates';
import { MoodDial } from './MoodDial';
import { moodFor, progressForScore } from './moods';
import { StreakCard } from './StreakCard';
import { currentStreak } from './streak';
import { useMoodTint } from './useMoodTint';

/** Lets the keyboard finish sliding up (and the scroll view take its inset) before scrolling to the note. */
const KEYBOARD_SETTLE_MS = 350;

type Loaded = {
  checkIn?: CheckIn;
  streak: number;
};

/**
 * Today: slide to the mood (the whole screen tints with it), name what shaped
 * it, write a line. Once saved, the day reads back as a page with the streak plant.
 */
export function TodayScreen() {
  const { spacing } = useTheme();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const today = todayKey();
  const [loaded, setLoaded] = useState<Loaded>();
  const [editing, setEditing] = useState(false);
  const progress = useSharedValue(0.5);
  const scrollRef = useRef<ScrollViewHandle>(null);
  const tint = useMoodTint(progress);

  const load = useCallback(async () => {
    const [checkIn, days] = await Promise.all([getCheckIn(today), listCheckInDays()]);
    if (checkIn) {
      progress.value = progressForScore(checkIn.score);
    }
    setLoaded({ checkIn, streak: currentStreak(new Set(days), today) });
    setEditing(false);
  }, [progress, today]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const dialWidth = width - spacing.gutter * 2;
  const checkIn = loaded?.checkIn;
  const showEditor = loaded !== undefined && (checkIn === undefined || editing);
  const title = checkIn && !editing ? `A ${moodFor(checkIn.score).label.toLowerCase()} day` : 'How are you today?';

  return (
    <Animated.View style={[styles.root, tint]}>
      <Screen tab scroll gap="lg" backgroundColor="transparent" scrollRef={scrollRef}>
        <Stack gap="xs">
          <Text variant="eyebrow" color="muted" numberOfLines={1}>
            {formatDayLong(today).toUpperCase()}
          </Text>
          <Text variant="title" numberOfLines={2}>
            {title}
          </Text>
        </Stack>

        {loaded === undefined ? null : showEditor ? (
          <CheckInEditor
            key={checkIn?.updatedAt ?? 'new'}
            day={today}
            initial={checkIn}
            progress={progress}
            width={dialWidth}
            saveTitle={checkIn ? 'Save changes' : 'Save today'}
            onSaved={() => {
              // The saved day reads from the top: the title, the dial, the note.
              scrollRef.current?.scrollTo({ y: 0, animated: true });
              void load();
            }}
            // The note sits at the end, just above Save: bring both above the keyboard.
            onNoteFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), KEYBOARD_SETTLE_MS)}
          />
        ) : checkIn ? (
          <Stack gap="lg">
            <Stack gap="xs" align="center">
              <MoodDial progress={progress} width={dialWidth} enabled={false} onScoreChange={() => undefined} />
              <Text variant="display" align="center" numberOfLines={1}>
                {moodFor(checkIn.score).label}
              </Text>
            </Stack>
            <CheckInSummary checkIn={checkIn} />
            <StreakCard streak={loaded.streak} />
            <Row gap="ms">
              <Button title="Edit today" variant="secondary" onPress={() => setEditing(true)} style={styles.flex} />
              <Button title="See the year" variant="secondary" onPress={() => router.navigate('/journal')} style={styles.flex} />
            </Row>
          </Stack>
        ) : null}
      </Screen>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
});
