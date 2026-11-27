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

/** SF Symbols on iOS, Ionicons elsewhere. The only place icons are drawn. */
export function Icon({ name, size = 22, color, weight = 'medium', style }: IconProps) {
  const icon = icons[name];

  if (Platform.OS !== 'ios') {
    return <Ionicons name={icon.ionicon} size={size} color={color} style={style} accessibilityElementsHidden importantForAccessibility="no" />;
  }

  return (
    <SymbolView
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      name={icon.symbol}
      size={size}
      tintColor={color}
      weight={weight}
      resizeMode="scaleAspectFit"
      style={[{ width: size, height: size }, style]}
    />
  );
}
