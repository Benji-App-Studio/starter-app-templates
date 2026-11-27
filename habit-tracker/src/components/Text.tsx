import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'streak' | 'success' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

/** Numerals grow less with Dynamic Type so hero layouts hold together. */
const NUMERAL_MAX_SCALE = 1.3;

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const colorValue: Record<TextColor, string> = {
    text: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    streak: colors.streak,
    success: colors.success,
    danger: colors.danger,
  };
  const isNumeral = variant === 'numeral' || variant === 'numeralSmall';

  return (
    <RNText
      maxFontSizeMultiplier={isNumeral ? NUMERAL_MAX_SCALE : undefined}
      {...rest}
      style={[typography[variant], { color: colorValue[color], textAlign: align }, style]}
    />
  );
}
