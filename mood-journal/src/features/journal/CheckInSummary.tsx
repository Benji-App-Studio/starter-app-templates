import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Chip, Icon, Text } from '@/components';
import type { CheckIn } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { formatTime } from './dates';
import { moodColor } from './moods';
import { tagIcon } from './tags';

type CheckInSummaryProps = {
  checkIn: CheckIn;
};

/** The saved day as a page of the journal: tags in the mood color, the note in the serif. */
export function CheckInSummary({ checkIn }: CheckInSummaryProps) {
  const { colors, spacing } = useTheme();
  const color = moodColor(colors, checkIn.score);

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)} style={{ gap: spacing.md }}>
      {checkIn.tags.length > 0 ? (
        <View style={[styles.wrap, { gap: spacing.sm }]}>
          {checkIn.tags.map((tag) => (
            <Chip key={tag} label={tag} icon={tagIcon(tag)} selected color={color} />
          ))}
        </View>
      ) : null}
      {checkIn.note ? (
        <View style={[styles.note, { gap: spacing.sm }]}>
          <Icon name="quote" size={18} color={color} />
          <Text variant="journal" style={styles.noteText}>
            {checkIn.note}
          </Text>
        </View>
      ) : null}
      <Text variant="caption" color="muted">
        {`${checkIn.noteKind === 'gratitude' ? 'Gratitude' : 'Note'} · saved ${formatTime(checkIn.updatedAt)}`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  note: { flexDirection: 'row', alignItems: 'flex-start' },
  noteText: { flex: 1 },
});
