import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components';
import { useTheme, type ThemeColors } from '@/theme/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type DayRunwayProps = {
  /** Spend per day of the budget month, in cents, one entry per day. */
  spentByDay: number[];
  /** What a day can take if the month is to land on budget. 0 when there is no budget. */
  plannedDailyCents: number;
  /** Zero-based index of today inside the month. */
  todayIndex: number;
  /** Labels under the first and last column, e.g. "Nov 1" and "Nov 30". */
  startLabel: string;
  endLabel: string;
  height: number;
  /** The label over today's column; previews of day one say "Day 1". */
  todayLabel?: string;
};

const COLUMN_GAP = 3;
const TODAY_STROKE = 2;
/** Room around the columns so today's outline is never clipped by the SVG edge. */
const INSET = TODAY_STROKE * 2;
/** Width given to each label under the runway, so they can be kept apart. */
const LABEL_WIDTH = 64;
/** A spent day never draws shorter than this, so small purchases still show. */
const MIN_FILL = 4;

/**
 * The month runway: one rounded column per day. Past days fill from the bottom with what was
 * spent, today is outlined, future days wait as faint tracks. The dashed line is the daily plan,
 * so a column poking above it is a day that ate into tomorrow.
 */
export function DayRunway({
  spentByDay,
  plannedDailyCents,
  todayIndex,
  startLabel,
  endLabel,
  height,
  todayLabel = 'Today',
}: DayRunwayProps) {
  const { colors, spacing } = useTheme();
  const [width, setWidth] = useState(0);
  const days = Math.max(1, spentByDay.length);
  const inner = Math.max(0, width - INSET * 2);
  const columnWidth = Math.max(2, (inner - COLUMN_GAP * (days - 1)) / days);
  // The plan sits at half height at most, so a heavy day has room to show how heavy it was.
  const scale = Math.max(plannedDailyCents * 2, ...spentByDay, 1);
  const planY = INSET + height - (plannedDailyCents / scale) * height;
  const todayCenter = INSET + todayIndex * (columnWidth + COLUMN_GAP) + columnWidth / 2;
  const todayLeft = Math.min(Math.max(todayCenter - LABEL_WIDTH / 2, 0), Math.max(width - LABEL_WIDTH, 0));
  const showStart = todayLeft >= LABEL_WIDTH;
  const showEnd = todayLeft + LABEL_WIDTH <= width - LABEL_WIDTH;

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Svg width={width} height={height + INSET * 2}>
        {width > 0
          ? spentByDay.map((cents, index) => (
              <DayColumn
                key={index}
                x={INSET + index * (columnWidth + COLUMN_GAP)}
                width={columnWidth}
                height={height}
                fill={index > todayIndex ? 0 : cents > 0 ? Math.max(MIN_FILL, (cents / scale) * height) : 0}
                state={index > todayIndex ? 'future' : index === todayIndex ? 'today' : 'past'}
                over={plannedDailyCents > 0 && cents > plannedDailyCents}
                colors={colors}
              />
            ))
          : null}
        {plannedDailyCents > 0 && width > 0 ? (
          <Line
            x1={INSET}
            y1={planY}
            x2={width - INSET}
            y2={planY}
            stroke={colors.text}
            strokeOpacity={0.45}
            strokeWidth={1.5}
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
        ) : null}
      </Svg>

      <View style={[styles.labels, { marginTop: spacing.xs }]}>
        {showStart ? (
          <View style={[styles.label, { left: 0, width: LABEL_WIDTH }]}>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {startLabel}
            </Text>
          </View>
        ) : null}
        <View style={[styles.label, { left: todayLeft, width: LABEL_WIDTH }]}>
          <Text variant="label" align="center" numberOfLines={1}>
            {todayLabel}
          </Text>
        </View>
        {showEnd ? (
          <View style={[styles.label, { right: 0, width: LABEL_WIDTH }]}>
            <Text variant="caption" color="muted" align="right" numberOfLines={1}>
              {endLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type DayColumnProps = {
  x: number;
  width: number;
  height: number;
  /** Height of the spent part. */
  fill: number;
  state: 'past' | 'today' | 'future';
  over: boolean;
  colors: ThemeColors;
};

function DayColumn({ x, width, height, fill, state, over, colors }: DayColumnProps) {
  const reduceMotion = useReducedMotion();
  const animated = useSharedValue(0);
  const radius = Math.min(width / 2, 6);

  useEffect(() => {
    animated.value = reduceMotion ? fill : withSpring(fill, { damping: 16, stiffness: 140, overshootClamping: false });
  }, [animated, fill, reduceMotion]);

  const fillProps = useAnimatedProps(() => {
    const h = Math.max(0, Math.min(height, animated.value));
    return { y: INSET + height - h, height: h };
  });

  return (
    <>
      <Rect
        x={x}
        y={INSET}
        width={width}
        height={height}
        rx={radius}
        fill={state === 'today' ? colors.primarySoft : colors.track}
        fillOpacity={state === 'future' ? 0.55 : 1}
      />
      <AnimatedRect animatedProps={fillProps} x={x} width={width} rx={radius} fill={over ? colors.danger : colors.primary} />
      {state === 'today' ? (
        <Rect
          x={x - TODAY_STROKE}
          y={INSET - TODAY_STROKE}
          width={width + TODAY_STROKE * 2}
          height={height + TODAY_STROKE * 2}
          rx={radius + TODAY_STROKE}
          fill="none"
          stroke={colors.text}
          strokeWidth={TODAY_STROKE}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  labels: { minHeight: 20 },
  label: { position: 'absolute', top: 0 },
});
