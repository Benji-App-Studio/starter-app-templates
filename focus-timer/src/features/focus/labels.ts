/** Starting labels per onboarding answer; the user's own labels take over as they accumulate. */
const suggestionsByPurpose: Record<string, string[]> = {
  study: ['Reading', 'Problem set', 'Revision', 'Lecture notes'],
  work: ['Deep work', 'Writing', 'Planning', 'Inbox'],
  creative: ['Drawing', 'Writing', 'Practice', 'Editing'],
  mixed: ['Deep work', 'Reading', 'Admin', 'Learning'],
};

export function suggestedLabels(purpose: string | undefined, recent: string[]): string[] {
  const defaults = suggestionsByPurpose[purpose ?? 'mixed'] ?? suggestionsByPurpose.mixed;
  const merged = [...recent, ...defaults.filter((label) => !recent.includes(label))];
  return merged.slice(0, 6);
}
