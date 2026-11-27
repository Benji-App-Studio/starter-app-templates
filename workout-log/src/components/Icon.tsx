import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform } from 'react-native';

import { icons, type IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type IconProps = {
  name: IconName;
  size?: number;
  /** Defaults to the text color. */
  color?: string;
  weight?: SymbolWeight;
};

/** SF Symbols on iOS, Ionicons on Android, one consistent weight. */
export function Icon({ name, size = 22, color, weight = 'semibold' }: IconProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.text;

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={icons[name].sf}
        size={size}
        tintColor={tint}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={{ width: size, height: size }}
      />
    );
  }

  return <Ionicons name={icons[name].ion} size={size} color={tint} />;
}
