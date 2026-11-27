import { Children, Fragment, type ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/theme/theme';

type GroupProps = {
  children: ReactNode;
};

/** Inset grouped rows (settings style): one surface, hairline dividers between rows. */
export function Group({ children }: GroupProps) {
  const { colors, radii, spacing, layout } = useTheme();
  const rows = Children.toArray(children);

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: layout.hairline,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
      }}
    >
      {rows.map((row, index) => (
        <Fragment key={index}>
          {index > 0 ? <View style={{ height: layout.hairline, backgroundColor: colors.border }} /> : null}
          {row}
        </Fragment>
      ))}
    </View>
  );
}
