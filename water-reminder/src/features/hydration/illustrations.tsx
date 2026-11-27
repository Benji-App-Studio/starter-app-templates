import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/** An empty tumbler with one drop on its way in. For the empty log. */
export function EmptyGlassIllustration({ size = 96 }: { size?: number }) {
  const { colors, scheme } = useTheme();
  const stroke = scheme === 'dark' ? '#5F7D91' : '#B9CFDD';

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path d="M 26 34 L 70 34 L 64 84 Q 63 88 59 88 L 37 88 Q 33 88 32 84 Z" fill={colors.surfaceRaised} />
      <Path d="M 30 56 L 66 56 L 63 84 Q 62 88 58 88 L 38 88 Q 34 88 33 84 Z" fill={colors.secondary} opacity={0.55} />
      <Path d="M 26 34 L 70 34 L 64 84 Q 63 88 59 88 L 37 88 Q 33 88 32 84 Z" stroke={stroke} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <Path d="M 48 6 C 48 6 38 19 38 25 A 10 10 0 0 0 58 25 C 58 19 48 6 48 6 Z" fill={colors.primary} />
      <Circle cx={44} cy={25} r={2} fill={colors.onPrimary} opacity={0.8} />
    </Svg>
  );
}

/** A small month grid with a few filled days. For the empty history. */
export function CalendarIllustration({ size = 96 }: { size?: number }) {
  const { colors, scheme } = useTheme();
  const stroke = scheme === 'dark' ? '#5F7D91' : '#B9CFDD';
  const cells = [
    { x: 21, y: 36, filled: true },
    { x: 37, y: 36, filled: true },
    { x: 53, y: 36, filled: false },
    { x: 69, y: 36, filled: true },
    { x: 21, y: 52, filled: true },
    { x: 37, y: 52, filled: false },
    { x: 53, y: 52, filled: true },
    { x: 69, y: 52, filled: true },
    { x: 21, y: 68, filled: false },
    { x: 37, y: 68, filled: false },
  ];

  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Rect x={12} y={14} width={72} height={74} rx={12} fill={colors.surfaceRaised} />
      <Rect x={12} y={14} width={72} height={16} rx={8} fill={colors.primary} />
      <Rect x={12} y={14} width={72} height={74} rx={12} stroke={stroke} strokeWidth={3} fill="none" />
      {cells.map((cell) => (
        <Rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={12}
          height={12}
          rx={4}
          fill={cell.filled ? colors.secondary : colors.border}
        />
      ))}
    </Svg>
  );
}
