import { useLocalSearchParams } from 'expo-router';

import { TimerSheet } from '@/features/mixer/TimerSheet';

/** Form sheet: the sleep-timer dial, for tonight's mix or for the default in Settings. */
export default function TimerRoute() {
  const { target } = useLocalSearchParams<{ target?: string }>();
  return <TimerSheet target={target === 'default' ? 'default' : 'tonight'} />;
}
