-- GSO Inventory System - Sample Data Seed Script
-- This script populates the database with sample data for testing and development

-- ============================================
-- Categories
-- ============================================
INSERT INTO categories (id, name, description, date_created) VALUES
('cat-001', 'Office Supplies', 'General office supplies and stationery', NOW()),
('cat-002', 'Electronics', 'Electronic equipment and accessories', NOW()),
('cat-003', 'Furniture', 'Office furniture and fixtures', NOW()),
('cat-004', 'Cleaning Supplies', 'Cleaning materials and equipment', NOW()),
('cat-005', 'IT Equipment', 'Computer hardware and networking equipment', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Custodians
-- ============================================
INSERT INTO custodians (id, name, department, email, phone, date_created) VALUES
('cust-001', 'John Smith', 'IT Department', 'john.smith@example.com', '+1-555-0101', NOW()),
('cust-002', 'Maria Garcia', 'Administration', 'maria.garcia@example.com', '+1-555-0102', NOW()),
('cust-003', 'Robert Johnson', 'Maintenance', 'robert.johnson@example.com', '+1-555-0103', NOW()),
('cust-004', 'Lisa Wong', 'HR Department', 'lisa.wong@example.com', '+1-555-0104', NOW()),
('cust-005', 'David Brown', 'Finance', 'david.brown@example.com', '+1-555-0105', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Items
-- ============================================
INSERT INTO items (id, name, description, category_id, unit, quantity, reorder_level, unit_cost, date_created) VALUES
('item-001', 'Ballpoint Pens (Blue)', 'Standard blue ballpoint pens, box of 12', 'cat-001', 'box', 25, 10, 5.99, NOW()),
('item-002', 'A4 Paper Ream', 'White A4 copy paper, 500 sheets', 'cat-001', 'ream', 150, 50, 8.50, NOW()),
('item-003', 'Wireless Mouse', 'Logitech wireless mouse with USB receiver', 'cat-002', 'piece', 30, 10, 25.00, NOW()),
('item-004', 'Office Chair', 'Ergonomic office chair with lumbar support', 'cat-003', 'piece', 15, 5, 199.99, NOW()),
('item-005', 'Laptop - Dell XPS 15', 'Dell XPS 15, 16GB RAM, 512GB SSD', 'cat-005', 'piece', 8, 3, 1499.00, NOW()),
('item-006', 'USB Flash Drive 32GB', 'SanDisk USB 3.0 flash drive', 'cat-005', 'piece', 45, 15, 12.99, NOW()),
('item-007', 'Desk Lamp', 'LED desk lamp with adjustable brightness', 'cat-003', 'piece', 20, 8, 35.00, NOW()),
('item-008', 'Whiteboard Markers', 'Dry-erase markers, assorted colors, pack of 4', 'cat-001', 'pack', 40, 15, 8.99, NOW()),
('item-009', 'Hand Sanitizer 500ml', 'Antibacterial hand sanitizer', 'cat-004', 'bottle', 60, 20, 6.50, NOW()),
('item-010', 'Ethernet Cable 10ft', 'Cat6 ethernet cable, 10 feet', 'cat-005', 'piece', 35, 12, 9.99, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Stock Movements
-- ============================================
INSERT INTO stock_movements (id, item_id, type, quantity, custodian_id, reference_number, notes, movement_date, date_created) VALUES
('mov-001', 'item-001', 'received', 50, 'cust-002', 'PO-2024-001', 'Initial stock order from ABC Supplies', '2024-01-15', NOW()),
('mov-002', 'item-002', 'received', 200, 'cust-002', 'PO-2024-002', 'Bulk paper order for Q1', '2024-01-15', NOW()),
('mov-003', 'item-003', 'received', 40, 'cust-001', 'PO-2024-003', 'New wireless mice for staff', '2024-01-20', NOW()),
('mov-004', 'item-001', 'issued', 15, 'cust-004', 'REQ-2024-001', 'HR department restocking', '2024-02-01', NOW()),
('mov-005', 'item-002', 'issued', 30, 'cust-005', 'REQ-2024-002', 'Finance department monthly supply', '2024-02-05', NOW()),
('mov-006', 'item-003', 'issued', 5, 'cust-001', 'REQ-2024-003', 'IT equipment for new hires', '2024-02-10', NOW()),
('mov-007', 'item-005', 'received', 10, 'cust-001', 'PO-2024-004', 'New laptops for development team', '2024-02-15', NOW()),
('mov-008', 'item-004', 'received', 20, 'cust-002', 'PO-2024-005', 'Office chairs for new workspace', '2024-02-20', NOW()),
('mov-009', 'item-005', 'issued', 2, 'cust-001', 'REQ-2024-004', 'Laptops for new developers', '2024-03-01', NOW()),
('mov-010', 'item-009', 'received', 100, 'cust-003', 'PO-2024-006', 'Hand sanitizer bulk order', '2024-03-05', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Department Requests
-- ============================================
INSERT INTO department_requests (id, department, requester_name, item_id, quantity_requested, priority, status, notes, request_date, date_created) VALUES
('req-001', 'IT Department', 'John Smith', 'item-006', 20, 'high', 'approved', 'USB drives for data backup project', '2024-03-10', NOW()),
('req-002', 'Administration', 'Maria Garcia', 'item-008', 10, 'medium', 'approved', 'Whiteboard markers for meeting rooms', '2024-03-12', NOW()),
('req-003', 'HR Department', 'Lisa Wong', 'item-001', 25, 'low', 'pending', 'Pens for new employee onboarding kits', '2024-03-15', NOW()),
('req-004', 'Finance', 'David Brown', 'item-002', 15, 'medium', 'approved', 'Paper for fiscal year-end reports', '2024-03-18', NOW()),
('req-005', 'Maintenance', 'Robert Johnson', 'item-009', 30, 'high', 'pending', 'Hand sanitizer for public areas', '2024-03-20', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Physical Counts
-- ============================================
INSERT INTO physical_counts (id, count_date, conducted_by, status, notes, date_created) VALUES
('count-001', '2024-01-31', 'cust-002', 'completed', 'Monthly inventory count - January', NOW()),
('count-002', '2024-02-29', 'cust-002', 'completed', 'Monthly inventory count - February', NOW()),
('count-003', '2024-03-20', 'cust-001', 'in_progress', 'Quarterly inventory audit - Q1', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Count Details
-- ============================================
INSERT INTO count_details (id, count_id, item_id, expected_quantity, actual_quantity, variance, notes, date_created) VALUES
('detail-001', 'count-001', 'item-001', 50, 48, -2, 'Minor discrepancy, likely unreported usage', NOW()),
('detail-002', 'count-001', 'item-002', 200, 200, 0, 'Count matches system', NOW()),
('detail-003', 'count-001', 'item-003', 40, 39, -1, 'One mouse missing, reported as damaged', NOW()),
('detail-004', 'count-002', 'item-001', 48, 30, -18, 'Usage higher than expected', NOW()),
('detail-005', 'count-002', 'item-002', 200, 170, -30, 'Matches issued quantities', NOW()),
('detail-006', 'count-002', 'item-005', 10, 10, 0, 'All laptops accounted for', NOW()),
('detail-007', 'count-003', 'item-001', 30, 25, -5, 'Count in progress', NOW()),
('detail-008', 'count-003', 'item-006', 45, 45, 0, 'Count matches system', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Summary
-- ============================================
SELECT 'Seed data inserted successfully!' as message;
SELECT 'Categories: ' || COUNT(*) FROM categories;
SELECT 'Custodians: ' || COUNT(*) FROM custodians;
SELECT 'Items: ' || COUNT(*) FROM items;
SELECT 'Stock Movements: ' || COUNT(*) FROM stock_movements;
SELECT 'Department Requests: ' || COUNT(*) FROM department_requests;
SELECT 'Physical Counts: ' || COUNT(*) FROM physical_counts;
SELECT 'Count Details: ' || COUNT(*) FROM count_details;
