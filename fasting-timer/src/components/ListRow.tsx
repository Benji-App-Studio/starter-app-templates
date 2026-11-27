import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { spacing, useTheme } from '@/theme/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Replaces the chevron on the right, e.g. a value label or a switch. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  /** Draws the divider under the row; the last row in a group passes false. */
  divider?: boolean;
};

/** One row of a grouped inset list, as in iOS Settings. */
export function ListRow({
  title,
  subtitle,
  icon,
  right,
  onPress,
  destructive = false,
  divider = true,
}: ListRowProps) {
  const { colors, radii, spacing } = useTheme();
  const titleColor = destructive ? 'danger' : 'text';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          minHeight: 52,
          paddingVertical: spacing.ms,
          gap: spacing.md,
          opacity: pressed ? 0.6 : 1,
          borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: destructive ? colors.surfaceRaised : colors.primarySoft, borderRadius: radii.sm },
          ]}
        >
          <Icon name={icon} size={17} color={destructive ? colors.danger : colors.primary} />
        </View>
      ) : null}
      <View style={styles.body}>
        <Text variant="body" color={titleColor} numberOfLines={1}>
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
    gap: spacing.xs,
  },
});
