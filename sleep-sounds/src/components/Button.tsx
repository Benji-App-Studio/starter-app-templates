import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import type { IconName } from '@/components/icons';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** `primary` is the one accent action on a screen; `secondary` sits on a surface; `ghost` is text only. */
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const { colors, radii, spacing } = useTheme();
  const inactive = disabled || loading;
  const background = {
    primary: colors.primary,
    secondary: colors.surfaceRaised,
    ghost: 'transparent',
  }[variant];
  const foreground = variant === 'primary' ? colors.onPrimary : colors.text;
  const textColor = variant === 'primary' ? 'onPrimary' : 'text';

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
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
          opacity: inactive ? 0.45 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={foreground} /> : null}
          <Text variant="label" color={textColor}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
