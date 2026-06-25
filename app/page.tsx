import { TransactionsCard } from "@/components/Transactions/page";
import { Wallet } from "@/components/Wallet/page";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r p-4 flex flex-col justify-between rounded-r-3xl">
        <div>
          {/* Profile */}
          <div className="flex items-center space-x-3 p-3 mb-6">
            <img
              src="/avatar.png"
              alt="User"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-slate-800">Gadiel Machado</h3>
              <p className="text-xs text-slate-500">Designer</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            <NavItem icon="📊" label="Dashboard" active />
            <NavItem icon="💰" label="Wallet" />
            <NavItem icon="📑" label="Transactions" />
            <NavItem icon="📈" label="Analytics" />
            <NavItem icon="🔍" label="Search" />
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="space-y-2 border-t border-slate-100 pt-4">
          <NavItem icon="⚙️" label="Settings" />
          <NavItem icon="❓" label="Help" />
          <NavItem icon="🚪" label="Log Out" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

          <input
            type="text"
            placeholder="Search..."
            className="border rounded-xl px-4 py-2 w-64 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Big card placeholder */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border min-h-[200px]">
              Big card placeholder
            </div>

            {/* Transactions list placeholder */}
            <TransactionsCard />

            {/* Chart placeholder */}
            <div className="p-6 bg-white rounded-2xl shadow-sm border min-h-[200px] flex items-center justify-center">
              <p className="text-slate-400">📈 Monthly Earnings Chart</p>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Wallet />

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <h2 className="text-slate-600 text-sm">Payable Accounts</h2>
              <p className="text-xs text-slate-400 mb-3">
                Keep your accounts up to date to avoid issues.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                <div className="bg-indigo-500 h-2 rounded-full w-5/6" />
              </div>
              <p className="text-xs text-right text-slate-500">14 of 16 paid</p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <h2 className="text-slate-600 text-sm mb-2">Receipts</h2>
              <ul className="space-y-2 text-sm">
                <li>💼 Salary - $5,000</li>
                <li>🧾 Service - $593</li>
                <li>🏠 Rent - $3,030.98</li>
              </ul>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border">
              <h2 className="text-slate-600 text-sm mb-2">Payables</h2>
              <ul className="space-y-2 text-sm">
                <li>💡 Electricity - $202.98</li>
                <li>🏠 Mortgage - $3,030.98</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href="#"
      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm ${
        active
          ? "bg-indigo-50 text-indigo-600 font-medium"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
