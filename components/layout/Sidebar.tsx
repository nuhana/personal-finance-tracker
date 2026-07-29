"use client";

import {
  ChartNoAxesCombined,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Search,
  Settings,
  Wallet,
} from "lucide-react";

import { NavItem } from "@/components/layout/NavItem";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: ReceiptText,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    name: "Help",
    href: "/help",
    icon: CircleHelp,
  },
  {
    name: "Log Out",
    href: "/logout",
    icon: LogOut,
  },
];

export function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between rounded-r-3xl border-r bg-white p-4 shadow-sm">
      <div>
        <div className="mb-6 flex items-center gap-3 p-3">
          <img
            src="/avatar.png"
            alt="Nouha Najah"
            className="size-12 rounded-full object-cover"
          />

          <div>
            <h3 className="font-semibold text-slate-800">Nouha Najah</h3>

            <p className="text-xs text-slate-500">Software Engineer</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavItem
                key={item.href}
                icon={<Icon className="size-5" />}
                label={item.name}
                href={item.href}
              />
            );
          })}
        </nav>
      </div>

      <nav className="space-y-2 border-t border-slate-100 pt-4">
        {secondaryNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavItem
              key={item.href}
              icon={<Icon className="size-5" />}
              label={item.name}
              href={item.href}
            />
          );
        })}
      </nav>
    </aside>
  );
}
