import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/Text';
import { useTheme } from '@/theme/theme';

export type DayCount = { label: string; count: number; isToday: boolean };

type CravingsChartProps = {
  days: DayCount[];
};

const HEIGHT = 150;
const TOP = 22;
const BOTTOM = 22;

/** Cravings per day over the last week, drawn by hand; today in the primary color. */
export function CravingsChart({ days }: CravingsChartProps) {
  const { colors, fonts, spacing, typography } = useTheme();
  const [width, setWidth] = useState(0);
  const max = Math.max(1, ...days.map((day) => day.count));
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const slot = width / days.length;
  const barWidth = Math.min(28, slot * 0.5);
  const baseline = HEIGHT - BOTTOM;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ gap: spacing.xs }}>
      <Text variant="caption" color="muted">
        {/* `max` floors at 1 for the scale; with nothing logged, say so instead of "Peak 1". */}
        {days.some((day) => day.count > 0) ? `Peak ${max} a day` : 'None logged this week'}
      </Text>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Line x1={0} y1={baseline} x2={width} y2={baseline} stroke={colors.border} strokeWidth={1} />
          {days.map((day, index) => {
            const x = index * slot + (slot - barWidth) / 2;
            const barHeight = Math.max(day.count > 0 ? 6 : 3, (day.count / max) * plotHeight);
            const y = baseline - barHeight;
            const fill = day.isToday ? colors.primary : day.count > 0 ? colors.textMuted : colors.border;
            return (
              <Rect key={day.label + index} x={x} y={y} width={barWidth} height={barHeight} rx={barWidth / 2} fill={fill} />
            );
          })}
          {days.map((day, index) => {
            const x = index * slot + slot / 2;
            const barHeight = (day.count / max) * plotHeight;
            return (
              <SvgText
                key={`label-${index}`}
                x={x}
                y={day.count > 0 ? baseline - barHeight - 8 : baseline - 8}
                fontFamily={fonts.bold}
                fontSize={typography.axis.fontSize}
                fill={day.isToday ? colors.primary : colors.textMuted}
                textAnchor="middle"
              >
                {day.count > 0 ? String(day.count) : ''}
              </SvgText>
            );
          })}
          {days.map((day, index) => (
            <SvgText
              key={`axis-${index}`}
              x={index * slot + slot / 2}
              y={HEIGHT - 4}
              fontFamily={day.isToday ? fonts.bold : fonts.medium}
              fontSize={typography.axis.fontSize}
              fill={day.isToday ? colors.text : colors.textMuted}
              textAnchor="middle"
            >
              {day.label}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { height: HEIGHT },
});
