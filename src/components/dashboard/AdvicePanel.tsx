import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, Bookmark, X } from "lucide-react";

interface AdviceItem {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
}

const adviceItems: AdviceItem[] = [
  {
    id: "1",
    severity: "warning",
    title: "Cash Flow Attention Needed",
    description: "Your cash flow has been negative for two consecutive months. Consider reviewing payment terms with customers or reducing non-essential expenses.",
  },
  {
    id: "2",
    severity: "info",
    title: "Margin Improvement",
    description: "Your profit margin has improved by 6% since last quarter. This is a great time to consider reinvesting in marketing while maintaining cost control.",
  },
  {
    id: "3",
    severity: "critical",
    title: "Gross Margin Below Target",
    description: "Gross margin has fallen below 30% for two consecutive periods. Review supplier contracts or pricing strategy to address this decline.",
  },
];

const severityConfig = {
  info: { icon: Info, color: "text-accent", bg: "bg-accent/10", label: "Info" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Warning" },
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Critical" },
};

export const AdvicePanel = () => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
          <Badge variant="secondary">{adviceItems.length} insights</Badge>
        </div>

        <div className="space-y-3">
          {adviceItems.map((item) => {
            const config = severityConfig[item.severity];
            const Icon = config.icon;

            return (
              <Card key={item.id} className={`p-4 ${config.bg} border-l-4 border-l-current ${config.color}`}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5 flex-shrink-0`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Bookmark className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
