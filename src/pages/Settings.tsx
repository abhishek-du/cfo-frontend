import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCurrentUser,
  useCompanyProfile,
  useUpdateCompany,
  useUnmappedAccounts,
  useMappedAccounts,
  useStandardAccounts,
  useCreateAccountMapping,
  useUpdateAccountMapping,
  useDeleteAccountMapping,
} from "@/hooks/useFinancialData";

const Settings = () => {
  const queryClient = useQueryClient();
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const companyId = userData?.profile?.company_id;
  
  const { data: company, isLoading: companyLoading } = useCompanyProfile(companyId || '');
  const { data: unmappedAccounts, isLoading: unmappedLoading } = useUnmappedAccounts(companyId || '');
  const { data: mappedAccounts, isLoading: mappedLoading } = useMappedAccounts(companyId || '');
  const { data: standardAccounts } = useStandardAccounts();
  
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({});
  const [savingMapping, setSavingMapping] = useState<string | null>(null);
  const [deletingMapping, setDeletingMapping] = useState<string | null>(null);

  const updateCompany = useUpdateCompany();
  const createMapping = useCreateAccountMapping();
  const updateMapping = useUpdateAccountMapping();
  const deleteMapping = useDeleteAccountMapping();

  // Initialize form values when company data loads
  useEffect(() => {
    if (company) {
      setCompanyName(company.name || '');
      setIndustry(company.industry || '');
    }
  }, [company]);

  const handleSaveCompany = async () => {
    if (!companyId) return;
    
    try {
      await updateCompany(companyId, {
        name: companyName || company?.name,
        industry: industry || company?.industry,
      });
      
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      
      toast({
        title: "Settings Saved",
        description: "Company information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update company information.",
        variant: "destructive",
      });
    }
  };

  const handleSaveMapping = async (accountCode: string | null, accountName: string) => {
    if (!companyId || !userData?.user?.id) return;
    
    const key = `${accountCode || ''}:${accountName}`;
    const stdAccountId = selectedMappings[key];
    
    if (!stdAccountId) {
      toast({
        title: "Error",
        description: "Please select a standard account to map to.",
        variant: "destructive",
      });
      return;
    }

    setSavingMapping(key);
    
    try {
      await createMapping({
        companyId,
        clientAccountCode: accountCode,
        clientAccountName: accountName,
        stdAccountId,
        userId: userData.user.id,
      });
      
      queryClient.invalidateQueries({ queryKey: ['unmapped-accounts', companyId] });
      queryClient.invalidateQueries({ queryKey: ['mapped-accounts', companyId] });
      
      toast({
        title: "Mapping Saved",
        description: `${accountName} has been mapped successfully.`,
      });
      
      // Clear the selection
      setSelectedMappings(prev => {
        const newMappings = { ...prev };
        delete newMappings[key];
        return newMappings;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save account mapping.",
        variant: "destructive",
      });
    } finally {
      setSavingMapping(null);
    }
  };

  const handleDeleteMapping = async (mappingId: string, accountName: string) => {
    if (!companyId) return;
    
    setDeletingMapping(mappingId);
    
    try {
      await deleteMapping(mappingId);
      
      queryClient.invalidateQueries({ queryKey: ['unmapped-accounts', companyId] });
      queryClient.invalidateQueries({ queryKey: ['mapped-accounts', companyId] });
      
      toast({
        title: "Mapping Deleted",
        description: `Mapping for ${accountName} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mapping.",
        variant: "destructive",
      });
    } finally {
      setDeletingMapping(null);
    }
  };

  const groupedStandardAccounts = standardAccounts?.reduce((acc, account) => {
    if (!acc[account.category]) {
      acc[account.category] = [];
    }
    acc[account.category].push(account);
    return acc;
  }, {} as Record<string, typeof standardAccounts>);

  if (userLoading || companyLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

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
                      value={companyName || company?.name || ''}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={industry || company?.industry || ''} 
                      onValueChange={setIndustry}
                    >
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select industry" />
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
                {unmappedLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !unmappedAccounts || unmappedAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                    <p>All accounts are mapped!</p>
                    {!mappedAccounts?.length && (
                      <p className="text-sm mt-1">Upload a trial balance file to begin mapping accounts.</p>
                    )}
                  </div>
                ) : (
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
                      {unmappedAccounts.map((account) => {
                        const key = `${account.account_code || ''}:${account.account_name}`;
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">
                              {account.account_code || <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell>
                              <Select 
                                value={selectedMappings[key] || ''} 
                                onValueChange={(value) => 
                                  setSelectedMappings(prev => ({ ...prev, [key]: value }))
                                }
                              >
                                <SelectTrigger className="w-[300px]">
                                  <SelectValue placeholder="Select standard account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {groupedStandardAccounts && Object.entries(groupedStandardAccounts).map(([category, accounts]) => (
                                    <div key={category}>
                                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                                        {category.replace(/_/g, ' ')}
                                      </div>
                                      {accounts.map((stdAccount) => (
                                        <SelectItem key={stdAccount.id} value={stdAccount.id}>
                                          {stdAccount.code} - {stdAccount.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSaveMapping(account.account_code, account.account_name)}
                                disabled={!selectedMappings[key] || savingMapping === key}
                              >
                                {savingMapping === key ? 'Saving...' : 'Save'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
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
                {mappedLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : !mappedAccounts || mappedAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No account mappings yet.</p>
                    <p className="text-sm mt-1">Start by mapping unmapped accounts above.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Mapped To</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappedAccounts.map((mapping) => (
                        <TableRow key={mapping.id}>
                          <TableCell className="font-medium">
                            {mapping.client_account_code || <span className="text-muted-foreground">N/A</span>}
                          </TableCell>
                          <TableCell>{mapping.client_account_name}</TableCell>
                          <TableCell>
                            {mapping.std_accounts ? 
                              `${mapping.std_accounts.code} - ${mapping.std_accounts.name}` : 
                              'Unknown'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={mapping.confidence_score >= 0.9 ? "default" : "secondary"}>
                              {Math.round(Number(mapping.confidence_score) * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteMapping(mapping.id, mapping.client_account_name)}
                              disabled={deletingMapping === mapping.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
