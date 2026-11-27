import { Redirect, useLocalSearchParams } from 'expo-router';

import { DayDetailScreen } from '@/features/diary/DayDetailScreen';

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

export default function DayRoute() {
  const { date } = useLocalSearchParams<{ date: string }>();

  if (!DAY_KEY.test(date)) {
    return <Redirect href="/" />;
  }

  return <DayDetailScreen day={date} />;
}
