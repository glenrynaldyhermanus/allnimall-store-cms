-- Migration: Add database functions for user profile & permissions
-- Date: 2024-01-XX
-- Description: Create functions for user profile retrieval and permission checks

-- Function to get user profile with role and store information
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    role_id UUID,
    role_name TEXT,
    store_id UUID,
    store_name TEXT,
    merchant_id UUID,
    merchant_name TEXT,
    is_active BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email,
        u.full_name,
        u.phone,
        ra.role_id,
        r.name as role_name,
        ra.store_id,
        s.name as store_name,
        ra.merchant_id,
        m.name as merchant_name,
        ra.is_active
    FROM users u
    LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.is_active = true
    LEFT JOIN roles r ON ra.role_id = r.id
    LEFT JOIN stores s ON ra.store_id = s.id
    LEFT JOIN merchants m ON ra.merchant_id = m.id
    WHERE u.id = user_uuid;
END;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
    user_uuid UUID,
    permission_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM role_assignments ra
        JOIN roles r ON ra.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ra.user_id = user_uuid
        AND ra.is_active = true
        AND p.name = permission_name
        AND rp.is_active = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$;

-- Function to check if user has access to specific store
CREATE OR REPLACE FUNCTION user_has_store_access(
    user_uuid UUID,
    store_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM role_assignments ra
        WHERE ra.user_id = user_uuid
        AND ra.store_id = store_uuid
        AND ra.is_active = true
    ) INTO has_access;
    
    RETURN has_access;
END;
$$;

-- Function to get user's accessible stores
CREATE OR REPLACE FUNCTION get_user_stores(user_uuid UUID)
RETURNS TABLE (
    store_id UUID,
    store_name TEXT,
    merchant_id UUID,
    merchant_name TEXT,
    role_id UUID,
    role_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name as store_name,
        s.merchant_id,
        m.name as merchant_name,
        ra.role_id,
        r.name as role_name
    FROM role_assignments ra
    JOIN stores s ON ra.store_id = s.id
    JOIN merchants m ON s.merchant_id = m.id
    JOIN roles r ON ra.role_id = r.id
    WHERE ra.user_id = user_uuid
    AND ra.is_active = true;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM role_assignments ra
        JOIN roles r ON ra.role_id = r.id
        WHERE ra.user_id = user_uuid
        AND ra.is_active = true
        AND r.name = 'admin'
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$;

-- Function to get user's current role in specific store
CREATE OR REPLACE FUNCTION get_user_store_role(
    user_uuid UUID,
    store_uuid UUID
)
RETURNS TABLE (
    role_id UUID,
    role_name TEXT,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ra.role_id,
        r.name as role_name,
        ra.is_active
    FROM role_assignments ra
    JOIN roles r ON ra.role_id = r.id
    WHERE ra.user_id = user_uuid
    AND ra.store_id = store_uuid
    AND ra.is_active = true;
END;
$$;
