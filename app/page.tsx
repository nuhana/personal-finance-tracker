export default function Page() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Card */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">This Month Spend</div>
          <div className="text-2xl font-semibold font-mono text-red-600">€ 1,240</div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">This Month Income</div>
          <div className="text-2xl font-semibold font-mono text-green-600">€ 2,900</div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="text-sm text-slate-500">Net</div>
          <div className="text-2xl font-semibold font-mono text-slate-900">€ 1,660</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-white p-6 shadow-sm min-h-[240px] flex flex-col justify-center items-center">
          <span className="text-slate-500 text-sm">📈 Monthly Trend (mock chart)</span>
        </div>
        <div className="rounded-2xl border bg-white p-6 shadow-sm min-h-[240px] flex flex-col justify-center items-center">
          <span className="text-slate-500 text-sm">📊 By Category (mock chart)</span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
        <ul className="divide-y divide-slate-100">
          <li className="flex justify-between py-2">
            <span className="text-slate-700">Groceries</span>
            <span className="font-mono text-red-500">-€24.50</span>
          </li>
          <li className="flex justify-between py-2">
            <span className="text-slate-700">Salary</span>
            <span className="font-mono text-green-600">+€1,200.00</span>
          </li>
          <li className="flex justify-between py-2">
            <span className="text-slate-700">Transport</span>
            <span className="font-mono text-red-500">-€30.00</span>
          </li>
        </ul>
        <p className="text-xs text-slate-500 mt-2">
          (Mock data — connect your API to display live transactions)
        </p>
      </div> 
    </div>
  );
}
