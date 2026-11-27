import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AnimatedNumber, Card, Row, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { Plant } from './Plant';
import { growthStages, stageForStreak } from './streak';

type StreakCardProps = {
  streak: number;
};

/** The streak and the plant that grows with it, with how far it is to the next stage. */
export function StreakCard({ streak }: StreakCardProps) {
  const { colors, radii, spacing } = useTheme();
  const { stage, next } = stageForStreak(streak);
  const level = growthStages.indexOf(stage);
  const toGo = next ? next.from - streak : 0;
  const hint = next ? `${toGo} more ${toGo === 1 ? 'day' : 'days'} to ${next.name.toLowerCase()}` : 'In full bloom';
  const fraction = next ? (streak - stage.from) / (next.from - stage.from) : 1;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(Math.max(0.06, fraction), { damping: 18, stiffness: 120 });
  }, [fraction, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <Card>
      <Row gap="md">
        <Plant stage={level} size={72} />
        <View style={[styles.body, { gap: spacing.xs }]}>
          <Row gap="sm" align="baseline">
            <AnimatedNumber value={streak} variant="stat" />
            <Text variant="label" color="muted" numberOfLines={1} style={styles.flex}>
              {streak === 1 ? 'day in a row' : 'days in a row'}
            </Text>
          </Row>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {`${stage.name} · ${hint}`}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.border, borderRadius: radii.pill, marginTop: spacing.xs }]}>
            <Animated.View style={[styles.fill, { backgroundColor: colors.leaf, borderRadius: radii.pill }, fill]} />
          </View>
        </View>
      </Row>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, minWidth: 0 },
  flex: { flex: 1 },
  track: { height: 6, overflow: 'hidden' },
  fill: { height: 6 },
});
