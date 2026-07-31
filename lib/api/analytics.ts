export type MonthlyAnalyticsDto = {
  month: string;
  income: number;
  expense: number;
};

export type AnalyticsDto = MonthlyAnalyticsDto[];

export async function getAnalytics(): Promise<AnalyticsDto> {
  const res = await fetch("/api/analytics/monthly", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load analytics");
  return res.json();
}
