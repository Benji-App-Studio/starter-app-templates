import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
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
  const foreground = isPrimary ? colors.onPrimary : colors.primary;

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
          backgroundColor: isPrimary ? colors.primary : colors.primarySoft,
          borderRadius: radii.pill,
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
          {icon ? <Icon name={icon} size={18} color={foreground} /> : null}
          <Text variant="label" color={isPrimary ? 'onPrimary' : 'primary'}>
            {title}
          </Text>
        </View>
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
  content: { flexDirection: 'row', alignItems: 'center' },
});
