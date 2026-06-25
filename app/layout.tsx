import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata = {
  title: "Personal Finance Tracker",
  description: "Manage expenses, budgets, and accounts easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
