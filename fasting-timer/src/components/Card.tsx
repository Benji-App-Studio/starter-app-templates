import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme/theme';

type CardProps = {
  children: ReactNode;
  /** Makes the card tappable, with a selection tick. */
  onPress?: () => void;
  /** Accent border and a tinted fill. */
  selected?: boolean;
  /** `raised` sits on top of another surface. */
  tone?: 'surface' | 'raised';
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, selected = false, tone = 'surface', style }: CardProps) {
  const { colors, radii, spacing } = useTheme();
  const cardStyle: ViewStyle = {
    backgroundColor: selected
      ? colors.primarySoft
      : tone === 'raised'
        ? colors.surfaceRaised
        : colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: selected ? colors.primary : 'transparent',
    padding: spacing.md,
  };

  if (!onPress) {
    return <View style={[cardStyle, style]}>{children}</View>;
  }

  function handlePress() {
    void Haptics.selectionAsync();
    onPress?.();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
