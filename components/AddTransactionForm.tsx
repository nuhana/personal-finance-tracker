"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTransaction } from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";

type Props = {
  accountId: string;
};

export function AddTransactionForm({ accountId }: Props) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      setAmount("");
      setNote("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutation.mutate({
      accountId,
      amount: Number(amount),
      date: new Date().toISOString(),
      note,
      categoryId: null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="w-full rounded-xl border px-3 py-2 text-sm"
        placeholder="Amount e.g. -25 or 1000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="w-full rounded-xl border px-3 py-2 text-sm"
        placeholder="Note e.g. Groceries"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add transaction"}
      </Button>

      {mutation.isError && (
        <p className="text-xs text-red-500">Failed to add transaction.</p>
      )}
    </form>
  );
}
