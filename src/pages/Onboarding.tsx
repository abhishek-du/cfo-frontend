import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Upload,
  Settings,
  BarChart3,
  Building2,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  useCurrentUser,
  useUpdateCompany,
  usePeriods,
  useUploadTrialBalance,
  useUnmappedAccounts,
  useStandardAccounts,
  useCreateAccountMapping,
} from "@/hooks/useFinancialData";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Helper toast wrappers
 *
 * - We don't assume the exact type of `toast` from "@/hooks/use-toast".
 * - These helpers try common shapes safely and avoid TypeScript errors.
 */
const notifySuccess = (message: string) => {
  const t: any = toast as any;
  // 1) if toast is a function (common), call it with message
  if (typeof t === "function") {
    try {
      t(message);
      return;
    } catch {
      // continue to try other shapes
    }
  }
  // 2) if toast.success exists
  if (t && typeof t.success === "function") {
    t.success(message);
    return;
  }
  // 3) if toast.show or toast.open exists with object signature
  if (t && typeof t.show === "function") {
    t.show({ message, type: "success" });
    return;
  }
  if (t && typeof t.open === "function") {
    t.open({ message, type: "success" });
    return;
  }
  // last fallback
  // eslint-disable-next-line no-console
  console.log("toast success:", message);
};

const notifyError = (message: string) => {
  const t: any = toast as any;
  if (typeof t === "function") {
    try {
      t(message);
      return;
    } catch {
      // ignore
    }
  }
  if (t && typeof t.error === "function") {
    t.error(message);
    return;
  }
  if (t && typeof t.show === "function") {
    t.show({ message, type: "error" });
    return;
  }
  if (t && typeof t.open === "function") {
    t.open({ message, type: "error" });
    return;
  }
  // eslint-disable-next-line no-console
  console.error("toast error:", message);
};

