import { RatioCard } from "./RatioCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useKPIValues } from "@/hooks/useFinancialData";

interface RatioSectionsProps {
  companyId: string;
  periodId: string;
}

const CATEGORY_TITLES: Record<string, string> = {
  liquidity: "Liquidity Ratios",
  profitability: "Profitability Ratios",
  leverage: "Leverage Ratios",
  efficiency: "Efficiency Ratios",
};

export const RatioSections = ({ companyId, periodId }: RatioSectionsProps) => {
  const { data: kpiValues, isLoading } = useKPIValues(companyId, periodId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-24" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpiValues || kpiValues.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          No KPI data available. Please compute KPIs from the Reports page.
        </p>
      </Card>
    );
  }

  // Group KPIs by category
  const groupedKPIs = kpiValues.reduce((acc, kpi) => {
    const category = kpi.kpi_catalog?.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(kpi);
    return acc;
  }, {} as Record<string, typeof kpiValues>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedKPIs).map(([category, kpis]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            {CATEGORY_TITLES[category] || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, index) => {
              const isPercentage = kpi.kpi_catalog?.display_format === 'percentage';
              const value = kpi.value || 0;
              const formattedValue = isPercentage 
                ? `${value.toFixed(1)}%` 
                : value.toFixed(2);
              
              return (
                <RatioCard
                  key={index}
                  name={kpi.kpi_catalog?.name || 'Unknown'}
                  value={formattedValue}
                  change={kpi.change_percent || 0}
                  definition={kpi.kpi_catalog?.description || ''}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
