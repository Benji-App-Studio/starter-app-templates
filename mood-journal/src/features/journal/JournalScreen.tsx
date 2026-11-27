import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Card, EmptyState, Icon, Row, Screen, Section, Stack, Text } from '@/components';
import { listCheckIns, type CheckIn, type MoodScore } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { formatDayShort, formatWeekday, todayKey, yearOf } from './dates';
import { EmptyJournal } from './Illustrations';
import { MoodFace } from './MoodFace';
import { moodColor, moodFor, progressForScore } from './moods';
import { YearPixels } from './YearPixels';

/** The year in pixels, then the entries of that year as journal pages. */
export function JournalScreen() {
  const { colors, radii, spacing } = useTheme();
  const router = useRouter();
  const today = todayKey();
  const [year, setYear] = useState(yearOf(today));
  const [entries, setEntries] = useState<CheckIn[]>();

  const load = useCallback(async () => {
    setEntries(await listCheckIns(`${year}-01-01`, `${year}-12-31`));
  }, [year]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const scores = new Map<string, MoodScore>(entries?.map((entry) => [entry.day, entry.score]));
  const currentYear = yearOf(today);

  return (
    <Screen
      tab
      title="Journal"
      eyebrow={`${entries?.length ?? 0} ${entries?.length === 1 ? 'day' : 'days'} in ${year}`}
      accessory={
        <View style={[styles.yearSwitch, { gap: spacing.xs, paddingBottom: spacing.xs }]}>
          <Pressable accessibilityLabel="Previous year" hitSlop={8} onPress={() => setYear(year - 1)} style={styles.yearButton}>
            <Icon name="chevronLeft" size={16} color={colors.textMuted} />
          </Pressable>
          <Text variant="label" style={styles.year}>
            {year}
          </Text>
          <Pressable
            accessibilityLabel="Next year"
            hitSlop={8}
            disabled={year >= currentYear}
            onPress={() => setYear(year + 1)}
            style={[styles.yearButton, { opacity: year >= currentYear ? 0.3 : 1 }]}
          >
            <Icon name="chevronRight" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      }
    >
      <Card>
        <Stack gap="md">
          <YearPixels year={year} scores={scores} today={today} onSelectDay={(day) => router.push(`/day/${day}`)} />
          <View style={[styles.legend, { gap: spacing.sm }]}>
            {colors.mood.map((color, index) => (
              <View key={color} style={[styles.legendItem, { gap: spacing.xs }]}>
                <View style={[styles.swatch, { backgroundColor: color, borderRadius: radii.sm }]} />
                {index === 0 || index === 4 ? (
                  <Text variant="caption" color="muted">
                    {index === 0 ? 'Awful' : 'Great'}
                  </Text>
                ) : null}
              </View>
            ))}
            <Text variant="caption" color="muted" numberOfLines={1} style={styles.legendHint}>
              Tap a day to open it
            </Text>
          </View>
        </Stack>
      </Card>

      {entries === undefined ? null : entries.length === 0 ? (
        <EmptyState
          illustration={<EmptyJournal />}
          title={year === currentYear ? 'No days written yet' : `Nothing from ${year}`}
          body={
            year === currentYear
              ? 'Your first check-in becomes the first colored square.'
              : 'Pick a square to add a day from memory.'
          }
          action={year === currentYear ? { title: 'Check in today', onPress: () => router.navigate('/') } : undefined}
        />
      ) : (
        <Section title="Entries">
          <Stack gap="ms">
            {entries.map((entry, index) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown.delay(Math.min(index, 8) * 40)
                  .springify()
                  .damping(18)}
                layout={LinearTransition.springify().damping(18)}
              >
                <Card onPress={() => router.push(`/day/${entry.day}`)}>
                  <Row gap="md" align="flex-start">
                    <MoodFace progress={progressForScore(entry.score)} size={44} />
                    <Stack gap="xs" style={styles.entryBody}>
                      <Row gap="sm" align="baseline">
                        <Text variant="label" numberOfLines={1}>
                          {moodFor(entry.score).label}
                        </Text>
                        <Text variant="caption" color="muted" numberOfLines={1} style={styles.entryBody}>
                          {`${formatWeekday(entry.day)} · ${formatDayShort(entry.day)}`}
                        </Text>
                      </Row>
                      {entry.note ? (
                        <Text variant="journalSmall" numberOfLines={2}>
                          {entry.note}
                        </Text>
                      ) : null}
                      {entry.tags.length > 0 ? (
                        <Text variant="caption" numberOfLines={1} style={{ color: moodColor(colors, entry.score) }}>
                          {entry.tags.join(' · ')}
                        </Text>
                      ) : null}
                    </Stack>
                  </Row>
                </Card>
              </Animated.View>
            ))}
          </Stack>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  yearSwitch: { flexDirection: 'row', alignItems: 'center' },
  yearButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  year: { fontVariant: ['tabular-nums'] },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendHint: { flex: 1, minWidth: 0, textAlign: 'right' },
  swatch: { width: 12, height: 12 },
  entryBody: { flex: 1, minWidth: 0 },
});
