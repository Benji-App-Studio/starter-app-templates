import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Replaces the chevron on the right, e.g. a value label or a stepper. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
};

export function ListRow({ title, subtitle, icon, right, onPress, destructive = false }: ListRowProps) {
  const { colors, radii, spacing } = useTheme();
  const titleColor = destructive ? 'danger' : 'text';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: spacing.item, gap: spacing.item, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft, borderRadius: radii.sm },
          ]}
        >
          <Icon name={icon} size={16} color={destructive ? colors.danger : colors.primary} />
        </View>
      ) : null}
      <View style={[styles.body, { gap: spacing.xxs }]}>
        <Text variant="body" color={titleColor} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron" size={14} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  iconWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
});
