import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  /** `primary` is the accent, `secondary` a filled neutral, `tinted` the break green, `plain` text only. */
  variant?: 'primary' | 'secondary' | 'tinted' | 'plain';
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
  const { colors, radii, sizes, spacing } = useTheme();
  const inactive = disabled || loading;

  const background = {
    primary: colors.primary,
    secondary: colors.surfaceStrong,
    tinted: colors.secondary,
    plain: 'transparent',
  }[variant];
  const foreground = {
    primary: colors.onPrimary,
    secondary: colors.text,
    tinted: colors.onPrimary,
    plain: colors.textMuted,
  }[variant];

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
          minHeight: sizes.cta,
          paddingHorizontal: spacing.lg,
          opacity: inactive ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <View style={[styles.content, { gap: spacing.sm }]}>
          {icon ? <Icon name={icon} size={18} color={foreground} weight="semibold" /> : null}
          <Text variant="label" numberOfLines={1} style={{ color: foreground }}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
});
