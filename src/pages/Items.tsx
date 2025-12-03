import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InventoryItem } from "@/types";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";

export default function Items() {
  const { items, isLoading, createItem, updateItem, deleteItem } = useItems();
  const { createMovement } = useStockMovements();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    category: "",
    unit: "",
    quantity: "",
    unitCost: "",
    reorderLevel: "",
    location: "",
  });

  useEffect(() => {
    if (!isAddDialogOpen) return;

    const category = formData.category;
    if (!category || !items) return;

    const prefixMap: { [key: string]: string } = {
      "Office Supplies": "OS",
      "Equipment": "EQ",
      "PPE": "PPE",
      "Cleaning Supplies": "CS",
    };

    const prefix = prefixMap[category];
    if (!prefix) {
      setFormData(prev => ({ ...prev, itemCode: "" }));
      return;
    }

    let maxId = 0;
    items.forEach(item => {
      if (item.itemCode.startsWith(prefix + "-")) {
        const idPart = item.itemCode.split('-')[1];
        const idNum = parseInt(idPart, 10);
        if (!isNaN(idNum) && idNum > maxId) {
          maxId = idNum;
        }
      }
    });
    
    const nextId = maxId + 1;
    const newItemCode = `${prefix}-${String(nextId).padStart(3, '0')}`;

    setFormData(prev => ({ ...prev, itemCode: newItemCode }));

  }, [formData.category, items, isAddDialogOpen]);

  const filteredItems = items.filter(item =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    const quantity = parseInt(formData.quantity);
    const reorderLevel = parseInt(formData.reorderLevel);
    const status: "In Stock" | "Low Stock" | "Out of Stock" = 
      quantity === 0 ? "Out of Stock" : 
      quantity <= reorderLevel ? "Low Stock" : 
      "In Stock";

    const newItem = {
      itemCode: formData.itemCode,
      itemName: formData.itemName,
      category: formData.category,
      unit: formData.unit,
      quantity: quantity,
      unitCost: parseFloat(formData.unitCost),
      totalValue: quantity * parseFloat(formData.unitCost),
      reorderLevel: reorderLevel,
      location: formData.location,
      status: status,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    createItem.mutate(newItem);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!selectedItem) return;

    const quantity = parseInt(formData.quantity);
    const reorderLevel = parseInt(formData.reorderLevel);
    const status: "In Stock" | "Low Stock" | "Out of Stock" = 
      quantity === 0 ? "Out of Stock" : 
      quantity <= reorderLevel ? "Low Stock" : 
      "In Stock";

    const updatedData = {
      itemCode: formData.itemCode,
      itemName: formData.itemName,
      category: formData.category,
      unit: formData.unit,
      quantity: quantity,
      unitCost: parseFloat(formData.unitCost),
      totalValue: quantity * parseFloat(formData.unitCost),
      reorderLevel: reorderLevel,
      location: formData.location,
      status: status,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    updateItem.mutate({ id: selectedItem.id, data: updatedData });
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    deleteItem.mutate(selectedItem.id);
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity.toString(),
      unitCost: item.unitCost.toString(),
      reorderLevel: item.reorderLevel.toString(),
      location: item.location,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      itemCode: "",
      itemName: "",
      category: "",
      unit: "",
      quantity: "",
      unitCost: "",
      reorderLevel: "",
      location: "",
    });
    setSelectedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-success/10 text-success";
      case "Low Stock":
        return "bg-warning/10 text-warning";
      case "Out of Stock":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items Management</h1>
          <p className="text-muted-foreground mt-1">Manage your inventory items</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Items
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name, code, or category..."
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item Code</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Item Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Unit</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Unit Cost</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Value</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">{item.itemCode}</td>
                    <td className="py-3 px-4 text-sm">{item.itemName}</td>
                    <td className="py-3 px-4 text-sm">{item.category}</td>
                    <td className="py-3 px-4 text-sm">{item.unit}</td>
                    <td className="py-3 px-4 text-sm text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-right">₱{item.unitCost.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">₱{item.totalValue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(item)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCode">Item Code</Label>
                <Input
                  id="itemCode"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  placeholder="OFF-001"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="PPE">PPE</SelectItem>
                    <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                placeholder="Enter item name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs, box, ream"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Warehouse A"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₱)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-itemCode">Item Code</Label>
                <Input
                  id="edit-itemCode"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="PPE">PPE</SelectItem>
                    <SelectItem value="Cleaning Supplies">Cleaning Supplies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-itemName">Item Name</Label>
              <Input
                id="edit-itemName"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unitCost">Unit Cost (₱)</Label>
                <Input
                  id="edit-unitCost"
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedItem?.itemName}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
