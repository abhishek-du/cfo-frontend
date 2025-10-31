import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useProfitabilityTrend } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfitabilityChartProps {
  companyId: string;
}

export const ProfitabilityChart = ({ companyId }: ProfitabilityChartProps) => {
  const { data, isLoading } = useProfitabilityTrend(companyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Profitability Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasInsufficientData = !data || data.length < 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Profitability Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {hasInsufficientData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            Upload more periods to see trend analysis
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString('en-US', { 
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="profit"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Net Profit ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="margin"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                name="Margin (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
