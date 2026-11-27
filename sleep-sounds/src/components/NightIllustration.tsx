import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

type NightIllustrationProps = {
  /** `moon`: a crescent over hills. `stars`: a loose constellation. `log`: three small bars. */
  kind: 'moon' | 'stars' | 'log';
  size?: number;
};

/** Small flat drawings in the palette for empty states. */
export function NightIllustration({ kind, size = 120 }: NightIllustrationProps) {
  const { colors } = useTheme();

  if (kind === 'stars') {
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d="M22 82 L48 58 L70 70 L98 34" stroke={colors.border} strokeWidth={1.5} fill="none" />
        <Circle cx={22} cy={82} r={4} fill={colors.primary} />
        <Circle cx={48} cy={58} r={5.5} fill={colors.primary} />
        <Circle cx={70} cy={70} r={3.5} fill={colors.textMuted} />
        <Circle cx={98} cy={34} r={6.5} fill={colors.primary} />
        <Circle cx={34} cy={30} r={2} fill={colors.textMuted} />
        <Circle cx={86} cy={92} r={2.5} fill={colors.textMuted} />
      </Svg>
    );
  }

  if (kind === 'log') {
    return (
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Path d="M18 96 H102" stroke={colors.border} strokeWidth={1.5} />
        <Path d="M30 96 V70 Q30 64 36 64 H40 Q46 64 46 70 V96 Z" fill={colors.surfaceRaised} />
        <Path d="M54 96 V52 Q54 46 60 46 H64 Q70 46 70 52 V96 Z" fill={colors.primarySoft} />
        <Path d="M78 96 V36 Q78 30 84 30 H88 Q94 30 94 36 V96 Z" fill={colors.primary} />
        <Circle cx={100} cy={22} r={3} fill={colors.textMuted} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d="M8 104 Q40 76 72 96 Q96 82 112 100 V120 H8 Z" fill={colors.surfaceRaised} />
      <Path
        d="M74 22 A30 30 0 1 0 92 76 A24 24 0 1 1 74 22 Z"
        fill={colors.primary}
      />
      <Circle cx={30} cy={34} r={2.5} fill={colors.textMuted} />
      <Circle cx={46} cy={18} r={1.8} fill={colors.textMuted} />
      <Circle cx={104} cy={40} r={2} fill={colors.textMuted} />
    </Svg>
  );
}
