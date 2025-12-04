import { useState } from "react";
import { Users, Shield, UserCog, Plus, Edit, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUserManagement } from "@/hooks/useUserManagement";
import { DepartmentCombobox } from "@/components/ui/DepartmentCombobox";

export default function UserRoles() {
  const { users, isLoading, updateProfile, updateRole } = useUserManagement();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    department: "",
    role: "",
  });

  const handleEdit = async () => {
    if (!selectedUserId) return;

    try {
      await updateProfile.mutateAsync({
        userId: selectedUserId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        department: formData.department,
      });

      await updateRole.mutateAsync({
        userId: selectedUserId,
        roleName: formData.role as "admin" | "manager" | "staff" | "viewer",
      });

      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUserId(user.id);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      department: user.department || "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      department: "",
      role: "",
    });
    setSelectedUserId(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive/10 text-destructive";
      case "manager":
        return "bg-primary/10 text-primary";
      case "staff":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "manager":
        return <UserCog className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage system users and access control</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            System Users
          </CardTitle>
          <CardDescription>
            <div className="flex items-start gap-2 mt-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Role Permissions:</p>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li><Badge variant="outline" className="text-xs">Admin</Badge> - Full system access including user management</li>
                  <li><Badge variant="outline" className="text-xs">Manager</Badge> - Can approve requests and access most features</li>
                  <li><Badge variant="outline" className="text-xs">Staff</Badge> - Basic operations, inventory management</li>
                  <li><Badge variant="outline" className="text-xs">Viewer</Badge> - Read-only access to reports and data</li>
                </ul>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Access</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium">
                      {((user.first_name || '') + ' ' + (user.last_name || '')).trim() || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.department || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {user.last_access ? new Date(user.last_access).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="overflow-visible">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-first-name">First Name</Label>
              <Input
                id="edit-first-name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-last-name">Last Name</Label>
              <Input
                id="edit-last-name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full system access</SelectItem>
                  <SelectItem value="manager">Manager - Approve requests</SelectItem>
                  <SelectItem value="staff">Staff - Basic operations</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <DepartmentCombobox 
                value={formData.department}
                onChange={(value) => setFormData({ ...formData, department: value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateProfile.isPending || updateRole.isPending}>
              {updateProfile.isPending || updateRole.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
