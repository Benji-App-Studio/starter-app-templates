import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color (accent-2, the deep violet). `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#3B2F8F';

export const fonts = {
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  /** Between sibling items in a list or grid. */
  item: 12,
  md: 16,
  /** Left and right screen margin for all content. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/**
 * The type scale. Display and numerals are set light: thin strokes read as calm at night.
 * Numerals are tabular so a countdown never jitters as digits change.
 */
export const typography = {
  display: { fontFamily: fonts.light, fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  numeral: {
    fontFamily: fonts.light,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -2.5,
    fontVariant: ['tabular-nums'],
  },
  title: { fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** A second step up from `surface`, for a control sitting on a card. */
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  /** The accent: the hero, the primary action, selection. Used sparingly. */
  primary: string;
  /** The deep brand violet behind the accent. */
  primaryDeep: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  danger: string;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

/** Night is the native state of this app; dark is designed first and light is the daytime version. */
export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    background: '#0B0A1A',
    surface: '#16142B',
    surfaceRaised: '#201D3A',
    border: '#2A2745',
    text: '#ECEAF7',
    textMuted: '#8C88A8',
    primary: '#8A7CFF',
    primaryDeep: PRIMARY_COLOR,
    primarySoft: '#8A7CFF2E',
    onPrimary: '#0B0A1A',
    success: '#6EE7A8',
    danger: '#FB7185',
  },
  spacing,
  radii,
  typography,
};

export const lightTheme: Theme = {
  ...darkTheme,
  scheme: 'light',
  colors: {
    background: '#F4F2FB',
    surface: '#FFFFFF',
    surfaceRaised: '#ECE9F8',
    border: '#DDD9EE',
    text: '#14122A',
    textMuted: '#6F6B8A',
    primary: '#5B4BD6',
    primaryDeep: PRIMARY_COLOR,
    primarySoft: '#5B4BD61F',
    onPrimary: '#FFFFFF',
    success: '#16A34A',
    danger: '#DC2626',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'light' ? lightTheme : darkTheme;
}
