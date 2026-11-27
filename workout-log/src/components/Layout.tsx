import { Children, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text';
import { spacing as spacingScale, useTheme } from '@/theme/theme';

type Gap = keyof typeof spacingScale;

type StackProps = {
  children: ReactNode;
  /** Space between children, from the spacing scale. Children never carry their own margins. */
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  style?: StyleProp<ViewStyle>;
};

/** Vertical layout with token gaps. */
export function Stack({ children, gap = 'sm', align, style }: StackProps) {
  const { spacing } = useTheme();
  return <View style={[{ gap: spacing[gap], alignItems: align }, style]}>{children}</View>;
}

type RowProps = StackProps & { justify?: ViewStyle['justifyContent'] };

/** Horizontal layout, centred on one line, with token gaps. */
export function Row({ children, gap = 'sm', align = 'center', justify, style }: RowProps) {
  const { spacing } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap: spacing[gap] }, style]}>
      {children}
    </View>
  );
}

/** A text column inside a Row: takes the free space and lets trailing values keep theirs. */
export function Fill({ children, gap = 'xs', style }: Omit<StackProps, 'align'>) {
  const { spacing } = useTheme();
  return <View style={[{ flex: 1, minWidth: 0, gap: spacing[gap] }, style]}>{children}</View>;
}

type SectionProps = {
  title: string;
  children: ReactNode;
  /** Right side of the title line, e.g. a count. */
  aside?: ReactNode;
};

/** A titled block: the title sits 12 pt above its content. Screens space sections with `gap`. */
export function Section({ title, aside, children }: SectionProps) {
  return (
    <Stack gap="smd">
      <Row justify="space-between">
        <Text variant="overline" color="muted" numberOfLines={1} style={{ flexShrink: 1 }}>
          {title}
        </Text>
        {aside}
      </Row>
      {children}
    </Stack>
  );
}

/** An inset group of rows (settings, sessions, sets) with hairlines between them. */
export function Group({ children }: { children: ReactNode }) {
  const { colors, radii, spacing } = useTheme();
  const rows = Children.toArray(children);
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={index}
          style={{ borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth, borderTopColor: colors.border }}
        >
          {row}
        </View>
      ))}
    </View>
  );
}

type BadgeProps = {
  label: string;
  tone?: 'pr' | 'primary';
  /** Fixed width so the badge can stand in a table column. */
  width?: number;
};

/** A small filled label: PR, Save 40%, Best value. */
export function Badge({ label, tone = 'primary', width }: BadgeProps) {
  const { colors, radii, spacing } = useTheme();
  return (
    <View
      style={{
        backgroundColor: tone === 'pr' ? colors.pr : colors.primary,
        borderRadius: radii.sm,
        paddingHorizontal: width ? 0 : spacing.chipX,
        paddingVertical: spacing.chipY,
        width,
        alignItems: 'center',
      }}
    >
      <Text variant="badge" color={tone === 'pr' ? 'onPr' : 'onPrimary'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
