import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Row, Screen, Section, Stack, Stepper, Text } from '@/components';
import { getFast, type Fast } from '@/db/fasts';
import { useTheme } from '@/theme/theme';

import { removeFast, saveFast } from './actions';
import { usePreferences } from './preferences';
import { ProtocolPicker } from './ProtocolPicker';
import { getProtocol, type ProtocolId } from './protocols';
import {
  DAY_MS,
  HOUR_MS,
  addDays,
  addHours,
  addMinutes,
  formatDay,
  formatDuration,
  formatHour,
} from './time';

type FastEditorScreenProps = {
  /** Omitted when logging a new fast. */
  fastId?: number;
};

const MAX_FAST_MS = 7 * DAY_MS;

/**
 * The sheet for logging a past fast, fixing a saved one, or moving the start of
 * the running one. Times are set with steppers, so there is no system picker to style.
 */
export function FastEditorScreen({ fastId }: FastEditorScreenProps) {
  const router = useRouter();
  const { colors, spacing } = useTheme();
  const prefs = usePreferences();
  const [original, setOriginal] = useState<Fast | null>();
  const [protocolId, setProtocolId] = useState<ProtocolId>(prefs.protocolId);
  const [startedAt, setStartedAt] = useState(0);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fastId === undefined) {
      // A past fast defaults to yesterday's usual window.
      const start = new Date(addDays(Date.now(), -1));
      start.setHours(prefs.startHour, prefs.startMinute, 0, 0);
      setStartedAt(start.getTime());
      setEndedAt(start.getTime() + getProtocol(prefs.protocolId).fastHours * HOUR_MS);
      setOriginal(null);
      return;
    }
    void getFast(fastId).then((fast) => {
      setOriginal(fast);
      if (fast) {
        setProtocolId(getProtocol(fast.protocolId).id);
        setStartedAt(fast.startedAt);
        setEndedAt(fast.endedAt);
      }
    });
  }, [fastId, prefs.protocolId, prefs.startHour, prefs.startMinute]);

  if (original === undefined || startedAt === 0) {
    return <Screen edges={['bottom']}>{null}</Screen>;
  }

  const now = Date.now();
  const isRunning = original !== null && original.endedAt === null;
  const goalHours = getProtocol(protocolId).fastHours;
  const duration = (endedAt ?? now) - startedAt;
  const problem =
    startedAt > now
      ? 'The start is in the future.'
      : endedAt !== null && endedAt > now
        ? 'The end is in the future.'
        : duration <= 0
          ? 'The end must come after the start.'
          : duration > MAX_FAST_MS
            ? 'A fast longer than seven days is probably a typo.'
            : undefined;
  const title = fastId === undefined ? 'Log a past fast' : isRunning ? 'Edit start time' : 'Edit fast';

  async function handleSave() {
    setSaving(true);
    try {
      await saveFast(original?.id, { protocolId, goalHours, startedAt, endedAt });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      setSaving(false);
      Alert.alert('Could not save', 'Please try again.');
    }
  }

  function handleDelete() {
    if (!original) return;
    const fast = original;
    Alert.alert(
      isRunning ? 'Discard this fast?' : 'Delete this fast?',
      isRunning ? 'The timer stops and nothing is saved.' : 'It leaves your history and streak.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isRunning ? 'Discard' : 'Delete',
          style: 'destructive',
          onPress: () => void removeFast(fast).then(() => router.back()),
        },
      ],
    );
  }

  return (
    <Screen
      scroll
      edges={['bottom']}
      footer={
        <Stack gap="sm">
          {problem ? (
            <Text variant="caption" color="danger" align="center">
              {problem}
            </Text>
          ) : null}
          <Button title="Save" onPress={() => void handleSave()} disabled={problem !== undefined} loading={saving} />
          {original ? (
            <Button
              title={isRunning ? 'Discard fast' : 'Delete fast'}
              variant="ghost"
              destructive
              onPress={handleDelete}
            />
          ) : null}
        </Stack>
      }
    >
      <Stack gap="lg" style={{ paddingTop: spacing.sm }}>
        <Row gap="md" justify="space-between">
          <Text variant="title" numberOfLines={2} style={styles.title}>
            {title}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            hitSlop={CLOSE_SLOP}
            style={[styles.close, { backgroundColor: colors.surfaceRaised }]}
          >
            <Icon name="close" size={15} color={colors.text} weight="semibold" />
          </Pressable>
        </Row>

        <Section title="Plan">
          <View style={{ marginHorizontal: -spacing.gutter }}>
            <ProtocolPicker value={protocolId} onChange={setProtocolId} />
          </View>
        </Section>

        <TimeFields label="Started" value={startedAt} onChange={setStartedAt} now={now} />

        {endedAt !== null ? <TimeFields label="Ended" value={endedAt} onChange={setEndedAt} now={now} /> : null}

        <Card>
          <Row gap="md">
            <Stack gap="xs" fill>
              <Text variant="caption" color="muted">
                {isRunning ? 'Fasting so far' : 'Duration'}
              </Text>
              <Text variant="stat" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={styles.tabular}>
                {duration > 0 ? formatDuration(duration) : '–'}
              </Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Text variant="caption" color="muted">
                Goal
              </Text>
              <Text variant="heading" color={duration >= goalHours * HOUR_MS ? 'gold' : 'text'} style={styles.tabular}>
                {goalHours} h
              </Text>
            </Stack>
          </Row>
        </Card>
      </Stack>
    </Screen>
  );
}

function TimeFields({
  label,
  value,
  onChange,
  now,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  now: number;
}) {
  const minutes = new Date(value).getMinutes();

  return (
    <Section title={label}>
      {/* The day gets a full row so "Yesterday" never has to shrink; hour and minute share one. */}
      <Stepper
        label="Day"
        unit="day"
        value={formatDay(value, now)}
        onDecrement={() => onChange(addDays(value, -1))}
        onIncrement={() => onChange(addDays(value, 1))}
      />
      <Row gap="ms" align="stretch">
        <Stepper
          style={styles.half}
          label="Hour"
          unit="hour"
          value={formatHour(value)}
          onDecrement={() => onChange(addHours(value, -1))}
          onIncrement={() => onChange(addHours(value, 1))}
        />
        <Stepper
          style={styles.half}
          label="Minute"
          unit="minute"
          value={`:${String(minutes).padStart(2, '0')}`}
          onDecrement={() => onChange(addMinutes(value, -5))}
          onIncrement={() => onChange(addMinutes(value, 5))}
        />
      </Row>
    </Section>
  );
}

// The close button is 32 pt; the slop makes the touch target 48 pt.
const CLOSE_SLOP = 8;

const styles = StyleSheet.create({
  title: { flex: 1, minWidth: 0 },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
  half: { flex: 1, minWidth: 0 },
});
