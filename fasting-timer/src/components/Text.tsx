import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'gold' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

/** Large numerals grow less with Dynamic Type so the hero keeps its shape. */
const scaleCap: Partial<Record<TypographyVariant, number>> = {
  display: 1.4,
  numeral: 1.2,
  stat: 1.3,
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const colorValue: Record<TextColor, string> = {
    text: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    gold: colors.gold,
    danger: colors.danger,
  };

  return (
    <RNText
      maxFontSizeMultiplier={scaleCap[variant]}
      {...rest}
      style={[typography[variant], { color: colorValue[color], textAlign: align }, style]}
    />
  );
}
