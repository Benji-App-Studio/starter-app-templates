import type { IconName } from '@/components/icons';

export type TagOption = {
  /** Stored as-is in `check_in_tags.tag`; renaming one splits its history in Trends. */
  label: string;
  icon: IconName;
};

/** What a day was about. A fixed set keeps the trends comparable; custom tags are a version-two idea. */
export const tagOptions: readonly TagOption[] = [
  { label: 'Work', icon: 'work' },
  { label: 'Family', icon: 'family' },
  { label: 'Friends', icon: 'friends' },
  { label: 'Partner', icon: 'heart' },
  { label: 'Health', icon: 'health' },
  { label: 'Sleep', icon: 'sleep' },
  { label: 'Exercise', icon: 'exercise' },
  { label: 'Food', icon: 'food' },
  { label: 'Money', icon: 'money' },
  { label: 'Weather', icon: 'weather' },
  { label: 'Rest', icon: 'rest' },
  { label: 'Hobbies', icon: 'hobbies' },
];

/** The icon for a stored tag, if it is one of the current options. */
export function tagIcon(label: string): IconName | undefined {
  return tagOptions.find((option) => option.label === label)?.icon;
}
