import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

type IllustrationProps = { size?: number };

/** An empty squat rack. Routines and empty workout states. */
export function RackIllustration({ size = 120 }: IllustrationProps) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Rect x="22" y="14" width="10" height="92" rx="3" fill={colors.surfaceRaised} />
      <Rect x="88" y="14" width="10" height="92" rx="3" fill={colors.surfaceRaised} />
      <Rect x="14" y="104" width="26" height="6" rx="3" fill={colors.border} />
      <Rect x="80" y="104" width="26" height="6" rx="3" fill={colors.border} />
      {[30, 46, 62, 78].map((y) => (
        <Rect key={y} x="30" y={y} width="8" height="4" rx="2" fill={colors.textMuted} />
      ))}
      {[30, 46, 62, 78].map((y) => (
        <Rect key={y} x="82" y={y} width="8" height="4" rx="2" fill={colors.textMuted} />
      ))}
      <Rect x="18" y="44" width="84" height="5" rx="2.5" fill={colors.primary} />
    </Svg>
  );
}

/** Stacked plates. Records empty state. */
export function PlatesIllustration({ size = 120 }: IllustrationProps) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Rect x="16" y="78" width="88" height="18" rx="6" fill={colors.surfaceRaised} />
      <Rect x="24" y="58" width="72" height="18" rx="6" fill={colors.border} />
      <Rect x="34" y="38" width="52" height="18" rx="6" fill={colors.primary} opacity={0.7} />
      <Rect x="44" y="18" width="32" height="18" rx="6" fill={colors.primary} />
      <Line x1="60" y1="18" x2="60" y2="96" stroke={colors.background} strokeWidth="3" />
    </Svg>
  );
}

/** A stopwatch face. History empty state. */
export function StopwatchIllustration({ size = 120 }: IllustrationProps) {
  const { colors } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden>
      <Rect x="52" y="8" width="16" height="10" rx="3" fill={colors.textMuted} />
      <Circle cx="60" cy="66" r="42" fill={colors.surfaceRaised} />
      <Circle cx="60" cy="66" r="34" fill={colors.surface} stroke={colors.border} strokeWidth="2" />
      <Path d="M60 66 L60 40" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" />
      <Path d="M60 66 L76 76" stroke={colors.text} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="60" cy="66" r="3.5" fill={colors.text} />
    </Svg>
  );
}
