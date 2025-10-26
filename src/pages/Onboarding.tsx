import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Upload, Settings, BarChart3, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState({
    companyName: "",
    industry: "",
    fiscalYearEnd: "",
  });

  useEffect(() => {
    // Fetch user's company ID on mount
    const fetchCompanyId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setCompanyId(profile.company_id);
        }
      }
    };
    fetchCompanyId();
  }, []);

  const handleCompanySetup = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    if (!companyData.companyName.trim()) {
      toast.error("Please enter your company name");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("companies")
        .update({
          name: companyData.companyName,
          industry: companyData.industry || null,
        })
        .eq("id", companyId);

      if (error) throw error;

      toast.success("Company details saved!");
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to save company details");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentStep === 0) {
      handleCompanySetup();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Circular Vector</h1>
          <p className="text-muted-foreground">
            Let's get your account set up in a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <Card
                key={step.id}
                className={`p-6 transition-all ${
                  isActive
                    ? "ring-2 ring-primary shadow-lg"
                    : isCompleted
                    ? "bg-success/5 border-success"
                    : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-success text-white"
                          : isActive
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-primary"
                          : isCompleted
                       ? "text-success"
                       : "text-muted-foreground"
                     }`}
                   >
                     Step {step.id + 1}
                   </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h2>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
            </div>

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
                    value={companyData.industry}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYearEnd">Fiscal Year End (Optional)</Label>
                  <Input
                    id="fiscalYearEnd"
                    name="fiscalYearEnd"
                    type="date"
                    value={companyData.fiscalYearEnd}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This is a placeholder for the {steps[currentStep].title.toLowerCase()} step.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    In the full version, you'll be able to complete this step here.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={handleContinue} disabled={loading}>
                {loading ? "Saving..." : currentStep === steps.length - 1 ? "Go to Dashboard" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
