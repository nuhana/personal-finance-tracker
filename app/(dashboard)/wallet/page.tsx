import { AddTransactionDialog } from "@/components/transactions/AddTransactionForm";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { WalletDetails } from "@/components/wallet/WalletDetails";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Wallet</h1>

          <p className="text-sm text-slate-500">
            Review your balance and recent wallet activity.
          </p>
        </div>

        <AddTransactionDialog />
      </header>

      <WalletDetails />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">
          Recent activity
        </h2>

        <TransactionsCard limit={5} />
      </section>
    </div>
  );
}
