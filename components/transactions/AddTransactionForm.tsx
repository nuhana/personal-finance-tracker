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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  // The input gives a string; validate it as text, then convert to a number.
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .transform(Number)
    .pipe(
      z
        .number({ error: "Enter a valid number" })
        .positive("Amount must be greater than 0")
    ),
  note: z.string(),
});

type TransactionFormInput = z.input<typeof transactionSchema>;
type TransactionFormValues = z.output<typeof transactionSchema>;

const defaultValues: TransactionFormInput = {
  type: "EXPENSE",
  amount: "",
  note: "",
};

export function AddTransactionDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  // Once the user clicks Income/Expense, the AI must not override it.
  const [typeChosen, setTypeChosen] = useState(false);
  const [category, setCategory] = useState<CategorizeResultDto | null>(null);

  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const type = form.watch("type");
  const note = form.watch("note");

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

      form.reset(defaultValues);
      setTypeChosen(false);
      resetSuggestion();
      setOpen(false);
    },
  });

  function onSubmit(values: TransactionFormValues) {
    mutation.mutate({
      ...values,
      date: new Date().toISOString(),
      categoryId: category?.categoryId ?? null,
    });
  }

  function chooseType(next: TransactionType) {
    if (type !== next) resetSuggestion();
    form.setValue("type", next);
    setTypeChosen(true);
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

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "EXPENSE" ? "default" : "outline"}
                onClick={() => chooseType("EXPENSE")}
              >
                Expense
              </Button>

              <Button
                type="button"
                variant={type === "INCOME" ? "default" : "outline"}
                onClick={() => chooseType("INCOME")}
              >
                Income
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="250.00"
              aria-invalid={!!errors.amount}
              {...form.register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <div className="flex gap-2">
              <Input
                id="note"
                placeholder="Groceries, salary, rent..."
                {...form.register("note", { onChange: resetSuggestion })}
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
                        form.setValue("type", result.type);
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
