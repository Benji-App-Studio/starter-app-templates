import type { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'sf-symbols-typescript';

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * Every icon the app uses, named by meaning. iOS draws the SF Symbol,
 * Android the closest Ionicon, so the two sets stay in step.
 */
export const icons = {
  play: { sf: 'play.fill', ionicon: 'play' },
  pause: { sf: 'pause.fill', ionicon: 'pause' },
  moon: { sf: 'moon.fill', ionicon: 'moon' },
  moonStars: { sf: 'moon.stars.fill', ionicon: 'moon' },
  timer: { sf: 'timer', ionicon: 'timer-outline' },
  bookmark: { sf: 'bookmark.fill', ionicon: 'bookmark' },
  bookmarkOutline: { sf: 'bookmark', ionicon: 'bookmark-outline' },
  bed: { sf: 'bed.double.fill', ionicon: 'bed' },
  chart: { sf: 'chart.bar.fill', ionicon: 'bar-chart' },
  settings: { sf: 'gearshape.fill', ionicon: 'settings' },
  waveform: { sf: 'waveform', ionicon: 'pulse' },
  waveformPath: { sf: 'waveform.path', ionicon: 'analytics' },
  mountains: { sf: 'mountain.2.fill', ionicon: 'triangle' },
  rain: { sf: 'cloud.rain.fill', ionicon: 'rainy' },
  waves: { sf: 'water.waves', ionicon: 'water' },
  wind: { sf: 'wind', ionicon: 'cloudy' },
  fan: { sf: 'fan.fill', ionicon: 'sync' },
  tuningFork: { sf: 'tuningfork', ionicon: 'radio' },
  ear: { sf: 'ear.fill', ionicon: 'ear' },
  zzz: { sf: 'zzz', ionicon: 'cloudy-night' },
  sparkles: { sf: 'sparkles', ionicon: 'sparkles' },
  check: { sf: 'checkmark', ionicon: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ionicon: 'checkmark-circle' },
  chevronRight: { sf: 'chevron.right', ionicon: 'chevron-forward' },
  plus: { sf: 'plus', ionicon: 'add' },
  trash: { sf: 'trash', ionicon: 'trash-outline' },
  refresh: { sf: 'arrow.clockwise', ionicon: 'refresh-outline' },
  card: { sf: 'creditcard', ionicon: 'card-outline' },
  document: { sf: 'doc.text', ionicon: 'document-text-outline' },
  shield: { sf: 'checkmark.shield', ionicon: 'shield-checkmark-outline' },
  star: { sf: 'star', ionicon: 'star-outline' },
  mail: { sf: 'envelope', ionicon: 'mail-outline' },
  infinity: { sf: 'infinity', ionicon: 'infinite' },
  slider: { sf: 'slider.horizontal.3', ionicon: 'options-outline' },
  speaker: { sf: 'speaker.wave.2.fill', ionicon: 'volume-medium' },
  bell: { sf: 'bell', ionicon: 'notifications-outline' },
  hand: { sf: 'hand.tap.fill', ionicon: 'hand-left' },
  lock: { sf: 'lock.fill', ionicon: 'lock-closed' },
  heart: { sf: 'heart.fill', ionicon: 'heart' },
} satisfies Record<string, { sf: SFSymbol; ionicon: IoniconName }>;

export type IconName = keyof typeof icons;
