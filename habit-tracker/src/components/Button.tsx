import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** `destructive` is a quiet red text button for delete and reset actions. */
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, radii, spacing } = useTheme();
  const inactive = disabled || loading;
  const background = {
    primary: colors.primary,
    secondary: colors.surfaceSunken,
    destructive: 'transparent',
  }[variant];
  const textColor = { primary: 'onPrimary', secondary: 'text', destructive: 'danger' } as const;

  function handlePress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          opacity: inactive ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.text} />
      ) : (
        <Text variant="label" color={textColor[variant]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
