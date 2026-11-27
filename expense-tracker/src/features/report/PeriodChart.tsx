import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

import { Row, Stack, Text } from '@/components';
import type { PeriodTotal } from '@/features/expenses/data';
import { formatMoney } from '@/features/expenses/money';
import { periodMonthName, periodShortLabel } from '@/features/expenses/period';
import { useTheme } from '@/theme/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type PeriodChartProps = {
  history: PeriodTotal[];
  /** Drawn as a dashed line so each month reads against the budget. 0 hides it. */
  budgetCents: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  currency: string;
};

const CHART_HEIGHT = 200;
const LABEL_HEIGHT = 18;
const GAP = 12;
const LEGEND_WIDTH = 24;

/** Six months of spending as rounded bars. Tap a bar to open that month below. */
export function PeriodChart({ history, budgetCents, selectedIndex, onSelect, currency }: PeriodChartProps) {
  const { colors, spacing } = useTheme();
  const [width, setWidth] = useState(0);
  const maxCents = Math.max(budgetCents, ...history.map((item) => item.spentCents), 1) * 1.08;
  const slot = history.length > 0 ? width / history.length : 0;
  const barWidth = Math.max(0, slot - GAP);
  const budgetY = CHART_HEIGHT - (budgetCents / maxCents) * CHART_HEIGHT;
  const selected = history[selectedIndex];

  function select(index: number) {
    if (index !== selectedIndex) {
      void Haptics.selectionAsync();
      onSelect(index);
    }
  }

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <Stack gap="xs" style={{ marginBottom: spacing.lg }}>
        <Text variant="eyebrow" color="muted" numberOfLines={1}>
          {selected ? `SPENT IN ${periodMonthName(selected.period).toUpperCase()}` : ' '}
        </Text>
        <Text variant="display" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
          {selected ? formatMoney(selected.spentCents, currency) : ' '}
        </Text>
      </Stack>

      <View>
        <Svg width={width} height={CHART_HEIGHT}>
          {history.map((item, index) => (
            <Bar
              key={item.period.start}
              x={index * slot + GAP / 2}
              width={barWidth}
              height={(item.spentCents / maxCents) * CHART_HEIGHT}
              color={
                budgetCents > 0 && item.spentCents > budgetCents
                  ? colors.danger
                  : index === selectedIndex
                    ? colors.primary
                    : colors.track
              }
            />
          ))}
          {budgetCents > 0 ? (
            <Line
              x1={0}
              y1={budgetY}
              x2={width}
              y2={budgetY}
              stroke={colors.textMuted}
              strokeWidth={1.5}
              strokeDasharray="3 6"
              strokeLinecap="round"
            />
          ) : null}
          <Line
            x1={0}
            y1={CHART_HEIGHT - 0.75}
            x2={width}
            y2={CHART_HEIGHT - 0.75}
            stroke={colors.border}
            strokeWidth={1.5}
          />
        </Svg>
      </View>

      <View style={styles.axis}>
        {history.map((item, index) => (
          <Pressable
            key={item.period.start}
            accessibilityRole="button"
            accessibilityLabel={`${periodShortLabel(item.period)}, ${formatMoney(item.spentCents, currency)}`}
            accessibilityState={{ selected: index === selectedIndex }}
            onPress={() => select(index)}
            style={[styles.axisItem, { width: slot, paddingTop: spacing.xs }]}
            hitSlop={{ top: CHART_HEIGHT }}
          >
            <Text
              variant={index === selectedIndex ? 'label' : 'caption'}
              color={index === selectedIndex ? 'text' : 'muted'}
            >
              {periodShortLabel(item.period)}
            </Text>
          </Pressable>
        ))}
      </View>

      {budgetCents > 0 ? (
        <Row gap="sm" style={{ marginTop: spacing.item }}>
          <Svg width={LEGEND_WIDTH} height={LABEL_HEIGHT}>
            <Line
              x1={1}
              y1={LABEL_HEIGHT / 2}
              x2={LEGEND_WIDTH - 1}
              y2={LABEL_HEIGHT / 2}
              stroke={colors.textMuted}
              strokeWidth={1.5}
              strokeDasharray="3 6"
              strokeLinecap="round"
            />
          </Svg>
          <Text variant="caption" color="muted" numberOfLines={1}>
            {selected ? `${periodMonthName(selected.period)} budget` : 'Budget'}, {formatMoney(budgetCents, currency)}
          </Text>
        </Row>
      ) : null}
    </View>
  );
}

type BarProps = { x: number; width: number; height: number; color: string };

function Bar({ x, width, height, color }: BarProps) {
  const reduceMotion = useReducedMotion();
  const animated = useSharedValue(0);
  const target = Math.max(height, 4);

  useEffect(() => {
    animated.value = reduceMotion
      ? target
      : withSpring(target, { damping: 18, stiffness: 120, overshootClamping: true });
  }, [animated, reduceMotion, target]);

  const props = useAnimatedProps(() => ({
    y: CHART_HEIGHT - animated.value,
    height: animated.value,
  }));

  return <AnimatedRect animatedProps={props} x={x} width={width} rx={Math.min(8, width / 2)} fill={color} />;
}

const styles = StyleSheet.create({
  axis: { flexDirection: 'row' },
  axisItem: { alignItems: 'center', minHeight: LABEL_HEIGHT },
});
