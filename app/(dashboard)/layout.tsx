import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
