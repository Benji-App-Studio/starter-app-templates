import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { fonts, useTheme } from '@/theme/theme';

import { formatShortDate } from './dates';
import type { WeekRate } from './streaks';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const CHART_HEIGHT = 150;
const AXIS_WIDTH = 34;
const LABEL_ROW = 22;
const BAR_GAP = 10;
const MIN_BAR = 4;

type WeeklyBarsProps = {
  weeks: WeekRate[];
};

/** Completion per week as rounded bars; the current week in the accent, the rest quieter. */
export function WeeklyBars({ weeks }: WeeklyBarsProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const plotWidth = Math.max(width - AXIS_WIDTH, 0);
  const plotHeight = CHART_HEIGHT - LABEL_ROW;
  const barWidth = weeks.length > 0 ? (plotWidth - BAR_GAP * (weeks.length - 1)) / weeks.length : 0;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)} style={{ height: CHART_HEIGHT }}>
      {width > 0 ? (
        <Svg width={width} height={CHART_HEIGHT}>
          {[0, 0.5, 1].map((tick) => {
            const y = plotHeight - tick * (plotHeight - MIN_BAR);
            return (
              <Line
                key={tick}
                x1={AXIS_WIDTH}
                x2={width}
                y1={y}
                y2={y}
                stroke={colors.border}
                strokeWidth={1}
                strokeDasharray={tick === 0 ? undefined : '3 4'}
              />
            );
          })}
          {[0, 0.5, 1].map((tick) => (
            <SvgText
              key={tick}
              x={0}
              y={plotHeight - tick * (plotHeight - MIN_BAR) + 3}
              fill={colors.textMuted}
              fontFamily={fonts.medium}
              fontSize={10}
            >
              {`${Math.round(tick * 100)}%`}
            </SvgText>
          ))}
          {weeks.map((week, index) => {
            const x = AXIS_WIDTH + index * (barWidth + BAR_GAP);
            const isCurrent = index === weeks.length - 1;
            return (
              <Bar
                key={week.start.getTime()}
                x={x}
                width={barWidth}
                plotHeight={plotHeight}
                rate={week.rate}
                color={week.rate === null ? colors.border : isCurrent ? colors.primary : `${colors.primary}66`}
              />
            );
          })}
          {weeks.map((week, index) => {
            const x = AXIS_WIDTH + index * (barWidth + BAR_GAP) + barWidth / 2;
            const isCurrent = index === weeks.length - 1;
            return (
              <SvgText
                key={week.start.getTime()}
                x={x}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fill={isCurrent ? colors.text : colors.textMuted}
                fontFamily={isCurrent ? fonts.semibold : fonts.medium}
                fontSize={10}
              >
                {isCurrent ? 'Now' : formatShortDate(week.start)}
              </SvgText>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}

type BarProps = { x: number; width: number; plotHeight: number; rate: number | null; color: string };

function Bar({ x, width, plotHeight, rate, color }: BarProps) {
  const reduceMotion = useReducedMotion();
  const target = MIN_BAR + (rate ?? 0) * (plotHeight - MIN_BAR);
  const height = useSharedValue(MIN_BAR);

  useEffect(() => {
    height.value = reduceMotion
      ? withTiming(target, { duration: 150 })
      : withSpring(target, { damping: 18, stiffness: 120 });
  }, [height, reduceMotion, target]);

  const animatedProps = useAnimatedProps(() => ({
    y: plotHeight - height.value,
    height: height.value,
  }));

  return <AnimatedRect animatedProps={animatedProps} x={x} width={width} rx={Math.min(6, width / 2)} fill={color} />;
}