const steps = [
  {
    id: 0,
    title: "Company Setup",
    description: "Tell us about your company",
    icon: Building2,
    completed: false,
  },
  {
    id: 1,
    title: "Upload Trial Balance",
    description: "Import your trial balance data to get started",
    icon: Upload,
    completed: false,
  },
  {
    id: 2,
    title: "Review Mapping",
    description: "Map your accounts to our standard chart",
    icon: Settings,
    completed: false,
  },
  {
    id: 3,
    title: "View KPIs",
    description: "See your financial insights and metrics",
    icon: BarChart3,
    completed: false,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const companyId = userData?.profile?.company_id;
  const userId = userData?.user?.id;
  const updateCompany = useUpdateCompany();

  const { data: periods, isLoading: periodsLoading } = usePeriods(companyId || "");
  const uploadTrialBalance = useUploadTrialBalance();

  const { data: unmappedAccounts, isLoading: unmappedLoading } = useUnmappedAccounts(
    companyId || ""
  );
  const { data: standardAccounts } = useStandardAccounts();
  const createMapping = useCreateAccountMapping();

  const [companyData, setCompanyData] = useState<{
    companyName: string;
    industry?: string;
    fiscalYearEnd?: string;
  }>({
    companyName: "",
    industry: undefined,
    fiscalYearEnd: undefined,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedMappings, setSelectedMappings] = useState<Record<string, string>>({});
  const [savingMapping, setSavingMapping] = useState<string | null>(null);

  useEffect(() => {
    if (userData && userData.profile && userData.profile.company) {
      setCompanyData((prev) => ({
        ...prev,
        companyName: userData.profile.company.name || "",
        industry: userData.profile.company.industry || undefined,
      }));
    }
  }, [userData]);

  // safe defaults for arrays
  const periodsList = periods || [];
  const unmappedList = unmappedAccounts || [];
  const stdAccountsList = standardAccounts || [];

  useEffect(() => {
    if (periodsList.length > 0 && !selectedPeriod) {
      setSelectedPeriod(periodsList[0].id ?? "");
    }
  }, [periodsList, selectedPeriod]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCompanySetup = async () => {
    if (!companyId) {
      notifyError("Company ID not found");
      return;
    }

    if (!companyData.companyName.trim()) {
      notifyError("Please enter your company name");
      return;
    }

    setLoading(true);
    try {
      await updateCompany(companyId, {
        name: companyData.companyName.trim(),
        industry: companyData.industry?.trim() || undefined,
      });

      notifySuccess("Company details saved!");
      setCurrentStep((s) => s + 1);
    } catch (error: any) {
      notifyError(error?.message || "Failed to save company details");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTrialBalance = async () => {
    if (!selectedFile || !selectedPeriod) {
      notifyError("Please select a file and period before uploading.");
      return;
    }
    if (!companyId || !userId) {
      notifyError("Authentication error: Company ID or User ID not found.");
      return;
    }
    if (!selectedFile.name.endsWith(".csv")) {
      notifyError("Only CSV files are supported at this time.");
      return;
    }

    setIsUploading(true);
    try {
      await uploadTrialBalance({
        file: selectedFile,
        periodId: selectedPeriod,
        companyId,
        userId,
      });
      notifySuccess("Trial balance uploaded successfully!");
      setCurrentStep((s) => s + 1);
    } catch (error: any) {
      notifyError(error?.response?.data?.detail || error?.message || "Failed to upload trial balance.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMapping = async (accountCode: string | null, accountName: string) => {
    if (!companyId || !userId) return;

    const key = `${accountCode || ""}:${accountName}`;
    const stdAccountId = selectedMappings[key];

    if (!stdAccountId) {
      notifyError("Please select a standard account to map to.");
      return;
    }

    setSavingMapping(key);

    try {
      await createMapping({
        companyId,
        clientAccountCode: accountCode,
        clientAccountName: accountName,
        stdAccountId,
        userId,
      });

      notifySuccess(`${accountName} mapped successfully!`);

      // locally clear selection
      setSelectedMappings((prev) => {
        const newMappings = { ...prev };
        delete newMappings[key];
        return newMappings;
      });
    } catch (error: any) {
      notifyError(error?.response?.data?.detail || error?.message || "Failed to save mapping.");
    } finally {
      setSavingMapping(null);
    }
  };

  const handleContinue = () => {
    if (currentStep === 0) {
      handleCompanySetup();
    } else if (currentStep === 1) {
      handleUploadTrialBalance();
    } else if (currentStep === 2) {
      // Allow moving forward - mapping should be saved individually
      setCurrentStep((s) => s + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyData({
      ...companyData,
      [e.target.name]: e.target.value,
    });
  };

  // group standard accounts by category for easier selection UI
  const groupedStandardAccounts: Record<string, Array<any>> = stdAccountsList.reduce(
    (acc: Record<string, any[]>, account: any) => {
      const cat = account?.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(account);
      return acc;
    },
    {}
  );

  if (userLoading || periodsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        {/* Steps header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome — Let's get you set up</h1>
          <p className="text-sm text-muted-foreground">
            We'll walk you through company setup, uploading trial balance, mapping accounts and viewing KPIs.
          </p>
        </div>

        {/* Steps cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const Icon = step.icon;
            return (
              <Card key={step.id} className={`p-4 ${isActive ? "ring-2 ring-primary" : ""}`}>
                <div className="flex items-start space-x-3">
                  <div>
                    <div className="h-10 w-10 rounded-md flex items-center justify-center bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted ? <Badge>Done</Badge> : isActive ? <Badge>In progress</Badge> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main card for current step */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>

            {/* Step content */}
            {currentStep === 0 ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Acme Inc."
                    value={companyData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry (Optional)</Label>
                  <Input
                    id="industry"
                    name="industry"
                    type="text"
                    placeholder="Technology"
                    value={companyData.industry ?? ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End (Optional)</Label>
                  <Input
                    id="fiscalYearEnd"
                    name="fiscalYearEnd"
                    type="date"
                    value={companyData.fiscalYearEnd ?? ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : currentStep === 1 ? (
              <div className="space-y-6 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label>Choose Period</Label>
                  <Select onValueChange={(v) => setSelectedPeriod(v)} value={selectedPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodsList.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload CSV Trial Balance</Label>
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  {selectedFile ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : currentStep === 2 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Unmapped Accounts</h3>
                  <div className="text-sm text-muted-foreground">
                    {unmappedLoading ? "Loading..." : `${unmappedList.length || 0} accounts`}
                  </div>
                </div>

                {unmappedLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : unmappedList && unmappedList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Map To (Standard)</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unmappedList.map((acc: any) => {
                        const key = `${acc.code || ""}:${acc.name}`;
                        return (
                          <TableRow key={key}>
                            <TableCell>{acc.code || <span className="text-muted-foreground">—</span>}</TableCell>
                            <TableCell>{acc.name}</TableCell>
                            <TableCell>
                              <Select
                                value={selectedMappings[key] || ""}
                                onValueChange={(v) =>
                                  setSelectedMappings((prev) => ({ ...prev, [key]: v }))
                                }
                              >
                                <SelectTrigger className="w-72">
                                  <SelectValue placeholder="Select standard account" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.keys(groupedStandardAccounts).map((cat) => (
                                    <div key={cat}>
                                      <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                                        {cat}
                                      </div>
                                      {groupedStandardAccounts[cat].map((std: any) => (
                                        <SelectItem key={std.id} value={std.id}>
                                          {std.code ? `${std.code} — ${std.name}` : std.name}
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
                                onClick={() => handleSaveMapping(acc.code || null, acc.name)}
                                disabled={savingMapping === key}
                              >
                                {savingMapping === key ? "Saving..." : "Save"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <Alert>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription>
                        No unmapped accounts found. If you've uploaded a trial balance, give the system a
                        moment to process or check the upload step.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your onboarding is complete — go check your dashboard for KPIs and insights.
                  </p>
                  <div className="pt-4">
                    <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || loading || isUploading}
              >
                Previous
              </Button>

              <div className="flex space-x-2">
                <Button onClick={handleContinue} disabled={loading || isUploading}>
                  {loading || isUploading
                    ? "Working..."
                    : currentStep === steps.length - 1
                      ? "Go to Dashboard"
                      : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
