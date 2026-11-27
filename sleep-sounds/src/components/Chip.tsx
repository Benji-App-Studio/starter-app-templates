import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

/** A pill option in a row of choices. Selection ticks the haptic engine once. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, radii, spacing } = useTheme();

  function handlePress() {
    void Haptics.selectionAsync();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => ({
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        borderRadius: radii.pill,
        backgroundColor: selected ? colors.primary : colors.surfaceRaised,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text variant="label" color={selected ? 'onPrimary' : 'text'} tabular>
        {label}
      </Text>
    </Pressable>
  );
}
