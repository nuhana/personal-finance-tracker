import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = "cmi5zz74k00007q4skczcm7ad";

    console.log("🔵 DATABASE_URL:", process.env.DATABASE_URL);
    console.log("🟡 Searching for userId:", userId);

    const account = await prisma.account.findFirst({
      where: { userId },
      select: { id: true, userId: true, name: true, balance: true },
    });

    console.log("🟢 Account found:", account);

    if (!account) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (err) {
    console.error("❌ SERVER ERROR in /api/wallet:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
