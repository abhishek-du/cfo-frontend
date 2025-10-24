import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Upload, Settings, BarChart3 } from "lucide-react";

const steps = [
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

  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Circular Vector</h1>
          <p className="text-muted-foreground">
            Let's get your account set up in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Step {step.id}
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

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={handleContinue}>
                {currentStep === steps.length - 1 ? "Go to Dashboard" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Onboarding;
