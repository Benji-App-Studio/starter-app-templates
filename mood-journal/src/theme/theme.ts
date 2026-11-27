import { useColorScheme, type TextStyle } from 'react-native';

/** The brand color. `scripts/rebrand.mjs --color` rewrites this line. */
export const PRIMARY_COLOR = '#D96C8A';

/**
 * Font families, loaded in `app/_layout.tsx`. Newsreader carries the journal voice
 * (headings and the user's own words); Work Sans does the quiet UI work.
 */
export const fonts = {
  serif: 'Newsreader_500Medium',
  serifStrong: 'Newsreader_600SemiBold',
  serifItalic: 'Newsreader_400Regular_Italic',
  sans: 'WorkSans_400Regular',
  sansMedium: 'WorkSans_500Medium',
  sansStrong: 'WorkSans_600SemiBold',
} as const;

/** The 8-pt grid (with 4 and 12 for tight spots). Components use these and nothing else. */
export const spacing = {
  xs: 4,
  sm: 8,
  ms: 12,
  md: 16,
  /** Left and right gutter of every screen. */
  gutter: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Fixed sizes the layout depends on. */
export const layout = {
  /** iOS tab bar height above the home-indicator inset. */
  tabBarHeight: 49,
  /** Primary call-to-action height. */
  ctaHeight: 54,
  /** Smallest comfortable hit target. */
  hitTarget: 44,
  /** Round icon buttons in sheet headers. */
  iconButton: 36,
  hairline: 1,
  /** Chip and option borders. */
  border: 1.5,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  display: { fontFamily: fonts.serifStrong, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title: { fontFamily: fonts.serifStrong, fontSize: 30, lineHeight: 34, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.serifStrong, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  /** The user's own words: notes, gratitude lines, quotes. */
  journal: { fontFamily: fonts.serifItalic, fontSize: 19, lineHeight: 28 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 24 },
  /** The user's words in a list row: same voice, smaller. */
  journalSmall: { fontFamily: fonts.serifItalic, fontSize: 17, lineHeight: 24 },
  label: { fontFamily: fonts.sansStrong, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  /** Uppercase section eyebrows. */
  eyebrow: { fontFamily: fonts.sansStrong, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
  /** Tab bar labels and chart axes. */
  micro: { fontFamily: fonts.sansMedium, fontSize: 11, lineHeight: 14 },
  /** Hero numbers. Tabular so they do not jump while counting. */
  numeral: {
    fontFamily: fonts.serifStrong,
    fontSize: 64,
    lineHeight: 68,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  /** Mid-size numbers in tiles (streaks, counts). */
  stat: {
    fontFamily: fonts.serifStrong,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.8,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Five colors, index 0 = score 1 (awful) … index 4 = score 5 (great). */
export type MoodScale = readonly [string, string, string, string, string];

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
  /** Mixed into a mood color for the eyes and mouth on a face. */
  shade: string;
  /** Leaves and stem of the streak plant. */
  leaf: string;
  /** The plant's pot. */
  pot: string;
  mood: MoodScale;
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  layout: typeof layout;
  typography: typeof typography;
  fonts: typeof fonts;
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: {
    background: '#FBF7F2',
    surface: '#FFFFFF',
    border: '#ECE4DB',
    text: '#2A2320',
    textMuted: '#857A73',
    primary: PRIMARY_COLOR,
    primarySoft: `${PRIMARY_COLOR}1F`,
    onPrimary: '#FFFFFF',
    success: '#5E9A6E',
    danger: '#C9503F',
    shade: '#1E1512',
    leaf: '#6E9B6A',
    pot: '#D9C6B4',
    mood: ['#5B6CC8', '#7FA7D9', '#B9B39F', '#F2B35B', '#E9776B'],
  },
  spacing,
  radii,
  layout,
  typography,
  fonts,
};

/** Dark is designed, not inverted: surfaces lift from the background, mood colors lose a little saturation. */
export const darkTheme: Theme = {
  ...lightTheme,
  scheme: 'dark',
  colors: {
    ...lightTheme.colors,
    background: '#1A1614',
    surface: '#272120',
    border: '#3A312E',
    text: '#F5EEE7',
    textMuted: '#A99E96',
    primarySoft: `${PRIMARY_COLOR}40`,
    success: '#7DB58A',
    danger: '#E07A6A',
    leaf: '#86AE80',
    pot: '#5A4A42',
    mood: ['#6E7CC6', '#86A8D1', '#A8A392', '#E2AE66', '#DD8074'],
  },
};

/** Follows the device appearance. */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

/** Mixes two hex colors; `amount` 0 returns `base`, 1 returns `tint`. */
export function mixColors(base: string, tint: string, amount: number): string {
  const parse = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(base);
  const [r2, g2, b2] = parse(tint);
  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}
