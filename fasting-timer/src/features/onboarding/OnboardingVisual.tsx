import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import { Icon, Text } from '@/components';
import { FastingRing } from '@/features/fasting/FastingRing';
import { defaultsFromAnswers } from '@/features/fasting/preferences';
import { getProtocol } from '@/features/fasting/protocols';
import { HOUR_MS, formatTime } from '@/features/fasting/time';
import { radii, spacing, useTheme } from '@/theme/theme';

type OnboardingVisualProps = {
  stepId: string;
  /** Saved answers plus the one being picked on this step. */
  answers: Record<string, string>;
  /** Called by the plan step once it has finished building. */
  onBuilt?: () => void;
  /** The plan step places the step's copy between its ring and its plan lines. */
  children?: ReactNode;
};

const RING = 184;

/**
 * The picture above each onboarding step: the real ring, reacting to the
 * answer as it is picked, and the plan assembled from the answers at the end.
 */
export function OnboardingVisual({ stepId, answers, onBuilt, children }: OnboardingVisualProps) {
  switch (stepId) {
    case 'welcome':
      return <WelcomePreview />;
    case 'experience':
      return <PlanPreview answers={answers} />;
    case 'lastMeal':
      return <WindowPreview answers={answers} />;
    case 'plan':
      return (
        <PlanBuild answers={answers} onBuilt={onBuilt}>
          {children}
        </PlanBuild>
      );
    default:
      return null;
  }
}

function WelcomePreview() {
  return (
    <FastingRing size={260} progress={0.68} goalHours={16} reached={false}>
      <Text variant="label" color="muted">
        Hour 11
      </Text>
      <Text variant="stat">10:52:14</Text>
      <Text variant="caption" color="muted">
        5h 7m to go
      </Text>
    </FastingRing>
  );
}

function PlanPreview({ answers }: { answers: Record<string, string> }) {
  const protocol = getProtocol(defaultsFromAnswers(answers).protocolId);
  const picked = answers.experience !== undefined;

  // The ring is one day: its filled share is the fasting part of every 24 hours.
  return (
    <FastingRing size={RING} progress={picked ? protocol.fastHours / 24 : 0} goalHours={24} reached={false} idle={!picked}>
      <Text variant="label" color="muted">
        {picked ? 'Your plan' : 'Pick one'}
      </Text>
      <Text variant="stat">{picked ? protocol.id : '--:--'}</Text>
      <Text variant="caption" color="muted">
        {picked ? `${protocol.fastHours} of 24 hours` : 'the ring adapts'}
      </Text>
    </FastingRing>
  );
}

/** A 24-hour strip: the fasting stretch in the accent, the eating window light. */
function WindowPreview({ answers }: { answers: Record<string, string> }) {
  const { colors, typography, spacing } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const { protocolId, startHour } = defaultsFromAnswers(answers);
  const protocol = getProtocol(protocolId);
  const picked = answers.lastMeal !== undefined;
  const width = windowWidth - spacing.gutter * 2;
  const height = 64;
  const perHour = width / 24;
  // The strip runs from the start hour around the clock.
  const fastWidth = perHour * protocol.fastHours;
  const base = new Date();
  base.setHours(startHour, 0, 0, 0);
  const eatStart = base.getTime() + protocol.fastHours * HOUR_MS;

  return (
    <View style={{ alignItems: 'center', gap: spacing.md }}>
      <Svg width={width} height={height + 26}>
        <Rect x={0.5} y={0.5} width={width - 1} height={height - 1} rx={height / 2} fill={colors.surfaceRaised} stroke={colors.border} />
        {Array.from({ length: 23 }, (_, index) => (
          <Rect
            key={index}
            x={perHour * (index + 1) - 0.5}
            y={index % 6 === 5 ? 10 : height / 2 - 4}
            width={1}
            height={index % 6 === 5 ? height - 20 : 8}
            fill={colors.border}
          />
        ))}
        <Rect
          x={0}
          y={0}
          width={picked ? fastWidth : perHour * 2}
          height={height}
          rx={height / 2}
          fill={picked ? colors.primary : colors.border}
        />
        <SvgText
          x={12}
          y={height + 20}
          fill={colors.textMuted}
          fontFamily={typography.caption.fontFamily}
          fontSize={typography.caption.fontSize}
        >
          {picked ? formatTime(base.getTime()) : 'last meal'}
        </SvgText>
        <SvgText
          x={picked ? fastWidth : perHour * 2}
          y={height + 20}
          fill={colors.text}
          fontFamily={typography.label.fontFamily}
          fontSize={typography.caption.fontSize}
          textAnchor="middle"
        >
          {picked ? formatTime(eatStart) : ''}
        </SvgText>
        <SvgText
          x={width - 4}
          y={height + 20}
          fill={colors.textMuted}
          fontFamily={typography.caption.fontFamily}
          fontSize={typography.caption.fontSize}
          textAnchor="end"
        >
          {picked ? formatTime(base.getTime()) : 'next day'}
        </SvgText>
      </Svg>
      <View style={[styles.legend, { gap: spacing.lg }]}>
        <Legend color={colors.primary} label={`Fast ${protocol.fastHours} h`} />
        <Legend color={colors.surfaceRaised} outline={colors.textMuted} label={`Eat ${protocol.eatHours} h`} />
      </View>
    </View>
  );
}

