import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app uses, named by meaning. iOS draws the SF Symbol,
 * Android the Ionicons fallback, so both stay in one place.
 */
export const icons = {
  add: { symbol: 'plus', ionicon: 'add' },
  minus: { symbol: 'minus', ionicon: 'remove' },
  close: { symbol: 'xmark', ionicon: 'close' },
  back: { symbol: 'chevron.left', ionicon: 'chevron-back' },
  chevron: { symbol: 'chevron.right', ionicon: 'chevron-forward' },
  check: { symbol: 'checkmark', ionicon: 'checkmark' },
  checkCircle: { symbol: 'checkmark.circle.fill', ionicon: 'checkmark-circle' },
  trash: { symbol: 'trash', ionicon: 'trash-outline' },
  search: { symbol: 'magnifyingglass', ionicon: 'search' },
  camera: { symbol: 'camera', ionicon: 'camera-outline' },
  today: { symbol: 'circle.circle', ionicon: 'radio-button-on-outline' },
  history: { symbol: 'chart.bar', ionicon: 'bar-chart-outline' },
  settings: { symbol: 'gearshape', ionicon: 'settings-outline' },
  flame: { symbol: 'flame', ionicon: 'flame-outline' },
  target: { symbol: 'scope', ionicon: 'locate-outline' },
  meal: { symbol: 'fork.knife', ionicon: 'restaurant-outline' },
  walk: { symbol: 'figure.walk', ionicon: 'walk-outline' },
  sparkles: { symbol: 'sparkles', ionicon: 'sparkles-outline' },
  infinity: { symbol: 'infinity', ionicon: 'infinite-outline' },
  macros: { symbol: 'chart.pie', ionicon: 'pie-chart-outline' },
  calendar: { symbol: 'calendar', ionicon: 'calendar-outline' },
  refresh: { symbol: 'arrow.clockwise', ionicon: 'refresh-outline' },
  card: { symbol: 'creditcard', ionicon: 'card-outline' },
  document: { symbol: 'doc.text', ionicon: 'document-text-outline' },
  shield: { symbol: 'checkmark.shield', ionicon: 'shield-checkmark-outline' },
  star: { symbol: 'star', ionicon: 'star-outline' },
  mail: { symbol: 'envelope', ionicon: 'mail-outline' },
  pencil: { symbol: 'pencil', ionicon: 'pencil-outline' },
} satisfies Record<string, { symbol: SFSymbol; ionicon: IoniconName }>;

export type IconName = keyof typeof icons;
