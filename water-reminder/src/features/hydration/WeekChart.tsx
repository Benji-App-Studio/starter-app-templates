import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { fonts, useTheme } from '@/theme/theme';

import { parseDay } from './dates';
import { formatAmountShort, type Unit } from './goal';

export type ChartDay = {
  day: string;
  totalMl: number;
  goalMl: number;
  reached: boolean;
  isToday: boolean;
};

type WeekChartProps = {
  days: ChartDay[];
  unit: Unit;
};

const HEIGHT = 168;
const TOP = 22;
const AXIS = 24;
const BAR_RADIUS = 7;

/** Seven rounded bars against a dashed goal line, drawn by hand with SVG. */
export function WeekChart({ days, unit }: WeekChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const goalMl = days[days.length - 1]?.goalMl ?? 1;
  const maxMl = Math.max(goalMl * 1.15, ...days.map((day) => day.totalMl));
  const plotHeight = HEIGHT - TOP - AXIS;
  const slot = width / Math.max(1, days.length);
  const barWidth = Math.min(34, slot * 0.56);
  const goalY = TOP + plotHeight * (1 - goalMl / maxMl);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height: HEIGHT }}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Line
            x1={0}
            x2={width}
            y1={goalY}
            y2={goalY}
            stroke={colors.textMuted}
            strokeWidth={1}
            strokeDasharray="4 5"
            opacity={0.6}
          />
          <Rect x={width - 72} y={goalY - 20} width={72} height={18} rx={6} fill={colors.surface} />
          <SvgText
            x={width - 4}
            y={goalY - 6}
            fill={colors.textMuted}
            fontFamily={fonts.semibold}
            fontSize={12}
            textAnchor="end"
          >
            {`Goal ${formatAmountShort(goalMl, unit)}`}
          </SvgText>
          {days.map((day, index) => {
            const x = slot * index + (slot - barWidth) / 2;
            const barHeight = Math.max(4, plotHeight * Math.min(1, day.totalMl / maxMl));
            const y = TOP + plotHeight - barHeight;
            const fill = day.reached ? colors.primary : day.isToday ? colors.primary : colors.secondary;
            const opacity = day.reached ? 1 : day.isToday ? 0.55 : day.totalMl > 0 ? 0.7 : 0.35;
            const label = parseDay(day.day).toLocaleDateString(undefined, { weekday: 'narrow' });
            return (
              <Bar
                key={day.day}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={fill}
                opacity={opacity}
                label={label}
                labelX={slot * index + slot / 2}
                labelColor={day.isToday ? colors.primary : colors.textMuted}
                labelFont={day.isToday ? fonts.extrabold : fonts.semibold}
              />
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

type BarProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  label: string;
  labelX: number;
  labelColor: string;
  labelFont: string;
};

function Bar({ x, y, width, height, fill, opacity, label, labelX, labelColor, labelFont }: BarProps) {
  return (
    <>
      <Rect x={x} y={y} width={width} height={height} rx={BAR_RADIUS} fill={fill} opacity={opacity} />
      <SvgText x={labelX} y={HEIGHT - 6} fill={labelColor} fontFamily={labelFont} fontSize={12} textAnchor="middle">
        {label}
      </SvgText>
    </>
  );
}
