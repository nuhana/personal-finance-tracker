import type { TransactionType } from "@/lib/api/transactions";

export type CategorizeInput = {
  note: string;
  type?: TransactionType;
};

export type CategorizeResultDto = {
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
