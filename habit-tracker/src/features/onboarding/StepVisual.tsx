import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line } from 'react-native-svg';

import { Icon, Text } from '@/components';
import { useTheme } from '@/theme/theme';

import { parseTime } from '../habits/dates';
import { checkinFor, startersFor } from '../habits/starters';

const AnimatedG = Animated.createAnimatedComponent(G);

type StepVisualProps = {
  stepId: string;
  /** The answer picked on this step so far, so the visual can react to it. */
  answer?: string;
};

/** The picture above each onboarding step. The two question steps preview the answer live. */
export function StepVisual({ stepId, answer }: StepVisualProps) {
  switch (stepId) {
    case 'focus':
      return <StarterPreview focus={answer} />;
    case 'checkin':
      return <ClockFace checkin={answer} />;
    default:
      return <WelcomeGrid />;
  }
}

/** Five weeks of one habit, so the first screen already shows what the app builds. */
const WEEKS = 5;
const CELL = 40;
/** Days missed in the sample month; the last cell is today, still open. */
const MISSED = new Set([3, 11, 12, 20]);

function WelcomeGrid() {
  const { colors, radii, spacing } = useTheme();
  const reduceMotion = useReducedMotion();
  const total = WEEKS * 7;
  const streak = total - 1 - Math.max(...MISSED) - 1;

  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <View style={[styles.weekGrid, { gap: spacing.sm, width: CELL * 7 + spacing.sm * 6 }]}>
        {Array.from({ length: total }, (_, index) => {
          const today = index === total - 1;
          const done = !today && !MISSED.has(index);
          return (
            <Animated.View
              key={index}
              entering={
                reduceMotion
                  ? FadeIn
                  : FadeIn.delay(index * 22)
                      .springify()
                      .damping(14)
              }
              style={{
                width: CELL,
                height: CELL,
                borderRadius: radii.sm,
                backgroundColor: done ? colors.primary : colors.track,
                borderWidth: today ? 2.5 : 0,
                borderColor: colors.streak,
              }}
            />
          );
        })}
      </View>
      <Animated.View
        entering={
          reduceMotion
            ? FadeIn
            : FadeInDown.delay(total * 22)
                .springify()
                .damping(16)
        }
        style={[
          styles.welcomeChip,
          {
            backgroundColor: colors.streakSoft,
            borderRadius: radii.pill,
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <Icon name="flame" size={14} color={colors.streak} weight="bold" />
        <Text variant="label" style={{ fontVariant: ['tabular-nums'] }}>
          {streak} days in a row
        </Text>
      </Animated.View>
    </View>
  );
}

/** Four tiles that switch to the starter habits of the chosen focus. */
function StarterPreview({ focus }: { focus?: string }) {
  const { colors, radii, spacing } = useTheme();
  const starters = focus ? startersFor({ focus }) : [];

  return (
    <View style={[styles.previewGrid, { gap: spacing.sm }]}>
      {(starters.length > 0 ? starters : Array.from({ length: 4 }, () => undefined)).map((starter, index) => (
        <Animated.View
          key={`${focus ?? 'empty'}-${index}`}
          entering={FadeInDown.delay(index * 60)
            .springify()
            .damping(16)}
          style={[
            styles.previewTile,
            {
              backgroundColor: starter ? colors.surface : colors.surfaceSunken,
              borderColor: starter ? colors.border : 'transparent',
              borderRadius: radii.lg,
              padding: spacing.sm + spacing.xs,
              gap: spacing.sm,
            },
          ]}
        >
          <View
            style={[
              styles.previewIcon,
              {
                borderRadius: radii.pill,
                backgroundColor: starter ? colors.primarySoft : colors.border,
                borderWidth: starter ? 0 : 1.5,
                borderColor: colors.border,
              },
            ]}
          >
            {starter ? <Icon name={starter.icon} size={18} color={colors.primary} /> : null}
          </View>
          {starter ? (
            <Text variant="caption" numberOfLines={2}>
              {starter.name}
            </Text>
          ) : (
            <View style={[styles.previewLine, { backgroundColor: colors.border, borderRadius: radii.pill }]} />
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const CLOCK = 168;

/** A clock whose hands spring to the chosen check-in time. */
function ClockFace({ checkin }: { checkin?: string }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const time = checkin ? checkinFor({ checkin }).time : '12:00';
  const { hour, minute } = parseTime(time);
  const hourAngle = useSharedValue(0);
  const minuteAngle = useSharedValue(0);
  const center = CLOCK / 2;
  const radius = center - 6;

  useEffect(() => {
    const targets = [((hour % 12) + minute / 60) * 30, minute * 6];
    const config = { damping: 14, stiffness: 90 };
    hourAngle.value = reduceMotion ? withTiming(targets[0]) : withSpring(targets[0], config);
    minuteAngle.value = reduceMotion ? withTiming(targets[1]) : withSpring(targets[1], config);
  }, [hour, hourAngle, minute, minuteAngle, reduceMotion]);

  const hourProps = useAnimatedProps(() => ({ rotation: hourAngle.value }));
  const minuteProps = useAnimatedProps(() => ({ rotation: minuteAngle.value }));
  const evening = hour >= 18 || hour < 6;

  return (
    <Svg width={CLOCK} height={CLOCK} viewBox={`0 0 ${CLOCK} ${CLOCK}`}>
      <Circle cx={center} cy={center} r={radius} fill={colors.surface} stroke={colors.border} strokeWidth={2} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index * 30 * Math.PI) / 180;
        const inner = radius - (index % 3 === 0 ? 14 : 8);
        return (
          <Line
            key={index}
            x1={center + Math.sin(angle) * inner}
            y1={center - Math.cos(angle) * inner}
            x2={center + Math.sin(angle) * (radius - 4)}
            y2={center - Math.cos(angle) * (radius - 4)}
            stroke={index % 3 === 0 ? colors.text : colors.border}
            strokeWidth={index % 3 === 0 ? 3 : 2}
            strokeLinecap="round"
          />
        );
      })}
      <AnimatedG animatedProps={hourProps} origin={`${center}, ${center}`}>
        <Line
          x1={center}
          y1={center}
          x2={center}
          y2={center - radius * 0.5}
          stroke={colors.text}
          strokeWidth={6}
          strokeLinecap="round"
        />
      </AnimatedG>
      <AnimatedG animatedProps={minuteProps} origin={`${center}, ${center}`}>
        <Line
          x1={center}
          y1={center}
          x2={center}
          y2={center - radius * 0.74}
          stroke={colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </AnimatedG>
      <Circle cx={center} cy={center} r={6} fill={colors.primary} />
      <Circle
        cx={center + radius * 0.55}
        cy={center - radius * 0.55}
        r={9}
        fill={evening ? colors.text : colors.streak}
        opacity={checkin ? 1 : 0}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  welcomeChip: { flexDirection: 'row', alignItems: 'center' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 272 },
  previewTile: { width: 132, minHeight: 96, borderWidth: 1 },
  previewIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  previewLine: { height: 10, width: '70%' },
});
