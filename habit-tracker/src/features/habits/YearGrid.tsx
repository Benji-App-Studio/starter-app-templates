import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import type { Habit } from '@/db/habits';
import { fonts, useTheme } from '@/theme/theme';

import { addDays, dayKey, daysBetween, monthShort, WEEK_ORDER } from './dates';
import { isScheduled } from './streaks';

const WEEKS = 53;
const GAP = 2;
const LABEL_WIDTH = 16;
const MONTH_ROW = 14;
const ROW_LABELS: Record<number, string> = { 0: 'M', 2: 'W', 4: 'F' };

type YearGridProps = {
  habit: Habit;
  done: Set<string>;
  today: Date;
};

/** The GitHub-style year of one habit: a square per day, filled when it was checked off. */
export function YearGrid({ habit, done, today }: YearGridProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);

  const cell = width > 0 ? (width - LABEL_WIDTH - GAP * (WEEKS - 1)) / WEEKS : 0;
  const height = MONTH_ROW + cell * 7 + GAP * 6;
  const daysSinceMonday = (today.getDay() + 6) % 7;
  const firstMonday = addDays(today, -daysSinceMonday - (WEEKS - 1) * 7);

  const months: { x: number; label: string }[] = [];
  let lastMonth = -1;

  const cells = [];
  for (let column = 0; column < WEEKS; column += 1) {
    const monday = addDays(firstMonday, column * 7);
    if (monday.getMonth() !== lastMonth && monday.getDate() <= 7) {
      months.push({ x: LABEL_WIDTH + column * (cell + GAP), label: monthShort(monday) });
      lastMonth = monday.getMonth();
    }
    for (let row = 0; row < 7; row += 1) {
      const date = addDays(monday, row);
      if (daysBetween(date, today) < 0) {
        continue;
      }
      const scheduled = isScheduled(habit, date);
      const checked = done.has(dayKey(date));
      const isToday = daysBetween(date, today) === 0;
      cells.push(
        <Rect
          key={`${column}-${row}`}
          x={LABEL_WIDTH + column * (cell + GAP)}
          y={MONTH_ROW + row * (cell + GAP)}
          width={cell}
          height={cell}
          rx={cell * 0.28}
          fill={checked ? colors.primary : scheduled ? colors.track : colors.surfaceSunken}
          stroke={isToday ? colors.streak : 'none'}
          strokeWidth={isToday ? 1.5 : 0}
        />,
      );
    }
  }

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height: width ? height : 90 }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          {months.map((month) => (
            <SvgText
              key={`${month.label}-${month.x}`}
              x={month.x}
              y={9}
              fill={colors.textMuted}
              fontFamily={fonts.medium}
              fontSize={9}
            >
              {month.label}
            </SvgText>
          ))}
          {WEEK_ORDER.map((_, row) =>
            ROW_LABELS[row] ? (
              <SvgText
                key={row}
                x={0}
                y={MONTH_ROW + row * (cell + GAP) + cell * 0.8}
                fill={colors.textMuted}
                fontFamily={fonts.medium}
                fontSize={9}
              >
                {ROW_LABELS[row]}
              </SvgText>
            ) : null,
          )}
          {cells}
        </Svg>
      ) : null}
    </View>
  );
}
