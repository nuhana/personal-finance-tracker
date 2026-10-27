import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// GET takes no request input, so Next.js would otherwise render it once at
// build time and serve that stale response from then on.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();

    const account = await prisma.account.findFirst({
      where: {
        userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const rawAmount = Number(body.amount);

    const isValidType = body.type === "EXPENSE" || body.type === "INCOME";

    if (!isValidType || Number.isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid transaction data" },
        { status: 400 }
      );
    }

    const transactionDate = body.date ? new Date(body.date) : new Date();

    if (Number.isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid transaction date" },
        { status: 400 }
      );
    }

    // The category is optional, but if given it must be one of this user's
    // categories and match the transaction type (no "Groceries" income).
    const categoryId = body.categoryId ?? null;

    if (categoryId !== null) {
      const category =
        typeof categoryId === "string"
          ? await prisma.category.findFirst({
              where: { id: categoryId, userId },
              select: { type: true },
            })
          : null;

      if (!category || category.type !== body.type) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    const signedAmount =
      body.type === "EXPENSE" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId: account.id,
            categoryId,
            amount: signedAmount,
            date: transactionDate,
            note: body.note?.trim() || null,
          },
          include: {
            category: true,
            account: true,
          },
        });

        await tx.account.update({
          where: {
            id: account.id,
          },
          data: {
            balance: {
              increment: signedAmount,
            },
          },
        });

        return transaction;
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating transaction:", error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
