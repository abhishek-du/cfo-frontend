import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentUser, usePeriods, useMappedTrialBalance, useKPIValues } from "@/hooks/useFinancialData";

const Reports = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const companyId = currentUser?.profile?.company_id;
  
  const { data: periods, isLoading: periodsLoading } = usePeriods(companyId || "");
  const { data: trialBalanceData, isLoading: tbLoading } = useMappedTrialBalance(companyId || "", selectedPeriod);
  const { data: kpiData, isLoading: kpiLoading } = useKPIValues(companyId || "", selectedPeriod);

  // Set first period as default when periods load
  useEffect(() => {
    if (periods && periods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periods[0].id);
    }
  }, [periods, selectedPeriod]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !currentUser) {
      navigate("/login");
    }
  }, [currentUser, userLoading, navigate]);

  const filteredTrialBalance = (trialBalanceData || []).filter(
    (row) =>
      row.std_account_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.std_account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.client_account_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.client_account_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportTrialBalanceCSV = () => {
    if (!trialBalanceData || trialBalanceData.length === 0) return;
    
    const headers = ["Standard Code", "Account Name", "Client Code", "Client Account Name", "Debit", "Credit", "Balance"];
    const rows = filteredTrialBalance.map((row) => [
      row.std_account_code,
      row.std_account_name,
      row.client_account_code,
      row.client_account_name,
      row.total_debit?.toFixed(2) || "0.00",
      row.total_credit?.toFixed(2) || "0.00",
      row.net_balance?.toFixed(2) || "0.00",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const periodLabel = periods?.find(p => p.id === selectedPeriod)?.label || selectedPeriod;
    a.download = `trial_balance_${periodLabel}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportKPICSV = () => {
    if (!kpiData || kpiData.length === 0) return;
    
    const headers = ["KPI", "Current Period", "Previous Period", "Change %"];
    const rows = kpiData.map((kpi: any) => [
      kpi.kpi_catalog?.name,
      formatKPIValue(kpi.value, kpi.kpi_catalog?.display_format),
      formatKPIValue(kpi.previous_period_value, kpi.kpi_catalog?.display_format),
      kpi.change_percent ? `${kpi.change_percent.toFixed(2)}%` : "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const periodLabel = periods?.find(p => p.id === selectedPeriod)?.label || selectedPeriod;
    a.download = `kpi_summary_${periodLabel}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  const formatKPIValue = (value: number | null | undefined, format: string | undefined) => {
    if (value === null || value === undefined) return "N/A";
    
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "currency":
        return formatCurrency(value);
      case "decimal":
      default:
        return value.toFixed(2);
    }
  };

  if (userLoading || periodsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const selectedPeriodLabel = periods?.find(p => p.id === selectedPeriod)?.label || "";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              View and export your financial reports
            </p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods?.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="trial-balance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trial-balance">Mapped Trial Balance</TabsTrigger>
            <TabsTrigger value="kpi-summary">KPI Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="trial-balance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Mapped Trial Balance</CardTitle>
                    <CardDescription>
                      Trial balance with mapped standard accounts for {selectedPeriodLabel}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleExportTrialBalanceCSV} 
                    className="gap-2"
                    disabled={!trialBalanceData || trialBalanceData.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by code or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>

                {tbLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !trialBalanceData || trialBalanceData.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No trial balance data available for this period. Please upload trial balance data from the Uploads page.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Standard Code</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Client Code</TableHead>
                          <TableHead>Client Account Name</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrialBalance.map((row, idx) => (
                          <TableRow key={`${row.std_account_code}-${idx}`}>
                            <TableCell className="font-medium">{row.std_account_code}</TableCell>
                            <TableCell>{row.std_account_name}</TableCell>
                            <TableCell className="text-muted-foreground">{row.client_account_code}</TableCell>
                            <TableCell className="text-muted-foreground">{row.client_account_name}</TableCell>
                            <TableCell className="text-right font-mono">
                              {row.total_debit && row.total_debit > 0 ? formatCurrency(row.total_debit) : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {row.total_credit && row.total_credit > 0 ? formatCurrency(row.total_credit) : "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium">
                              {formatCurrency(row.net_balance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpi-summary" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>KPI Summary</CardTitle>
                    <CardDescription>
                      Key performance indicators for {selectedPeriodLabel}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleExportKPICSV} 
                    className="gap-2"
                    disabled={!kpiData || kpiData.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {kpiLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !kpiData || kpiData.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No KPI data available for this period. KPIs are computed automatically after uploading and mapping trial balance data.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>KPI</TableHead>
                          <TableHead className="text-right">Current Period</TableHead>
                          <TableHead className="text-right">Previous Period</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpiData.map((kpi: any) => (
                          <TableRow key={kpi.kpi_catalog?.code}>
                            <TableCell className="font-medium">{kpi.kpi_catalog?.name}</TableCell>
                            <TableCell className="text-right font-mono">
                              {formatKPIValue(kpi.value, kpi.kpi_catalog?.display_format)}
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {formatKPIValue(kpi.previous_period_value, kpi.kpi_catalog?.display_format)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {kpi.change_percent !== null && kpi.change_percent !== undefined ? (
                                <span
                                  className={
                                    kpi.change_percent > 0
                                      ? "text-success"
                                      : kpi.change_percent < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {kpi.change_percent > 0 ? "+" : ""}{kpi.change_percent.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
