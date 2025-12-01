import { UserRole } from "@/hooks/useUserRole";

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  name: string;
}

export const routePermissions: RoutePermission[] = [
  {
    path: "/",
    allowedRoles: ["admin", "manager", "staff", "viewer"],
    name: "Dashboard",
  },
  {
    path: "/items",
    allowedRoles: ["admin", "manager", "staff"],
    name: "Items Management",
  },
  {
    path: "/receiving",
    allowedRoles: ["admin", "manager", "staff"],
    name: "Stock Receiving",
  },
  {
    path: "/issuance",
    allowedRoles: ["admin", "manager", "staff"],
    name: "Stock Issuance",
  },
  {
    path: "/custodians",
    allowedRoles: ["admin", "manager", "staff", "viewer"],
    name: "Custodians",
  },
  {
    path: "/stock-card",
    allowedRoles: ["admin", "manager", "staff", "viewer"],
    name: "Stock Card",
  },
  {
    path: "/physical-count",
    allowedRoles: ["admin", "manager", "staff"],
    name: "Physical Count",
  },
  {
    path: "/requests",
    allowedRoles: ["admin", "manager"],
    name: "Department Requests",
  },
  {
    path: "/users",
    allowedRoles: ["admin"],
    name: "User Roles",
  },
  {
    path: "/settings",
    allowedRoles: ["admin", "manager", "staff", "viewer"],
    name: "Settings",
  },
];

export function getRoutePermission(path: string): RoutePermission | undefined {
  return routePermissions.find((route) => route.path === path);
}

export function canAccessRoute(path: string, userRole: UserRole | null): boolean {
  if (!userRole) return false;
  
  const permission = getRoutePermission(path);
  if (!permission) return true; // Allow access to routes not in the list
  
  return permission.allowedRoles.includes(userRole);
}
