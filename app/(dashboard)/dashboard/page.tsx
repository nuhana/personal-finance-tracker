import { AddTransactionDialog } from "@/components/transactions/AddTransactionForm";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { WalletCard } from "@/components/wallet/WalletCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

        <input
          type="text"
          placeholder="Search..."
          className="w-64 rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="min-h-[200px] rounded-2xl border bg-white p-6 shadow-sm">
            Big card placeholder
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-700">Transactions</h2>

              <AddTransactionDialog />
            </div>

            <TransactionsCard limit={5} />
          </div>

          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-slate-400">📈 Monthly Earnings Chart</p>
          </div>
        </div>

        <div className="space-y-6">
          <WalletCard />

          {/* other cards */}
        </div>
      </div>
    </div>
  );
}
