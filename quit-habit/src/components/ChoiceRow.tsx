import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type ChoiceRowProps = {
  label: string;
  hint?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
};

/** A large single-choice row with a haptic tick. Used by onboarding and the pickers. */
export function ChoiceRow({ label, hint, icon, selected, onPress }: ChoiceRowProps) {
  const { colors, radii, spacing } = useTheme();

  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radii.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          gap: spacing.md,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: selected ? colors.primary : colors.surfaceAlt, borderRadius: radii.sm },
          ]}
        >
          <Icon name={icon} size={20} color={selected ? colors.onPrimary : colors.textMuted} />
        </View>
      ) : null}
      <View style={[styles.body, { gap: spacing.xxs }]}>
        <Text variant="label" numberOfLines={2}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : 'transparent',
            borderRadius: radii.pill,
          },
        ]}
      >
        {selected ? <Icon name="check" size={13} color={colors.onPrimary} weight="bold" /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 64,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
