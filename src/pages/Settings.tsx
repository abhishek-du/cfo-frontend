import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [industry, setIndustry] = useState("technology");

  // Mock unmapped accounts
  const unmappedAccounts = [
    { code: "1001", name: "Petty Cash", suggestedMapping: "1110" },
    { code: "4567", name: "Service Income", suggestedMapping: "4200" },
    { code: "6789", name: "Office Supplies", suggestedMapping: "6400" },
  ];

  // Mock mapped accounts
  const mappedAccounts = [
    { code: "1110", name: "Cash in Bank", mappedTo: "1110 - Cash & Cash Equivalents", confidence: 1.0 },
    { code: "2110", name: "Trade Payables", mappedTo: "2110 - Accounts Payable", confidence: 0.95 },
    { code: "4100", name: "Product Sales", mappedTo: "4100 - Sales Revenue", confidence: 1.0 },
  ];

  const handleSaveCompany = () => {
    toast({
      title: "Settings Saved",
      description: "Company information has been updated successfully.",
    });
  };

  const handleSaveMapping = () => {
    toast({
      title: "Mappings Saved",
      description: "Account mappings have been updated successfully.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your company profile and account mappings
          </p>
        </div>

        <Tabs defaultValue="company" className="space-y-4">
          <TabsList>
            <TabsTrigger value="company">Company Profile</TabsTrigger>
            <TabsTrigger value="mappings">Account Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="services">Professional Services</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleSaveCompany} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-4">
            {/* Unmapped Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Unmapped Accounts
                </CardTitle>
                <CardDescription>
                  Map your trial balance accounts to standard chart of accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Map To</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unmappedAccounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          <Select defaultValue={account.suggestedMapping}>
                            <SelectTrigger className="w-[280px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1110">1110 - Cash & Cash Equivalents</SelectItem>
                              <SelectItem value="1120">1120 - Accounts Receivable</SelectItem>
                              <SelectItem value="4200">4200 - Service Revenue</SelectItem>
                              <SelectItem value="6400">6400 - Administrative Expenses</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">Save</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mapped Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Mapped Accounts
                </CardTitle>
                <CardDescription>
                  Review and edit existing account mappings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Mapped To</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedAccounts.map((account) => (
                      <TableRow key={account.code}>
                        <TableCell className="font-medium">{account.code}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.mappedTo}</TableCell>
                        <TableCell>
                          <Badge variant={account.confidence >= 0.9 ? "default" : "secondary"}>
                            {Math.round(account.confidence * 100)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
