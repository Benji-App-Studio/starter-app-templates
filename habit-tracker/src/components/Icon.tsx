import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform, type ColorValue } from 'react-native';

import { icons, type IconName } from '@/components/icons';

type IconProps = {
  name: IconName;
  size?: number;
  color: ColorValue;
  weight?: SymbolWeight;
};

/** SF Symbols on iOS, Ionicons on Android, one name for both. */
export function Icon({ name, size = 22, color, weight = 'semibold' }: IconProps) {
  const icon = icons[name];

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={icon.sf}
        size={size}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Ionicons name={icon.ionicon} size={size} color={typeof color === 'string' ? color : undefined} />;
}
