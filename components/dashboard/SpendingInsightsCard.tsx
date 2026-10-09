"use client";

import { useMutation } from "@tanstack/react-query";
import { generateInsights } from "@/lib/api/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SpendingInsightsCard() {
  // Only runs when the user clicks "Generate insights", to stay within the
  // AI rate limit.
  const insights = useMutation({
    mutationFn: generateInsights,
  });

  const data = insights.data;
  const change = data?.stats.changePercent ?? null;

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>AI Spending Insights</CardTitle>
        <CardDescription>This month so far vs. last month</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {!data && !insights.isError && (
          <p className="text-sm text-muted-foreground">
            {insights.isPending
              ? "Analyzing your spending…"
              : "Get a quick summary of how your spending is changing."}
          </p>
        )}

        {data && (
          <>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold font-mono">
                ${data.stats.totalCurrent.toFixed(2)}
              </p>
              {change !== null && change !== 0 && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    // More spending is the bad direction.
                    change > 0 ? "text-red-500" : "text-emerald-600"
                  )}
                >
                  {change > 0 ? "▲" : "▼"} {Math.abs(change)}%
                </span>
              )}
            </div>

            <p className="text-sm">{data.summary}</p>

            {data.insights.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {data.insights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            )}
          </>
        )}

        {insights.isError && (
          <p className="text-xs text-red-500">{insights.error.message}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={insights.isPending}
          onClick={() => insights.mutate()}
        >
          {insights.isPending
            ? "Generating..."
            : data
              ? "Regenerate"
              : "Generate insights"}
        </Button>
      </CardFooter>
    </Card>
  );
}
