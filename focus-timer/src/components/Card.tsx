import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

type CardProps = {
  children: ReactNode;
  /** Makes the card tappable. */
  onPress?: () => void;
  /** Highlights the border with the primary color. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A white (or lifted, in dark) panel with a hairline border. Selection uses the accent. */
export function Card({ children, onPress, selected = false, style }: CardProps) {
  const { colors, radii, spacing } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: selected ? colors.primarySoft : colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: selected ? colors.primary : colors.border,
    padding: spacing.md,
  };

  if (!onPress) {
    return <View style={[cardStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, { transform: [{ scale: pressed ? 0.985 : 1 }] }, style]}
    >
      {children}
    </Pressable>
  );
}
