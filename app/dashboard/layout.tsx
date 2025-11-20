// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r shadow-sm rounded-r-3xl p-4 flex flex-col">
        {/* … sidebar content … */}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white/80 backdrop-blur border-b flex items-center justify-between px-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <input
            className="w-64 rounded-xl border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Search…"
          />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