function Legend({ color, label, outline }: { color: string; label: string; outline?: string }) {
  return (
    <View style={styles.legendItem}>
      {/* The eating colour is the strip's light track, so its dot gets an outline to stay visible. */}
      <View style={[styles.dot, { backgroundColor: color, borderColor: outline ?? color, borderWidth: 1 }]} />
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

const BUILD_STEPS_MS = [250, 600, 950];

/** The plan, line by line, as it is computed: about a second, then the ring completes. */
function PlanBuild({
  answers,
  onBuilt,
  children,
}: {
  answers: Record<string, string>;
  onBuilt?: () => void;
  children?: ReactNode;
}) {
  const { colors, spacing } = useTheme();
  const [revealed, setRevealed] = useState(0);
  const prefs = defaultsFromAnswers(answers);
  const protocol = getProtocol(prefs.protocolId);
  const start = new Date();
  start.setHours(prefs.startHour, prefs.startMinute, 0, 0);
  const eatStart = start.getTime() + protocol.fastHours * HOUR_MS;

  useEffect(() => {
    const timers = BUILD_STEPS_MS.map((ms, index) =>
      setTimeout(() => {
        setRevealed(index + 1);
        if (index === BUILD_STEPS_MS.length - 1) onBuilt?.();
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [onBuilt]);

  const lines: [string, 'timer' | 'moon' | 'bell', string][] = [
    [`${protocol.id} · ${protocol.name}`, 'timer', `${protocol.fastHours} hours fasting, ${protocol.eatHours} eating`],
    [`Fast from ${formatTime(start.getTime())}`, 'moon', `Eating window opens ${formatTime(eatStart)}`],
    [`Reminder at ${formatTime(start.getTime())}`, 'bell', 'Turn it on in Settings when you are ready'],
  ];
  const done = revealed === lines.length;

  return (
    <View style={[styles.stretch, { gap: spacing.lg, alignItems: 'center' }]}>
      <FastingRing size={168} progress={revealed / lines.length} goalHours={protocol.fastHours} reached={done}>
        <Text variant="stat">{protocol.id}</Text>
        <Text variant="caption" color={done ? 'gold' : 'muted'}>
          {done ? 'ready' : 'building'}
        </Text>
      </FastingRing>
      <View style={styles.stretch}>{children}</View>
      {/* Three fixed slots, so nothing jumps while the lines arrive. */}
      <View style={[styles.stretch, { gap: spacing.ms }]}>
        {lines.map(([title, icon, detail], index) => (
          <View key={title} style={[styles.line, { backgroundColor: colors.surface }]}>
            {index < revealed ? (
              <Animated.View
                entering={FadeInUp.springify().damping(16)}
                style={[styles.lineInner, { gap: spacing.md, padding: spacing.md }]}
              >
                <View style={[styles.lineIcon, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={icon} size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="label">{title}</Text>
                  <Text variant="caption" color="muted">
                    {detail}
                  </Text>
                </View>
              </Animated.View>
            ) : (
              <View style={[styles.lineInner, { padding: spacing.md, opacity: 0.5 }]}>
                <View style={[styles.lineIcon, { backgroundColor: colors.surfaceRaised }]} />
                <View style={[styles.placeholderBar, { backgroundColor: colors.surfaceRaised }]} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stretch: { alignSelf: 'stretch' },
  line: { borderRadius: radii.lg, minHeight: 72, justifyContent: 'center' },
  lineInner: { flexDirection: 'row', alignItems: 'center' },
  lineIcon: { width: 32, height: 32, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  placeholderBar: { flex: 1, height: 12, borderRadius: 6, marginLeft: spacing.md },
});
