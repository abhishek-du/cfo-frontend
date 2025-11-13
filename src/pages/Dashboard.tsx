import { useState, useEffect } from "react";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import { RatioSections } from "@/components/dashboard/RatioSections";
import { ProfitabilityChart } from "@/components/dashboard/ProfitabilityChart";
import { RatioTrendChart } from "@/components/dashboard/RatioTrendChart";
import { AdvicePanel } from "@/components/dashboard/AdvicePanel";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { useAuth } from "@/hooks/use-auth";
import { usePeriods } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { user, loading: userLoading } = useAuth();
  const companyId = user?.company_id;

  const { data: periods, isLoading: periodsLoading } = usePeriods(companyId || '');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  // Set first period as default when loaded
  useEffect(() => {
    if (periods && periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0].id);
    }
  }, [periods, selectedPeriod]);

  if (userLoading || periodsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Unable to load company data</p>
      </div>
    );
  }

  return (
    // ✅ FIXED: Removed <DashboardLayout> wrapper
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial performance</p>
      </div>

      {periods && periods.length > 0 && (
        <PeriodSelector
          periods={periods}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
        />
      )}

      {/* Summary Tiles */}
      {selectedPeriod && (
        <SummaryTiles periodId={selectedPeriod} companyId={companyId} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ratios and Charts */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPeriod && (
            <RatioSections periodId={selectedPeriod} companyId={companyId} />
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfitabilityChart periodId={selectedPeriod} companyId={companyId} />
            <RatioTrendChart companyId={companyId} />
          </div>
        </div>

        {/* Right Column - Advice Panel */}
        <div>
          <AdvicePanel periodId={selectedPeriod} companyId={companyId} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
