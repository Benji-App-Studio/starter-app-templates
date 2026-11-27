import { interpolateColor, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { mixColors, useTheme } from '@/theme/theme';

const STOPS = [0, 0.25, 0.5, 0.75, 1];

/** A background style that follows the dial: the screen takes on a wash of the current mood. */
export function useMoodTint(progress: SharedValue<number>) {
  const { colors, scheme } = useTheme();
  const tints = colors.mood.map((color) => mixColors(colors.background, color, scheme === 'dark' ? 0.26 : 0.2));

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, STOPS, tints),
  }));
}
