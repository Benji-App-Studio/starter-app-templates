import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/** An open ring with a sprout: the counter before it starts. */
export function SproutIllustration({ size = 112 }: { size?: number }) {
  const { colors } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 112 112">
      <Circle cx={56} cy={56} r={48} stroke={colors.border} strokeWidth={8} fill={colors.surface} />
      <Path d="M56 8 A48 48 0 0 1 104 56" stroke={colors.primary} strokeWidth={8} strokeLinecap="round" fill="none" />
      <Circle cx={56} cy={8} r={6} fill={colors.accent} />
      <Path d="M56 80 V52" stroke={colors.primary} strokeWidth={5} strokeLinecap="round" />
      <Path d="M56 60 C 56 46, 44 40, 36 42 C 36 54, 46 62, 56 60 Z" fill={colors.primary} />
      <Path d="M56 52 C 56 40, 68 34, 76 36 C 76 48, 66 54, 56 52 Z" fill={colors.primarySoft} stroke={colors.primary} strokeWidth={2} />
    </Svg>
  );
}

/** Three quiet bars: history before there is any. */
export function QuietBarsIllustration({ size = 112 }: { size?: number }) {
  const { colors } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 112 112">
      <Line x1={14} y1={90} x2={98} y2={90} stroke={colors.border} strokeWidth={3} />
      <Rect x={22} y={58} width={16} height={32} rx={8} fill={colors.border} />
      <Rect x={48} y={38} width={16} height={52} rx={8} fill={colors.textMuted} opacity={0.5} />
      <Rect x={74} y={48} width={16} height={42} rx={8} fill={colors.primary} />
      <Circle cx={82} cy={30} r={6} fill={colors.accent} />
    </Svg>
  );
}

/** A flag on a pole: milestones before the counter runs. */
export function FlagIllustration({ size = 112 }: { size?: number }) {
  const { colors } = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 112 112">
      <Line x1={36} y1={20} x2={36} y2={96} stroke={colors.textMuted} strokeWidth={5} strokeLinecap="round" />
      <Path d="M39 22 L84 34 L39 50 Z" fill={colors.accent} />
      <Circle cx={36} cy={16} r={5} fill={colors.primary} />
      <Line x1={22} y1={96} x2={62} y2={96} stroke={colors.border} strokeWidth={4} strokeLinecap="round" />
    </Svg>
  );
}
