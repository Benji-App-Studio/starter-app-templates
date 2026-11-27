import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

type CardProps = {
  children: ReactNode;
  /** Makes the card tappable. */
  onPress?: () => void;
  onLongPress?: () => void;
  /** Highlights the border with the accent. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A flat surface. Depth comes from the surface step, never from a shadow. */
export function Card({ children, onPress, onLongPress, selected = false, style }: CardProps) {
  const { colors, radii, spacing } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: selected ? colors.primarySoft : colors.surface,
    borderRadius: radii.lg,
    borderCurve: 'continuous',
    borderWidth: 1.5,
    borderColor: selected ? colors.primary : colors.surface,
    padding: spacing.md,
  };

  if (!onPress && !onLongPress) {
    return <View style={[cardStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.8 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
