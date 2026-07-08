import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const rawAmount = Number(body.amount);

    if (!body.accountId || Number.isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid transaction data" },
        { status: 400 }
      );
    }

    const signedAmount =
      body.type === "EXPENSE" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: body.accountId,
          categoryId: body.categoryId ?? null,
          amount: signedAmount,
          date: new Date(body.date),
          note: body.note ?? null,
        },
        include: {
          category: true,
          account: true,
        },
      });

      await tx.account.update({
        where: {
          id: body.accountId,
        },
        data: {
          balance: {
            increment: signedAmount,
          },
        },
      });

      return transaction;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
