"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getTransactions, TransactionDto } from "@/lib/api/transactions";

export function TransactionsCard() {
  const {
    data: transactions = [],
    isLoading,
    isError,
  } = useQuery<TransactionDto[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Failed to load transactions.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Transactions</CardTitle>
        <CardDescription className="text-xs">
          Your latest spending activity
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="divide-y divide-slate-200 text-sm">
          {transactions.length === 0 && (
            <li className="py-3 text-slate-500 text-xs">
              No transactions yet.
            </li>
          )}

          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3">
              <span>{tx.category?.name ?? "Uncategorized"}</span>
              <span className="font-mono">${Number(tx.amount).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
