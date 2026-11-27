import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#1E9BD7';

/** Nunito, loaded in `app/_layout.tsx`. Weights map to separate families in React Native. */
export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

/** The 8-pt grid. Every margin, padding and gap comes from here. */
export const spacing = {
  xs: 4,
  sm: 8,
  /** Between siblings in a list or grid, and under a section title. */
  ms: 12,
  md: 16,
  /** Left and right screen margin for all content. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Bottom padding of a scrolling tab screen: the 49 pt tab bar plus 24 pt of air. */
  tabClearance: 72,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/** Tabular figures so a changing number never shifts the text around it. */
const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  title: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  /** The hero number: today's total, the goal on the plan screen. */
  numeral: { fontFamily: fonts.extrabold, fontSize: 72, lineHeight: 76, letterSpacing: -2.5, ...tabular },
  /** Smaller figures in stat tiles and chart labels. */
  stat: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 32, letterSpacing: -0.8, ...tabular },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** A second surface level for rows inside cards, pressed states, chart tracks. */
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  /** Translucent tint of the accent for soft fills and selection. */
  primarySoft: string;
  /** The lighter water tone: wave highlights, secondary chart bars. */
  secondary: string;
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

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#F2F8FC',
    surface: '#FFFFFF',
    surfaceRaised: '#EAF3F9',
    border: '#D8E6EF',
    text: '#0F2A3D',
    textMuted: '#6B8597',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    secondary: '#7FD3F5',
    onPrimary: '#FFFFFF',
    success: '#1FA26A',
    danger: '#D9534F',
  },
  spacing,
  radii,
  typography,
};

/** Dark is its own palette: lifted navy surfaces and a calmer, less saturated accent. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    background: '#0B1620',
    surface: '#13232F',
    surfaceRaised: '#1B2F3D',
    border: '#24394A',
    text: '#E8F2F8',
    textMuted: '#8EA6B6',
    primary: '#3FAEE4',
    primarySoft: '#3FAEE433',
    secondary: '#5CC2E8',
    onPrimary: '#06202F',
    success: '#3DBE80',
    danger: '#E57373',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
