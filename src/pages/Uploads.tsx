import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Uploads = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Mock data for upload history
  const uploadHistory = [
    {
      id: "1",
      filename: "trial_balance_jan_2024.csv",
      period: "January 2024",
      status: "succeeded",
      uploadedAt: "2024-01-15 10:30 AM",
      rows: 156,
      successfulRows: 156,
      errorRows: 0,
    },
    {
      id: "2",
      filename: "trial_balance_dec_2023.xlsx",
      period: "December 2023",
      status: "succeeded",
      uploadedAt: "2023-12-20 2:15 PM",
      rows: 148,
      successfulRows: 148,
      errorRows: 0,
    },
  ];

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

    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded and is being processed.`,
      });
      setSelectedFile(null);
      setSelectedPeriod("");
    }, 2000);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Trial Balance</h1>
          <p className="text-muted-foreground mt-1">
            Import your trial balance data to generate financial insights
          </p>
        </div>

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
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">January 2024</SelectItem>
                    <SelectItem value="2023-12">December 2023</SelectItem>
                    <SelectItem value="2023-11">November 2023</SelectItem>
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
                <li>account_code - Account number/code</li>
                <li>account_name - Account description</li>
                <li>debit - Debit amount (0 if none)</li>
                <li>credit - Credit amount (0 if none)</li>
              </ul>
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
                {uploadHistory.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium">{upload.filename}</TableCell>
                    <TableCell>{upload.period}</TableCell>
                    <TableCell>{getStatusBadge(upload.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{upload.uploadedAt}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-success">{upload.successfulRows}</span>
                      {upload.errorRows > 0 && (
                        <> / <span className="text-destructive">{upload.errorRows}</span></>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Uploads;
