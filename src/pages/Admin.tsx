import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Admin = () => {
  const { isAdmin, isLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  // Mock KPI catalog data
  const [kpiCatalog, setKpiCatalog] = useState([
    { id: "1", code: "gross_margin", name: "Gross Margin %", category: "profitability", active: true },
    { id: "2", code: "operating_margin", name: "Operating Margin %", category: "profitability", active: true },
    { id: "3", code: "net_profit_margin", name: "Net Profit Margin %", category: "profitability", active: true },
    { id: "4", code: "current_ratio", name: "Current Ratio", category: "liquidity", active: true },
    { id: "5", code: "quick_ratio", name: "Quick Ratio", category: "liquidity", active: true },
    { id: "6", code: "debt_to_equity", name: "Debt-to-Equity", category: "leverage", active: true },
    { id: "7", code: "debt_ratio", name: "Debt Ratio", category: "leverage", active: false },
    { id: "8", code: "asset_turnover", name: "Asset Turnover", category: "efficiency", active: true },
  ]);

  // Mock standard accounts
  const standardAccounts = [
    { code: "1000", name: "Assets", category: "asset", count: 9 },
    { code: "2000", name: "Liabilities", category: "liability", count: 7 },
    { code: "3000", name: "Equity", category: "equity", count: 3 },
    { code: "4000", name: "Revenue", category: "revenue", count: 3 },
    { code: "5000", name: "Cost of Goods Sold", category: "cogs", count: 4 },
    { code: "6000", name: "Operating Expenses", category: "operating_expense", count: 6 },
  ];

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      profitability: "bg-success text-success-foreground",
      liquidity: "bg-primary text-primary-foreground",
      leverage: "bg-warning text-warning-foreground",
      efficiency: "bg-secondary text-secondary-foreground",
    };
    return colors[category] || "bg-muted";
  };

  const toggleKPI = (id: string) => {
    setKpiCatalog(prev =>
      prev.map(kpi =>
        kpi.id === id ? { ...kpi, active: !kpi.active } : kpi
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Manage KPIs, standard accounts, and system settings
          </p>
        </div>

        <Tabs defaultValue="kpis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="kpis">KPI Management</TabsTrigger>
            <TabsTrigger value="accounts">Standard Accounts</TabsTrigger>
            <TabsTrigger value="companies">Companies</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>KPI Catalog</CardTitle>
                    <CardDescription>
                      Manage available KPIs for all companies
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add KPI
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kpiCatalog.map((kpi) => (
                      <TableRow key={kpi.id}>
                        <TableCell className="font-mono text-sm">{kpi.code}</TableCell>
                        <TableCell className="font-medium">{kpi.name}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryBadge(kpi.category)}>
                            {kpi.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={kpi.active}
                              onCheckedChange={() => toggleKPI(kpi.id)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {kpi.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Standard Chart of Accounts</CardTitle>
                    <CardDescription>
                      Manage the canonical account structure
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Account
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Sub-accounts</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standardAccounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-mono text-sm font-medium">
                          {account.code}
                        </TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{account.count}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>
                  View and manage registered companies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <p>Company management coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
