import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

type CardProps = {
  children: ReactNode;
  /** Makes the card tappable. */
  onPress?: () => void;
  /** Highlights the border with the accent. */
  selected?: boolean;
  /** `raised` sits on top of another card. */
  tone?: 'surface' | 'raised';
  style?: StyleProp<ViewStyle>;
};

/** A flat panel with a hairline border; no shadows anywhere in this app. */
export function Card({ children, onPress, selected = false, tone = 'surface', style }: CardProps) {
  const { colors, radii, spacing } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: tone === 'raised' ? colors.surfaceRaised : colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
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
      style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.8 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
