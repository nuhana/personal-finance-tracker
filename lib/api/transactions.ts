    export type TransactionsDto = {
      
    };

    export async function getTransactions(): Promise<TransactionsDto> {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load wallet");
      return res.json();
    }
