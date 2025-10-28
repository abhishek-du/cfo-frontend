import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Period {
  id: string;
  label: string;
}

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  periods: Period[];
}

export const PeriodSelector = ({ selectedPeriod, onPeriodChange, periods }: PeriodSelectorProps) => {
  return (
    <Select value={selectedPeriod} onValueChange={onPeriodChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {periods.map((period) => (
          <SelectItem key={period.id} value={period.id}>
            {period.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
