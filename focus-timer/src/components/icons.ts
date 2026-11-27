import type { Ionicons } from '@expo/vector-icons';
import type { SymbolViewProps } from 'expo-symbols';

type SFSymbolName = Extract<SymbolViewProps['name'], string>;
type IoniconName = keyof typeof Ionicons.glyphMap;

type IconSpec = { sf: SFSymbolName; ion: IoniconName };

/**
 * Every icon the app uses, named by meaning. iOS renders the SF Symbol,
 * Android the Ionicons fallback, so screens never pick a glyph by platform.
 */
export const icons = {
  timer: { sf: 'timer', ion: 'timer-outline' },
  history: { sf: 'chart.bar.xaxis', ion: 'bar-chart-outline' },
  settings: { sf: 'gearshape', ion: 'settings-outline' },
  play: { sf: 'play.fill', ion: 'play' },
  pause: { sf: 'pause.fill', ion: 'pause' },
  stop: { sf: 'stop.fill', ion: 'stop' },
  forward: { sf: 'forward.end.fill', ion: 'play-skip-forward' },
  check: { sf: 'checkmark', ion: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ion: 'checkmark-circle' },
  flame: { sf: 'flame.fill', ion: 'flame' },
  trash: { sf: 'trash', ion: 'trash-outline' },
  bell: { sf: 'bell.badge', ion: 'notifications-outline' },
  restore: { sf: 'arrow.clockwise', ion: 'refresh-outline' },
  card: { sf: 'creditcard', ion: 'card-outline' },
  document: { sf: 'doc.text', ion: 'document-text-outline' },
  shield: { sf: 'checkmark.shield', ion: 'shield-checkmark-outline' },
  star: { sf: 'star', ion: 'star-outline' },
  mail: { sf: 'envelope', ion: 'mail-outline' },
  chevron: { sf: 'chevron.right', ion: 'chevron-forward' },
  tag: { sf: 'tag', ion: 'pricetag-outline' },
  target: { sf: 'scope', ion: 'locate-outline' },
  book: { sf: 'book', ion: 'book-outline' },
  briefcase: { sf: 'briefcase', ion: 'briefcase-outline' },
  palette: { sf: 'paintpalette', ion: 'color-palette-outline' },
  sparkles: { sf: 'sparkles', ion: 'sparkles-outline' },
  sliders: { sf: 'slider.horizontal.3', ion: 'options-outline' },
  minus: { sf: 'minus', ion: 'remove' },
  plus: { sf: 'plus', ion: 'add' },
  leaf: { sf: 'leaf', ion: 'leaf-outline' },
  cup: { sf: 'cup.and.saucer', ion: 'cafe-outline' },
} satisfies Record<string, IconSpec>;

export type IconName = keyof typeof icons;
