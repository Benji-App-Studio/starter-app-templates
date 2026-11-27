import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

export type LinePoint = { label: string; value: number };

type LineChartProps = {
  points: LinePoint[];
  height?: number;
  formatValue: (value: number) => string;
};

/** Room under the plot for the first and latest date. */
const LABEL_BAND = 24;
/** Keeps the end dots inside the plot. */
const DOT_INSET = 8;

/** Builds a smooth cubic path through the points (Catmull-Rom converted to Bézier). */
function smoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length < 2) {
    return '';
  }
  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let index = 0; index < coords.length - 1; index += 1) {
    const previous = coords[index - 1] ?? coords[index];
    const current = coords[index];
    const next = coords[index + 1];
    const after = coords[index + 2] ?? next;
    const c1x = current.x + (next.x - previous.x) / 6;
    const c1y = current.y + (next.y - previous.y) / 6;
    const c2x = next.x - (after.x - current.x) / 6;
    const c2y = next.y - (after.y - current.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${next.x} ${next.y}`;
  }
  return path;
}

/**
 * A smooth line with a dot per session, the latest point highlighted. The top and bottom
 * gridlines carry the highest and lowest value as labels above them, so no label sits on the line.
 */
export function LineChart({ points, height = 176, formatValue }: LineChartProps) {
  const { colors, spacing, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const labelBand = typography.caption.lineHeight + spacing.xs;
  const values = points.map((point) => point.value);
  const max = Math.max(1, ...values);
  const min = Math.min(...values, max);
  const flat = min === max;
  const top = labelBand + DOT_INSET;
  const baseline = height - LABEL_BAND;
  const bottom = flat ? top : baseline - DOT_INSET;
  const stepX = points.length > 1 ? (width - DOT_INSET * 2) / (points.length - 1) : 0;
  const coords = points.map((point, index) => ({
    x: DOT_INSET + stepX * index,
    y: flat ? top : top + (1 - (point.value - min) / (max - min)) * (bottom - top),
  }));
  const last = coords[coords.length - 1];
  const first = points[0];
  const latest = points[points.length - 1];

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Line x1={0} x2={width} y1={top} y2={top} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
          <Line x1={0} x2={width} y1={baseline} y2={baseline} stroke={colors.border} strokeWidth={1} />
          <Path d={smoothPath(coords)} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          {coords.map((coord, index) => (
            <Circle key={index} cx={coord.x} cy={coord.y} r={3} fill={colors.background} stroke={colors.primary} strokeWidth={2} />
          ))}
          {last ? <Circle cx={last.x} cy={last.y} r={6} fill={colors.primary} /> : null}
        </Svg>
      ) : null}
      <Text variant="caption" color="muted" numberOfLines={1}>
        {formatValue(max)}
      </Text>
      {flat ? null : (
        <Text
          variant="caption"
          color="muted"
          numberOfLines={1}
          style={[styles.minLabel, { top: baseline - labelBand }]}
        >
          {formatValue(min)}
        </Text>
      )}
      <View style={[styles.labels, { top: baseline + spacing.xs }]} pointerEvents="none">
        <Text variant="caption" color="muted" numberOfLines={1}>
          {first?.label ?? ''}
        </Text>
        <Text variant="caption" color="primary" numberOfLines={1}>
          {latest?.label ?? ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  minLabel: { position: 'absolute', right: 0 },
  labels: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
});
