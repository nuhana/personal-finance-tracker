import type { TransactionType } from "@/lib/api/transactions";
// Type-only import: erased at build time, so Prisma never reaches the client.
import type { SpendingStats } from "@/lib/insights";

export type CategorizeInput = {
  note: string;
  // Omit to let the AI infer income/expense from the note.
  type?: TransactionType;
};

export type CategorizeResultDto = {
  type: TransactionType;
  categoryId: string | null;
  categoryName: string | null;
};

export async function categorizeTransaction(
  input: CategorizeInput
): Promise<CategorizeResultDto> {
  const res = await fetch("/api/ai/categorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to suggest a category");
  }

  return res.json();
}

export type SpendingInsightsDto = {
  summary: string;
  insights: string[];
  stats: SpendingStats;
};

export async function generateInsights(): Promise<SpendingInsightsDto> {
  const res = await fetch("/api/ai/insights", { method: "POST" });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to generate insights");
  }

  return res.json();
}
