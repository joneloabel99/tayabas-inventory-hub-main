import { useState } from "react";
import { PackageMinus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StockMovement } from "@/types";
import { useDirectusItems } from "@/hooks/useDirectusItems";
import { useDirectusMovements } from "@/hooks/useDirectusMovements";
import { useDirectusCustodians } from "@/hooks/useDirectusCustodians";

export default function StockIssuance() {
  const { items } = useDirectusItems();
  const { movements, createMovement } = useDirectusMovements('issued');
  const { custodians } = useDirectusCustodians();

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: "",
    custodianId: "",
    reference: "",
    date: new Date().toISOString().split('T')[0],
    purpose: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedItem = items.find(item => item.id === formData.itemId);
    const selectedCustodian = custodians.find(c => c.id === formData.custodianId);
    
    if (!selectedItem || !selectedCustodian) {
      toast.error("Please select item and custodian");
      return;
    }

    const newMovement = {
      itemId: formData.itemId,
      itemName: selectedItem.itemName,
      type: "issued" as const,
      quantity: parseInt(formData.quantity),
      date: formData.date,
      reference: formData.reference,
      custodian: selectedCustodian.name,
    };

    createMovement(newMovement);
    
    // Reset form
    setFormData({
      itemId: "",
      quantity: "",
      custodianId: "",
      reference: "",
      date: new Date().toISOString().split('T')[0],
      purpose: "",
      notes: "",
    });

    toast.success("Stock issued successfully");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Issuance / RIS</h1>
        <p className="text-muted-foreground mt-1">Issue inventory items to custodians</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issuance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageMinus className="w-5 h-5" />
              Issue Items (RIS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="custodian">Custodian</Label>
                <Select value={formData.custodianId} onValueChange={(value) => setFormData({ ...formData, custodianId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select custodian" />
                  </SelectTrigger>
                  <SelectContent>
                    {custodians.map((custodian) => (
                      <SelectItem key={custodian.id} value={custodian.id}>
                        {custodian.name} - {custodian.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="date">Date Issued</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">RIS No.</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="RIS-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Purpose of issuance"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or remarks"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <PackageMinus className="w-4 h-4" />
                Issue Items
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Issuances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Issuances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No issuances recorded yet
                </div>
              ) : (
                movements.slice(0, 10).map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PackageMinus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{movement.itemName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            To: {movement.custodian}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ref: {movement.reference}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary flex-shrink-0">
                          -{movement.quantity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{movement.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
