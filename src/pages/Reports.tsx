import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock mapped trial balance data
  const trialBalanceData = [
    { code: "1110", name: "Cash & Cash Equivalents", clientCode: "1001", debit: 125000, credit: 0, balance: 125000 },
    { code: "1120", name: "Accounts Receivable", clientCode: "1200", debit: 85000, credit: 0, balance: 85000 },
    { code: "1130", name: "Inventory", clientCode: "1300", debit: 65000, credit: 0, balance: 65000 },
    { code: "2110", name: "Accounts Payable", clientCode: "2001", debit: 0, credit: 45000, balance: -45000 },
    { code: "2130", name: "Short-term Debt", clientCode: "2100", debit: 0, credit: 35000, balance: -35000 },
    { code: "3200", name: "Retained Earnings", clientCode: "3000", debit: 0, credit: 95000, balance: -95000 },
    { code: "4100", name: "Sales Revenue", clientCode: "4000", debit: 0, credit: 425000, balance: -425000 },
    { code: "5000", name: "Cost of Goods Sold", clientCode: "5000", debit: 255000, credit: 0, balance: 255000 },
    { code: "6100", name: "Salaries & Wages", clientCode: "6001", debit: 85000, credit: 0, balance: 85000 },
    { code: "6200", name: "Rent & Utilities", clientCode: "6100", debit: 35000, credit: 0, balance: 35000 },
  ];

  // Mock KPI summary data
  const kpiSummaryData = [
    { kpi: "Gross Margin %", current: "40.0%", prev: "38.5%", change: "+1.5%", trend: "up" },
    { kpi: "Operating Margin %", current: "20.0%", prev: "18.2%", change: "+1.8%", trend: "up" },
    { kpi: "Net Profit Margin %", current: "15.5%", prev: "14.1%", change: "+1.4%", trend: "up" },
    { kpi: "Current Ratio", current: "2.35", prev: "2.18", change: "+0.17", trend: "up" },
    { kpi: "Quick Ratio", current: "1.85", prev: "1.72", change: "+0.13", trend: "up" },
    { kpi: "Debt-to-Equity", current: "0.42", prev: "0.48", change: "-0.06", trend: "down" },
  ];

  const filteredTrialBalance = trialBalanceData.filter(
    (row) =>
      row.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.clientCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Standard Code", "Account Name", "Client Code", "Debit", "Credit", "Balance"];
    const rows = filteredTrialBalance.map((row) => [
      row.code,
      row.name,
      row.clientCode,
      row.debit.toFixed(2),
      row.credit.toFixed(2),
      row.balance.toFixed(2),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial_balance_${selectedPeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
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
                      Trial balance with mapped standard accounts for {selectedPeriod}
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportCSV} className="gap-2">
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

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Standard Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Client Code</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrialBalance.map((row) => (
                        <TableRow key={row.code}>
                          <TableCell className="font-medium">{row.code}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell className="text-muted-foreground">{row.clientCode}</TableCell>
                          <TableCell className="text-right font-mono">
                            {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(row.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                      Key performance indicators for {selectedPeriod}
                    </CardDescription>
                  </div>
                  <Button onClick={handleExportCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
                      {kpiSummaryData.map((kpi) => (
                        <TableRow key={kpi.kpi}>
                          <TableCell className="font-medium">{kpi.kpi}</TableCell>
                          <TableCell className="text-right font-mono">{kpi.current}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {kpi.prev}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span
                              className={
                                kpi.trend === "up"
                                  ? "text-success"
                                  : "text-muted-foreground"
                              }
                            >
                              {kpi.change}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
