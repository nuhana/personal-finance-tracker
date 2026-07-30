"use client";

import { useQuery } from "@tanstack/react-query";

import { getWallet, type WalletDto } from "@/lib/api/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function WalletDetails() {
  const {
    data: wallet,
    isLoading,
    isError,
  } = useQuery<WalletDto>({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-500">
          Loading wallet...
        </CardContent>
      </Card>
    );
  }

  if (isError || !wallet) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-red-500">
          Failed to load wallet.
        </CardContent>
      </Card>
    );
  }

  const balance = Number(wallet.balance);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{wallet.name}</CardTitle>
          <CardDescription>Your current wallet balance</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="font-mono text-5xl font-semibold">
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Wallet details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Wallet name</span>
            <span className="font-medium">{wallet.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Currency</span>
            <span className="font-medium">USD</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="font-medium text-emerald-600">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
