"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  type TransactionType,
} from "@/lib/api/transactions";
import { categorizeTransaction } from "@/lib/api/ai";
import { getCategories } from "@/lib/api/categories";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  // Optional: null saves the transaction uncategorized.
  categoryId: z.string().nullable(),
});

type TransactionFormInput = z.input<typeof transactionSchema>;
type TransactionFormValues = z.output<typeof transactionSchema>;

const defaultValues: TransactionFormInput = {
  type: "EXPENSE",
  amount: "",
  note: "",
  categoryId: null,
};

export function AddTransactionDialog() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  // Once the user clicks Income/Expense, the AI must not override it.
  const [typeChosen, setTypeChosen] = useState(false);
  // Who set the category: a suggestion is tied to the note it was made for,
  // a category the user picked is not.
  const [categorySource, setCategorySource] = useState<"user" | "ai" | null>(
    null
  );

  const form = useForm<TransactionFormInput, unknown, TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues,
  });
  const { errors } = form.formState;
  const type = form.watch("type");
  const note = form.watch("note");
  const categoryId = form.watch("categoryId");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categoriesOfType = (categories.data ?? []).filter(
    (c) => c.type === type
  );
  // A null item gives the "no category" option its label.
  const categoryItems = [
    { value: null, label: "No category" },
    ...categoriesOfType.map((c) => ({ value: c.id, label: c.name })),
  ];

  // Only runs when the user clicks "Suggest", to stay within the AI rate limit.
  const suggestion = useMutation({
    mutationFn: categorizeTransaction,
  });

  function setCategory(id: string | null, source: "user" | "ai" | null) {
    form.setValue("categoryId", id);
    setCategorySource(id ? source : null);
  }

  function clearCategory() {
    setCategory(null, null);
    suggestion.reset();
  }

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });

      setOpen(false);
    },
  });

  // Every way of opening the dialog starts from an empty form, whether it was
  // last closed by Save, Cancel, Escape or a click outside. Resetting on open
  // rather than on close keeps the fields from blanking during the close
  // animation.
  function onOpenChange(next: boolean) {
    if (next) {
      form.reset(defaultValues);
      setTypeChosen(false);
      clearCategory();
      mutation.reset();
    }
    setOpen(next);
  }

  function onSubmit(values: TransactionFormValues) {
    mutation.mutate({
      ...values,
      date: new Date().toISOString(),
    });
  }

  function chooseType(next: TransactionType) {
    // Categories belong to one type, so the current one no longer fits.
    if (type !== next) clearCategory();
    form.setValue("type", next);
    setTypeChosen(true);
  }

  function chooseCategory(id: string | null) {
    // Drops a suggestion still in flight, so it can't replace this choice.
    suggestion.reset();
    setCategory(id, "user");
    // The list only shows categories of the current type, so picking one
    // confirms that type; a later Suggest must not flip it.
    if (id) setTypeChosen(true);
  }

  function onNoteChange() {
    // A suggestion was made for the old note; a category the user picked
    // doesn't depend on the note, so it stays.
    suggestion.reset();
    if (categorySource === "ai") setCategory(null, null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {...form.register("note", { onChange: onNoteChange })}
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
                    // suggestion.reset() ran while the request was in flight.
                    {
                      onSuccess: (result) => {
                        form.setValue("type", result.type);
                        // "Nothing fits" must not wipe a category the user
                        // picked themselves.
                        if (result.categoryId || categorySource !== "user") {
                          setCategory(result.categoryId, "ai");
                        }
                      },
                    }
                  )
                }
              >
                {suggestion.isPending ? "Suggesting..." : "Suggest"}
              </Button>
            </div>

            {suggestion.isError && (
              <p className="text-xs text-red-500">{suggestion.error.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              items={categoryItems}
              value={categoryId}
              onValueChange={(value) => chooseCategory(value as string | null)}
              disabled={categories.isPending || categories.isError}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    categories.isPending
                      ? "Loading categories..."
                      : "No category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value ?? "none"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categorySource === "ai" && (
              <p className="text-xs text-muted-foreground">
                Suggested by AI. You can change it.
              </p>
            )}

            {suggestion.data && !suggestion.data.categoryId && !categoryId && (
              <p className="text-xs text-muted-foreground">
                No matching category found.
              </p>
            )}

            {categories.isError && (
              <p className="text-xs text-red-500">
                Couldn&apos;t load categories.
              </p>
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
