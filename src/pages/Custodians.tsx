import { useState, useMemo } from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCustodians } from "@/hooks/useCustodians";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useItems } from "@/hooks/useItems";
import { useStockMovements } from "@/hooks/useStockMovements";

export default function Custodians() {
  const navigate = useNavigate();
  const { custodians, isLoading: isLoadingCustodians, createCustodian } = useCustodians();
  const { items, isLoading: isLoadingItems } = useItems();
  const { movements, isLoading: isLoadingMovements } = useStockMovements();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    phone: "",
  });

  const handleAddCustodian = () => {
    if (!formData.name || !formData.department || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createCustodian({
      name: formData.name,
      department: formData.department,
      email: formData.email,
      phone: formData.phone,
      itemsAssigned: 0,
      totalValue: 0,
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      email: "",
      phone: "",
    });
  };

  const custodiansWithCalculatedValues = useMemo(() => {
    if (isLoadingCustodians || isLoadingItems || isLoadingMovements || !custodians || !items || !movements) return [];

    return custodians.map(custodian => {
      let itemsAssigned = 0;
      let totalValue = 0;

      const custodianMovements = movements.filter(m => m.custodian?.id === custodian.id);

      custodianMovements.forEach(movement => {
        if (movement.type === 'issued') {
          itemsAssigned += movement.quantity;
          const item = items.find(i => i.id === movement.item.id);
          if (item) {
            totalValue += movement.quantity * item.unitCost;
          }
        }
      });

      return {
        ...custodian,
        itemsAssigned,
        totalValue,
      };
    });
  }, [custodians, items, movements, isLoadingCustodians, isLoadingItems, isLoadingMovements]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custodians</h1>
          <p className="text-muted-foreground mt-1">Manage custodians and assigned assets</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Custodian
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Custodians
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCustodians || isLoadingItems || isLoadingMovements ? (
            <p className="text-center text-muted-foreground">Loading custodians...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {custodiansWithCalculatedValues.map((custodian) => (
              <Card 
                key={custodian.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/custodians/${custodian.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {custodian.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{custodian.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{custodian.department}</p>
                      <p className="text-xs text-muted-foreground mt-1">{custodian.email}</p>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Items Assigned</p>
                          <p className="text-lg font-semibold text-foreground">{custodian.itemsAssigned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="text-lg font-semibold text-foreground">₱{(custodian.totalValue / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Add Custodian Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Custodian</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Custodian's Full Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Department Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+63-xxx-xxxxxxx"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddCustodian}>
              Add Custodian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
