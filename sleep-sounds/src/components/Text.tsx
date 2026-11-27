import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'success';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  /** Fixed-width digits, for any number that changes while visible. */
  tabular?: boolean;
};

export function Text({
  variant = 'body',
  color = 'text',
  align,
  tabular = false,
  style,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const colorValue: Record<TextColor, string> = {
    text: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    danger: colors.danger,
    success: colors.success,
  };

  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        typography[variant],
        { color: colorValue[color], textAlign: align },
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
