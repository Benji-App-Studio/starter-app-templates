import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform } from 'react-native';

import { icons, type IconName } from '@/components/icons';

type IconProps = {
  name: IconName;
  size?: number;
  color: string;
  weight?: SymbolWeight;
};

/** SF Symbol on iOS, the matching Ionicon elsewhere. */
export function Icon({ name, size = 22, color, weight = 'medium' }: IconProps) {
  const spec = icons[name];

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={spec.sf}
        size={size}
        tintColor={color}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={{ width: size, height: size }}
        // Decorative: the row or button around it carries the label, so VoiceOver skips the symbol name.
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }

  return <Ionicons name={spec.ion} size={size} color={color} accessible={false} importantForAccessibility="no" />;
}
