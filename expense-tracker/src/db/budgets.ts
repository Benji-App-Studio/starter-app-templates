import { getDatabase } from './index';

/** A monthly limit per category. A limit of 0 means "no limit" and still counts as set. */
export type Budget = {
  categoryId: string;
  limitCents: number;
};

type BudgetRow = {
  category_id: string;
  limit_cents: number;
};

function toBudget(row: BudgetRow): Budget {
  return { categoryId: row.category_id, limitCents: row.limit_cents };
}

export async function listBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BudgetRow>('SELECT * FROM budgets');
  return rows.map(toBudget);
}

export async function setBudget(categoryId: string, limitCents: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (category_id, limit_cents) VALUES (?, ?)
     ON CONFLICT(category_id) DO UPDATE SET limit_cents = excluded.limit_cents`,
    categoryId,
    limitCents,
  );
}

/** Writes the given budgets only when the table is empty (first launch, or after a reset). */
export async function seedBudgets(budgets: Budget[]): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM budgets');
  if ((row?.count ?? 0) > 0) {
    return;
  }
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const budget of budgets) {
      await txn.runAsync(
        'INSERT INTO budgets (category_id, limit_cents) VALUES (?, ?)',
        budget.categoryId,
        budget.limitCents,
      );
    }
  });
}

export async function deleteAllBudgets(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets');
}
