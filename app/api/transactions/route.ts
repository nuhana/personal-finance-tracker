import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/current-user";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const tx = await prisma.transaction.create({
      data: {
        userId,
        accountId: body.accountId,
        categoryId: body.categoryId ?? null,
        amount: body.amount,
        date: new Date(body.date),
        note: body.note ?? null,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json(tx, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating transaction:", error);

    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
