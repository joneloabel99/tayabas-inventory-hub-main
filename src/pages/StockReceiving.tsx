import { useState } from "react";
import { PackagePlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StockMovement } from "@/types";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";

export default function StockReceiving() {
  const { items, updateItem } = useItems();
  const { movements, createMovement } = useStockMovements('received');

  const [formData, setFormData] = useState({
    itemId: "",
    quantity: "",
    reference: "",
    date: new Date().toISOString().split('T')[0],
    supplier: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedItem = items.find(item => item.id === formData.itemId);
    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }

    const newMovement = {
      itemId: formData.itemId,
      itemName: selectedItem.itemName,
      type: "received" as const,
      quantity: parseInt(formData.quantity),
      date: formData.date,
      reference: formData.reference,
    };

    createMovement.mutate(newMovement);

    // Update the item's quantity and status
    const newQuantity = selectedItem.quantity + parseInt(formData.quantity);
    const newTotalValue = newQuantity * selectedItem.unitCost;
    const newStatus: "In Stock" | "Low Stock" | "Out of Stock" = 
      newQuantity === 0 ? "Out of Stock" : 
      newQuantity <= selectedItem.reorderLevel ? "Low Stock" : 
      "In Stock";

    updateItem.mutate({
      id: selectedItem.id,
      data: {
        quantity: newQuantity,
        totalValue: newTotalValue,
        status: newStatus,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    });
    
    // Reset form
    setFormData({
      itemId: "",
      quantity: "",
      reference: "",
      date: new Date().toISOString().split('T')[0],
      supplier: "",
      notes: "",
    });

    toast.success("Stock received successfully");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Stock Receiving</h1>
        <p className="text-muted-foreground mt-1">Record incoming inventory items</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receiving Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackagePlus className="w-5 h-5" />
              Receive Items
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
                        {item.itemCode} - {item.itemName}
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
                  <Label htmlFor="date">Date Received</Label>
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
                <Label htmlFor="reference">Reference No. (PO/DR)</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="PO-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name"
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
                <PackagePlus className="w-4 h-4" />
                Record Receipt
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {movements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No receipts recorded yet
                </div>
              ) : (
                movements.slice(0, 10).map((movement) => (
                  <div
                    key={movement.id}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <PackagePlus className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{movement.itemName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Reference: {movement.reference}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-success flex-shrink-0">
                          +{movement.quantity}
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
