import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RatioCardProps {
  name: string;
  value: string;
  change: number;
  definition: string;
}

export const RatioCard = ({ name, value, change, definition }: RatioCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{name}</p>
              <div className="flex items-baseline justify-between">
                <h4 className="text-xl font-bold text-foreground">{value}</h4>
                <div className="flex items-center gap-1">
                  {change >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs font-medium text-success">+{change}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      <span className="text-xs font-medium text-destructive">{change}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
