import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert, Loader2 } from "lucide-react";
import { rolePermissions, ROLES } from "@/config/rolePermissions"; // Import ROLES

const SUPER_ADMIN_ROLE_ID = "fff05402-13a6-43a4-b961-7d20a307a02e";

interface RoleGuardProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function RoleGuard({ children, permission, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRoleId = user?.role?.id;

  // Check if the user is a Super Admin or Admin
  if (userRoleId === SUPER_ADMIN_ROLE_ID || userRoleId === ROLES.ADMIN) {
    return <>{children}</>;
  }

  // Otherwise, check against specific role permissions
  const hasPermission = userRoleId ? rolePermissions[userRoleId]?.includes(permission) : false;

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}