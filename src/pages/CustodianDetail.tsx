import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCustodian } from "@/hooks/useCustodian";
import { useCustodians } from "@/hooks/useCustodians";
import { useStockMovements } from "@/hooks/useStockMovements";
import { toast } from "sonner";
import { Custodian } from "@/types";

export default function CustodianDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { custodian, isLoading: isLoadingCustodian } = useCustodian(id!);
  const { movements, isLoading: isLoadingMovements } = useStockMovements("issued", id);
  const { updateCustodian, deleteCustodian } = useCustodians();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    phone: "",
  });

  if (isLoadingCustodian || isLoadingMovements) {
    return <p>Loading...</p>;
  }

  if (!custodian) {
    return <p>Custodian not found.</p>;
  }

  const handleEditCustodian = () => {
    if (!formData.name || !formData.department || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }
    updateCustodian({
      id: custodian.id,
      data: {
        name: formData.name,
        department: formData.department,
        email: formData.email,
        phone: formData.phone,
      },
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteCustodian = () => {
    deleteCustodian(custodian.id);
    setIsDeleteDialogOpen(false);
    navigate("/custodians");
  };

  const openEditDialog = (custodian: Custodian) => {
    setFormData({
      name: custodian.name,
      department: custodian.department,
      email: custodian.email,
      phone: custodian.phone,
    });
    setIsEditDialogOpen(true);
  };

  const totalValue = movements.reduce((acc, movement) => {
    return acc + (movement.item ? movement.item.unitCost * movement.quantity : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditDialog(custodian)} className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {custodian.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{custodian.department}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{custodian.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{custodian.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Items Assigned</p>
              <p className="text-lg font-semibold">{movements.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-lg font-semibold">₱{totalValue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Items</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Item Name</th>
                <th className="text-left py-2">Quantity</th>
                <th className="text-left py-2">Date Issued</th>
                <th className="text-left py-2">Reference</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-b">
                  <td className="py-2">{movement.item.itemName}</td>
                  <td className="py-2">{movement.quantity}</td>
                  <td className="py-2">{movement.date}</td>
                  <td className="py-2">{movement.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Edit Custodian Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custodian</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditCustodian}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{custodian?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustodian} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
