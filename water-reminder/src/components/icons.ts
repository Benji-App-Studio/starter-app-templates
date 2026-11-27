import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

type IonIcon = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app uses, named by meaning. iOS renders the SF Symbol,
 * Android the Ionicons fallback, so screens never pick a glyph per platform.
 */
export const icons = {
  drop: { sf: 'drop.fill', ion: 'water' },
  dropOutline: { sf: 'drop', ion: 'water-outline' },
  glass: { sf: 'waterbottle.fill', ion: 'cafe' },
  chart: { sf: 'chart.bar.fill', ion: 'bar-chart' },
  settings: { sf: 'gearshape.fill', ion: 'settings' },
  bell: { sf: 'bell.fill', ion: 'notifications' },
  bellOff: { sf: 'bell.slash.fill', ion: 'notifications-off' },
  clock: { sf: 'clock.fill', ion: 'time' },
  timer: { sf: 'timer', ion: 'timer-outline' },
  target: { sf: 'target', ion: 'locate' },
  ruler: { sf: 'ruler', ion: 'resize' },
  weight: { sf: 'scalemass.fill', ion: 'barbell' },
  walk: { sf: 'figure.walk', ion: 'walk' },
  sun: { sf: 'sun.max.fill', ion: 'sunny' },
  flame: { sf: 'flame.fill', ion: 'flame' },
  calendar: { sf: 'calendar', ion: 'calendar' },
  check: { sf: 'checkmark', ion: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ion: 'checkmark-circle' },
  plus: { sf: 'plus', ion: 'add' },
  trash: { sf: 'trash', ion: 'trash-outline' },
  chevronRight: { sf: 'chevron.right', ion: 'chevron-forward' },
  sparkles: { sf: 'sparkles', ion: 'sparkles' },
  refresh: { sf: 'arrow.clockwise', ion: 'refresh' },
  card: { sf: 'creditcard', ion: 'card-outline' },
  document: { sf: 'doc.text', ion: 'document-text-outline' },
  shield: { sf: 'checkmark.shield', ion: 'shield-checkmark-outline' },
  star: { sf: 'star', ion: 'star-outline' },
  mail: { sf: 'envelope', ion: 'mail-outline' },
  info: { sf: 'info.circle', ion: 'information-circle-outline' },
} satisfies Record<string, { sf: SFSymbol; ion: IonIcon }>;

export type IconName = keyof typeof icons;
