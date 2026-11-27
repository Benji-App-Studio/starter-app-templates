import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { Icon, Text } from '@/components';
import type { Habit } from '@/db/habits';
import { useTheme } from '@/theme/theme';

import { HoldRing, HoldToComplete } from './HoldToComplete';

type HabitTileProps = {
  habit: Habit;
  done: boolean;
  streak: number;
  width: number;
  index: number;
  onToggle: () => void;
  onOpen: () => void;
};

const RING = 56;

/** A grid tile for one habit due today. Hold to check it off, tap to open it. */
export function HabitTile({ habit, done, streak, width, index, onToggle, onOpen }: HabitTileProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40)
        .springify()
        .damping(18)}
      layout={LinearTransition.springify().damping(18)}
      style={{ width }}
    >
      <HoldToComplete
        done={done}
        onToggle={onToggle}
        onPress={onOpen}
        accessibilityLabel={`${habit.name}${done ? ', done today' : ''}${streak > 0 ? `, ${streak} day streak` : ''}`}
      >
        {(hold) => (
          <View
            style={[
              styles.tile,
              {
                backgroundColor: done ? colors.primary : colors.surface,
                borderRadius: radii.lg,
                padding: spacing.md,
                gap: spacing.sm,
              },
            ]}
          >
            <View style={styles.top}>
              <HoldRing hold={hold} done={done} size={RING}>
                <Icon name={habit.icon} size={22} color={done ? colors.onPrimary : colors.primary} />
              </HoldRing>
              {done ? <Icon name="check" size={18} color={colors.onPrimary} weight="bold" /> : null}
            </View>
            <Text variant="label" numberOfLines={2} style={[styles.name, done ? { color: colors.onPrimary } : null]}>
              {habit.name}
            </Text>
            {streak > 0 ? (
              <View style={[styles.streak, { gap: spacing.sm }]}>
                <Icon name="flame" size={13} color={done ? colors.onPrimary : colors.streak} weight="bold" />
                <Text
                  variant="caption"
                  style={{ color: done ? colors.onPrimary : colors.textMuted, fontVariant: ['tabular-nums'] }}
                >
                  {streak} {streak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            ) : (
              <Text variant="caption" style={{ color: done ? colors.onPrimary : colors.textMuted }}>
                {done ? 'Done today' : 'Hold to check off'}
              </Text>
            )}
          </View>
        )}
      </HoldToComplete>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: { minHeight: 156 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Two lines reserved so a row of tiles keeps one height whatever the names.
  name: { flexGrow: 1, minHeight: 40 },
  streak: { flexDirection: 'row', alignItems: 'center' },
});
