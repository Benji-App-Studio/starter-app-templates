import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'pr' | 'onPr' | 'success';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

const NUMBER_VARIANTS: TypographyVariant[] = ['numeral', 'numeralMedium', 'numeralSmall', 'stepper'];

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const { colors, typography } = useTheme();
  const colorValue: Record<TextColor, string> = {
    text: colors.text,
    muted: colors.textMuted,
    primary: colors.accentText,
    onPrimary: colors.onPrimary,
    danger: colors.danger,
    pr: colors.pr,
    onPr: colors.onPr,
    success: colors.success,
  };
  const isNumber = NUMBER_VARIANTS.includes(variant);
  // Numbers never wrap: they shrink to fit their slot. Hero sizes also cap how far Dynamic Type grows them.
  const fit = isNumber ? { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.5 } : undefined;
  const maxFontSizeMultiplier = isNumber || variant === 'display' ? 1.3 : 2;

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...fit}
      {...rest}
      style={[typography[variant], { color: colorValue[color], textAlign: align }, style]}
    />
  );
}
