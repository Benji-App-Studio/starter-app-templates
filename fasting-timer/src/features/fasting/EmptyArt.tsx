import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/** A quiet ring with a crescent inside: the state before the first fast. */
export function EmptyArt({ size = 120 }: { size?: number }) {
  const { colors } = useTheme();
  const c = size / 2;
  const r = c - 10;

  return (
    <Svg width={size} height={size}>
      <Circle cx={c} cy={c} r={r} stroke={colors.surfaceRaised} strokeWidth={10} fill="none" />
      <Circle
        cx={c}
        cy={c}
        r={r}
        stroke={colors.primary}
        strokeWidth={10}
        strokeDasharray={`${r * 0.9} ${2 * Math.PI * r}`}
        strokeLinecap="round"
        fill="none"
        rotation={-90}
        origin={`${c}, ${c}`}
      />
      <Circle cx={c} cy={10} r={7} fill={colors.background} stroke={colors.primary} strokeWidth={3} />
      <Path
        d={`M ${c + 4} ${c - 22} a 22 22 0 1 0 0 44 a 17 17 0 1 1 0 -44 z`}
        fill={colors.textMuted}
        opacity={0.6}
      />
    </Svg>
  );
}
