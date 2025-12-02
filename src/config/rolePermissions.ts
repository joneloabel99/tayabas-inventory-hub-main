import { UserRole } from "@/hooks/useUserRole";

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  name: string;
}

export const ROLE_UUID_MAP: Record<UserRole, string> = {
  admin: "4951a033-5127-43ca-91c9-f0422bc38f1e",
  manager: "2cf1bfb6-7ef3-4514-91ba-ad93f308933d",
  staff: "c2aea2f7-edbb-4a65-bc55-8c82ec4fc9fa",
  viewer: "647a085a-94f6-4237-a190-0f110da1b14a",
};

// Function to get role name from role ID
export function getRoleNameFromId(roleId: string): UserRole | undefined {
  const entry = Object.entries(ROLE_UUID_MAP).find(([, id]) => id === roleId);
  return entry ? (entry[0] as UserRole) : undefined;
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
