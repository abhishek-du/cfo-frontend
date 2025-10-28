import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrentUser, usePeriods, useFileImports, useUploadTrialBalance } from "@/hooks/useFinancialData";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

const Uploads = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  
  const queryClient = useQueryClient();
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const companyId = userData?.profile?.company_id;
  const userId = userData?.user?.id;
  
  const { data: periods, isLoading: periodsLoading } = usePeriods(companyId || '');
  const { data: fileImports, isLoading: importsLoading } = useFileImports(companyId || '');
  const uploadTrialBalance = useUploadTrialBalance();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedPeriod) {
      toast({
        title: "Missing Information",
        description: "Please select a file and period before uploading.",
        variant: "destructive",
      });
      return;
    }

    if (!companyId || !userId) {
      toast({
        title: "Authentication Error",
        description: "Unable to identify user. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Only CSV files are supported at this time.",
        variant: "destructive",
      });
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

      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded and processed successfully.`,
      });
      
      // Refresh the imports list
      queryClient.invalidateQueries({ queryKey: ['file-imports', companyId] });
      
      setSelectedFile(null);
      setSelectedPeriod("");
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "An error occurred while uploading the file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "account_code,account_name,debit,credit\n1110,Cash,50000,0\n2110,Accounts Payable,0,15000";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trial_balance_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "processing":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Trial Balance</h1>
          <p className="text-muted-foreground mt-1">
            Import your trial balance data to generate financial insights
          </p>
        </div>

        {/* No periods warning */}
        {periods && periods.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No financial periods found. Please create a period in Settings before uploading trial balance data.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>New Upload</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file containing your trial balance data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Financial Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={periodsLoading || !periods || periods.length === 0}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder={periodsLoading ? "Loading periods..." : periods && periods.length === 0 ? "No periods available" : "Select period"} />
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

              <div className="space-y-2">
                <Label htmlFor="file">Trial Balance File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !selectedFile || !selectedPeriod}
                className="gap-2"
              >
                {isUploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="h-4 w-4" />Upload File</>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownloadTemplate} className="gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Required Columns:</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>account_code - Account number/code (optional)</li>
                <li>account_name - Account description (required)</li>
                <li>debit - Debit amount (0 if none)</li>
                <li>credit - Credit amount (0 if none)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Only CSV format is currently supported.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload History */}
        <Card>
          <CardHeader>
            <CardTitle>Upload History</CardTitle>
            <CardDescription>
              View past trial balance uploads and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {importsLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : fileImports && fileImports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Rows</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileImports.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell className="font-medium">{upload.filename}</TableCell>
                      <TableCell>{upload.periods?.label || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(upload.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(upload.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-success">{upload.successful_rows || 0}</span>
                        {upload.error_rows > 0 && (
                          <> / <span className="text-destructive">{upload.error_rows}</span></>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No uploads yet. Upload your first trial balance to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Uploads;
