import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'sf-symbols-typescript';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app uses, named by meaning. iOS renders the SF Symbol,
 * Android the Ionicons fallback, so both sides stay the same weight.
 */
export const icons = {
  today: { sf: 'sun.max', ionicon: 'sunny-outline' },
  journal: { sf: 'book.closed', ionicon: 'book-outline' },
  trends: { sf: 'chart.xyaxis.line', ionicon: 'stats-chart-outline' },
  settings: { sf: 'gearshape', ionicon: 'settings-outline' },
  chevronRight: { sf: 'chevron.right', ionicon: 'chevron-forward' },
  chevronLeft: { sf: 'chevron.left', ionicon: 'chevron-back' },
  close: { sf: 'xmark', ionicon: 'close' },
  check: { sf: 'checkmark', ionicon: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ionicon: 'checkmark-circle' },
  restore: { sf: 'arrow.clockwise', ionicon: 'refresh-outline' },
  card: { sf: 'creditcard', ionicon: 'card-outline' },
  document: { sf: 'doc.text', ionicon: 'document-text-outline' },
  shield: { sf: 'checkmark.shield', ionicon: 'shield-checkmark-outline' },
  star: { sf: 'star', ionicon: 'star-outline' },
  mail: { sf: 'envelope', ionicon: 'mail-outline' },
  trash: { sf: 'trash', ionicon: 'trash-outline' },
  bell: { sf: 'bell', ionicon: 'notifications-outline' },
  clock: { sf: 'clock', ionicon: 'time-outline' },
  pencil: { sf: 'pencil', ionicon: 'create-outline' },
  sparkles: { sf: 'sparkles', ionicon: 'sparkles-outline' },
  flame: { sf: 'flame', ionicon: 'flame-outline' },
  heart: { sf: 'heart', ionicon: 'heart-outline' },
  tag: { sf: 'tag', ionicon: 'pricetag-outline' },
  quote: { sf: 'quote.opening', ionicon: 'chatbox-ellipses-outline' },
  face: { sf: 'face.smiling', ionicon: 'happy-outline' },
  calendar: { sf: 'calendar', ionicon: 'calendar-outline' },
  lock: { sf: 'lock', ionicon: 'lock-closed-outline' },
  moon: { sf: 'moon.stars', ionicon: 'moon-outline' },
  leaf: { sf: 'leaf', ionicon: 'leaf-outline' },
  waveform: { sf: 'waveform.path.ecg', ionicon: 'pulse-outline' },
  infinity: { sf: 'infinity', ionicon: 'infinite-outline' },
  eraser: { sf: 'eraser', ionicon: 'backspace-outline' },
  work: { sf: 'briefcase', ionicon: 'briefcase-outline' },
  family: { sf: 'house', ionicon: 'home-outline' },
  friends: { sf: 'person.2', ionicon: 'people-outline' },
  health: { sf: 'cross.case', ionicon: 'medkit-outline' },
  sleep: { sf: 'bed.double', ionicon: 'bed-outline' },
  exercise: { sf: 'figure.walk', ionicon: 'walk-outline' },
  food: { sf: 'fork.knife', ionicon: 'restaurant-outline' },
  money: { sf: 'banknote', ionicon: 'cash-outline' },
  weather: { sf: 'cloud.sun', ionicon: 'partly-sunny-outline' },
  rest: { sf: 'cup.and.saucer', ionicon: 'cafe-outline' },
  hobbies: { sf: 'paintpalette', ionicon: 'color-palette-outline' },
} satisfies Record<string, { sf: SFSymbol; ionicon: IoniconName }>;

export type IconName = keyof typeof icons;
