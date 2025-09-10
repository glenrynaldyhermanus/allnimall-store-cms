-- Migration: Fix RLS infinite recursion for role_assignments
-- Date: 2024-01-XX
-- Description: Fix infinite recursion in role_assignments RLS policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage role assignments" ON role_assignments;

-- The correct policies are already in place from migration 004:
-- - "Users can view own role assignments" (SELECT)
-- - "Users can insert own role assignments" (INSERT) 
-- - "Users can update own role assignments" (UPDATE)

-- These policies are simple and don't cause recursion:
-- SELECT: user_id = auth.uid()
-- INSERT: user_id = auth.uid() 
-- UPDATE: user_id = auth.uid()
