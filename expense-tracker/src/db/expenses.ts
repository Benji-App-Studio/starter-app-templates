import { getDatabase } from './index';

export type Expense = {
  id: number;
  /** Whole cents, so sums never drift. */
  amountCents: number;
  categoryId: string;
  note: string;
  /** Unix time in milliseconds. */
  spentAt: number;
};

export type ExpenseInput = Omit<Expense, 'id'>;

type ExpenseRow = {
  id: number;
  amount_cents: number;
  category_id: string;
  note: string;
  spent_at: number;
};

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amountCents: row.amount_cents,
    categoryId: row.category_id,
    note: row.note,
    spentAt: row.spent_at,
  };
}

/** Expenses with `start <= spentAt < end`, newest first. */
export async function listExpenses(start: number, end: number): Promise<Expense[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT * FROM expenses WHERE spent_at >= ? AND spent_at < ? ORDER BY spent_at DESC, id DESC',
    start,
    end,
  );
  return rows.map(toExpense);
}

export async function getExpense(id: number): Promise<Expense | undefined> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ExpenseRow>('SELECT * FROM expenses WHERE id = ?', id);
  return row ? toExpense(row) : undefined;
}

export async function sumExpenses(start: number, end: number): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount_cents) AS total FROM expenses WHERE spent_at >= ? AND spent_at < ?',
    start,
    end,
  );
  return row?.total ?? 0;
}

export async function countExpenses(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM expenses');
  return row?.count ?? 0;
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO expenses (amount_cents, category_id, note, spent_at) VALUES (?, ?, ?, ?)',
    input.amountCents,
    input.categoryId,
    input.note,
    input.spentAt,
  );
  return { id: result.lastInsertRowId, ...input };
}

export async function updateExpense(id: number, input: ExpenseInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE expenses SET amount_cents = ?, category_id = ?, note = ?, spent_at = ? WHERE id = ?',
    input.amountCents,
    input.categoryId,
    input.note,
    input.spentAt,
    id,
  );
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?', id);
}

export async function deleteAllExpenses(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses');
}
