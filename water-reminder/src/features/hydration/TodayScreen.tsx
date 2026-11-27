import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { CountUpText, EmptyState, Icon, LargeTitleScroll, Screen, Text } from '@/components';
import type { Drink } from '@/db/drinks';
import { useTheme, spacing } from '@/theme/theme';

import { AmountSheet } from './AmountSheet';
import { CupIcon } from './CupIcon';
import { formatLongDate, formatTime } from './dates';
import { GLASS_ML, amountValue, cupPresets, formatAmount, type CupPreset } from './goal';
import { EmptyGlassIllustration } from './illustrations';
import { reminderSlots, syncReminders } from './reminders';
import { hydrationSettings, useHydrationSettings } from './settings';
import { useGoal } from './useGoal';
import { useToday } from './useToday';
import { WaterGlass } from './WaterGlass';

/** Two quick taps, like a swallow, on the moment a drink is logged. */
async function gulpHaptic() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 110);
}

export function TodayScreen() {
  const router = useRouter();
  const { colors, radii, spacing } = useTheme();
  const settings = useHydrationSettings();
  const { goalMl, unit } = useGoal();
  const { drinks, totalMl, log, remove } = useToday(goalMl);
  const [customVisible, setCustomVisible] = useState(false);
  const [sloshKey, setSloshKey] = useState(0);

  // Re-schedule on launch so reminders survive a reinstall or a changed goal.
  useEffect(() => {
    void syncReminders(hydrationSettings.get());
  }, []);

  const reached = totalMl >= goalMl;
  const remainingMl = Math.max(0, goalMl - totalMl);
  const percent = goalMl > 0 ? Math.round((totalMl / goalMl) * 100) : 0;
  const slots = reminderSlots(settings).length;

  async function pour(amountMl: number) {
    void gulpHaptic();
    setSloshKey((key) => key + 1);
    await log(amountMl);
  }

  return (
    <Screen edges={['top']} padded={false}>
      <LargeTitleScroll
        title="Today"
        subtitle={formatLongDate()}
        accessory={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reminder settings"
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.pill,
              {
                backgroundColor: settings.remindersEnabled ? colors.primarySoft : colors.surface,
                borderColor: settings.remindersEnabled ? colors.primarySoft : colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.ms,
                gap: spacing.sm,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Icon
              name={settings.remindersEnabled ? 'bell' : 'bellOff'}
              size={13}
              color={settings.remindersEnabled ? colors.primary : colors.textMuted}
            />
            <Text variant="caption" color={settings.remindersEnabled ? 'primary' : 'muted'}>
              {settings.remindersEnabled ? `${slots} reminders` : 'Reminders off'}
            </Text>
          </Pressable>
        }
      >
        <View style={[styles.hero, { marginTop: spacing.sm, marginBottom: spacing.xl }]}>
          <WaterGlass
            level={goalMl > 0 ? totalMl / goalMl : 0}
            size={196}
            sloshKey={sloshKey}
            success={reached}
            marks
          />
          <View style={[styles.figures, { marginTop: spacing.lg, gap: spacing.sm }]}>
            <CountUpText
              variant="numeral"
              color={reached ? 'success' : 'text'}
              value={totalMl}
              format={(value) => amountValue(value, unit).toLocaleString()}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            />
            <Text variant="heading" color="muted">
              {unit}
            </Text>
          </View>
          <Text variant="label" color={reached ? 'success' : 'muted'} align="center" style={{ marginTop: spacing.sm }}>
            {reached
              ? `Goal of ${formatAmount(goalMl, unit)} reached`
              : `${percent}% of ${formatAmount(goalMl, unit)} · ${formatAmount(remainingMl, unit)} to go`}
          </Text>
        </View>

        <Text variant="heading" style={{ marginBottom: spacing.ms }}>
          Pour a cup
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -spacing.gutter, marginBottom: spacing.xl }}
          contentContainerStyle={{ paddingHorizontal: spacing.gutter, gap: spacing.ms }}
        >
          {cupPresets[unit].map((preset) => (
            <PourTile key={preset.id} preset={preset} unit={unit} onPress={() => pour(preset.amountMl)} />
          ))}
          <PourTile unit={unit} onPress={() => setCustomVisible(true)} />
        </ScrollView>

        <Text variant="heading" style={{ marginBottom: spacing.ms }}>
          Logged today
        </Text>
        {drinks === undefined ? null : drinks.length === 0 ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg }}>
            <EmptyState
              inline
              illustration={<EmptyGlassIllustration size={88} />}
              title="Nothing logged yet"
              body="Tap a cup when you drink and the glass fills as you go."
              action={{ title: `Log a glass (${formatAmount(GLASS_ML, unit)})`, onPress: () => pour(GLASS_ML) }}
            />
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md }}>
            {drinks.map((drink, index) => (
              <DrinkRow key={drink.id} drink={drink} unit={unit} last={index === drinks.length - 1} onDelete={() => remove(drink.id)} />
            ))}
          </View>
        )}
      </LargeTitleScroll>

      <AmountSheet
        visible={customVisible}
        onClose={() => setCustomVisible(false)}
        title="Custom amount"
        unit={unit}
        initialMl={GLASS_ML}
        submitLabel={(ml) => (ml > 0 ? `Add ${formatAmount(ml, unit)}` : 'Add')}
        onSubmit={(ml) => void pour(ml)}
      />
    </Screen>
  );
}

