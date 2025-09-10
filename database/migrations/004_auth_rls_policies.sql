-- Migration: Add RLS policies for user-related tables
-- Date: 2024-01-XX
-- Description: Enable Row Level Security for users, customers, role_assignments, and merchant_customers tables

-- Enable RLS for user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_customers ENABLE ROW LEVEL SECURITY;

-- RLS Policy for users table
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policy for customers table
-- Users can only see customers from their store (via merchant_customers table)
CREATE POLICY "Users can view store customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM role_assignments ra
            JOIN merchant_customers mc ON ra.store_id = mc.store_id
            WHERE ra.user_id = auth.uid()
            AND mc.customer_id = customers.id
            AND ra.is_active = true
            AND mc.is_active = true
        )
    );

-- Users can insert customers to their store
CREATE POLICY "Users can insert store customers" ON customers
    FOR INSERT WITH CHECK (
        -- Allow insertion if user has access to any store
        EXISTS (
            SELECT 1 FROM role_assignments ra
            WHERE ra.user_id = auth.uid()
            AND ra.is_active = true
        )
    );

-- Users can update customers from their store
CREATE POLICY "Users can update store customers" ON customers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM role_assignments ra
            JOIN merchant_customers mc ON ra.store_id = mc.store_id
            WHERE ra.user_id = auth.uid()
            AND mc.customer_id = customers.id
            AND ra.is_active = true
            AND mc.is_active = true
        )
    );

-- RLS Policy for role_assignments table
-- Users can only see their own role assignments
CREATE POLICY "Users can view own role assignments" ON role_assignments
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own role assignments (for setup store)
CREATE POLICY "Users can insert own role assignments" ON role_assignments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own role assignments
CREATE POLICY "Users can update own role assignments" ON role_assignments
    FOR UPDATE USING (user_id = auth.uid());

-- RLS Policy for merchant_customers table
-- Users can only see merchant_customers from their store
CREATE POLICY "Users can view store merchant customers" ON merchant_customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM role_assignments ra
            WHERE ra.user_id = auth.uid()
            AND ra.store_id = merchant_customers.store_id
            AND ra.is_active = true
        )
    );

-- Users can insert merchant_customers to their store
CREATE POLICY "Users can insert store merchant customers" ON merchant_customers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM role_assignments ra
            WHERE ra.user_id = auth.uid()
            AND ra.store_id = merchant_customers.store_id
            AND ra.is_active = true
        )
    );

-- Users can update merchant_customers from their store
CREATE POLICY "Users can update store merchant customers" ON merchant_customers
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM role_assignments ra
            WHERE ra.user_id = auth.uid()
            AND ra.store_id = merchant_customers.store_id
            AND ra.is_active = true
        )
    );
