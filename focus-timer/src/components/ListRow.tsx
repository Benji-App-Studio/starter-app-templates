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
  /** Replaces the chevron on the right, e.g. a value label or a switch. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
};

export function ListRow({ title, subtitle, icon, right, onPress, destructive = false }: ListRowProps) {
  const { colors, radii, sizes, spacing } = useTheme();
  const titleColor = destructive ? 'danger' : 'text';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { minHeight: sizes.row, paddingVertical: spacing.ms, gap: spacing.ms, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              width: sizes.iconTile,
              height: sizes.iconTile,
              borderRadius: radii.sm,
              backgroundColor: destructive ? colors.dangerSoft : colors.primarySoft,
            },
          ]}
        >
          <Icon name={icon} size={17} color={destructive ? colors.danger : colors.primary} weight="semibold" />
        </View>
      ) : null}
      <View style={[styles.body, { gap: spacing.xs }]}>
        <Text variant="body" color={titleColor} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron" size={14} color={colors.textMuted} weight="semibold" /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
});
