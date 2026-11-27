import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

type IconSpec = { sf: SFSymbol; ion: keyof typeof Ionicons.glyphMap };

/** Every icon the app uses: an SF Symbol for iOS and the Ionicons fallback for Android. */
export const icons = {
  barbell: { sf: 'dumbbell', ion: 'barbell-outline' },
  strength: { sf: 'figure.strengthtraining.traditional', ion: 'fitness-outline' },
  home: { sf: 'house', ion: 'home-outline' },
  routines: { sf: 'list.bullet', ion: 'list-outline' },
  history: { sf: 'chart.bar', ion: 'bar-chart-outline' },
  settings: { sf: 'gearshape', ion: 'settings-outline' },
  check: { sf: 'checkmark', ion: 'checkmark' },
  plus: { sf: 'plus', ion: 'add' },
  minus: { sf: 'minus', ion: 'remove' },
  close: { sf: 'xmark', ion: 'close' },
  back: { sf: 'chevron.left', ion: 'chevron-back' },
  forward: { sf: 'chevron.right', ion: 'chevron-forward' },
  down: { sf: 'chevron.down', ion: 'chevron-down' },
  trophy: { sf: 'trophy', ion: 'trophy-outline' },
  timer: { sf: 'timer', ion: 'timer-outline' },
  clock: { sf: 'clock', ion: 'time-outline' },
  trash: { sf: 'trash', ion: 'trash-outline' },
  restore: { sf: 'arrow.counterclockwise', ion: 'refresh-outline' },
  card: { sf: 'creditcard', ion: 'card-outline' },
  document: { sf: 'doc.text', ion: 'document-text-outline' },
  privacy: { sf: 'hand.raised', ion: 'shield-checkmark-outline' },
  star: { sf: 'star', ion: 'star-outline' },
  mail: { sf: 'envelope', ion: 'mail-outline' },
  scale: { sf: 'scalemass', ion: 'scale-outline' },
  more: { sf: 'ellipsis', ion: 'ellipsis-horizontal' },
  search: { sf: 'magnifyingglass', ion: 'search-outline' },
  play: { sf: 'play.fill', ion: 'play' },
  skip: { sf: 'forward.fill', ion: 'play-skip-forward' },
  flag: { sf: 'flag', ion: 'flag-outline' },
  calendar: { sf: 'calendar', ion: 'calendar-outline' },
  bolt: { sf: 'bolt', ion: 'flash-outline' },
  target: { sf: 'target', ion: 'locate-outline' },
  repeat: { sf: 'repeat', ion: 'repeat-outline' },
  pencil: { sf: 'pencil', ion: 'pencil-outline' },
  flame: { sf: 'flame', ion: 'flame-outline' },
  reset: { sf: 'arrow.counterclockwise', ion: 'refresh-outline' },
} satisfies Record<string, IconSpec>;

export type IconName = keyof typeof icons;
