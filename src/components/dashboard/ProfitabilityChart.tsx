import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", profit: 280000, margin: 28.5 },
  { month: "Feb", profit: 310000, margin: 29.2 },
  { month: "Mar", profit: 295000, margin: 27.8 },
  { month: "Apr", profit: 340000, margin: 30.5 },
  { month: "May", profit: 365000, margin: 31.2 },
  { month: "Jun", profit: 385000, margin: 31.8 },
  { month: "Jul", profit: 375000, margin: 30.9 },
  { month: "Aug", profit: 390000, margin: 32.1 },
  { month: "Sep", profit: 410000, margin: 33.2 },
  { month: "Oct", profit: 398000, margin: 32.0 },
  { month: "Nov", profit: 420000, margin: 33.5 },
  { month: "Dec", profit: 435000, margin: 34.1 },
];

export const ProfitabilityChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Profitability Trend (12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="profit"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Profit ($)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              name="Margin (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
