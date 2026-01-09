import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getTransactions } from "@/lib/api/transactions";
import { useEffect, useState } from "react";

export function TransactionsCard() {

    const [transactions, setTransactions] = useState([]);
useEffect(() => {
  getTransactions().then(setTransactions);
}, []);

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
            <li className="py-3 text-slate-500 text-xs">No transactions yet.</li>
          )}

          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between py-3">
              <span>{tx.category?.name ?? "Uncategorized"}</span>
              <span className="font-mono">
                {tx.amount} {tx.account?.currency ?? "€"}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
