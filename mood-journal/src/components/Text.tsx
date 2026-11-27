import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const colorValue: Record<TextColor, string> = {
    text: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    danger: colors.danger,
  };

  return (
    <RNText
      {...rest}
      maxFontSizeMultiplier={1.6}
      style={[typography[variant], { color: colorValue[color], textAlign: align }, style]}
    />
  );
}