type PourTileProps = {
  /** Omit for the "Custom" tile. */
  preset?: CupPreset;
  unit: 'ml' | 'oz';
  onPress: () => void;
};

function PourTile({ preset, unit, onPress }: PourTileProps) {
  const { colors, radii, spacing } = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function press(down: boolean) {
    if (reducedMotion) {
      return;
    }
    scale.value = withSpring(down ? 0.93 : 1, { damping: 14, stiffness: 320 });
  }

  return (
    <Animated.View style={[styles.tileWrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={preset ? `Add ${preset.label}, ${formatAmount(preset.amountMl, unit)}` : 'Add a custom amount'}
        onPressIn={() => press(true)}
        onPressOut={() => press(false)}
        onPress={onPress}
        style={[
          styles.tile,
          {
            backgroundColor: preset ? colors.surface : 'transparent',
            borderColor: colors.border,
            borderStyle: preset ? 'solid' : 'dashed',
            borderWidth: preset ? StyleSheet.hairlineWidth : 1.5,
            borderRadius: radii.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.ms,
            gap: spacing.xs,
          },
        ]}
      >
        <View style={[styles.cupSlot, { marginBottom: spacing.sm }]}>
          {preset ? (
            <CupIcon amountMl={preset.amountMl} size={48} color={colors.primary} fill={colors.secondary} />
          ) : (
            <View style={[styles.plus, { backgroundColor: colors.primarySoft, borderRadius: radii.pill }]}>
              <Icon name="plus" size={18} color={colors.primary} weight="bold" />
            </View>
          )}
        </View>
        <Text variant="label" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {preset ? formatAmount(preset.amountMl, unit) : 'Custom'}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {preset ? preset.label : 'Any amount'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

type DrinkRowProps = {
  drink: Drink;
  unit: 'ml' | 'oz';
  last: boolean;
  onDelete: () => void;
};

function DrinkRow({ drink, unit, last, onDelete }: DrinkRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(18).stiffness(180)}
      exiting={FadeOut.duration(160)}
      layout={LinearTransition.springify().damping(20)}
      style={[
        styles.row,
        {
          gap: spacing.md,
          paddingVertical: spacing.sm + spacing.xs,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <CupIcon amountMl={drink.amountMl} size={28} color={colors.primary} fill={colors.secondary} />
      <View style={styles.rowBody}>
        <Text variant="label">{formatAmount(drink.amountMl, unit)}</Text>
        <Text variant="caption" color="muted">
          {formatTime(drink.loggedAt)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${formatAmount(drink.amountMl, unit)}`}
        hitSlop={10}
        onPress={onDelete}
        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
      >
        <Icon name="trash" size={17} color={colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', height: 32, borderWidth: StyleSheet.hairlineWidth },
  hero: { alignItems: 'center' },
  figures: { flexDirection: 'row', alignItems: 'baseline', maxWidth: '100%' },
  tileWrap: { width: 92 },
  tile: { alignItems: 'center' },
  cupSlot: { height: 48, justifyContent: 'flex-end', alignItems: 'center' },
  plus: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBody: { flex: 1, gap: spacing.sm },
});
