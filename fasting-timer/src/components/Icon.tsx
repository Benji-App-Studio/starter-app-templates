import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

import { icons, type IconName } from '@/components/icons';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbols on iOS, the matching Ionicons glyph elsewhere. The only icon component in the app. */
export function Icon({ name, size = 22, color, weight = 'medium', style }: IconProps) {
  const icon = icons[name];

  if (Platform.OS !== 'ios') {
    return <Ionicons name={icon.android} size={size} color={color} style={style} />;
  }

  return (
    <SymbolView
      name={icon.ios}
      size={size}
      tintColor={color}
      weight={weight}
      style={[{ width: size, height: size }, style]}
      fallback={<Ionicons name={icon.android} size={size} color={color} />}
    />
  );
}
