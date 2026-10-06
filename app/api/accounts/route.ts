import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET takes no request input, so Next.js would otherwise render it once at
// build time and serve that stale response from then on.
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = "cmi5zz74k00007q4skczcm7ad"; // later: get from auth/session

  const accounts = await prisma.account.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      balance: true,
    },
  });

  return NextResponse.json(accounts);
}
