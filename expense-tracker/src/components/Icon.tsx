import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SFSymbol, type SymbolWeight } from 'expo-symbols';
import { Platform } from 'react-native';

type IconSource = { sf: SFSymbol; ionicon: keyof typeof Ionicons.glyphMap };

/**
 * Every icon the app uses, named by meaning. iOS draws the SF Symbol, Android the
 * Ionicons fallback, so screens never pick a glyph set themselves.
 */
const icons = {
  home: { sf: 'house.fill', ionicon: 'home' },
  budgets: { sf: 'chart.pie.fill', ionicon: 'pie-chart' },
  report: { sf: 'chart.bar.fill', ionicon: 'bar-chart' },
  settings: { sf: 'gearshape.fill', ionicon: 'settings' },
  food: { sf: 'fork.knife', ionicon: 'restaurant' },
  groceries: { sf: 'cart.fill', ionicon: 'cart' },
  transport: { sf: 'car.fill', ionicon: 'car' },
  shopping: { sf: 'bag.fill', ionicon: 'bag-handle' },
  bills: { sf: 'doc.text.fill', ionicon: 'receipt' },
  fun: { sf: 'ticket.fill', ionicon: 'ticket' },
  health: { sf: 'heart.fill', ionicon: 'heart' },
  other: { sf: 'ellipsis.circle.fill', ionicon: 'ellipsis-horizontal-circle' },
  wallet: { sf: 'wallet.bifold.fill', ionicon: 'wallet' },
  banknote: { sf: 'banknote.fill', ionicon: 'cash' },
  calendar: { sf: 'calendar', ionicon: 'calendar' },
  trend: { sf: 'chart.line.uptrend.xyaxis', ionicon: 'trending-up' },
  infinity: { sf: 'infinity', ionicon: 'infinite' },
  lock: { sf: 'lock.fill', ionicon: 'lock-closed' },
  shield: { sf: 'lock.shield.fill', ionicon: 'shield-checkmark' },
  check: { sf: 'checkmark', ionicon: 'checkmark' },
  checkCircle: { sf: 'checkmark.circle.fill', ionicon: 'checkmark-circle' },
  plus: { sf: 'plus', ionicon: 'add' },
  close: { sf: 'xmark', ionicon: 'close' },
  backspace: { sf: 'delete.left.fill', ionicon: 'backspace' },
  trash: { sf: 'trash.fill', ionicon: 'trash' },
  chevron: { sf: 'chevron.right', ionicon: 'chevron-forward' },
  restore: { sf: 'arrow.clockwise', ionicon: 'refresh' },
  reset: { sf: 'arrow.counterclockwise', ionicon: 'refresh' },
  card: { sf: 'creditcard.fill', ionicon: 'card' },
  document: { sf: 'doc.text.fill', ionicon: 'document-text' },
  star: { sf: 'star.fill', ionicon: 'star' },
  mail: { sf: 'envelope.fill', ionicon: 'mail' },
  sparkles: { sf: 'sparkles', ionicon: 'sparkles' },
  coin: { sf: 'dollarsign.circle.fill', ionicon: 'logo-usd' },
  theme: { sf: 'circle.lefthalf.filled', ionicon: 'contrast' },
} satisfies Record<string, IconSource>;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  weight?: SymbolWeight;
};

export function Icon({ name, size = 22, color, weight = 'medium' }: IconProps) {
  const source: IconSource = icons[name];

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={source.sf}
        size={size}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Ionicons name={source.ionicon} size={size} color={color} />;
}
