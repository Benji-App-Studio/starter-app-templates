import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#E0532F';

/** An 8-pt grid (4 for hairline gaps between related lines). Use only these values. */
export const spacing = {
  xs: 4,
  sm: 8,
  /** Between sibling rows and cards; a section title sits this far above its content. */
  ms: 12,
  md: 16,
  /** Left and right screen gutter for all content. */
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

/** Plus Jakarta Sans, loaded in `app/_layout.tsx` from `@expo-google-fonts/plus-jakarta-sans`. */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  title: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.7 },
  heading: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18 },
  /** Section titles in capitals. */
  overline: { fontFamily: fontFamily.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
  /** Tab bar labels and the day numbers inside the week strip's small rings. */
  micro: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, ...tabular },
  /** Hero numbers: calories left, the plan target. */
  numeral: { fontFamily: fontFamily.extrabold, fontSize: 64, lineHeight: 68, letterSpacing: -2.5, ...tabular },
  /** Secondary numbers: day totals, macro grams. */
  stat: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 26, letterSpacing: -0.5, ...tabular },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  danger: string;
  /** Macro ring colors. */
  protein: string;
  carbs: string;
  fat: string;
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
    background: '#FAFAF8',
    surface: '#FFFFFF',
    border: '#E9E9E4',
    text: '#0E0E0E',
    textMuted: '#7A7A75',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    onPrimary: '#FFFFFF',
    success: '#36A26A',
    danger: '#D9342B',
    protein: '#2F7DE0',
    carbs: '#E3A72F',
    fat: '#36A26A',
  },
  spacing,
  radii,
  typography,
};

/** Dark lifts the surfaces and lowers saturation instead of inverting light. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    ...lightTheme.colors,
    background: '#111110',
    surface: '#1C1C1A',
    border: '#2B2B28',
    text: '#F2F2EE',
    textMuted: '#9A9A93',
    primarySoft: `${PRIMARY_COLOR}33`,
    success: '#4FB57F',
    danger: '#E5675E',
    protein: '#5C9AE6',
    carbs: '#E8B957',
    fat: '#4FB57F',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
