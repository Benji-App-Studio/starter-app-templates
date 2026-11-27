import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app uses, by meaning. iOS renders the SF Symbol; Android
 * falls back to the Ionicon. Add a pair here instead of naming icons in screens.
 */
export const icons = {
  home: { sf: 'house.fill', ion: 'home' },
  milestones: { sf: 'flag.fill', ion: 'flag' },
  history: { sf: 'chart.bar.fill', ion: 'bar-chart' },
  settings: { sf: 'gearshape.fill', ion: 'settings' },
  smoking: { sf: 'smoke.fill', ion: 'logo-no-smoking' },
  vaping: { sf: 'cloud.fill', ion: 'cloud' },
  drinking: { sf: 'wineglass.fill', ion: 'wine' },
  other: { sf: 'hand.raised.fill', ion: 'hand-left' },
  timer: { sf: 'timer', ion: 'time-outline' },
  money: { sf: 'banknote.fill', ion: 'cash-outline' },
  wind: { sf: 'wind', ion: 'leaf-outline' },
  flag: { sf: 'flag.checkered', ion: 'flag-outline' },
  trophy: { sf: 'trophy.fill', ion: 'trophy' },
  check: { sf: 'checkmark', ion: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ion: 'checkmark-circle' },
  lock: { sf: 'lock.fill', ion: 'lock-closed' },
  chevron: { sf: 'chevron.right', ion: 'chevron-forward' },
  close: { sf: 'xmark', ion: 'close' },
  plus: { sf: 'plus', ion: 'add' },
  minus: { sf: 'minus', ion: 'remove' },
  restore: { sf: 'arrow.clockwise', ion: 'refresh-outline' },
  card: { sf: 'creditcard', ion: 'card-outline' },
  terms: { sf: 'doc.text', ion: 'document-text-outline' },
  privacy: { sf: 'shield.fill', ion: 'shield-checkmark-outline' },
  star: { sf: 'star.fill', ion: 'star-outline' },
  mail: { sf: 'envelope', ion: 'mail-outline' },
  trash: { sf: 'trash', ion: 'trash-outline' },
  palette: { sf: 'paintpalette', ion: 'color-palette-outline' },
  calendar: { sf: 'calendar', ion: 'calendar-outline' },
  sparkles: { sf: 'sparkles', ion: 'sparkles-outline' },
  heart: { sf: 'heart.fill', ion: 'heart' },
  stress: { sf: 'bolt.fill', ion: 'flash-outline' },
  social: { sf: 'person.2.fill', ion: 'people-outline' },
  boredom: { sf: 'sofa.fill', ion: 'bed-outline' },
  routine: { sf: 'repeat', ion: 'repeat-outline' },
  coffee: { sf: 'cup.and.saucer.fill', ion: 'cafe-outline' },
  question: { sf: 'questionmark.circle', ion: 'help-circle-outline' },
  currency: { sf: 'dollarsign.circle', ion: 'logo-usd' },
  perDay: { sf: 'number', ion: 'calculator-outline' },
  slip: { sf: 'arrow.counterclockwise', ion: 'arrow-undo-outline' },
  note: { sf: 'text.bubble.fill', ion: 'chatbubble-outline' },
} as const satisfies Record<string, { sf: SFSymbol; ion: IoniconName }>;

export type IconName = keyof typeof icons;
