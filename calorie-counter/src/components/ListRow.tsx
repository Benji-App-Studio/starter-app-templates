import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/icons';
import { spacing as grid, useTheme } from '@/theme/theme';

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
  const { colors, spacing } = useTheme();
  const titleColor = destructive ? 'danger' : 'text';

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: spacing.md, gap: spacing.md, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={destructive ? colors.danger : colors.text} /> : null}
      <View style={styles.body}>
        <Text variant="body" color={titleColor}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="muted">
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
  body: {
    flex: 1,
    minWidth: 0,
    gap: grid.xs,
  },
});
