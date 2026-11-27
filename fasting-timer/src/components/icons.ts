import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app draws, as an SF Symbol for iOS and the Ionicons glyph
 * Android falls back to. Add a pair here rather than importing an icon set in a screen.
 */
export const icons = {
  timer: { ios: 'timer', android: 'time-outline' },
  history: { ios: 'clock.arrow.circlepath', android: 'calendar-outline' },
  settings: { ios: 'gearshape', android: 'settings-outline' },
  flame: { ios: 'flame.fill', android: 'flame' },
  trophy: { ios: 'trophy.fill', android: 'trophy' },
  check: { ios: 'checkmark.circle.fill', android: 'checkmark-circle' },
  checkSmall: { ios: 'checkmark', android: 'checkmark' },
  bell: { ios: 'bell.badge.fill', android: 'notifications' },
  moon: { ios: 'moon.stars.fill', android: 'moon' },
  chart: { ios: 'chart.bar.fill', android: 'bar-chart' },
  chevron: { ios: 'chevron.right', android: 'chevron-forward' },
  plus: { ios: 'plus', android: 'add' },
  minus: { ios: 'minus', android: 'remove' },
  close: { ios: 'xmark', android: 'close' },
  trash: { ios: 'trash', android: 'trash-outline' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh-outline' },
  card: { ios: 'creditcard', android: 'card-outline' },
  document: { ios: 'doc.text', android: 'document-text-outline' },
  shield: { ios: 'checkmark.shield', android: 'shield-checkmark-outline' },
  star: { ios: 'star', android: 'star-outline' },
  mail: { ios: 'envelope', android: 'mail-outline' },
  pencil: { ios: 'pencil', android: 'pencil-outline' },
  sun: { ios: 'sun.max.fill', android: 'sunny' },
  sparkle: { ios: 'sparkles', android: 'sparkles' },
} satisfies Record<string, { ios: SFSymbol; android: IoniconName }>;

export type IconName = keyof typeof icons;
