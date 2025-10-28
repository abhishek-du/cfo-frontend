import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import { RatioSections } from "@/components/dashboard/RatioSections";
import { ProfitabilityChart } from "@/components/dashboard/ProfitabilityChart";
import { RatioTrendChart } from "@/components/dashboard/RatioTrendChart";
import { AdvicePanel } from "@/components/dashboard/AdvicePanel";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { useCurrentUser, usePeriods } from "@/hooks/useFinancialData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const companyId = userData?.profile?.company_id;
  
  const { data: periods, isLoading: periodsLoading } = usePeriods(companyId || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Set first period as default when loaded
  useEffect(() => {
    if (periods && periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0].id);
    }
  }, [periods, selectedPeriod]);

  if (userLoading || periodsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!companyId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Unable to load company data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your financial performance
            </p>
          </div>
          {periods && periods.length > 0 && (
            <PeriodSelector 
              selectedPeriod={selectedPeriod} 
              onPeriodChange={setSelectedPeriod}
              periods={periods}
            />
          )}
        </div>

        {/* Summary Tiles */}
        <SummaryTiles />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Ratios and Charts */}
          <div className="xl:col-span-2 space-y-6">
            <RatioSections />
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfitabilityChart />
              <RatioTrendChart />
            </div>
          </div>

          {/* Right Column - Advice Panel */}
          <div className="xl:col-span-1">
            <AdvicePanel companyId={companyId} periodId={selectedPeriod} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
