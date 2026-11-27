import { useTheme } from '@/theme/theme';

/**
 * Header options for the History and Settings stacks. The screens draw their own large title
 * (`Screen title=…`, see `src/components/CollapsingTitle.tsx`): the native large title went
 * blank after the first scroll on iOS 26 with a tinted header.
 */
export function useTabStackOptions() {
  const { colors } = useTheme();
  return { headerShown: false, contentStyle: { backgroundColor: colors.background } };
}
