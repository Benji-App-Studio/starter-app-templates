import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
/** Room under the plot for the week labels. */
const LABEL_BAND = 24;

export type BarDatum = {
  label: string;
  value: number;
  /** Drawn in the accent, e.g. this week. */
  highlight?: boolean;
};

type BarChartProps = {
  data: BarDatum[];
  height?: number;
  /** Labels the top gridline (the tallest bar). */
  formatValue: (value: number) => string;
};

/** Rounded bars that spring up from the baseline, a dashed top gridline, labels in caption size. */
export function BarChart({ data, height = 168, formatValue }: BarChartProps) {
  const { colors, spacing, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const max = Math.max(1, ...data.map((datum) => datum.value));
  const topBand = typography.caption.lineHeight + spacing.sm;
  const baseline = height - LABEL_BAND;
  const plotHeight = baseline - topBand;
  const slot = data.length > 0 ? width / data.length : 0;
  const barWidth = Math.min(28, slot * 0.58);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Line x1={0} x2={width} y1={topBand} y2={topBand} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
          <Line x1={0} x2={width} y1={baseline} y2={baseline} stroke={colors.border} strokeWidth={1} />
          {data.map((datum, index) => (
            <Bar
              key={`${datum.label}-${index}`}
              x={slot * index + (slot - barWidth) / 2}
              width={barWidth}
              baseline={baseline}
              height={datum.value <= 0 ? 3 : Math.max(3, (datum.value / max) * plotHeight)}
              color={datum.highlight ? colors.primary : datum.value <= 0 ? colors.border : colors.textMuted}
              opacity={datum.highlight || datum.value <= 0 ? 1 : 0.35}
            />
          ))}
        </Svg>
      ) : null}
      <Text variant="caption" color="muted" numberOfLines={1}>
        {formatValue(max)}
      </Text>
      <View style={[styles.labels, { top: baseline + spacing.xs }]} pointerEvents="none">
        {data.map((datum, index) => (
          <Text
            key={`${datum.label}-${index}`}
            variant="caption"
            color={datum.highlight ? 'primary' : 'muted'}
            align="center"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            style={{ width: slot }}
          >
            {datum.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

type BarProps = { x: number; width: number; baseline: number; height: number; color: string; opacity: number };

function Bar({ x, width, baseline, height, color, opacity }: BarProps) {
  const reducedMotion = useReducedMotion();
  const grown = useSharedValue(reducedMotion ? height : 0);

  useEffect(() => {
    grown.value = reducedMotion ? height : withSpring(height, { damping: 18, stiffness: 120 });
  }, [grown, height, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    y: baseline - grown.value,
    height: grown.value,
  }));

  return (
    <AnimatedRect x={x} width={width} rx={Math.min(5, width / 2)} fill={color} opacity={opacity} animatedProps={animatedProps} />
  );
}

const styles = StyleSheet.create({
  labels: { position: 'absolute', left: 0, right: 0, flexDirection: 'row' },
});
