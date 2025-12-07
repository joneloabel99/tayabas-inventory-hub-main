import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import { PERMISSIONS } from "./rolePermissions";

export const navigationLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD },
  { name: "Items Management", href: "/items", icon: Package, permission: PERMISSIONS.ITEMS_MANAGEMENT },
  { name: "Stock Receiving", href: "/stock-receiving", icon: PackagePlus, permission: PERMISSIONS.STOCK_RECEIVING },
  { name: "Stock Issuance", href: "/stock-issuance", icon: PackageMinus, permission: PERMISSIONS.STOCK_ISSUANCE },
  { name: "Custodians", href: "/custodians", icon: Users, permission: PERMISSIONS.CUSTODIANS },
  { name: "Stock Card", href: "/stock-card", icon: FileText, permission: PERMISSIONS.STOCK_CARD },
  { name: "Physical Count", href: "/physical-count", icon: ClipboardCheck, permission: PERMISSIONS.PHYSICAL_COUNT },
  { name: "Department Requests", href: "/department-requests", icon: FileText, permission: PERMISSIONS.DEPT_REQUESTS },
  { name: "User Roles", href: "/user-roles", icon: Users, permission: PERMISSIONS.USER_ROLES },
  { name: "Settings", href: "/settings", icon: Settings, permission: PERMISSIONS.SETTINGS },
];
