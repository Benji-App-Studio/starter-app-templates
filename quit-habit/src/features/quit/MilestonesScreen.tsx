import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { EmptyState, Screen, Stack, Text } from '@/components';

import { FlagIllustration } from './Illustrations';
import { MilestoneTimeline } from './MilestoneTimeline';
import { milestoneProgress, milestones } from './milestones';
import { useNow } from './time';
import { useActiveAttempt } from './useActiveAttempt';

/** Ten markers on a line that fills as the current run goes on. */
export function MilestonesScreen() {
  const router = useRouter();
  const { loaded, attempt } = useActiveAttempt();
  const now = useNow(30_000);

  if (!loaded) {
    return <Screen tab title="Milestones">{null}</Screen>;
  }

  if (!attempt) {
    return (
      <Screen tab title="Milestones" contentStyle={styles.center}>
        <EmptyState
          illustration={<FlagIllustration />}
          title="Ten markers along the way"
          body="From the first 12 hours to a full year. They unlock on their own once the counter runs."
          action={{ title: 'Start my counter', onPress: () => router.push('/start') }}
        />
      </Screen>
    );
  }

  const { reached, next } = milestoneProgress(attempt.startedAt, now);

  return (
    <Screen
      tab
      title="Milestones"
      titleAccessory={
        <Text variant="caption" color="muted" tabular>
          {reached.length} of {milestones.length}
        </Text>
      }
    >
      <Stack gap="lg">
        <Text color="muted">
          {next
            ? 'Each marker is time you kept. They fill in on their own while the counter runs.'
            : 'A full year. Every marker on this line is yours.'}
        </Text>
        <MilestoneTimeline startedAt={attempt.startedAt} now={now} />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
});
