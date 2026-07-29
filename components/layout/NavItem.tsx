"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: ReactNode;
  label: string;
  href: string;
};

export function NavItem({ icon, label, href }: NavItemProps) {
  const pathname = usePathname();

  const active =
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
        active
          ? "bg-indigo-50 font-medium text-indigo-600"
          : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
