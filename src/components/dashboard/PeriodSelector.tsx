import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

export const PeriodSelector = ({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    label: "",
    startDate: "",
    endDate: "",
  });

  // Mock periods - in real app, fetch from database
  const periods = [
    { id: "2024-01", label: "January 2024" },
    { id: "2023-12", label: "December 2023" },
    { id: "2023-11", label: "November 2023" },
  ];

  const handleCreatePeriod = () => {
    if (!newPeriod.label || !newPeriod.startDate || !newPeriod.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // In real app, save to database
    toast({
      title: "Period Created",
      description: `${newPeriod.label} has been created successfully`,
    });

    setIsOpen(false);
    setNewPeriod({ label: "", startDate: "", endDate: "" });
  };

  return (
    <div className="flex items-center gap-2">
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Period</DialogTitle>
            <DialogDescription>
              Add a new financial reporting period
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Period Label</Label>
              <Input
                id="label"
                placeholder="e.g., January 2024"
                value={newPeriod.label}
                onChange={(e) => setNewPeriod({ ...newPeriod, label: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newPeriod.startDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newPeriod.endDate}
                  onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePeriod}>Create Period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
