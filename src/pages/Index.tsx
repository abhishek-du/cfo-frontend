import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Shield, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <BarChart3 className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Circular Vector</h1>
          </div>
          
          <h2 className="text-5xl font-bold text-foreground max-w-3xl mx-auto leading-tight">
            AI-Powered Financial Insights for SMEs
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your financial data into actionable insights. Upload your trial balance, 
            get instant KPI calculations, and receive AI-driven advice to grow your business.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Real-Time KPIs</h3>
            <p className="text-muted-foreground">
              Monitor key performance indicators with automated calculations and trend analysis
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">AI-Driven Insights</h3>
            <p className="text-muted-foreground">
              Get personalized advice and recommendations based on your financial performance
            </p>
          </div>

          <div className="text-center space-y-4 p-6 rounded-lg bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Enterprise Security</h3>
            <p className="text-muted-foreground">
              Bank-level security with row-level access control and encrypted data storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
