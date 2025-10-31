import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinancialSummary } from "@/hooks/useFinancialData";

interface SummaryTilesProps {
  companyId: string;
  periodId: string;
}

export const SummaryTiles = ({ companyId, periodId }: SummaryTilesProps) => {
  const { data: summary, isLoading } = useFinancialSummary(companyId, periodId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          No financial data available for this period. Please upload a trial balance.
        </p>
      </Card>
    );
  }

  const totalIncome = Math.abs(summary.total_revenue || 0) + Math.abs(summary.total_other_income || 0);
  const totalExpenses = Math.abs(summary.total_cogs || 0) + 
                        Math.abs(summary.total_opex || 0) + 
                        Math.abs(summary.total_other_expense || 0);
  const netProfit = summary.net_profit || 0;
  const netMargin = summary.margin_percent || 0;

  const tiles = [
    {
      title: "Total Income",
      value: `$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: 0,
    },
    {
      title: "Total Expenses",
      value: `$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: 0,
    },
    {
      title: "Net Profit",
      value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: 0,
    },
    {
      title: "Net Margin %",
      value: `${netMargin.toFixed(1)}%`,
      change: 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{tile.title}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-foreground">{tile.value}</h3>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
