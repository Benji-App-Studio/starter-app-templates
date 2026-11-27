import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#4F46E5';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
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
    background: '#FFFFFF',
    surface: '#F4F4F6',
    border: '#E4E4E9',
    text: '#111114',
    textMuted: '#6B6B78',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1F`,
    onPrimary: '#FFFFFF',
    success: '#16A34A',
    danger: '#DC2626',
  },
  spacing,
  radii,
  typography,
};

export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    ...lightTheme.colors,
    background: '#0B0B0F',
    surface: '#17171D',
    border: '#2A2A33',
    text: '#F4F4F6',
    textMuted: '#9A9AA8',
    primarySoft: `${PRIMARY_COLOR}40`,
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
