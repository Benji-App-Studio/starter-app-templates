import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/** An empty plate with cutlery and a quarter of the ring, for empty states. */
export function PlateIllustration({ size = 112 }: { size?: number }) {
  const { colors } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 112 112" accessible={false}>
      <Circle cx="56" cy="58" r="40" fill={colors.surface} stroke={colors.border} strokeWidth="2" />
      <Circle cx="56" cy="58" r="27" fill="none" stroke={colors.border} strokeWidth="2" />
      <Rect x="12" y="26" width="4" height="60" rx="2" fill={colors.textMuted} />
      <Path d="M8 26v16a6 6 0 0 0 12 0V26" fill="none" stroke={colors.textMuted} strokeWidth="3" strokeLinecap="round" />
      <Rect x="96" y="26" width="4" height="60" rx="2" fill={colors.textMuted} />
      <Path d="M96 26c-8 8-8 24 0 32" fill="none" stroke={colors.textMuted} strokeWidth="3" strokeLinecap="round" />
      <Path d="M56 18a40 40 0 0 1 40 40" fill="none" stroke={colors.primary} strokeWidth="5" strokeLinecap="round" />
    </Svg>
  );
}
