import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#2F6FE0';

/** Loaded once in the root layout; the splash screen stays up until they are ready. */
export const fonts = { Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold };

const family = {
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  ms: 12,
  md: 16,
  /** Left and right margin for all screen content. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/**
 * Sora at every role. Numbers that change use `numeral` or `stat`:
 * tabular figures keep them from jumping as they tick.
 */
export const typography = {
  display: { fontFamily: family.bold, fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  title: { fontFamily: family.semibold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  heading: { fontFamily: family.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: family.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: family.medium, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: family.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.1 },
  /** Tab bar labels only. */
  micro: { fontFamily: family.medium, fontSize: 11, lineHeight: 13, letterSpacing: 0.1 },
  numeral: {
    fontFamily: family.semibold,
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -2.5,
    fontVariant: ['tabular-nums'],
  },
  stat: {
    fontFamily: family.semibold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** A step above `surface`: chips, selected rows, the ring track. */
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  /** Goal reached, completed fasts, streaks. */
  gold: string;
  /** Gold as a quiet fill behind gold text and icons. */
  goldSoft: string;
  danger: string;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

/** The night palette is the one the app was designed in. */
export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    background: '#0C1020',
    surface: '#151A2E',
    surfaceRaised: '#1D2440',
    border: '#262D4A',
    text: '#EEF1FA',
    textMuted: '#8D93AD',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}3D`,
    onPrimary: '#FFFFFF',
    gold: '#F2B84B',
    goldSoft: '#F2B84B26',
    danger: '#E5635F',
  },
  spacing,
  radii,
  typography,
};

/** Daylight: the same ink and accent on paper-white surfaces, gold darkened to stay readable. */
export const lightTheme: Theme = {
  ...darkTheme,
  scheme: 'light',
  colors: {
    background: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceRaised: '#EAEEF7',
    border: '#DCE1EE',
    text: '#0C1020',
    textMuted: '#5F6782',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1F`,
    onPrimary: '#FFFFFF',
    gold: '#C98F1F',
    goldSoft: '#C98F1F1F',
    danger: '#D64545',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'light' ? lightTheme : darkTheme;
}
