import { prisma } from "@/lib/prisma";

export type CategorySpending = {
  name: string;
  current: number;
  previous: number;
  // Null when there was no spending in the previous period to compare with.
  changePercent: number | null;
};

export type SpendingStats = {
  // Month-to-date, compared with the same number of days of last month, so a
  // half-finished month is not compared with a whole one.
  currentPeriod: { from: string; to: string };
  previousPeriod: { from: string; to: string };
  totalCurrent: number;
  totalPrevious: number;
  changePercent: number | null;
  // Sorted by current spending, largest first.
  categories: CategorySpending[];
};

const UNCATEGORIZED = "Uncategorized";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

// Expense totals per category for [from, to). Amounts are signed, so
// expenses are the negative ones.
async function expensesByCategory(userId: string, from: Date, to: Date) {
  const groups = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, amount: { lt: 0 }, date: { gte: from, lt: to } },
    _sum: { amount: true },
  });

  return new Map(
    groups.map((g) => [
      g.categoryId,
      Math.abs(g._sum.amount?.toNumber() ?? 0),
    ])
  );
}

// Months are UTC, matching /api/analytics/monthly.
export async function getSpendingStats(
  userId: string,
  now = new Date()
): Promise<SpendingStats> {
  const currentStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  );
  const previousStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)
  );
  // Same elapsed time into last month, but never past its end
  // (e.g. March 31 compares with all of February).
  const previousEnd = new Date(
    Math.min(
      previousStart.getTime() + (now.getTime() - currentStart.getTime()),
      currentStart.getTime()
    )
  );

  const [current, previous] = await Promise.all([
    expensesByCategory(userId, currentStart, now),
    expensesByCategory(userId, previousStart, previousEnd),
  ]);

  const categoryIds = Array.from(
    new Set([...current.keys(), ...previous.keys()])
  ).filter((id): id is string => id !== null);

  const categories = await prisma.category.findMany({
    where: { userId, id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(categories.map((c) => [c.id, c.name]));

  // Merge by name, so null and unknown IDs both land in "Uncategorized".
  const byName = new Map<string, { current: number; previous: number }>();
  const add = (
    totals: Map<string | null, number>,
    key: "current" | "previous"
  ) => {
    for (const [id, amount] of totals) {
      const name = (id && nameById.get(id)) || UNCATEGORIZED;
      const entry = byName.get(name) ?? { current: 0, previous: 0 };
      entry[key] += amount;
      byName.set(name, entry);
    }
  };
  add(current, "current");
  add(previous, "previous");

  const categorySpending = Array.from(byName, ([name, t]) => ({
    name,
    current: round2(t.current),
    previous: round2(t.previous),
    changePercent: percentChange(t.current, t.previous),
  })).sort((a, b) => b.current - a.current || b.previous - a.previous);

  const totalCurrent = round2(
    categorySpending.reduce((sum, c) => sum + c.current, 0)
  );
  const totalPrevious = round2(
    categorySpending.reduce((sum, c) => sum + c.previous, 0)
  );

  return {
    currentPeriod: { from: currentStart.toISOString(), to: now.toISOString() },
    previousPeriod: {
      from: previousStart.toISOString(),
      to: previousEnd.toISOString(),
    },
    totalCurrent,
    totalPrevious,
    changePercent: percentChange(totalCurrent, totalPrevious),
    categories: categorySpending,
  };
}
