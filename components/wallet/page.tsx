"use client";

import { useQuery } from "@tanstack/react-query";
import { getWallet, type WalletDto } from "@/lib/api/wallet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function Wallet() {
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
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Loading your balance…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError || !wallet) {
    return (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Failed to load wallet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const balanceNumber = Number(wallet.balance);

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>Total money you have</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-semibold font-mono">
          ${balanceNumber.toFixed(2)}
        </p>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm">
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}
