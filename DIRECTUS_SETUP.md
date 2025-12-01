# Directus Backend Setup Guide

## Overview
This document provides the complete Directus collections structure for the GSO Inventory Stock Management System.

## Environment Variables
Add these to your `.env` file or Directus environment:
```
VITE_DIRECTUS_URL=https://your-directus-instance.com
VITE_DIRECTUS_TOKEN=your-directus-access-token
```

## Collections Structure

### 1. **items** Collection
Main inventory items table.

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `itemCode` (String, Required, Unique)
- `itemName` (String, Required)
- `category` (String, Required)
  - Options: Office Supplies, Equipment, PPE, Cleaning Supplies, Others
- `unit` (String, Required) - e.g., "pcs", "box", "ream"
- `quantity` (Integer, Required, Default: 0)
- `unitCost` (Decimal, Required)
- `totalValue` (Decimal, Computed: quantity * unitCost)
- `reorderLevel` (Integer, Required)
- `location` (String, Required)
- `status` (String, Required)
  - Options: In Stock, Low Stock, Out of Stock
- `lastUpdated` (DateTime, Auto-updated)
- `date_created` (DateTime, Auto-generated)
- `date_updated` (DateTime, Auto-updated)

**Indexes:**
- Index on `itemCode`
- Index on `category`
- Index on `status`

---

### 2. **stock_movements** Collection
Records all stock transactions (receiving & issuance).

**Fields:**
- `id` (UUID, Primary Key, Auto-generated)
- `itemId` (Many-to-One → items)
- `itemName` (String, Mirrored from items)
- `type` (String, Required)
  - Options: received, issued
- `quantity` (Integer, Required)
- `date` (Date, Required)
- `reference` (String, Required) - PO/RIS number
- `custodian` (String, Optional) - For issuances
- `supplier` (String, Optional) - For receipts
- `purpose` (String, Optional)
- `notes` (Text, Optional)
- `date_created` (DateTime, Auto-generated)

**Indexes:**
- Index on `type`
- Index on `date`
- Index on `itemId`

**Relationships:**
- Many-to-One with `items` collection

---

### 3. **custodians** Collection
Asset holders and responsible persons.

**Fields:**
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `department` (String, Required)
- `email` (Email, Required, Unique)
- `phone` (String, Optional)
- `itemsAssigned` (Integer, Default: 0)
- `totalValue` (Decimal, Default: 0)
- `date_created` (DateTime, Auto-generated)
- `date_updated` (DateTime, Auto-updated)

**Indexes:**
- Index on `email`
- Index on `department`

---

### 4. **physical_counts** Collection
Physical inventory audit records.

**Fields:**
- `id` (UUID, Primary Key)
- `countDate` (Date, Required)
- `countedBy` (String, Required)
- `location` (String, Required)
- `status` (String, Required)
  - Options: Scheduled, In Progress, Completed
- `itemsCounted` (Integer, Default: 0)
- `discrepanciesFound` (Integer, Default: 0)
- `notes` (Text, Optional)
- `date_created` (DateTime, Auto-generated)

**Indexes:**
- Index on `countDate`
- Index on `status`

---

### 5. **count_details** Collection
Line items for each physical count.

**Fields:**
- `id` (UUID, Primary Key)
- `countId` (Many-to-One → physical_counts)
- `itemId` (Many-to-One → items)
- `systemQuantity` (Integer, Required)
- `actualQuantity` (Integer, Required)
- `variance` (Integer, Computed: actualQuantity - systemQuantity)
- `remarks` (Text, Optional)
- `date_created` (DateTime, Auto-generated)

**Relationships:**
- Many-to-One with `physical_counts`
- Many-to-One with `items`

---

### 6. **department_requests** Collection
Department requisition requests (RIS).

**Fields:**
- `id` (UUID, Primary Key)
- `requestDate` (Date, Required, Auto-generated)
- `department` (String, Required)
- `requestedBy` (String, Required)
- `itemId` (Many-to-One → items)
- `itemName` (String, Mirrored)
- `quantity` (Integer, Required)
- `purpose` (Text, Required)
- `status` (String, Required)
  - Options: Pending, Approved, Rejected, Fulfilled
- `approvedBy` (String, Optional)
- `approvedDate` (DateTime, Optional)
- `remarks` (Text, Optional)
- `date_created` (DateTime, Auto-generated)

**Indexes:**
- Index on `status`
- Index on `department`

**Relationships:**
- Many-to-One with `items`

---

### 7. **users** Collection (Directus Built-in)
Use Directus's built-in users collection with custom fields.

**Custom Fields to Add:**
- `department` (String, Required)
- `phone` (String, Optional)
- `isActive` (Boolean, Default: true)
- `lastLogin` (DateTime, Auto-updated)

**Roles:**
- Admin - Full access
- Manager - Approve requests, view reports
- Staff - CRUD operations on items
- Viewer - Read-only access

---

### 8. **categories** Collection
Item categories for filtering.

