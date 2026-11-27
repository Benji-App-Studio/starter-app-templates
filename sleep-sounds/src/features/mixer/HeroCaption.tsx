import type { ReactNode } from 'react';

import { Text } from '@/components';
import { useTheme } from '@/theme/theme';

/**
 * The small line under the number in the blob. The blob is bright where its layers overlap, so
 * muted grey disappears there; ink at reduced opacity with a soft halo in the background color
 * reads on every tint in both themes.
 */
export function HeroCaption({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <Text
      variant="label"
      style={{ opacity: 0.86, textShadowColor: colors.background, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } }}
    >
      {children}
    </Text>
  );
}
