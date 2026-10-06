"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  type TransactionType,
} from "@/lib/api/transactions";
import {
  categorizeTransaction,
  type CategorizeResultDto,
} from "@/lib/api/ai";
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

export function AddTransactionDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  // Once the user clicks Income/Expense, the AI must not override it.
  const [typeChosen, setTypeChosen] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<CategorizeResultDto | null>(null);

  // Only runs when the user clicks "Suggest", to stay within the AI rate limit.
  const suggestion = useMutation({
    mutationFn: categorizeTransaction,
  });

  function resetSuggestion() {
    setCategory(null);
    suggestion.reset();
  }

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      setAmount("");
      setNote("");
      setType("EXPENSE");
      setTypeChosen(false);
      resetSuggestion();
      setOpen(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    mutation.mutate({
      type,
      amount: Number(amount),
      date: new Date().toISOString(),
      note,
      categoryId: category?.categoryId ?? null,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">+ Add Transaction</Button>} />

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
                onClick={() => {
                  if (type !== "EXPENSE") resetSuggestion();
                  setType("EXPENSE");
                  setTypeChosen(true);
                }}
              >
                Expense
              </Button>

              <Button
                type="button"
                variant={type === "INCOME" ? "default" : "outline"}
                onClick={() => {
                  if (type !== "INCOME") resetSuggestion();
                  setType("INCOME");
                  setTypeChosen(true);
                }}
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
            <div className="flex gap-2">
              <Input
                id="note"
                placeholder="Groceries, salary, rent..."
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  resetSuggestion();
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!note.trim() || suggestion.isPending}
                onClick={() =>
                  suggestion.mutate(
                    {
                      note: note.trim(),
                      ...(typeChosen ? { type } : {}),
                    },
                    // Passed here, not to useMutation, so it is skipped if
                    // resetSuggestion() ran while the request was in flight.
                    {
                      onSuccess: (result) => {
                        setType(result.type);
                        setCategory(result);
                      },
                    }
                  )
                }
              >
                {suggestion.isPending ? "Suggesting..." : "Suggest"}
              </Button>
            </div>

            {category?.categoryId && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Category:</span>
                <span className="rounded-full border px-2 py-0.5">
                  {category.categoryName}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={resetSuggestion}
                  aria-label="Remove category"
                >
                  ✕
                </button>
              </div>
            )}

            {category && !category.categoryId && (
              <p className="text-xs text-muted-foreground">
                No matching category found.
              </p>
            )}

            {suggestion.isError && (
              <p className="text-xs text-red-500">{suggestion.error.message}</p>
            )}
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