**Fields:**
- `id` (UUID, Primary Key)
- `name` (String, Required, Unique)
- `description` (Text, Optional)
- `icon` (String, Optional)
- `date_created` (DateTime, Auto-generated)

**Pre-populate with:**
- Office Supplies
- Equipment
- PPE
- Cleaning Supplies
- Others

---

### 9. **transactions** Collection (Audit Log)
Complete audit trail of all operations.

**Fields:**
- `id` (UUID, Primary Key)
- `user` (Many-to-One → directus_users)
- `action` (String, Required)
  - Options: create, update, delete
- `collection` (String, Required)
- `itemId` (String, Required)
- `oldValue` (JSON, Optional)
- `newValue` (JSON, Optional)
- `timestamp` (DateTime, Auto-generated)
- `ipAddress` (String, Optional)

---

## Analytics Aggregations

### Required Aggregates for Dashboard:

1. **Total Items Count**
```
GET /items?aggregate[count]=id
```

2. **Total Stock Value**
```
GET /items?aggregate[sum]=totalValue
```

3. **Low Stock Items**
```
GET /items?filter[quantity][_lte]=$TRIGGER[reorderLevel]&aggregate[count]=id
```

4. **Items Issued Today**
```
GET /stock_movements?filter[type][_eq]=issued&filter[date][_eq]=$TODAY&aggregate[count]=id
```

5. **Items Received Today**
```
GET /stock_movements?filter[type][_eq]=received&filter[date][_eq]=$TODAY&aggregate[count]=id
```

6. **Active Custodians**
```
GET /custodians?filter[itemsAssigned][_gt]=0&aggregate[count]=id
```

7. **Pending RIS Requests**
```
GET /department_requests?filter[status][_eq]=Pending&aggregate[count]=id
```

8. **Monthly Stock Movement**
```
GET /stock_movements?groupBy[]=month(date)&groupBy[]=type&aggregate[sum]=quantity
```

9. **Category Distribution**
```
GET /items?groupBy[]=category&aggregate[sum]=quantity
```

10. **Top 10 Issued Items**
```
GET /stock_movements?filter[type][_eq]=issued&groupBy[]=itemId&aggregate[sum]=quantity&sort[]=-quantity&limit=10
```

---

## Permissions Setup

### Admin Role:
- Full CRUD on all collections

### Manager Role:
- Read all collections
- Update: items, stock_movements, department_requests (approve)
- Create: physical_counts

### Staff Role:
- CRUD: items, stock_movements, custodians
- Read: department_requests
- Create: department_requests

### Viewer Role:
- Read-only access to all collections

---

## Workflows & Hooks

### Auto-update Inventory on Stock Movement
```javascript
// Hook: After creating stock_movement
if (type === 'received') {
  items.quantity += quantity;
} else if (type === 'issued') {
  items.quantity -= quantity;
}
items.totalValue = items.quantity * items.unitCost;
items.status = items.quantity <= items.reorderLevel ? 'Low Stock' : 'In Stock';
```

### Auto-update Custodian Stats
```javascript
// Hook: After creating/updating assignments
custodians.itemsAssigned = count of assigned items;
custodians.totalValue = sum of assigned item values;
```

---

## REST API Examples

### Create Item
```bash
POST /items
{
  "itemCode": "OFF-001",
  "itemName": "A4 Bond Paper",
  "category": "Office Supplies",
  "unit": "ream",
  "quantity": 100,
  "unitCost": 220,
  "reorderLevel": 50,
  "location": "Warehouse A"
}
```

### Record Stock Receipt
```bash
POST /stock_movements
{
  "itemId": "uuid-here",
  "type": "received",
  "quantity": 50,
  "date": "2024-01-20",
  "reference": "PO-2024-001",
  "supplier": "ABC Supplies"
}
```

### Get Dashboard Analytics
```bash
GET /items?aggregate[count]=id
GET /items?aggregate[sum]=totalValue
GET /items?filter[quantity][_lte]=reorderLevel&aggregate[count]=id
```

---

## GraphQL Examples

### Query Items with Movements
```graphql
query {
  items {
    id
    itemCode
    itemName
    quantity
    unitCost
    totalValue
    stock_movements {
      type
      quantity
      date
      reference
    }
  }
}
```

### Dashboard Analytics
```graphql
query {
  items_aggregated {
    count { id }
    sum { totalValue }
  }
  stock_movements_aggregated(filter: { type: { _eq: "issued" }, date: { _eq: "$TODAY" } }) {
    count { id }
  }
}
```

---

## Next Steps

1. Create all collections in your Directus instance
2. Set up permissions for each role
3. Configure webhooks for real-time updates (optional)
4. Import initial data (categories, locations)
5. Update frontend to use real Directus URLs
6. Test CRUD operations and analytics

---

## Support

For Directus documentation:
- https://docs.directus.io/
- REST API: https://docs.directus.io/reference/introduction
- GraphQL: https://docs.directus.io/reference/graphql
