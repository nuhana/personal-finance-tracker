export default function TransactionTable() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <table className="w-full text-sm">
        <thead className="text-left text-slate-500">
          <tr><th className="py-2">Date</th><th>Category</th><th>Account</th><th className="text-right">Amount</th></tr>
        </thead>
        <tbody>
          <tr className="border-t"><td className="py-2">2025-10-01</td><td>Groceries</td><td>Card</td><td className="text-right">-€ 24.50</td></tr>
        </tbody>
      </table>
    </div>
  );
}
