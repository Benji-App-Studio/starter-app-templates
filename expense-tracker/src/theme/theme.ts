import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#1F6F5F';

/**
 * Typefaces, loaded in `app/_layout.tsx`. DM Serif Display carries every amount and
 * screen title; DM Sans does the reading text.
 */
export const fonts = {
  serif: 'DMSerifDisplay_400Regular',
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
} as const;

/** The 8-pt grid. Every padding, margin and gap in the app is one of these. */
export const spacing = {
  hairline: 2,
  xs: 4,
  /** Vertical padding inside pills and badges. */
  pillY: 6,
  sm: 8,
  /** Between siblings in a list or grid. */
  item: 12,
  md: 16,
  /** Left and right screen gutter. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Fixed heights for controls, so every row and key lines up. */
export const sizes = {
  hit: 44,
  input: 48,
  key: 56,
  button: 56,
  badge: 40,
  badgeLarge: 48,
  check: 24,
  iconBubble: 32,
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  /** The hero amount. */
  numeral: {
    fontFamily: fonts.serif,
    fontSize: 88,
    lineHeight: 96,
    letterSpacing: -3,
    ...tabular,
  },
  /** The amount being typed on the keypad sheets. */
  numeralSheet: {
    fontFamily: fonts.serif,
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2,
    ...tabular,
  },
  /** The hero inside onboarding and paywall previews. */
  numeralCompact: {
    fontFamily: fonts.serif,
    fontSize: 56,
    lineHeight: 62,
    letterSpacing: -1.8,
    ...tabular,
  },
  /** Amounts in rows and summaries. */
  money: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, letterSpacing: -0.4, ...tabular },
  display: { fontFamily: fonts.serif, fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  title: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 38, letterSpacing: -0.6 },
  heading: { fontFamily: fonts.sansSemiBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  /** Upper-case labels above a number or a group. Pass the text in upper case. */
  eyebrow: { fontFamily: fonts.sansSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.2 },
  /** Keypad digits. */
  key: { fontFamily: fonts.sansMedium, fontSize: 26, lineHeight: 32, ...tabular },
  /** Text typed into fields. */
  input: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 22 },
  /** Tab bar labels. */
  tab: { fontFamily: fonts.sansMedium, fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  /** Empty part of bars and rings. */
  track: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  /** Ink drawn on a category tint. */
  onTint: string;
  success: string;
  /** Over budget, destructive actions. */
  danger: string;
  dangerSoft: string;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  /** One tint per spending category, indexed by `Category.tint`. */
  categoryTints: readonly string[];
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  typography: typeof typography;
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#F6F4EE',
    surface: '#FFFFFF',
    border: '#E7E3D9',
    track: '#EAE7DE',
    text: '#14211D',
    textMuted: '#6E7A74',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    onPrimary: '#FFFFFF',
    onTint: '#14211D',
    success: PRIMARY_COLOR,
    danger: '#D9573B',
    dangerSoft: '#D9573B1F',
  },
  categoryTints: [
    '#D9A066',
    '#8FB68F',
    '#7FA8C9',
    '#C98BA6',
    '#8A8FBF',
    '#B5A15C',
    '#6FB7B0',
    '#A9A69C',
  ],
  spacing,
  radii,
  sizes,
  typography,
};

/** Dark is its own design: lifted surfaces, lower saturation, a brighter accent for contrast. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    background: '#121715',
    surface: '#1B231F',
    border: '#2C362F',
    track: '#28322C',
    text: '#EEF1EC',
    textMuted: '#98A49D',
    primary: '#4FA68F',
    primarySoft: '#4FA68F33',
    onPrimary: '#0E1A16',
    onTint: '#121715',
    success: '#4FA68F',
    danger: '#E8846A',
    dangerSoft: '#E8846A2E',
  },
  categoryTints: [
    '#E0AE7B',
    '#9BC19B',
    '#8DB5D4',
    '#D39BB4',
    '#9BA0CC',
    '#C2AF6E',
    '#7FC3BC',
    '#B5B2A8',
  ],
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
