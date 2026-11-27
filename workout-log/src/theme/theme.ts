import { useColorScheme, type TextStyle } from 'react-native';

/** The brand accent. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#F2A93B';

/**
 * Barlow Condensed carries every number and heading (gym-floor, dense);
 * Barlow carries body copy. Both are loaded in `app/_layout.tsx`.
 */
export const fonts = {
  condensed: 'BarlowCondensed_600SemiBold',
  condensedBold: 'BarlowCondensed_700Bold',
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
} as const;

/** The 8-pt grid. Components take every margin, padding and gap from here. */
export const spacing = {
  xs: 4,
  sm: 8,
  /** Between sibling items in a list, and a section title above its content. */
  smd: 12,
  md: 16,
  /** Left and right screen gutter. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
  /** Pills and chips: horizontal and vertical padding. */
  chipX: 12,
  chipY: 6,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const typography = {
  display: { fontFamily: fonts.condensedBold, fontSize: 44, lineHeight: 46, letterSpacing: -0.6 },
  title: { fontFamily: fonts.condensedBold, fontSize: 32, lineHeight: 34, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.condensed, fontSize: 22, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  /** Hero numbers: the week count, the rest clock, the volume total. */
  numeral: { fontFamily: fonts.condensedBold, fontSize: 84, lineHeight: 84, letterSpacing: -2.5, ...tabular },
  numeralMedium: { fontFamily: fonts.condensedBold, fontSize: 44, lineHeight: 46, letterSpacing: -1, ...tabular },
  numeralSmall: { fontFamily: fonts.condensed, fontSize: 26, lineHeight: 30, letterSpacing: -0.3, ...tabular },
  /** The number inside a set-table stepper. */
  stepper: { fontFamily: fonts.condensedBold, fontSize: 21, lineHeight: 24, ...tabular },
  // Text fields carry no lineHeight: on iOS it pushes single-line input text off centre.
  /** The routine name field in the editor. */
  titleInput: { fontFamily: fonts.condensedBold, fontSize: 32, letterSpacing: -0.4 },
  /** Search and other plain text fields. */
  input: { fontFamily: fonts.regular, fontSize: 17 },
  /** PR and plan badges. */
  badge: { fontFamily: fonts.condensedBold, fontSize: 13, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export type ThemeColors = {
  background: string;
  surface: string;
  /** One step above `surface`: inputs, chips and thumbs that sit on a card. */
  surfaceRaised: string;
  border: string;
  text: string;
  textMuted: string;
  /** The accent as a fill: the hero, the primary action, selection. */
  primary: string;
  primarySoft: string;
  onPrimary: string;
  /** The accent as text on `background`, darkened in light mode for contrast. */
  accentText: string;
  /** Personal record. */
  pr: string;
  /** Text on a `pr` fill. */
  onPr: string;
  /** The dim layer behind a modal sheet. */
  scrim: string;
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

/** Mixes a hex color towards black (`amount` 0..1). */
function shade(hex: string, amount: number): string {
  const channels = [1, 3, 5].map((offset) =>
    Math.round(parseInt(hex.slice(offset, offset + 2), 16) * (1 - amount)),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: {
    background: '#0F1012',
    surface: '#1A1C20',
    surfaceRaised: '#25282E',
    border: '#2C2F36',
    text: '#F2F2F0',
    textMuted: '#8E9096',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}29`,
    onPrimary: '#0F1012',
    accentText: PRIMARY_COLOR,
    pr: '#E5484D',
    onPr: '#FFFFFF',
    scrim: 'rgba(0,0,0,0.6)',
    success: '#4CC38A',
    danger: '#E5484D',
  },
  spacing,
  radii,
  typography,
};

export const lightTheme: Theme = {
  ...darkTheme,
  scheme: 'light',
  colors: {
    background: '#F3F3F0',
    surface: '#FFFFFF',
    surfaceRaised: '#ECECE8',
    border: '#E0E0DB',
    text: '#0F1012',
    textMuted: '#6B6E75',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}33`,
    onPrimary: '#0F1012',
    accentText: shade(PRIMARY_COLOR, 0.42),
    pr: '#D13438',
    onPr: '#FFFFFF',
    scrim: 'rgba(15,16,18,0.4)',
    success: '#1F8A4C',
    danger: '#D13438',
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'light' ? lightTheme : darkTheme;
}
