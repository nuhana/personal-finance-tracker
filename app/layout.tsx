import "./globals.css";

export const metadata = {
  title: "Personal Finance Tracker",
  description: "Track expenses, income, and budgets with a clean dashboard."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex h-screen">
          <aside className="hidden md:block w-64 border-r bg-white">
            <div className="p-4 text-lg font-semibold">💸 Finance Tracker</div>
            <nav className="px-2 space-y-1">
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/">Dashboard</a>
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/transactions">Transactions</a>
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/accounts">Accounts</a>
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/categories">Categories</a>
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/budgets">Budgets</a>
              <a className="block px-3 py-2 rounded-lg hover:bg-slate-100" href="/settings">Settings</a>
            </nav>
          </aside>
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b bg-white/80 backdrop-blur flex items-center justify-between px-4">
              <div className="font-medium">Welcome</div>
              <div className="flex items-center gap-3">
                <a href="/login" className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm">Sign in</a>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
