import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "admin" | "manager" | "staff" | "viewer";

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return "viewer" as UserRole;
      }

      return data.role as UserRole;
    },
    enabled: !!user,
  });

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
