import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Card, Icon, Row, Stack, Text } from '@/components';
import type { IconName } from '@/components';
import { CounterRing } from '@/features/quit/CounterRing';
import { formatUnits, habits } from '@/features/quit/habits';
import { milestones } from '@/features/quit/milestones';
import { formatMoney, profileFromAnswers } from '@/features/quit/profile';
import { projectedSavings } from '@/features/quit/savings';
import { useTheme } from '@/theme/theme';

const buildSteps = ['Reading your answers', 'Working out the first month', 'Placing ten milestones'];
const STEP_MS = 350;
const RING = 200;

/**
 * The short "building your plan" moment: each step ticks off in turn (about 1.4 s in all)
 * while the ring fills, then the plan is ready. Inactive on every other step.
 */
export function usePlanBuild(active: boolean) {
  const [done, setDone] = useState(0);
  const ready = done > buildSteps.length;

  useEffect(() => {
    if (!active || ready) {
      return;
    }
    const id = setTimeout(() => setDone((value) => value + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [active, done, ready]);

  return { done, ready, progress: Math.min(1, done / buildSteps.length) };
}

/** The plan step's hero: the counter ring filling as the plan builds, then 30 days in gold. */
export function PlanHero({ answers, progress, ready }: { answers: Record<string, string>; progress: number; ready: boolean }) {
  const habit = habits[profileFromAnswers(answers).habit];

  return (
    <CounterRing size={RING} progress={progress} complete={ready}>
      <Stack align="center" gap="none">
        <Text variant="overline" color="primary" numberOfLines={1}>
          {habit.freeLabel.toUpperCase()}
        </Text>
        <Text variant="display" tabular>
          30
        </Text>
        <Text variant="label" color="muted">
          days
        </Text>
      </Stack>
    </CounterRing>
  );
}

/** Under the title: the build checklist, then the first month computed from the answers. */
export function PlanDetails({ answers, done, ready }: { answers: Record<string, string>; done: number; ready: boolean }) {
  const { colors, radii } = useTheme();
  const profile = profileFromAnswers(answers);
  const habit = habits[profile.habit];
  const month = projectedSavings(profile.unitsPerDay, profile.costPerDay, 30);

  if (!ready) {
    return (
      <Stack gap="item">
        {buildSteps.map((label, index) => (
          <Row key={label} gap="sm" style={{ opacity: index < done ? 1 : 0.4 }}>
            {index < done ? (
              <Animated.View entering={FadeIn.duration(150)}>
                <Icon name="checkCircle" size={20} color={colors.primary} />
              </Animated.View>
            ) : (
              <View style={[styles.pending, { borderColor: colors.border, borderRadius: radii.pill }]} />
            )}
            <Text variant="label">{label}</Text>
          </Row>
        ))}
      </Stack>
    );
  }

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <Card>
        <Stack gap="md">
          <PlanRow
            icon="money"
            title={`${formatMoney(month.money, profile.currency, 0)} kept`}
            body={`At ${formatMoney(profile.costPerDay, profile.currency)} a day, counted by the second.`}
          />
          <PlanRow
            icon={habit.icon}
            title={`${formatUnits(month.units, habit)} ${habit.avoidedLabel}`}
            body={`${profile.unitsPerDay} fewer ${habit.unit.many} a day, every day.`}
          />
          <PlanRow
            icon="flag"
            title={`First milestone in ${milestones[0].title}`}
            body={`Then ${milestones.length - 1} more, up to a year.`}
          />
          <PlanRow icon="wind" title="A craving button" body="One minute of slow breathing, any time you need it." />
        </Stack>
      </Card>
    </Animated.View>
  );
}

function PlanRow({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { colors, radii } = useTheme();

  return (
    <Row gap="item">
      <View style={[styles.planIcon, { backgroundColor: colors.primarySoft, borderRadius: radii.sm }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <Stack gap="xxs" style={styles.grow}>
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="muted">
          {body}
        </Text>
      </Stack>
    </Row>
  );
}

const styles = StyleSheet.create({
  pending: { width: 20, height: 20, borderWidth: 2 },
  planIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, minWidth: 0 },
});
