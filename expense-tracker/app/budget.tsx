import { Redirect, useLocalSearchParams } from 'expo-router';

import { BudgetEditorScreen } from '@/features/budgets/BudgetEditorScreen';

/** Form sheet for one category's monthly limit. */
export default function BudgetRoute() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  if (!categoryId) {
    return <Redirect href="/budgets" />;
  }

  return <BudgetEditorScreen categoryId={categoryId} />;
}
