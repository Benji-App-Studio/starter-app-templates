import { useState } from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import type { MoodScore } from '@/db/checkIns';
import { useTheme } from '@/theme/theme';

import { dayKeyFor, daysInMonth } from './dates';
import { moodColor } from './moods';

type YearPixelsProps = {
  year: number;
  /** Score per day key. */
  scores: ReadonlyMap<string, MoodScore>;
  today: string;
  onSelectDay?: (day: string) => void;
};

const GAP = 3;
const GUTTER = 22;
const HEADER = 18;
const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const ROW_LABELS = [1, 8, 15, 22, 29];

/**
 * A year in pixels: twelve columns of days, each square the color of that day's mood.
 * Tapping a square opens the day.
 */
export function YearPixels({ year, scores, today, onSelectDay }: YearPixelsProps) {
  const { colors, fonts } = useTheme();
  const [width, setWidth] = useState(0);
  const cell = width > 0 ? (width - GUTTER - GAP * 11) / 12 : 0;
  const height = HEADER + 31 * (cell + GAP);

  function handlePress(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent;
    const month = Math.floor((locationX - GUTTER) / (cell + GAP));
    const date = Math.floor((locationY - HEADER) / (cell + GAP)) + 1;
    if (month < 0 || month > 11 || date < 1 || date > daysInMonth(year, month)) {
      return;
    }
    const day = dayKeyFor(year, month, date);
    if (day <= today) {
      onSelectDay?.(day);
    }
  }

  return (
    <Pressable
      accessibilityLabel={`Year ${year} in pixels`}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onPress={handlePress}
      style={styles.root}
    >
      {width > 0 ? (
        <Svg width={width} height={height}>
          {MONTH_LETTERS.map((letter, month) => (
            <SvgText
              key={month}
              x={GUTTER + month * (cell + GAP) + cell / 2}
              y={11}
              fill={colors.textMuted}
              fontFamily={fonts.sansMedium}
              fontSize={11}
              textAnchor="middle"
            >
              {letter}
            </SvgText>
          ))}
          {ROW_LABELS.map((label) => (
            <SvgText
              key={label}
              x={GUTTER - 7}
              y={HEADER + (label - 1) * (cell + GAP) + cell / 2 + 4}
              fill={colors.textMuted}
              fontFamily={fonts.sansMedium}
              fontSize={10}
              textAnchor="end"
            >
              {label}
            </SvgText>
          ))}
          {MONTH_LETTERS.map((_, month) =>
            Array.from({ length: daysInMonth(year, month) }, (__, index) => {
              const day = dayKeyFor(year, month, index + 1);
              const score = scores.get(day);
              const isToday = day === today;
              const future = day > today;
              return (
                <Rect
                  key={day}
                  x={GUTTER + month * (cell + GAP)}
                  y={HEADER + index * (cell + GAP)}
                  width={cell}
                  height={cell}
                  rx={cell * 0.28}
                  // Days still to come are outlined, not filled: the card is the surface colour,
                  // so a surface fill made the rest of the year (all of December) vanish.
                  fill={score ? moodColor(colors, score) : future ? 'transparent' : colors.border}
                  stroke={isToday ? colors.text : future ? colors.border : undefined}
                  strokeWidth={isToday ? 1.5 : future ? 1 : 0}
                />
              );
            }),
          )}
        </Svg>
      ) : (
        <View style={{ height: 300 }} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
});
