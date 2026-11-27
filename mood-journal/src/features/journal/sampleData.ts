import { saveCheckIn, type MoodScore, type NoteKind } from '@/db/checkIns';

import { addDays, todayKey } from './dates';
import { tagOptions } from './tags';

const NOTES: { score: MoodScore; note: string; kind: NoteKind }[] = [
  { score: 5, note: 'Long walk after work, phone in my pocket the whole time.', kind: 'free' },
  { score: 4, note: 'Mum called just to talk. Nothing was wrong.', kind: 'gratitude' },
  { score: 3, note: 'Fine. Meetings. Pasta.', kind: 'free' },
  { score: 2, note: 'Slept four hours and felt it all day.', kind: 'free' },
  { score: 4, note: 'The first warm evening on the balcony.', kind: 'gratitude' },
  { score: 1, note: 'Argued and said the thing I always regret.', kind: 'free' },
  { score: 4, note: 'A quiet morning with coffee and no plans.', kind: 'gratitude' },
  { score: 3, note: 'Rain all day. Finished the book though.', kind: 'free' },
  { score: 5, note: 'Ran further than I thought I could.', kind: 'free' },
  { score: 2, note: 'Money worries again. Wrote them down, felt lighter.', kind: 'free' },
];

/**
 * Development only: fills the last ten weeks so the journal, pixels and trends
 * have something to show. Existing days are overwritten.
 */
export async function loadSampleData(): Promise<void> {
  const today = todayKey();
  for (let back = 0; back < 70; back += 1) {
    // Leave a few gaps so the line and the streak look real.
    if (back % 11 === 6 || back % 17 === 13) {
      continue;
    }
    const sample = NOTES[(back * 7) % NOTES.length];
    const tags = [tagOptions[(back * 3) % tagOptions.length].label, tagOptions[(back * 5 + 1) % tagOptions.length].label];
    await saveCheckIn({
      day: addDays(today, -back),
      score: sample.score,
      note: back % 3 === 0 ? '' : sample.note,
      noteKind: sample.kind,
      tags: back % 4 === 0 ? [tags[0]] : tags,
    });
  }
}
