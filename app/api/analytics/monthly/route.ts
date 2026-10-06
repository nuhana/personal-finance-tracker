import { getCurrentUserId } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET takes no request input, so Next.js would otherwise render it once at
// build time and serve that stale response from then on.
export const dynamic = "force-dynamic";

type MonthlyAnalytics = {
  month: string;
  income: number;
  expense: number;
};

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const monthlyData = transactions.reduce(
      (result: Record<string, MonthlyAnalytics>, transaction) => {
        const monthKey = transaction.date.toISOString().slice(0, 7);

        const monthLabel = transaction.date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        if (!result[monthKey]) {
          result[monthKey] = {
            month: monthLabel,
            income: 0,
            expense: 0,
          };
        }

        const amount = transaction.amount.toNumber();

        if (amount >= 0) {
          result[monthKey].income += amount;
        } else {
          result[monthKey].expense += Math.abs(amount);
        }

        return result;
      },
      {}
    );

    const analytics = Object.values(monthlyData);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("SERVER ERROR in /api/analytics/monthly:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
