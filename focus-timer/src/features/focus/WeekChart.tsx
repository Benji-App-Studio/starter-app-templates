import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import type { DailyTotal } from '@/db/sessions';
import { useTheme } from '@/theme/theme';

import { dayKey, formatMinutes, totalsFor, weekDays } from './stats';

type WeekChartProps = {
  totals: DailyTotal[];
  today: Date;
};

const HEIGHT = 168;
const AXIS_WIDTH = 36;
const LABEL_HEIGHT = 22;

/** Minutes per day for the current week, Monday to Sunday, drawn by hand. */
export function WeekChart({ totals, today }: WeekChartProps) {
  const { colors, fonts, typography } = useTheme();
  const [width, setWidth] = useState(0);

  const days = weekDays(today);
  const minutes = days.map((day) => totalsFor(totals, day).minutes);
  const peak = Math.max(...minutes, 30);
  // Round the axis up to a friendly value: 30, 60, 90, 120, ...
  const top = Math.ceil(peak / 30) * 30;
  const plotHeight = HEIGHT - LABEL_HEIGHT;
  const plotWidth = Math.max(0, width - AXIS_WIDTH);
  const slot = plotWidth / 7;
  const barWidth = Math.min(28, slot * 0.56);
  const todayKey = dayKey(today);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.root}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT} accessibilityLabel="Focused minutes per day this week">
          {[0, 0.5, 1].map((fraction) => {
            const y = plotHeight - fraction * (plotHeight - 12);
            return (
              <Line
                key={fraction}
                x1={AXIS_WIDTH}
                x2={width}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeDasharray={fraction === 0 ? undefined : '3 5'}
              />
            );
          })}
          {[0.5, 1].map((fraction) => (
            <SvgText
              key={fraction}
              x={AXIS_WIDTH - 8}
              y={plotHeight - fraction * (plotHeight - 12) + 4}
              fontFamily={fonts.medium}
              fontSize={typography.tab.fontSize}
              fill={colors.textMuted}
              textAnchor="end"
            >
              {formatMinutes(top * fraction)}
            </SvgText>
          ))}
          {days.map((day, index) => {
            const value = minutes[index];
            const key = dayKey(day);
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            const barHeight = value > 0 ? Math.max(6, (value / top) * (plotHeight - 12)) : 0;
            const x = AXIS_WIDTH + slot * index + (slot - barWidth) / 2;
            const fill = isToday ? colors.primary : value > 0 ? colors.surfaceStrong : 'transparent';
            return (
              <Rect
                key={key}
                x={x}
                y={plotHeight - barHeight}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2}
                fill={fill}
                stroke={isFuture || value > 0 ? 'none' : colors.border}
                strokeDasharray={value > 0 ? undefined : '2 3'}
              />
            );
          })}
          {days.map((day, index) => {
            const isToday = dayKey(day) === todayKey;
            return (
              <SvgText
                key={day.toISOString()}
                x={AXIS_WIDTH + slot * index + slot / 2}
                y={HEIGHT - 4}
                fontFamily={isToday ? fonts.bold : fonts.medium}
                fontSize={typography.tab.fontSize}
                fill={isToday ? colors.primary : colors.textMuted}
                textAnchor="middle"
              >
                {day.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </SvgText>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: HEIGHT },
});
