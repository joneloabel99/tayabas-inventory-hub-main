import { useState } from "react";
import { FileInput, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useItems } from "@/hooks/useItems";
import { DepartmentRequest } from "@/types";

export default function DepartmentRequests() {
  const { items } = useItems();
  const [requests, setRequests] = useState<DepartmentRequest[]>([
    {
      id: "1",
      requestDate: "2024-01-18",
      department: "Human Resources",
      requestedBy: "Juan Dela Cruz",
      items: [{
        itemId: "1",
        itemName: "A4 Bond Paper (500 sheets)",
        quantity: 20,
        purpose: "Monthly reports printing",
      }],
      status: "approved",
    },
    {
      id: "2",
      requestDate: "2024-01-19",
      department: "Finance",
      requestedBy: "Maria Santos",
      items: [{
        itemId: "2",
        itemName: "Ballpoint Pen (Blue)",
        quantity: 5,
        purpose: "Office supplies replenishment",
      }],
      status: "pending",
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: "",
    requestedBy: "",
    itemId: "",
    quantity: "",
    purpose: "",
  });

  const handleSubmit = () => {
    const selectedItem = items.find(item => item.id === formData.itemId);
    if (!selectedItem) return;

    const newRequest: DepartmentRequest = {
      id: Date.now().toString(),
      department: formData.department,
      requestedBy: formData.requestedBy,
      requestDate: new Date().toISOString().split('T')[0],
      items: [{
        itemId: formData.itemId,
        itemName: selectedItem.itemName,
        quantity: parseInt(formData.quantity),
        purpose: formData.purpose,
      }],
      status: "pending",
    };

    setRequests([newRequest, ...requests]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Request submitted successfully");
  };

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: "approved" as const }
        : req
    ));
    toast.success("Request approved");
  };

  const handleReject = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id 
        ? { ...req, status: "rejected" as const }
        : req
    ));
    toast.error("Request rejected");
  };

  const resetForm = () => {
    setFormData({
      department: "",
      requestedBy: "",
      itemId: "",
      quantity: "",
      purpose: "",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "fulfilled":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-success/10 text-success";
      case "rejected":
        return "bg-destructive/10 text-destructive";
      case "fulfilled":
        return "bg-primary/10 text-primary";
      default:
        return "bg-warning/10 text-warning";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Requests</h1>
          <p className="text-muted-foreground mt-1">Manage inventory requests from departments</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileInput className="w-5 h-5" />
            Request List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested By</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Purpose</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{request.requestDate}</td>
                    <td className="py-3 px-4 text-sm font-medium">{request.department}</td>
                    <td className="py-3 px-4 text-sm">{request.requestedBy}</td>
                    <td className="py-3 px-4 text-sm">{request.items[0]?.itemName || "N/A"}</td>
                    <td className="py-3 px-4 text-sm text-right">{request.items[0]?.quantity || 0}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{request.items[0]?.purpose || ""}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {request.status === "pending" && (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(request.id)}
                            className="h-8 text-success hover:bg-success/10"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(request.id)}
                            className="h-8 text-destructive hover:bg-destructive/10"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Request Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Department Request</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="IT Department">IT Department</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedBy">Requested By</Label>
              <Input
                id="requestedBy"
                value={formData.requestedBy}
                onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={formData.itemId} onValueChange={(value) => setFormData({ ...formData, itemId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.itemCode} - {item.itemName} (Available: {item.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Reason for request"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
