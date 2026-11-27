import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/*
 * Small flat drawings in the palette. They are the only pictures in the app, so
 * they stay abstract: runways, coins and bars, never stock art.
 */

/** Onboarding welcome: a ledger card with three runways and a coin resting on its edge. */
export function WelcomeIllustration() {
  const { colors, categoryTints } = useTheme();

  return (
    <Svg width={260} height={180} viewBox="0 0 260 180">
      <Rect x={18} y={24} width={200} height={132} rx={20} fill={colors.surface} stroke={colors.border} strokeWidth={1.5} />
      <Rect x={42} y={56} width={120} height={14} rx={7} fill={colors.track} />
      <Rect x={42} y={56} width={78} height={14} rx={7} fill={categoryTints[0]} />
      <Rect x={42} y={84} width={120} height={14} rx={7} fill={colors.track} />
      <Rect x={42} y={84} width={44} height={14} rx={7} fill={categoryTints[2]} />
      <Rect x={42} y={112} width={120} height={14} rx={7} fill={colors.track} />
      <Rect x={42} y={112} width={96} height={14} rx={7} fill={categoryTints[3]} />
      <Line x1={118} y1={48} x2={118} y2={134} stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={206} cy={110} r={42} fill={colors.primary} />
      <Circle cx={206} cy={110} r={28} fill="none" stroke={colors.onPrimary} strokeWidth={3} strokeOpacity={0.9} />
      <Circle cx={206} cy={110} r={6} fill={colors.onPrimary} />
    </Svg>
  );
}

/** Empty list: a receipt with nothing on it yet. */
export function EmptyLedgerIllustration() {
  const { colors } = useTheme();

  return (
    <Svg width={96} height={88} viewBox="0 0 96 88">
      <Rect x={20} y={6} width={56} height={76} rx={10} fill={colors.background} stroke={colors.border} strokeWidth={1.5} />
      <Rect x={32} y={24} width={32} height={6} rx={3} fill={colors.track} />
      <Rect x={32} y={40} width={22} height={6} rx={3} fill={colors.track} />
      <Rect x={32} y={56} width={26} height={6} rx={3} fill={colors.track} />
      <Circle cx={66} cy={59} r={5} fill={colors.primary} />
    </Svg>
  );
}

/** Empty report: three bars waiting for data. */
export function EmptyChartIllustration() {
  const { colors } = useTheme();

  return (
    <Svg width={96} height={88} viewBox="0 0 96 88">
      <Rect x={18} y={46} width={14} height={30} rx={5} fill={colors.track} />
      <Rect x={41} y={30} width={14} height={46} rx={5} fill={colors.track} />
      <Rect x={64} y={18} width={14} height={58} rx={5} fill={colors.primarySoft} stroke={colors.primary} strokeWidth={1.5} />
      <Line x1={10} y1={80} x2={86} y2={80} stroke={colors.border} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
