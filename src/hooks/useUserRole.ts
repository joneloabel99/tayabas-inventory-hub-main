import { useMemo } from "react";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "manager" | "staff" | "viewer";

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();

  // The user role should be available directly from the user object after useAuth is properly integrated
  const role: UserRole | null = useMemo(() => {
    // Assuming 'role' is a field directly on the Directus User object
    // Or it might be nested, depending on Directus configuration.
    // For now, casting it assuming it's directly available.
    // If user.role is null or undefined, default to 'viewer' or null
    return (user?.role as UserRole) || null;
  }, [user]);

  const isLoading = authLoading; // Inherit loading state from useAuth

  const hasRole = (requiredRole: UserRole | UserRole[]) => {
    if (!role) return false;
    
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role);
  };

  const canAccess = (requiredRole: UserRole | UserRole[]) => {
    if (!role) return false;

    const roleHierarchy: Record<UserRole, number> = {
      admin: 4,
      manager: 3,
      staff: 2,
      viewer: 1,
    };

    const userLevel = roleHierarchy[role];
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const requiredLevels = requiredRoles.map(r => roleHierarchy[r]);
    const minRequiredLevel = Math.min(...requiredLevels);

    return userLevel >= minRequiredLevel;
  };

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isStaff = role === "staff";
  const isViewer = role === "viewer";

  return {
    role,
    isLoading,
    hasRole,
    canAccess,
    isAdmin,
    isManager,
    isStaff,
    isViewer,
  };
}
