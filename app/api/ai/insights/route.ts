import { getCurrentUserId } from "@/lib/current-user";
import { getSpendingStats, type SpendingStats } from "@/lib/insights";
import { AiRateLimitError, generateJson } from "@/lib/ai";
import { NextResponse } from "next/server";

// Keeps the prompt small; the rest rarely changes the story.
const MAX_CATEGORIES = 10;
const MAX_INSIGHTS = 4;

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function describeChange(change: number | null, previous: number) {
  if (change === null) return previous === 0 ? "new this period" : "n/a";
  if (change === 0) return "no change";
  return change > 0 ? `up ${change}%` : `down ${Math.abs(change)}%`;
}

// Written by the app, not the model: shown when the model's summary can't be
// trusted, and when there is nothing to send to the model at all.
function fallbackSummary(stats: SpendingStats) {
  const { changePercent, totalCurrent } = stats;
  if (changePercent === null) {
    return `You have spent ${money(totalCurrent)} so far this month.`;
  }
  if (changePercent === 0) {
    return "Your spending is the same as this time last month.";
  }
  return `Your spending ${changePercent > 0 ? "increased" : "decreased"} ${Math.abs(changePercent)}% compared with this time last month.`;
}

// Numbers as they appear in text, ignoring thousands separators.
function numbersIn(text: string) {
  return (text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) =>
    Number(n.replace(/,/g, ""))
  );
}

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    const stats = await getSpendingStats(userId);

    if (stats.totalCurrent === 0 && stats.totalPrevious === 0) {
      return NextResponse.json({
        summary: "No expenses this month or last month yet.",
        insights: [],
        stats,
      });
    }

    // Every figure is calculated above; the model only turns these facts
    // into sentences. Only category names and totals are sent, never IDs or
    // transaction notes.
    const facts = [
      "Period: this month so far, compared with the same number of days of last month.",
      `Total spending: ${money(stats.totalCurrent)} (last month: ${money(stats.totalPrevious)}, ${describeChange(stats.changePercent, stats.totalPrevious)}).`,
      "Spending by category, largest first:",
      ...stats.categories
        .slice(0, MAX_CATEGORIES)
        .map(
          (c) =>
            `- ${c.name}: ${money(c.current)} (last month: ${money(c.previous)}, ${describeChange(c.changePercent, c.previous)})`
        ),
    ].join("\n");

    const prompt = [
      "You write short spending insights for a personal finance app.",
      "Use ONLY the facts below. Do not calculate, estimate or invent any number; every number you write must appear in the facts exactly.",
      "summary: one sentence about how total spending changed.",
      `insights: up to ${MAX_INSIGHTS} short bullet points about the most notable category changes and the largest category. Plain text, no bullet characters.`,
      "",
      facts,
    ].join("\n");

    const parsed = (await generateJson({
      prompt,
      schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          insights: { type: "array", items: { type: "string" } },
        },
        required: ["summary", "insights"],
      },
    })) as { summary?: unknown; insights?: unknown };

    // Never trust the model's numbers: drop any sentence that contains a
    // number the app did not give it.
    const allowed = new Set(numbersIn(facts));
    const isGrounded = (text: string) =>
      numbersIn(text).every((n) => allowed.has(n));

    const summary =
      typeof parsed.summary === "string" &&
      parsed.summary.trim() &&
      isGrounded(parsed.summary)
        ? parsed.summary.trim()
        : fallbackSummary(stats);

    const insights = (Array.isArray(parsed.insights) ? parsed.insights : [])
      .filter((i): i is string => typeof i === "string")
      .map((i) => i.trim())
      .filter((i) => i && isGrounded(i))
      .slice(0, MAX_INSIGHTS);

    return NextResponse.json({ summary, insights, stats });
  } catch (error) {
    console.error("❌ Error generating insights:", error);

    if (error instanceof AiRateLimitError) {
      return NextResponse.json(
        { error: "AI rate limit reached, try again later" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
