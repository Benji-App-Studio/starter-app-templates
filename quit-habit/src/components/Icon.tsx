import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import type { StyleProp, ViewStyle } from 'react-native';

import { icons, type IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type IconProps = {
  name: IconName;
  size?: number;
  /** Any theme color string; defaults to the text color. */
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbol on iOS, Ionicon elsewhere. The only place the app draws an icon. */
export function Icon({ name, size = 22, color, weight = 'semibold', style }: IconProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.text;
  const glyph = icons[name];

  return (
    <SymbolView
      name={glyph.sf}
      size={size}
      tintColor={tint}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={style}
      fallback={<Ionicons name={glyph.ion} size={size} color={tint} style={style} />}
    />
  );
}
