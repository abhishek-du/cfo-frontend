import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useRatioTrend } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

const ratioOptions = [
  { code: "current_ratio", label: "Current Ratio" },
  { code: "quick_ratio", label: "Quick Ratio" },
  { code: "gross_margin", label: "Gross Margin %" },
  { code: "operating_margin", label: "Operating Margin %" },
  { code: "debt_to_equity", label: "Debt to Equity" },
  { code: "asset_turnover", label: "Asset Turnover" },
];

interface RatioTrendChartProps {
  companyId: string;
}

export const RatioTrendChart = ({ companyId }: RatioTrendChartProps) => {
  const [selectedRatio, setSelectedRatio] = useState("current_ratio");
  const { data, isLoading } = useRatioTrend(companyId, selectedRatio);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Ratio Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasInsufficientData = !data || data.length < 2;
  const selectedLabel = ratioOptions.find(r => r.code === selectedRatio)?.label || "Ratio";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Ratio Trend</CardTitle>
        <Select value={selectedRatio} onValueChange={setSelectedRatio}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ratioOptions.map(option => (
              <SelectItem key={option.code} value={option.code}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: number) => value.toLocaleString('en-US', { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name={selectedLabel}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
