import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme, type TypographyVariant } from '@/theme/theme';

type TextColor = 'text' | 'muted' | 'primary' | 'onPrimary' | 'danger';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
};

/** Large amounts scale less with Dynamic Type so the hero never wraps. */
const maxScale: Record<TypographyVariant, number> = {
  numeral: 1.15,
  numeralSheet: 1.15,
  numeralCompact: 1.15,
  money: 1.3,
  display: 1.3,
  title: 1.4,
  heading: 1.6,
  body: 1.8,
  label: 1.8,
  caption: 1.8,
  eyebrow: 1.6,
  key: 1.3,
  input: 1.8,
  tab: 1.3,
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
      maxFontSizeMultiplier={maxScale[variant]}
      {...rest}
      style={[typography[variant], { color: colorValue[color], textAlign: align }, style]}
    />
  );
}
