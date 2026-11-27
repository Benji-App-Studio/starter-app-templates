import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#C2410C';

/** The break color: calm green against the warm focus accent. */
const BREAK_COLOR = '#2E7D6B';

/** The 8-pt grid. Every padding, margin and gap in the app comes from here. */
export const spacing = {
  xs: 4,
  sm: 8,
  /** Between sibling items in a list or grid, and a section title above its content. */
  ms: 12,
  md: 16,
  /** Left and right screen gutter. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Fixed control sizes, so hit targets never drop below 44 pt. */
export const sizes = {
  /** Primary call to action. */
  cta: 56,
  /** Settings rows, inputs. */
  row: 52,
  /** Minimum hit target. */
  hit: 44,
  /** Chips and small toggles (with hitSlop to reach `hit`). */
  chip: 36,
  /** Icon tiles in lists and benefit rows. */
  iconTile: 32,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

/** Font families, loaded in `app/_layout.tsx`. Unbounded for numbers, Inter for everything else. */
export const fonts = {
  numeral: 'Unbounded_500Medium',
  numeralStrong: 'Unbounded_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  heading: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  /** Uppercase eyebrows above sections and stats. */
  eyebrow: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8 },
  /** Tab bar labels. */
  tab: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 13 },
  /** Text typed into fields. */
  input: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  /** The timer digits. */
  numeral: { fontFamily: fonts.numeralStrong, fontSize: 64, lineHeight: 72, letterSpacing: -2.5, ...tabular },
  /** Minutes on the idle dial. */
  numeralLarge: { fontFamily: fonts.numeralStrong, fontSize: 88, lineHeight: 96, letterSpacing: -4, ...tabular },
  /** The week total on the History hero. */
  numeralMedium: { fontFamily: fonts.numeralStrong, fontSize: 44, lineHeight: 52, letterSpacing: -1.6, ...tabular },
  /** Stat tiles and totals. */
  numeralSmall: { fontFamily: fonts.numeral, fontSize: 26, lineHeight: 32, letterSpacing: -0.8, ...tabular },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  /** The screen background while a focus session runs. */
  backgroundFocus: string;
  surface: string;
  /** A second, slightly deeper surface for tracks and inactive bars. */
  surfaceStrong: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  /** Breaks and "goal reached" moments. */
  secondary: string;
  secondarySoft: string;
  success: string;
  danger: string;
  dangerSoft: string;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  typography: typeof typography;
  fonts: typeof fonts;
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#FAF6F1',
    backgroundFocus: '#F3E9DD',
    surface: '#FFFFFF',
    surfaceStrong: '#EFE7DD',
    border: '#E7DED3',
    text: '#1D1712',
    textMuted: '#857A70',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    onPrimary: '#FFFFFF',
    secondary: BREAK_COLOR,
    secondarySoft: `${BREAK_COLOR}1A`,
    success: BREAK_COLOR,
    danger: '#B3261E',
    dangerSoft: '#B3261E1A',
  },
  spacing,
  radii,
  sizes,
  typography,
  fonts,
};

/** Dark is designed, not inverted: lifted warm surfaces and lower saturation. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    ...lightTheme.colors,
    background: '#15110E',
    backgroundFocus: '#1C140F',
    surface: '#221C17',
    surfaceStrong: '#2E261F',
    border: '#38302A',
    text: '#F5EFE8',
    textMuted: '#A3968A',
    primarySoft: `${PRIMARY_COLOR}33`,
    secondary: '#4FA08D',
    secondarySoft: `${BREAK_COLOR}33`,
    success: '#4FA08D',
    danger: '#E2645B',
    dangerSoft: '#E2645B26',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
