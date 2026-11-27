import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components';
import { useTheme } from '@/theme/theme';

import type { DayHours } from './stats';

type WeekChartProps = {
  days: DayHours[];
  goalHours: number;
};

const HEIGHT = 150;
const LABEL_HEIGHT = 22;
const TOP = 18;

/** Hours fasted per day for the last week, with the goal as a dashed line (labelled in the card header). Drawn by hand. */
export function WeekChart({ days, goalHours }: WeekChartProps) {
  const { colors, typography } = useTheme();
  const [width, setWidth] = useState(0);

  const plotHeight = HEIGHT - LABEL_HEIGHT - TOP;
  const maxHours = Math.max(goalHours, ...days.map((day) => day.hours)) * 1.08;
  const slot = width / days.length;
  const barWidth = Math.min(28, slot * 0.5);
  const goalY = TOP + plotHeight * (1 - goalHours / maxHours);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={styles.root}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Line
            x1={0}
            x2={width}
            y1={goalY}
            y2={goalY}
            stroke={colors.border}
            strokeWidth={1}
            strokeDasharray="4 5"
          />
          {days.map((day, index) => {
            const x = slot * index + (slot - barWidth) / 2;
            const barHeight = Math.max(4, plotHeight * (day.hours / maxHours));
            const y = TOP + plotHeight - barHeight;
            const reached = day.hours >= goalHours;
            const fill = day.isToday
              ? colors.primary
              : reached
                ? colors.primary
                : day.hours > 0
                  ? colors.border
                  : colors.surfaceRaised;
            return (
              <Rect
                key={day.date}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={barWidth / 2.6}
                fill={fill}
                opacity={day.isToday || !reached ? 1 : 0.55}
              />
            );
          })}
          {days.map((day, index) =>
            day.hours > 0 && (day.isToday || day.hours >= goalHours) ? (
              <SvgText
                key={`value-${day.date}`}
                x={slot * index + slot / 2}
                y={TOP + plotHeight * (1 - day.hours / maxHours) - 7}
                fill={day.isToday ? colors.text : colors.textMuted}
                fontSize={typography.caption.fontSize}
                fontFamily={typography.label.fontFamily}
                textAnchor="middle"
              >
                {`${Math.round(day.hours)}h`}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : (
        <View style={{ height: HEIGHT }} />
      )}
      <View style={styles.labels}>
        {days.map((day) => (
          <View key={day.date} style={styles.label}>
            <Text
              variant="caption"
              color={day.isToday ? 'text' : 'muted'}
              style={day.isToday ? { fontFamily: typography.label.fontFamily } : undefined}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  labels: { flexDirection: 'row', marginTop: -LABEL_HEIGHT + 4 },
  label: { flex: 1, alignItems: 'center' },
});
