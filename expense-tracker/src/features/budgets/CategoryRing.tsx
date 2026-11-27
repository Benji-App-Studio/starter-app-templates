import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

export type RingSegment = {
  id: string;
  color: string;
  /** The category's monthly limit: the length of its arc. */
  limitCents: number;
  /** Spent so far: how much of the arc is filled. */
  spentCents: number;
};

type CategoryRingProps = {
  segments: RingSegment[];
  size: number;
  /** Drawn in the middle of the ring. */
  children: ReactNode;
};

const STROKE = 18;
/** Gap between two arcs, along the ring. */
const SEGMENT_GAP = 4;

/**
 * The month's budget as one ring: each category owns an arc as long as its limit, drawn faint,
 * and fills it with what it has spent. A category past its limit fills its arc in the over color.
 */
export function CategoryRing({ segments, size, children }: CategoryRingProps) {
  const { colors } = useTheme();
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const withLimit = segments.filter((segment) => segment.limitCents > 0);
  const total = withLimit.reduce((sum, segment) => sum + segment.limitCents, 0);
  const gap = withLimit.length > 1 ? SEGMENT_GAP : 0;

  let start = 0;
  const arcs = withLimit.map((segment) => {
    const length = (segment.limitCents / total) * circumference;
    const drawn = Math.max(0, length - gap);
    const filled = Math.min(drawn, (segment.spentCents / segment.limitCents) * drawn);
    const arc = { ...segment, start, drawn, filled, over: segment.spentCents > segment.limitCents };
    start += length;
    return arc;
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {total === 0 ? (
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.track} strokeWidth={STROKE} fill="none" />
          ) : null}
          {arcs.map((arc) => (
            <G key={arc.id}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeOpacity={0.28}
                strokeWidth={STROKE}
                strokeDasharray={[arc.drawn, circumference]}
                strokeDashoffset={-arc.start}
              />
              {arc.filled > 0 ? (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={arc.over ? colors.danger : arc.color}
                  strokeWidth={STROKE}
                  strokeDasharray={[arc.filled, circumference]}
                  strokeDashoffset={-arc.start}
                />
              ) : null}
            </G>
          ))}
        </G>
      </Svg>
      {/* The centre content keeps one stroke width of air inside the ring. */}
      <View style={[StyleSheet.absoluteFill, styles.center, { padding: STROKE * 2 }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
