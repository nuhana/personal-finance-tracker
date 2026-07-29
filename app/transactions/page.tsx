import { AddTransactionDialog } from "@/components/transactions/AddTransactionForm";
import { TransactionTable } from "@/components/transactions/TransactionTable";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 px-6 py-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Transactions</h1>

          <p className="text-sm text-slate-500">
            View and manage your income and expenses.
          </p>
        </div>

        <AddTransactionDialog />
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 sm:flex-row">
        <input
          type="search"
          placeholder="Search transactions..."
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select className="rounded-lg border px-3 py-2 text-sm">
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      <TransactionTable />
    </div>
  );
}
