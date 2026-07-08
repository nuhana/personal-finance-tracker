"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  type TransactionType,
} from "@/lib/api/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  accountId: string;
};

export function AddTransactionDialog({ accountId }: Props) {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      setAmount("");
      setNote("");
      setType("EXPENSE");
      setOpen(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutation.mutate({
      accountId,
      type,
      amount: Number(amount),
      date: new Date().toISOString(),
      note,
      categoryId: null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm">+ Add Transaction</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Add income or expense to your wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "EXPENSE" ? "default" : "outline"}
                onClick={() => setType("EXPENSE")}
              >
                Expense
              </Button>

              <Button
                type="button"
                variant={type === "INCOME" ? "default" : "outline"}
                onClick={() => setType("INCOME")}
              >
                Income
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              placeholder="250.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              placeholder="Groceries, salary, rent..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>

          {mutation.isError && (
            <p className="text-xs text-red-500">
              Failed to create transaction.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
