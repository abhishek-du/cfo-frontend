import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ratioData = {
  "current-ratio": [
    { month: "Jan", value: 2.1 },
    { month: "Feb", value: 2.2 },
    { month: "Mar", value: 2.3 },
    { month: "Apr", value: 2.2 },
    { month: "May", value: 2.4 },
    { month: "Jun", value: 2.3 },
    { month: "Jul", value: 2.4 },
    { month: "Aug", value: 2.5 },
    { month: "Sep", value: 2.4 },
    { month: "Oct", value: 2.4 },
    { month: "Nov", value: 2.5 },
    { month: "Dec", value: 2.6 },
  ],
  "gross-margin": [
    { month: "Jan", value: 40.2 },
    { month: "Feb", value: 41.1 },
    { month: "Mar", value: 40.8 },
    { month: "Apr", value: 41.5 },
    { month: "May", value: 42.0 },
    { month: "Jun", value: 42.3 },
    { month: "Jul", value: 42.1 },
    { month: "Aug", value: 42.5 },
    { month: "Sep", value: 42.8 },
    { month: "Oct", value: 42.5 },
    { month: "Nov", value: 43.0 },
    { month: "Dec", value: 43.2 },
  ],
};

export const RatioTrendChart = () => {
  const [selectedRatio, setSelectedRatio] = useState<keyof typeof ratioData>("current-ratio");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Ratio Trend (12 Months)</CardTitle>
        <Select value={selectedRatio} onValueChange={(value) => setSelectedRatio(value as keyof typeof ratioData)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-ratio">Current Ratio</SelectItem>
            <SelectItem value="gross-margin">Gross Margin %</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratioData[selectedRatio]}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name={selectedRatio === "current-ratio" ? "Current Ratio" : "Gross Margin %"}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
