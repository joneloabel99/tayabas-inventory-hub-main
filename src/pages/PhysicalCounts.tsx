import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PhysicalCount } from "@/types";
import { usePhysicalCounts } from "@/hooks/usePhysicalCounts";

export default function PhysicalCounts() {
  const { counts, isLoading, createCount, startCount } = usePhysicalCounts();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    countDate: "",
    countedBy: "",
    location: "GSO Storage",
    notes: "",
  });

  const filteredCounts = counts.filter(count =>
    count.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    count.countedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSchedule = () => {
    createCount({
      countDate: formData.countDate,
      countedBy: formData.countedBy,
      location: formData.location,
      status: "Scheduled",
      itemsCounted: 0,
      discrepanciesFound: 0,
      notes: formData.notes,
    });
    setIsScheduleDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      countDate: "",
      countedBy: "",
      location: "GSO Storage",
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
                  <tr key={count.id} onClick={() => {
                    if (count.status === "Scheduled") {
                      startCount(count.id, {
                        onSuccess: () => {
                          navigate(`/physical-count/${count.id}`);
                        },
                      });
                    } else {
                      navigate(`/physical-count/${count.id}`);
                    }
                  }} className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer">
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
              <Input
                id="location"
                value={formData.location}
                onChange={() => {}} // Disabled, so no change handler needed
                readOnly // Make it read-only
                disabled // Visually disable it
                required
              />
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
