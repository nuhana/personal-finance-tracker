import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


////TODO get the transactions for the logged in user

export async function GET() {
  try {
    const userId = "cmi5zz74k00007q4skczcm7ad";

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
  const body = await req.json();

  const tx = await prisma.transaction.create({
    data: {
      userId: body.userId,
      accountId: body.accountId,
      amount: body.amount,
      date: new Date(body.date),
      note: body.note,
      categoryId: body.categoryId,
    },
  });

  return NextResponse.json(tx);
}
