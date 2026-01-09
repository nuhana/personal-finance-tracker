'use client';

import { useEffect, useState } from "react";
import { getWallet, WalletDto } from "@/lib/api/wallet";
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
  const [wallet, setWallet] = useState<WalletDto | null>(null);

  useEffect(() => {
    getWallet()
      .then(setWallet)
      .catch((err) => console.error(err));
  }, []);

  if (!wallet) {
    return (
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>Loading your balance…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const balanceNumber = Number(wallet.balance);

  return (
    <Card>
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
