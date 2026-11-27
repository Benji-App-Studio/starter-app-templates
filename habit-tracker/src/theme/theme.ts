import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#5B4BDB';

/** The streak color: warm against the cool accent, used only for streak marks. */
const STREAK_COLOR = '#FFB547';

/**
 * Two families: Bricolage Grotesque carries the big, characterful text (titles, numerals);
 * Figtree carries everything that has to be read quickly. Loaded in `app/_layout.tsx`.
 */
export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_600SemiBold',
  body: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
} as const;

export const spacing = {
  /** Hairline gaps between two lines of the same block. */
  xxs: 2,
  xs: 4,
  sm: 8,
  /** Between sibling items in a list or grid. */
  item: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Left and right screen margin for all content. */
  gutter: 20,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

const tabular: TextStyle['fontVariant'] = ['tabular-nums'];

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -1.2 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.8 },
  heading: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  /** Tab bar labels; no line height so the native tab bar can lay them out. */
  tabLabel: { fontFamily: fonts.semibold, fontSize: 11 },
  /** Hero numbers. Tabular so a changing count does not shift the layout. */
  numeral: {
    fontFamily: fonts.displayHeavy,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: -3,
    fontVariant: tabular,
  },
  /** Numbers in stat tiles and rows. */
  numeralSmall: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    fontVariant: tabular,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** A second surface level, for a card inside a card or a sunken field. */
  surfaceSunken: string;
  border: string;
  /** Empty ring segments and chart tracks: visible against the background in both schemes. */
  track: string;
  text: string;
  textMuted: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  streak: string;
  streakSoft: string;
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

/** Mixes a hex color toward white (amount 0..1). Lets the dark accent follow the rebrand color. */
function lift(hex: string, amount: number): string {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16));
  return `#${channels
    .map((value) => Math.round(value + (255 - value) * amount).toString(16).padStart(2, '0'))
    .join('')}`;
}

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#F7F6FB',
    surface: '#FFFFFF',
    surfaceSunken: '#F1EFF8',
    border: '#E5E2F0',
    track: '#E7E4F2',
    text: '#17152B',
    textMuted: '#77738F',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1A`,
    onPrimary: '#FFFFFF',
    streak: STREAK_COLOR,
    streakSoft: `${STREAK_COLOR}33`,
    success: '#2E9E6B',
    danger: '#D9484F',
  },
  spacing,
  radii,
  typography,
};

/** Dark is designed, not inverted: lifted surfaces, a softer accent, ink text on the accent. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    ...lightTheme.colors,
    background: '#121022',
    surface: '#1C1A30',
    surfaceSunken: '#161429',
    border: '#2D2A45',
    track: '#2E2B48',
    text: '#F2F0FA',
    textMuted: '#9B97B5',
    primary: lift(PRIMARY_COLOR, 0.25),
    primarySoft: `${lift(PRIMARY_COLOR, 0.25)}2E`,
    onPrimary: '#14122A',
    streak: '#FFC266',
    streakSoft: '#FFC26633',
    success: '#4CBE88',
    danger: '#F0666C',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}
