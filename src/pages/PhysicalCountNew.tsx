import { useState } from "react";
import { ClipboardCheck, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PhysicalCount {
  id: string;
  countDate: string;
  countedBy: string;
  location: string;
  status: "Scheduled" | "In Progress" | "Completed";
  itemsCounted: number;
  discrepanciesFound: number;
  notes: string;
}

export default function PhysicalCountNew() {
  const [counts, setCounts] = useState<PhysicalCount[]>([
    {
      id: "1",
      countDate: "2024-01-20",
      countedBy: "Juan Dela Cruz",
      location: "Warehouse A",
      status: "Completed",
      itemsCounted: 150,
      discrepanciesFound: 3,
      notes: "Annual inventory count",
    },
    {
      id: "2",
      countDate: "2024-01-15",
      countedBy: "Maria Santos",
      location: "IT Storage",
      status: "Completed",
      itemsCounted: 45,
      discrepanciesFound: 0,
      notes: "Quarterly IT equipment audit",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    countDate: "",
    countedBy: "",
    location: "",
    notes: "",
  });

  const filteredCounts = counts.filter(count =>
    count.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    count.countedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchedule = () => {
    const newCount: PhysicalCount = {
      id: Date.now().toString(),
      countDate: formData.countDate,
      countedBy: formData.countedBy,
      location: formData.location,
      status: "Scheduled",
      itemsCounted: 0,
      discrepanciesFound: 0,
      notes: formData.notes,
    };

    setCounts([newCount, ...counts]);
    setIsScheduleDialogOpen(false);
    resetForm();
    toast.success("Physical count scheduled successfully");
  };

  const resetForm = () => {
    setFormData({
      countDate: "",
      countedBy: "",
      location: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success";
      case "In Progress":
        return "bg-primary/10 text-primary";
      case "Scheduled":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Physical Count</h1>
          <p className="text-muted-foreground mt-1">Schedule and conduct physical inventory counts</p>
        </div>
        <Button onClick={() => setIsScheduleDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Count
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Physical Count Records
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by location or counter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Counted By</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Items Counted</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Discrepancies</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCounts.map((count) => (
                  <tr key={count.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{count.countDate}</td>
                    <td className="py-3 px-4 text-sm font-medium">{count.location}</td>
                    <td className="py-3 px-4 text-sm">{count.countedBy}</td>
                    <td className="py-3 px-4 text-sm text-right">{count.itemsCounted}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={count.discrepanciesFound > 0 ? "text-warning font-semibold" : ""}>
                        {count.discrepanciesFound}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(count.status)}`}>
                        {count.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{count.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Physical Count</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="countDate">Count Date</Label>
              <Input
                id="countDate"
                type="date"
                value={formData.countDate}
                onChange={(e) => setFormData({ ...formData, countDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                  <SelectItem value="IT Storage">IT Storage</SelectItem>
                  <SelectItem value="Medical Storage">Medical Storage</SelectItem>
                  <SelectItem value="Main Office">Main Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="countedBy">Counter / Assigned To</Label>
              <Input
                id="countedBy"
                value={formData.countedBy}
                onChange={(e) => setFormData({ ...formData, countedBy: e.target.value })}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Purpose or additional notes"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsScheduleDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSchedule}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
