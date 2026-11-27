import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#0F8A5F';

/** Milestone gold: used only for reached milestones and the next-up marker. */
const ACCENT_COLOR = '#E8B04B';

/** The 8-pt grid. `gutter` is the screen's side margin; `item` the gap between siblings in a list. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  item: 12,
  md: 16,
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/**
 * Manrope, loaded in `app/_layout.tsx`. Each weight is its own family name,
 * so styles set `fontFamily` and never `fontWeight`.
 */
export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  /** The hero number: the days counter. */
  numeral: { fontFamily: fonts.extrabold, fontSize: 88, lineHeight: 92, letterSpacing: -4, ...tabular },
  /** Secondary live numbers: hours, minutes, seconds, money. */
  numeralSmall: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -1, ...tabular },
  display: { fontFamily: fonts.extrabold, fontSize: 36, lineHeight: 42, letterSpacing: -1.2 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
  /** Tab bar labels. */
  tabLabel: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 13 },
  /** Chart axis labels and values inside SVG. */
  axis: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** A second, quieter surface for inset groups on top of `surface`. */
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  /** Milestone gold. */
  accent: string;
  accentSoft: string;
  /** Ink on the gold accent, e.g. the "Save NN%" badge. */
  onAccent: string;
  danger: string;
  dangerSoft: string;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  fonts: typeof fonts;
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#F4F7F5',
    surface: '#FFFFFF',
    surfaceAlt: '#EDF2EF',
    border: '#DDE5E0',
    text: '#12251D',
    textMuted: '#6D7F77',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    onPrimary: '#FFFFFF',
    accent: ACCENT_COLOR,
    accentSoft: `${ACCENT_COLOR}33`,
    onAccent: '#3A2A08',
    danger: '#C4553F',
    dangerSoft: '#C4553F1F',
  },
  spacing,
  radii,
  typography,
  fonts,
};

/** Dark is designed, not inverted: lifted surfaces, a lighter and less saturated green. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    background: '#0E1512',
    surface: '#172019',
    surfaceAlt: '#1F2B23',
    border: '#2A3830',
    text: '#EEF4F0',
    textMuted: '#93A49B',
    primary: '#3DAE87',
    primarySoft: '#3DAE8733',
    onPrimary: '#07140E',
    accent: '#E9BC64',
    accentSoft: '#E9BC642E',
    onAccent: '#2A1E05',
    danger: '#E07A66',
    dangerSoft: '#E07A6629',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
