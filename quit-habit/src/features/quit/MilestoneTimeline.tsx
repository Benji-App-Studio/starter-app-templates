import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Stack } from '@/components/Stack';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

import { milestoneProgress, milestones } from './milestones';
import { formatDate, formatDuration } from './time';

type MilestoneTimelineProps = {
  startedAt: number;
  now: number;
};

const RAIL = 28;
const LINE = 4;
const NODE = 16;
const NEXT_NODE = 20;
const ROW_MIN = 76;

/**
 * Every milestone on one vertical line that fills as time passes. Each row draws
 * its own half-segments above and below its node, so rows can grow with Dynamic
 * Type and the line stays continuous. The segment toward the next milestone fills
 * with the run's progress: the lower half of the last reached row first, then the
 * upper half of the next row.
 */
export function MilestoneTimeline({ startedAt, now }: MilestoneTimelineProps) {
  const { colors, spacing } = useTheme();
  const { reached, next, progress } = milestoneProgress(startedAt, now);
  const nextIndex = next ? reached.length : -1;

  return (
    <View>
      {milestones.map((milestone, index) => {
        const isReached = index < reached.length;
        const isNext = index === nextIndex;
        const isFirst = index === 0;
        const isLast = index === milestones.length - 1;
        // How much of the half-segment above this node is filled (0..1).
        const topFill = isReached ? 1 : isNext ? (isFirst ? progress : Math.max(0, progress * 2 - 1)) : 0;
        // How much of the half-segment below this node is filled.
        const bottomFill = index < reached.length - 1 ? 1 : index === nextIndex - 1 ? Math.min(1, progress * 2) : 0;
        const nodeSize = isNext ? NEXT_NODE : NODE;

        return (
          <View key={milestone.id} style={[styles.row, { gap: spacing.md }]}>
            <View style={styles.rail}>
              <Segment fill={topFill} hidden={false} trackColor={colors.border} fillColor={colors.primary} />
              <View
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: nodeSize / 2,
                  borderWidth: LINE - 1,
                  borderColor: isReached ? colors.primary : isNext ? colors.accent : colors.border,
                  backgroundColor: isReached ? colors.primary : isNext ? colors.accentSoft : colors.surface,
                }}
              />
              <Segment fill={bottomFill} hidden={isLast} trackColor={colors.border} fillColor={colors.primary} />
            </View>

            <View style={[styles.body, { paddingVertical: spacing.item, gap: spacing.md }]}>
              <Stack gap="xxs" style={styles.copy}>
                <Text variant="label" color={isReached || isNext ? 'text' : 'muted'} numberOfLines={1}>
                  {milestone.title}
                </Text>
                <Text variant="caption" color="muted">
                  {milestone.body}
                </Text>
              </Stack>
              {isReached ? (
                <Animated.View entering={FadeIn}>
                  <Text variant="caption" color="primary" numberOfLines={1}>
                    {formatDate(startedAt + milestone.afterMs)}
                  </Text>
                </Animated.View>
              ) : isNext ? (
                <Text variant="caption" color="accent" tabular numberOfLines={1}>
                  in {formatDuration(startedAt + milestone.afterMs - now)}
                </Text>
              ) : (
                <Icon name="lock" size={14} color={colors.textMuted} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Segment({
  fill,
  hidden,
  trackColor,
  fillColor,
}: {
  fill: number;
  hidden: boolean;
  trackColor: string;
  fillColor: string;
}) {
  return (
    <View style={[styles.segment, { backgroundColor: hidden ? 'transparent' : trackColor }]}>
      {!hidden && fill > 0 ? (
        <View style={{ height: `${Math.min(1, fill) * 100}%`, backgroundColor: fillColor }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: ROW_MIN },
  rail: { width: RAIL, alignItems: 'center' },
  segment: { flex: 1, width: LINE, overflow: 'hidden' },
  body: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  copy: { flex: 1, minWidth: 0 },
});
