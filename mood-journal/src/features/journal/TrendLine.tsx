import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

import { formatDayShort, formatWeekday } from './dates';
import { moodColor, scoreForAverage } from './moods';

export type TrendPoint = {
  day: string;
  /** Mean score for the day (or week), or undefined when nothing was logged. */
  score?: number;
};

type TrendLineProps = {
  points: readonly TrendPoint[];
  today: string;
  height?: number;
};

const PADDING = { top: 14, bottom: 26, left: 8, right: 8 };
/** A regular date label closer than this to today's (end-aligned) label is skipped so they never collide. */
const LAST_LABEL_CLEARANCE = 64;

const Y_LABELS: { score: number; label: string }[] = [
  { score: 5, label: 'Great' },
  { score: 3, label: 'Okay' },
  { score: 1, label: 'Awful' },
];

/** Catmull-Rom through the points, converted to cubic Béziers for a soft line. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) {
    return '';
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

/** The mood line: smooth, hand-drawn with SVG, today ringed. Gaps stay gaps. */
export function TrendLine({ points, today, height = 220 }: TrendLineProps) {
  const { colors, fonts } = useTheme();
  const [width, setWidth] = useState(0);
  const labelGutter = 44;
  const plotLeft = PADDING.left + labelGutter;
  const plotWidth = width - plotLeft - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const xFor = (index: number) => plotLeft + index * step;
  const yFor = (score: number) => PADDING.top + ((5 - score) / 4) * plotHeight;

  // Consecutive logged days form one run; a missed day ends it so the line does not bridge the gap.
  const segments: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  points.forEach((point, index) => {
    if (point.score === undefined) {
      if (run.length > 0) {
        segments.push(run);
      }
      run = [];
      return;
    }
    run.push({ x: xFor(index), y: yFor(point.score) });
  });
  if (run.length > 0) {
    segments.push(run);
  }

  const xLabelEvery = points.length <= 7 ? 1 : Math.ceil(points.length / 5);
  const dotRadius = points.length <= 7 ? 6 : points.length <= 31 ? 4 : 5;
  const dense = points.length > 14;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity={0.22} />
              <Stop offset="1" stopColor={colors.primary} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {Y_LABELS.map(({ score, label }) => (
            <Line
              key={score}
              x1={plotLeft}
              x2={width - PADDING.right}
              y1={yFor(score)}
              y2={yFor(score)}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray={score === 3 ? '3 5' : undefined}
            />
          ))}
          {Y_LABELS.map(({ score, label }) => (
            <SvgText
              key={label}
              x={plotLeft - 10}
              y={yFor(score) + 4}
              fill={colors.textMuted}
              fontFamily={fonts.sansMedium}
              fontSize={11}
              textAnchor="end"
            >
              {label}
            </SvgText>
          ))}
          {segments.map((run, index) =>
            run.length > 1 ? (
              <Path
                key={`fill-${index}`}
                d={`${smoothPath(run)} L ${run[run.length - 1].x} ${yFor(1)} L ${run[0].x} ${yFor(1)} Z`}
                fill="url(#trendFill)"
              />
            ) : null,
          )}
          {segments.map((run, index) =>
            run.length > 1 ? (
              <Path
                key={`line-${index}`}
                d={smoothPath(run)}
                stroke={colors.text}
                strokeOpacity={0.55}
                strokeWidth={2}
                strokeLinecap="round"
                fill="none"
              />
            ) : null,
          )}
          {points.map((point, index) => {
            if (point.score === undefined) {
              return null;
            }
            const isToday = point.day === today;
            const score = scoreForAverage(point.score);
            if (dense && !isToday) {
              return (
                <Circle key={point.day} cx={xFor(index)} cy={yFor(point.score)} r={3} fill={moodColor(colors, score)} />
              );
            }
            return (
              <Circle
                key={point.day}
                cx={xFor(index)}
                cy={yFor(point.score)}
                r={isToday ? dotRadius + 2 : dotRadius}
                fill={moodColor(colors, score)}
                stroke={isToday ? colors.text : colors.background}
                strokeWidth={isToday ? 2 : 1.5}
              />
            );
          })}
          {points.map((point, index) =>
            (index % xLabelEvery === 0 && (points.length - 1 - index) * step >= LAST_LABEL_CLEARANCE) ||
            index === points.length - 1 ? (
              <SvgText
                key={`x-${point.day}`}
                x={xFor(index)}
                y={height - 8}
                fill={point.day === today ? colors.text : colors.textMuted}
                fontFamily={point.day === today ? fonts.sansStrong : fonts.sansMedium}
                fontSize={11}
                textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
              >
                {points.length <= 7 ? formatWeekday(point.day) : formatDayShort(point.day)}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : null}
    </View>
  );
}
