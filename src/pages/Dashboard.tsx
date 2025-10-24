import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SummaryTiles } from "@/components/dashboard/SummaryTiles";
import { RatioSections } from "@/components/dashboard/RatioSections";
import { ProfitabilityChart } from "@/components/dashboard/ProfitabilityChart";
import { RatioTrendChart } from "@/components/dashboard/RatioTrendChart";
import { AdvicePanel } from "@/components/dashboard/AdvicePanel";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");

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
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
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
            <AdvicePanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
