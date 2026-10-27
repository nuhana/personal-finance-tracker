import type { TransactionType } from "@/lib/api/transactions";

export type CategoryDto = {
  id: string;
  name: string;
  type: TransactionType;
  color: string | null;
};

export async function getCategories(): Promise<CategoryDto[]> {
  const res = await fetch("/api/categories", { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to load categories");
  }

  return res.json();
}
