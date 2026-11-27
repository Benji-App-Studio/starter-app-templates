import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

type DotsMarkProps = {
  size?: number;
  /** How many of the nine dots are filled, left to right, top to bottom. */
  filled?: number;
};

/**
 * The brand mark: a three-by-three grid of dots, filled ones in the accent, the next one a ring.
 * Used by the empty states, the onboarding welcome and the paywall.
 */
export function DotsMark({ size = 120, filled = 6 }: DotsMarkProps) {
  const { colors } = useTheme();
  const step = size / 3;
  const radius = step * 0.3;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityRole="image">
      {Array.from({ length: 9 }, (_, index) => {
        const cx = step * ((index % 3) + 0.5);
        const cy = step * (Math.floor(index / 3) + 0.5);
        if (index < filled) {
          return <Circle key={index} cx={cx} cy={cy} r={radius} fill={colors.primary} />;
        }
        if (index === filled) {
          return (
            <Circle
              key={index}
              cx={cx}
              cy={cy}
              r={radius - 2}
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
            />
          );
        }
        return <Circle key={index} cx={cx} cy={cy} r={radius} fill={colors.border} />;
      })}
    </Svg>
  );
}
