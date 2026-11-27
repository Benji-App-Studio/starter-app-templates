import { habitList, isHabitId } from '@/features/quit/habits';
import { profile, useProfile } from '@/features/quit/profile';

import { PickerSheet } from './PickerSheet';

export function HabitSheet() {
  const current = useProfile();

  return (
    <PickerSheet
      title="What are you leaving behind?"
      options={habitList.map((habit) => ({ id: habit.id, label: habit.label, icon: habit.icon, hint: habit.freeLabel }))}
      selectedId={current?.habit ?? 'smoking'}
      onSelect={(id) => {
        if (isHabitId(id)) {
          profile.set({ habit: id });
        }
      }}
    />
  );
}
