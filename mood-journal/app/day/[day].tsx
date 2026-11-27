import { Redirect, useLocalSearchParams } from 'expo-router';

import { DayScreen } from '@/features/journal/DayScreen';

export default function DayRoute() {
  const { day } = useLocalSearchParams<{ day: string }>();

  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return <Redirect href="/" />;
  }

  return <DayScreen day={day} />;
}
