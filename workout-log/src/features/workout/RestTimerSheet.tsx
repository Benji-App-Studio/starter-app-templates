import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Button, Fill, Row, Sheet, Stack, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { formatClock } from './format';
import type { RestTimer } from './useRestTimer';

type RestTimerSheetProps = { timer: RestTimer };

/**
 * Slides up when a set is checked and does not block the table behind it. The bar drains in
 * real time (a linear timing is right here: it is a clock, not a gesture) and the sheet turns
 * to "Go" in the accent when the rest is over.
 */
export function RestTimerSheet({ timer }: RestTimerSheetProps) {
  const { colors, radii } = useTheme();
  const fill = useSharedValue(1);
  const done = timer.running && timer.remainingMs === 0;

  useEffect(() => {
    if (timer.endsAt === undefined) {
      return;
    }
    const remaining = Math.max(0, timer.endsAt - Date.now());
    fill.value = timer.totalMs > 0 ? remaining / timer.totalMs : 0;
    fill.value = withTiming(0, { duration: remaining, easing: Easing.linear });
  }, [fill, timer.endsAt, timer.totalMs]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <Sheet visible={timer.running} onDismiss={timer.skip} dim={false}>
      <Stack gap="md">
        <Row gap="md">
          <Fill>
            <Text variant="overline" color={done ? 'primary' : 'muted'}>
              {done ? 'Rest over · next set' : 'Rest'}
            </Text>
            <Text
              variant="numeral"
              color={done ? 'primary' : 'text'}
              accessibilityLiveRegion="polite"
              accessibilityLabel={`${Math.ceil(timer.remainingMs / 1000)} seconds of rest left`}
            >
              {formatClock(timer.remainingMs)}
            </Text>
          </Fill>
          <Button title={done ? 'Go' : 'Skip'} icon={done ? 'play' : 'skip'} onPress={timer.skip} />
        </Row>
        <View style={[styles.track, { backgroundColor: colors.surfaceRaised, borderRadius: radii.pill }]}>
          <Animated.View style={[styles.fill, { backgroundColor: colors.primary, borderRadius: radii.pill }, fillStyle]} />
        </View>
        <Row gap="smd">
          <Button title="−15 s" variant="secondary" size="sm" onPress={() => timer.adjust(-15)} disabled={done} style={styles.adjust} />
          <Button title="+15 s" variant="secondary" size="sm" onPress={() => timer.adjust(15)} disabled={done} style={styles.adjust} />
        </Row>
      </Stack>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, overflow: 'hidden' },
  fill: { height: '100%' },
  adjust: { flex: 1 },
});
