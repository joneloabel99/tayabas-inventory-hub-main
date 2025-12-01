export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  reorderLevel: number;
  location: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "received" | "issued";
  quantity: number;
  date: string;
  reference: string;
  custodian?: string;
}

export interface Custodian {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  itemsAssigned: number;
  totalValue: number;
}

export interface DepartmentRequest {
  id: string;
  department: string;
  requestedBy: string;
  requestDate: string;
  items: RequestItem[];
  status: "pending" | "approved" | "rejected" | "fulfilled";
  remarks?: string;
  // Legacy fields for backward compatibility
  itemId?: string;
  itemName?: string;
  quantity?: number;
  purpose?: string;
  approvedBy?: string;
}

export interface RequestItem {
  itemId: string;
  itemName: string;
  quantity: number;
  purpose: string;
}
