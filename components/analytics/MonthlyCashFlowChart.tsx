"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getAnalytics, type MonthlyAnalyticsDto } from "@/lib/api/analytics";

export function MonthlyCashFlowChart() {
  const {
    data = [],
    isLoading,
    isError,
  } = useQuery<MonthlyAnalyticsDto[]>({
    queryKey: ["analytics", "monthly"],
    queryFn: getAnalytics,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monthly Cash Flow</CardTitle>

        <CardDescription>
          Income compared with expenses by month
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading && (
          <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        )}

        {isError && (
          <div className="flex h-80 items-center justify-center text-sm text-destructive">
            Failed to load analytics.
          </div>
        )}

        {!isLoading && !isError && data.length === 0 && (
          <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
            Add transactions to see your monthly cash flow.
          </div>
        )}

        {!isLoading && !isError && data.length > 0 && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="month" tickLine={false} axisLine={false} />

                <YAxis
                  width={70}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) =>
                    new Intl.NumberFormat("en-DK", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(value)
                  }
                />

                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("en-DK", {
                      style: "currency",
                      currency: "DKK",
                    }).format(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#8884d8"
                  radius={[10, 10, 0, 0]}
                />

                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="#82ca9d"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
