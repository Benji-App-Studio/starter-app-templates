import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { Button, Card, EmptyState, Icon, ProgressBar, Row, Screen, Stack, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { CounterRing } from './CounterRing';
import { SproutIllustration } from './Illustrations';
import { TimeFreeCounter } from './TimeFreeCounter';
import { habits } from './habits';
import { milestoneProgress } from './milestones';
import { formatMoney, useProfile } from './profile';
import { attemptSavings } from './savings';
import { formatDateTime, formatDuration, useNow } from './time';
import { useActiveAttempt } from './useActiveAttempt';

const MAX_RING = 320;

/** Home: the live counter, what it has saved, the next milestone, and the craving button. */
export function CounterScreen() {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const { width } = useWindowDimensions();
  const profile = useProfile();
  const { loaded, attempt, cravings } = useActiveAttempt();
  const now = useNow();

  if (!loaded || !profile) {
    return <Screen tab>{null}</Screen>;
  }

  const habit = habits[profile.habit];

  if (!attempt) {
    return (
      <Screen tab contentStyle={styles.center}>
        <EmptyState
          illustration={<SproutIllustration />}
          title="Ready when you are"
          body={`The counter starts the moment you say so. Every hour after that adds to your time, your money and the ${habit.unit.many} you leave behind.`}
          action={{ title: 'Start my counter', onPress: () => router.push('/start') }}
        />
      </Screen>
    );
  }

  const savings = attemptSavings(attempt, now);
  const milestone = milestoneProgress(attempt.startedAt, now);
  const ringSize = Math.min(width - spacing.gutter * 2, MAX_RING);

  return (
    <Screen
      tab
      scroll
      footer={
        <>
          <Button title="I have a craving" icon="wind" onPress={() => router.push('/craving')} />
          <Button title="I slipped" variant="ghost" onPress={() => router.push('/slip')} />
        </>
      }
    >
      <Stack gap="lg" grow>
        <View style={styles.hero}>
          <Stack align="center" gap="md">
            <Text variant="caption" color="muted" align="center" numberOfLines={1}>
              Since {formatDateTime(attempt.startedAt)}
            </Text>
            <CounterRing size={ringSize} progress={milestone.progress}>
              <TimeFreeCounter elapsedMs={savings.elapsedMs} label={habit.freeLabel} />
            </CounterRing>
          </Stack>
        </View>

        <Stack gap="item">
          <Row gap="item" align="stretch">
            <Stat label="Kept" value={formatMoney(savings.money, profile.currency)} />
            {/* Numbers alone keep the three values the same size; the unit moves into the caption. */}
            <Stat
              label={`${capitalize(habit.unit.many)} ${habit.avoidedLabel}`}
              value={Math.floor(savings.units).toLocaleString()}
            />
            <Stat label="Cravings beaten" value={String(cravings)} />
          </Row>

          <Card>
            <Stack gap="item">
              <Row gap="sm">
                <Icon name="flag" size={16} color={colors.accent} />
                <Text variant="label" numberOfLines={1} style={styles.grow}>
                  {milestone.next ? `Next: ${milestone.next.title}` : 'Every milestone reached'}
                </Text>
                {milestone.next ? (
                  <Text variant="caption" color="muted" tabular numberOfLines={1}>
                    in {formatDuration(milestone.remainingMs)}
                  </Text>
                ) : null}
              </Row>
              <ProgressBar progress={milestone.progress} color={colors.accent} />
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Screen>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.stat}>
      <Stack gap="xxs">
        <Text variant="heading" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {value}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={2}>
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  hero: { flexGrow: 1, justifyContent: 'center' },
  stat: { flex: 1, minWidth: 0 },
  grow: { flex: 1, minWidth: 0 },
});
