import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const wallet = await prisma.account.findFirst({
      where: { userId },
      select: { id: true, userId: true, name: true, balance: true },
    });

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json(wallet);
  } catch (err) {
    console.error("❌ SERVER ERROR in /api/wallet:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
