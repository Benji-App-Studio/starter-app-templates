import Svg, { ClipPath, Defs, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { dayOfMonth } from '@/features/diary/days';
import { fontFamily, useTheme } from '@/theme/theme';

const HEIGHT = 190;
const TOP = 14;
const BOTTOM = 26;
const RIGHT = 48;
const STUB = 3;

type DailyBarChartProps = {
  width: number;
  /** Oldest first; every day in the range, zero when nothing was logged. */
  days: { day: string; calories: number }[];
  target: number;
  today: string;
};

/** Calories per day as rounded bars against a dashed target line. Drawn by hand with SVG. */
export function DailyBarChart({ width, days, target, today }: DailyBarChartProps) {
  const { colors } = useTheme();
  const chartWidth = width - RIGHT;
  const chartHeight = HEIGHT - TOP - BOTTOM;
  const max = Math.max(target * 1.2, ...days.map((entry) => entry.calories));
  const slot = chartWidth / days.length;
  const barWidth = Math.min(slot * 0.56, 18);
  const targetY = TOP + chartHeight * (1 - target / max);
  const baseline = TOP + chartHeight;

  return (
    <Svg width={width} height={HEIGHT} accessibilityLabel={`Calories per day for the last ${days.length} days`}>
      <Line
        x1={0}
        x2={chartWidth}
        y1={targetY}
        y2={targetY}
        stroke={colors.textMuted}
        strokeWidth={1}
        strokeDasharray="3 4"
      />
      <SvgText
        x={chartWidth + 8}
        y={targetY + 4}
        fill={colors.textMuted}
        fontFamily={fontFamily.medium}
        fontSize={11}
      >
        {target.toLocaleString()}
      </SvgText>
      <SvgText x={chartWidth + 8} y={baseline + 1} fill={colors.textMuted} fontFamily={fontFamily.medium} fontSize={11}>
        0
      </SvgText>
      <Defs>
        {/* Everything above the target line: the over part of a bar is drawn through this. */}
        <ClipPath id="over-target">
          <Rect x={0} y={0} width={chartWidth} height={targetY} />
        </ClipPath>
      </Defs>
      {days.map((entry, index) => {
        const isToday = entry.day === today;
        const height = entry.calories > 0 ? Math.max(barWidth, chartHeight * (entry.calories / max)) : STUB;
        const x = slot * index + (slot - barWidth) / 2;
        const over = !isToday && entry.calories > target;
        const color = entry.calories === 0 ? colors.border : isToday ? colors.primary : colors.text;
        const bar = {
          x,
          y: baseline - height,
          width: barWidth,
          height,
          rx: entry.calories > 0 ? barWidth / 2 : 1.5,
        };

        return (
          <G key={entry.day}>
            <Rect {...bar} fill={color} opacity={isToday || entry.calories === 0 ? 1 : 0.75} />
            {/* Past days over target keep the ink bar; only the part above the line turns red, so today stays the one accent bar. */}
            {over ? <Rect {...bar} fill={colors.danger} clipPath="url(#over-target)" /> : null}
          </G>
        );
      })}
      {days.map((entry, index) => {
        const isToday = entry.day === today;
        return (
          <SvgText
            key={entry.day}
            x={slot * index + slot / 2}
            y={HEIGHT - 8}
            fill={isToday ? colors.primary : colors.textMuted}
            fontFamily={isToday ? fontFamily.bold : fontFamily.medium}
            fontSize={11}
            textAnchor="middle"
          >
            {String(dayOfMonth(entry.day))}
          </SvgText>
        );
      })}
    </Svg>
  );
}
