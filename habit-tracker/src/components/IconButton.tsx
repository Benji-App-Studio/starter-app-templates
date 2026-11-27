import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type IconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** `filled` is the accent circle used for the main add action. */
  variant?: 'filled' | 'plain';
};

const SIZE = 44;

export function IconButton({ icon, accessibilityLabel, onPress, variant = 'plain' }: IconButtonProps) {
  const { colors, radii } = useTheme();
  const filled = variant === 'filled';

  function handlePress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: radii.pill,
          backgroundColor: filled ? colors.primary : colors.surfaceSunken,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <Icon name={icon} size={filled ? 20 : 17} color={filled ? colors.onPrimary : colors.text} weight="bold" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
});
