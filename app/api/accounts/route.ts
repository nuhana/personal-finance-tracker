import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = "cmi5zz74k00007q4skczcm7ad"; // later: get from auth/session

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      currency: true,
      balance: true,
    },
  });

  return NextResponse.json(accounts);
}
