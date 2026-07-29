"use client";

import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";

import { getTransactions, type TransactionDto } from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function TransactionTable() {
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
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-sm text-slate-500">Loading transactions...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border bg-white p-6">
        <p className="text-sm text-red-500">Failed to load transactions.</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <h2 className="font-semibold text-slate-800">No transactions yet</h2>

        <p className="mt-1 text-sm text-slate-500">
          Add your first income or expense to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 text-right font-medium">Amount</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const amount = Number(transaction.amount);
              const isIncome = amount > 0;

              return (
                <tr
                  key={transaction.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {new Date(transaction.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-800">
                      {transaction.note || "No description"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {transaction.account?.name ?? "Wallet"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {transaction.category?.name ?? "Uncategorized"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        isIncome
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {isIncome ? "Income" : "Expense"}
                    </span>
                  </td>

                  <td
                    className={
                      isIncome
                        ? "whitespace-nowrap px-6 py-4 text-right font-mono font-medium text-emerald-600"
                        : "whitespace-nowrap px-6 py-4 text-right font-mono font-medium text-red-600"
                    }
                  >
                    {formatAmount(amount)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Transaction actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
