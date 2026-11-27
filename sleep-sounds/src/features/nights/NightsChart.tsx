import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { fonts, useTheme } from '@/theme/theme';

export type NightBar = {
  /** "Mon" */
  label: string;
  minutes: number;
  isTonight: boolean;
};

type NightsChartProps = {
  bars: NightBar[];
  height?: number;
};

const AXIS_WIDTH = 34;
const LABEL_HEIGHT = 22;

/** Minutes listened per night for the last week: rounded bars, tonight in the accent. */
export function NightsChart({ bars, height = 170 }: NightsChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const max = Math.max(30, ...bars.map((bar) => bar.minutes));
  // Round the top of the axis to a clean half hour.
  const top = Math.ceil(max / 30) * 30;
  const plotHeight = height - LABEL_HEIGHT;
  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const slot = bars.length > 0 ? plotWidth / bars.length : 0;
  const barWidth = Math.min(28, slot * 0.55);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {[0, 0.5, 1].map((fraction) => {
            const y = plotHeight - fraction * (plotHeight - 8);
            return (
              <Line
                key={fraction}
                x1={AXIS_WIDTH}
                x2={width}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray={fraction === 0 ? undefined : '2 4'}
              />
            );
          })}
          {[0.5, 1].map((fraction) => (
            <SvgText
              key={fraction}
              x={AXIS_WIDTH - 8}
              y={plotHeight - fraction * (plotHeight - 8) + 4}
              fontFamily={fonts.regular}
              fontSize={11}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {formatAxis(top * fraction)}
            </SvgText>
          ))}
          {bars.map((bar, index) => {
            const x = AXIS_WIDTH + slot * index + (slot - barWidth) / 2;
            const barHeight = bar.minutes === 0 ? 3 : Math.max(6, (bar.minutes / top) * (plotHeight - 8));
            return (
              <Rect
                key={bar.label + index}
                x={x}
                y={plotHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill={bar.isTonight ? colors.primary : bar.minutes === 0 ? colors.border : colors.primarySoft}
              />
            );
          })}
          {bars.map((bar, index) => (
            <SvgText
              key={bar.label + index}
              x={AXIS_WIDTH + slot * index + slot / 2}
              y={height - 4}
              fontFamily={bar.isTonight ? fonts.medium : fonts.regular}
              fontSize={11}
              fill={bar.isTonight ? colors.text : colors.textMuted}
              textAnchor="middle"
            >
              {bar.label}
            </SvgText>
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

function formatAxis(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}
