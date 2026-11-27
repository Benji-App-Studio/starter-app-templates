import { Ionicons } from '@expo/vector-icons';
import { SymbolView, type SymbolWeight } from 'expo-symbols';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

import { icons, type IconName } from '@/components/icons';
import { useTheme } from '@/theme/theme';

type IconProps = {
  name: IconName;
  size?: number;
  /** Defaults to the text color. */
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
};

/** SF Symbols on iOS, Ionicons on Android, one weight everywhere. */
export function Icon({ name, size = 22, color, weight = 'medium', style }: IconProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.text;
  const icon = icons[name];

  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={icon.sf}
        size={size}
        tintColor={tint}
        weight={weight}
        resizeMode="scaleAspectFit"
        style={[{ width: size, height: size }, style]}
        // Decorative: the row or chip around it carries the label, so VoiceOver skips the symbol name.
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }

  return <Ionicons name={icon.ionicon} size={size} color={tint} style={style} accessible={false} importantForAccessibility="no" />;
}
