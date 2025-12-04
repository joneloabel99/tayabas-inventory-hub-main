import { useMemo } from "react";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "manager" | "staff" | "viewer";

// This is the ID for the Administrator role that should have super admin privileges.
const SUPER_ADMIN_ROLE_ID = "fff05402-13a6-43a4-b961-7d20a307a02e";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  const isSuperAdmin = useMemo(() => {
    return user?.role?.id === SUPER_ADMIN_ROLE_ID;
  }, [user]);

  // The user role should be available directly from the user object after useAuth is properly integrated
  const role: UserRole | null = useMemo(() => {
    if (isSuperAdmin) {
      return "admin"; // Treat super admin as 'admin' for role name purposes
    }
    // The user's role is nested in the 'role' object.
    // We access it via user.role.name
    return (user?.role?.name as UserRole) || "viewer";                                                                                                                            
  }, [user, isSuperAdmin]);

  const isLoading = authLoading; // Inherit loading state from useAuth

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (isSuperAdmin) return true; // Super admin has all roles.
    if (!role) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  const canAccess = (requiredRole: UserRole | UserRole[]) => {
    if (isSuperAdmin) return true; // Super admin can access anything.
    if (!role) return false;

    const roleHierarchy: Record<UserRole, number> = {
      admin: 4,
      manager: 3,
      staff: 2,
      viewer: 1,
    };

    const userLevel = roleHierarchy[role];
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];
    const requiredLevels = requiredRoles.map((r) => roleHierarchy[r]);
    const minRequiredLevel = Math.min(...requiredLevels);

    return userLevel >= minRequiredLevel;
  };

  const isAdmin = isSuperAdmin || role === "admin";
  const isManager = isSuperAdmin || role === "manager";
  const isStaff = isSuperAdmin || role === "staff";
  const isViewer = isSuperAdmin || role === "viewer";

  return {
    role,
    isLoading,
    hasRole,
    canAccess,
    isAdmin,
    isManager,
    isStaff,
    isViewer,
    isSuperAdmin, // Also exporting this for potential direct use
  };
}
