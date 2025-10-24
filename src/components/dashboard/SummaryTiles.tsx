import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TileData {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
}

const tiles: TileData[] = [
  { title: "Total Revenue", value: "$1,245,820", change: 12.5, changeLabel: "vs last period" },
  { title: "Total Cost", value: "$847,340", change: 8.2, changeLabel: "vs last period" },
  { title: "Profit / Loss", value: "$398,480", change: 24.3, changeLabel: "vs last period" },
  { title: "Margin %", value: "32.0%", change: 3.4, changeLabel: "vs last period" },
];

export const SummaryTiles = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{tile.title}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-foreground">{tile.value}</h3>
            </div>
            <div className="flex items-center gap-1 text-sm">
              {tile.change >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">+{tile.change}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="font-medium text-destructive">{tile.change}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">{tile.changeLabel}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
