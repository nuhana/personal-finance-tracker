export type TransactionDto = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  amount: string; // Prisma Decimal becomes string in JSON
  date: string;
  note: string | null;
  createdAt: string;

  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    color: string | null;
  } | null;

  account: {
    id: string;
    name: string;
    type: "CASH" | "BANK" | "CARD";
    balance: string;
  };
};

export type CreateTransactionInput = {
  accountId: string;
  categoryId?: string | null;
  amount: number;
  date: string;
  note?: string;
};

export async function getTransactions(): Promise<TransactionDto[]> {
  const res = await fetch("/api/transactions", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load transactions");
  }

  return res.json();
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<TransactionDto> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Failed to create transaction");
  }

  return res.json();
}
