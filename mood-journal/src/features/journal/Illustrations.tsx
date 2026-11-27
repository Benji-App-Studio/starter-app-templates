import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/** A sun or moon over a horizon; its place follows the chosen check-in time. */
export function SkyArc({ time, width = 280 }: { time: 'morning' | 'midday' | 'evening' | 'night' | undefined; width?: number }) {
  const { colors } = useTheme();
  const height = width * 0.46;
  const horizonY = height - 18;
  const radius = width * 0.36;
  const centerX = width / 2;
  const angles = { morning: 200, midday: 268, evening: 334, night: 300 };
  const angle = ((angles[time ?? 'midday'] ?? 268) * Math.PI) / 180;
  const x = centerX + radius * Math.cos(angle);
  const y = horizonY + radius * Math.sin(angle);
  const isNight = time === 'night';
  const glow = isNight ? colors.mood[0] : time === 'evening' ? colors.mood[4] : colors.mood[3];

  return (
    <Svg width={width} height={height}>
      <Path
        d={`M ${centerX - radius} ${horizonY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${horizonY}`}
        stroke={colors.border}
        strokeWidth={2}
        strokeDasharray="4 7"
        strokeLinecap="round"
        fill="none"
      />
      <Line x1={12} x2={width - 12} y1={horizonY} y2={horizonY} stroke={colors.textMuted} strokeWidth={1.5} strokeOpacity={0.5} />
      <Circle cx={x} cy={y} r={30} fill={glow} opacity={0.18} />
      <Circle cx={x} cy={y} r={17} fill={glow} />
      {isNight ? <Circle cx={x + 9} cy={y - 7} r={14} fill={colors.background} /> : null}
      {isNight
        ? [
            [x + 46, y - 6],
            [x + 34, y + 18],
            [x - 44, y + 2],
          ].map(([sx, sy]) => <Circle key={`${sx}`} cx={sx} cy={sy} r={1.8} fill={colors.textMuted} />)
        : null}
    </Svg>
  );
}

/** An open journal with a few colored day-squares, for empty lists. */
export function EmptyJournal({ width = 128 }: { width?: number }) {
  const { colors } = useTheme();
  const height = width * 0.75;
  return (
    <Svg width={width} height={height} viewBox="0 0 128 96">
      <Rect x={10} y={12} width={108} height={76} rx={12} fill={colors.surface} stroke={colors.border} strokeWidth={2} />
      <Line x1={64} y1={12} x2={64} y2={88} stroke={colors.border} strokeWidth={2} />
      {[30, 42, 54, 66].map((y) => (
        <Line key={y} x1={22} x2={54} y1={y} y2={y} stroke={colors.border} strokeWidth={3} strokeLinecap="round" />
      ))}
      <Rect x={74} y={26} width={12} height={12} rx={3.5} fill={colors.mood[3]} />
      <Rect x={90} y={26} width={12} height={12} rx={3.5} fill={colors.mood[4]} />
      <Rect x={74} y={42} width={12} height={12} rx={3.5} fill={colors.mood[2]} />
      <Rect x={90} y={42} width={12} height={12} rx={3.5} fill={colors.border} />
      <Rect x={74} y={58} width={12} height={12} rx={3.5} fill={colors.border} />
      <Rect x={90} y={58} width={12} height={12} rx={3.5} fill={colors.border} />
    </Svg>
  );
}

/** A short rising line with three dots, for an empty trends screen. */
export function EmptyTrend({ width = 128 }: { width?: number }) {
  const { colors } = useTheme();
  const height = width * 0.6;
  return (
    <Svg width={width} height={height} viewBox="0 0 128 76">
      <Line x1={12} x2={116} y1={62} y2={62} stroke={colors.border} strokeWidth={2} strokeLinecap="round" />
      <Path d="M 20 50 C 40 48 46 30 64 34 S 90 20 108 16" stroke={colors.textMuted} strokeOpacity={0.5} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeDasharray="5 6" />
      <Circle cx={20} cy={50} r={6} fill={colors.mood[1]} stroke={colors.background} strokeWidth={2} />
      <Circle cx={64} cy={34} r={6} fill={colors.mood[2]} stroke={colors.background} strokeWidth={2} />
      <Circle cx={108} cy={16} r={6} fill={colors.mood[4]} stroke={colors.background} strokeWidth={2} />
    </Svg>
  );
}
