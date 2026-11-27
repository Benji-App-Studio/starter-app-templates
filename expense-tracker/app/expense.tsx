import { useLocalSearchParams } from 'expo-router';

import { ExpenseFormScreen } from '@/features/expenses/ExpenseFormScreen';

/** Form sheet. Opened without `id` to add, with `id` to edit. */
export default function ExpenseRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const parsed = id === undefined ? undefined : Number(id);

  return <ExpenseFormScreen id={parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined} />;
}
