import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated, { FadeIn, FadeOut, type SharedValue } from 'react-native-reanimated';

import { Button, Chip, Row, Section, Stack, Text } from '@/components';
import { saveCheckIn, type CheckIn, type MoodScore, type NoteKind } from '@/db/checkIns';
import { useAppState } from '@/state/appState';
import { useTheme } from '@/theme/theme';

import { MoodDial } from './MoodDial';
import { moodFor, scoreForProgress } from './moods';
import { notePromptFor } from './prompts';
import { tagOptions } from './tags';

type CheckInEditorProps = {
  day: string;
  initial?: CheckIn;
  /** The dial's position; the parent tints its background from it. */
  progress: SharedValue<number>;
  width: number;
  onSaved: (checkIn: CheckIn) => void;
  /** Label of the save button, e.g. "Save today". */
  saveTitle: string;
  /** Called when the note gets focus, so the screen can scroll it above the keyboard. */
  onNoteFocus?: () => void;
};

const NOTE_KINDS: { id: NoteKind; label: string }[] = [
  { id: 'gratitude', label: 'Grateful for' },
  { id: 'free', label: 'On my mind' },
];

/** The dial, the tags and the note. Today and past days share it. */
export function CheckInEditor({ day, initial, progress, width, onSaved, saveTitle, onNoteFocus }: CheckInEditorProps) {
  const { colors, radii, spacing, typography, layout } = useTheme();
  const { onboardingAnswers } = useAppState();
  const prompt = notePromptFor(onboardingAnswers.focus);

  const [score, setScore] = useState<MoodScore>(initial?.score ?? scoreForProgress(progress.value));
  const [touched, setTouched] = useState(initial !== undefined);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [noteKind, setNoteKind] = useState<NoteKind>(initial?.noteKind ?? prompt.defaultKind);
  const [note, setNote] = useState(initial?.note ?? '');
  const [saving, setSaving] = useState(false);

  function toggleTag(tag: string) {
    setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saved = await saveCheckIn({ day, score, note, noteKind, tags });
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Stack gap="xl">
      <Stack gap="xs" align="center">
        <MoodDial
          progress={progress}
          width={width}
          onScoreChange={(next) => {
            setScore(next);
            setTouched(true);
          }}
          onCommit={(next) => {
            setScore(next);
            setTouched(true);
          }}
        />
        <Animated.View key={touched ? score : 'hint'} entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)}>
          <Text variant="display" align="center" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {touched ? moodFor(score).label : 'Slide to how you feel'}
          </Text>
        </Animated.View>
        <Text variant="caption" color="muted" align="center">
          {touched ? 'Drag the face to change it' : 'Awful on the left, great on the right'}
        </Text>
      </Stack>

      <Section
        title="What shaped it"
        trailing={tags.length > 0 ? <Text variant="caption" color="muted">{`${tags.length} picked`}</Text> : undefined}
      >
        <Row gap="sm" wrap>
          {tagOptions.map((tag) => (
            <Chip
              key={tag.label}
              label={tag.label}
              icon={tag.icon}
              selected={tags.includes(tag.label)}
              onPress={() => toggleTag(tag.label)}
            />
          ))}
        </Row>
      </Section>

      <Section title="A line about today">
        <Row gap="sm">
          {NOTE_KINDS.map((kind) => (
            <Chip
              key={kind.id}
              label={kind.label}
              selected={noteKind === kind.id}
              onPress={() => setNoteKind(kind.id)}
              tone="ink"
            />
          ))}
        </Row>
        <TextInput
          accessibilityLabel="Note"
          value={note}
          onChangeText={setNote}
          onFocus={onNoteFocus}
          placeholder={prompt.placeholder[noteKind]}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          textAlignVertical="top"
          style={[
            typography.journal,
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radii.lg,
              borderWidth: layout.hairline,
              padding: spacing.md,
            },
          ]}
        />
      </Section>

      <Button title={saveTitle} onPress={() => void handleSave()} disabled={!touched} loading={saving} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 120 },
});
