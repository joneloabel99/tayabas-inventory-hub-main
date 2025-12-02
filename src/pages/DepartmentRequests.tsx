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
import { useDepartmentRequests } from "@/hooks/useDepartmentRequests";

export default function DepartmentRequests() {
  const { items } = useItems();
  const { requests, isLoading, createRequest, updateRequest } = useDepartmentRequests();

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
    if (!selectedItem) {
      toast.error("Please select an item.");
      return;
    }

    const requestedQuantity = parseInt(formData.quantity);

    if (requestedQuantity <= 0) {
      toast.error("Requested quantity must be greater than 0.");
      return;
    }

    if (selectedItem.quantity <= 0) {
      toast.error("Item is out of stock.");
      return;
    }

    if (requestedQuantity > selectedItem.quantity) {
      toast.error(`Requested quantity (${requestedQuantity}) exceeds available stock (${selectedItem.quantity}).`);
      return;
    }

    const newRequest = {
      department: formData.department,
      requestedBy: formData.requestedBy,
      requestDate: new Date().toISOString().split('T')[0],
      items: [{
        item_id: formData.itemId, // Send the ID of the related item using item_id
        quantity: requestedQuantity,
        purpose: formData.purpose,
      }],
      status: "pending" as const,
    };

    createRequest.mutate(newRequest);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleApprove = (id: string) => {
    updateRequest.mutate({ id, data: { status: "approved" } });
    toast.success("Request approved");
  };

  const handleReject = (id: string) => {
    updateRequest.mutate({ id, data: { status: "rejected" } });
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
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading requests...</p>
          ) : (
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
                {requests.map((request) => {
                  const requestItem = request.items[0];
                  // Ensure items are loaded before trying to find an item
                  const itemDetails = items.find(item => item.id === String(requestItem?.item_id));
                  const displayedItemName = itemDetails?.itemName || "N/A";

                  return (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{request.requestDate}</td>
                    <td className="py-3 px-4 text-sm font-medium">{request.department}</td>
                    <td className="py-3 px-4 text-sm">{request.requestedBy}</td>
                    <td className="py-3 px-4 text-sm">{displayedItemName}</td>
                    <td className="py-3 px-4 text-sm text-right">{requestItem?.quantity || 0}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">{requestItem?.purpose || ""}</td>
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
                  ); // Added this
                })}
              </tbody>
            </table>
          </div>
          )}
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
