import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { Card, DotsMark, Icon, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { formatTime } from '../habits/dates';
import type { Starter } from '../habits/starters';
import { TodayRing } from '../habits/TodayRing';

/** How long the "building" moment lasts: long enough to read, short enough to not feel staged. */
const BUILD_MS = 1200;
const DOT_STEP_MS = BUILD_MS / 9;

type PlanStepProps = {
  starters: Starter[];
  /** Which starters are ticked, same order as `starters`. */
  selected: boolean[];
  onToggle: (index: number) => void;
  checkinLabel: string;
  reminderTime: string;
  onReady: () => void;
};

/** The last onboarding step: the plan computed from the answers, with each habit tickable. */
export function PlanStep({ starters, selected, onToggle, checkinLabel, reminderTime, onReady }: PlanStepProps) {
  const { colors, radii, spacing } = useTheme();
  const [filled, setFilled] = useState(0);
  const building = filled < 9;

  useEffect(() => {
    if (!building) {
      onReady();
      return;
    }
    const timer = setTimeout(() => setFilled((count) => count + 1), DOT_STEP_MS);
    return () => clearTimeout(timer);
  }, [building, filled, onReady]);

  if (building) {
    return (
      <Animated.View exiting={FadeOut} style={[styles.building, { gap: spacing.lg }]}>
        <DotsMark size={120} filled={filled} />
        <Text color="muted">Building your plan</Text>
      </Animated.View>
    );
  }

  const count = selected.filter(Boolean).length;

  return (
    <Animated.View entering={FadeIn} style={{ gap: spacing.md }}>
      <View style={styles.ring}>
        <TodayRing total={count} done={count} size={132}>
          <Text variant="numeralSmall" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {count}
          </Text>
          <Text variant="caption" color="muted">
            a day
          </Text>
        </TodayRing>
      </View>
      <View style={[styles.summary, { gap: spacing.sm }]}>
        <Icon name="bell" size={16} color={colors.primary} />
        <Text variant="caption" color="muted">
          {checkinLabel} check-in · reminder at {formatTime(reminderTime)}, every day
        </Text>
      </View>
      {starters.map((starter, index) => (
        <Animated.View key={starter.name} entering={FadeInDown.delay(index * 70).springify().damping(16)}>
          <Card
            selected={selected[index]}
            onPress={() => {
              void Haptics.selectionAsync();
              onToggle(index);
            }}
          >
            <View style={[styles.row, { gap: spacing.md }]}>
              <View style={[styles.icon, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
                <Icon name={starter.icon} size={20} color={colors.primary} />
              </View>
              <Text variant="label" numberOfLines={1} style={styles.name}>
                {starter.name}
              </Text>
              <View
                style={[
                  styles.tick,
                  {
                    borderRadius: radii.pill,
                    backgroundColor: selected[index] ? colors.primary : 'transparent',
                    borderColor: selected[index] ? colors.primary : colors.border,
                  },
                ]}
              >
                {selected[index] ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
              </View>
            </View>
          </Card>
        </Animated.View>
      ))}
      <Text variant="caption" color="muted" align="center">
        {count === 0 ? 'Start empty and add your own habits on Today.' : `${count} ${count === 1 ? 'habit' : 'habits'} to start with. Edit any of them later.`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  building: { alignItems: 'center' },
  ring: { alignItems: 'center' },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, minWidth: 0 },
  tick: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
