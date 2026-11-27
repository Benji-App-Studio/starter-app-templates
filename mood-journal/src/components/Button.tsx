import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
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
  const { colors, radii, spacing, layout } = useTheme();
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';
  const background = isPrimary ? colors.primary : variant === 'secondary' ? colors.surface : 'transparent';
  const labelColor = isPrimary ? 'onPrimary' : variant === 'secondary' ? 'text' : 'primary';

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
          borderRadius: radii.pill,
          minHeight: layout.ctaHeight,
          borderWidth: variant === 'secondary' ? layout.hairline : 0,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          opacity: inactive ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.text} />
      ) : (
        <Text variant="label" color={labelColor} numberOfLines={1}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
