import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** `primary` is the accent; `secondary` sits on a surface; `ghost` is a text button. */
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
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? 'onPrimary' : variant === 'ghost' ? 'primary' : 'text';
  const iconColor = isPrimary ? colors.onPrimary : variant === 'ghost' ? colors.primary : colors.text;
  const background = isPrimary ? colors.primary : variant === 'secondary' ? colors.surface : 'transparent';

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
        variant === 'ghost' ? styles.ghost : null,
        {
          backgroundColor: background,
          borderRadius: radii.md,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
          opacity: inactive ? 0.45 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={iconColor} weight="semibold" /> : null}
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
  ghost: {
    minHeight: 44,
  },
});
