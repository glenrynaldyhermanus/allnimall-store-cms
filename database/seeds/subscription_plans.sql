-- Seed Data: Default Subscription Plans
-- Date: $(date)
-- Description: Insert default subscription plans for SaaS functionality

-- =============================================
-- DEFAULT SUBSCRIPTION PLANS
-- =============================================

-- Free Plan
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    restrictions,
    is_active,
    sort_order
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Free',
    'Perfect for small pet shops getting started',
    0,
    'monthly',
    '["product_management", "basic_inventory", "customer_management", "basic_reports"]'::jsonb,
    '{
        "products": 50,
        "transactions_per_month": 100,
        "stores": 1,
        "employees": 0,
        "customers": 200
    }'::jsonb,
    '{
        "pos_access": false,
        "advanced_reports": false,
        "online_store": false,
        "api_access": false,
        "priority_support": false
    }'::jsonb,
    true,
    1
);

-- Pro Plan (Monthly)
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    restrictions,
    is_active,
    sort_order
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Pro',
    'For growing pet businesses with multiple locations',
    299000,
    'monthly',
    '["product_management", "advanced_inventory", "customer_management", "advanced_reports", "pos_access", "employee_management", "api_access"]'::jsonb,
    '{
        "products": -1,
        "transactions_per_month": -1,
        "stores": -1,
        "employees": -1,
        "customers": -1
    }'::jsonb,
    '{
        "pos_access": true,
        "advanced_reports": true,
        "online_store": false,
        "api_access": true,
        "priority_support": false
    }'::jsonb,
    true,
    2
);

-- Pro Plan (Yearly)
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    restrictions,
    is_active,
    sort_order
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Pro',
    'For growing pet businesses with multiple locations (Annual)',
    2990000,
    'yearly',
    '["product_management", "advanced_inventory", "customer_management", "advanced_reports", "pos_access", "employee_management", "api_access"]'::jsonb,
    '{
        "products": -1,
        "transactions_per_month": -1,
        "stores": -1,
        "employees": -1,
        "customers": -1
    }'::jsonb,
    '{
        "pos_access": true,
        "advanced_reports": true,
        "online_store": false,
        "api_access": true,
        "priority_support": false
    }'::jsonb,
    true,
    3
);

-- Enterprise Plan (Monthly)
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    restrictions,
    is_active,
    sort_order
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'Enterprise',
    'For large pet businesses with advanced needs',
    599000,
    'monthly',
    '["product_management", "advanced_inventory", "customer_management", "advanced_reports", "pos_access", "employee_management", "api_access", "online_store", "priority_support", "custom_integrations"]'::jsonb,
    '{
        "products": -1,
        "transactions_per_month": -1,
        "stores": -1,
        "employees": -1,
        "customers": -1
    }'::jsonb,
    '{
        "pos_access": true,
        "advanced_reports": true,
        "online_store": true,
        "api_access": true,
        "priority_support": true
    }'::jsonb,
    true,
    4
);

-- Enterprise Plan (Yearly)
INSERT INTO subscription_plans (
    id,
    name,
    description,
    price,
    billing_cycle,
    features,
    limits,
    restrictions,
    is_active,
    sort_order
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    'Enterprise',
    'For large pet businesses with advanced needs (Annual)',
    5990000,
    'yearly',
    '["product_management", "advanced_inventory", "customer_management", "advanced_reports", "pos_access", "employee_management", "api_access", "online_store", "priority_support", "custom_integrations"]'::jsonb,
    '{
        "products": -1,
        "transactions_per_month": -1,
        "stores": -1,
        "employees": -1,
        "customers": -1
    }'::jsonb,
    '{
        "pos_access": true,
        "advanced_reports": true,
        "online_store": true,
        "api_access": true,
        "priority_support": true
    }'::jsonb,
    true,
    5
);

-- =============================================
-- FEATURE FLAGS
-- =============================================

-- Feature flags for Free plan
INSERT INTO feature_flags (
    feature_name,
    plan_id,
    enabled,
    usage_limit,
    reset_period,
    description,
    category,
    is_core_feature
) VALUES 
('product_management', '00000000-0000-0000-0000-000000000001', true, 50, 'monthly', 'Manage products and inventory', 'core', true),
('basic_inventory', '00000000-0000-0000-0000-000000000001', true, 100, 'monthly', 'Basic inventory tracking', 'core', true),
('customer_management', '00000000-0000-0000-0000-000000000001', true, 200, 'monthly', 'Customer database management', 'core', true),
('basic_reports', '00000000-0000-0000-0000-000000000001', true, 10, 'monthly', 'Basic sales reports', 'reports', false),
('pos_access', '00000000-0000-0000-0000-000000000001', false, 0, 'monthly', 'Point of sale system access', 'pos', false),
('advanced_reports', '00000000-0000-0000-0000-000000000001', false, 0, 'monthly', 'Advanced analytics and reports', 'reports', false),
('online_store', '00000000-0000-0000-0000-000000000001', false, 0, 'monthly', 'Online store integration', 'ecommerce', false),
('api_access', '00000000-0000-0000-0000-000000000001', false, 0, 'monthly', 'API access for integrations', 'integration', false),
('priority_support', '00000000-0000-0000-0000-000000000001', false, 0, 'monthly', 'Priority customer support', 'support', false);

-- Feature flags for Pro plan
INSERT INTO feature_flags (
    feature_name,
    plan_id,
    enabled,
    usage_limit,
    reset_period,
    description,
    category,
    is_core_feature
) VALUES 
('product_management', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Unlimited product management', 'core', true),
('advanced_inventory', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Advanced inventory tracking', 'core', true),
('customer_management', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Unlimited customer management', 'core', true),
('advanced_reports', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Advanced analytics and reports', 'reports', true),
('pos_access', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Point of sale system access', 'pos', true),
('employee_management', '00000000-0000-0000-0000-000000000002', true, -1, 'monthly', 'Employee and staff management', 'management', true),
('api_access', '00000000-0000-0000-0000-000000000002', true, 1000, 'monthly', 'API access for integrations', 'integration', false),
('online_store', '00000000-0000-0000-0000-000000000002', false, 0, 'monthly', 'Online store integration', 'ecommerce', false),
('priority_support', '00000000-0000-0000-0000-000000000002', false, 0, 'monthly', 'Priority customer support', 'support', false);

-- Feature flags for Enterprise plan
INSERT INTO feature_flags (
    feature_name,
    plan_id,
    enabled,
    usage_limit,
    reset_period,
    description,
    category,
    is_core_feature
) VALUES 
('product_management', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Unlimited product management', 'core', true),
('advanced_inventory', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Advanced inventory tracking', 'core', true),
('customer_management', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Unlimited customer management', 'core', true),
('advanced_reports', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Advanced analytics and reports', 'reports', true),
('pos_access', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Point of sale system access', 'pos', true),
('employee_management', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Employee and staff management', 'management', true),
('api_access', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Unlimited API access', 'integration', true),
('online_store', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Online store integration', 'ecommerce', true),
('priority_support', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Priority customer support', 'support', true),
('custom_integrations', '00000000-0000-0000-0000-000000000004', true, -1, 'monthly', 'Custom integrations and white-label', 'integration', false);

-- =============================================
-- DEFAULT USER SUBSCRIPTION (Free Plan)
-- =============================================

-- Note: Default user subscriptions will be created automatically
-- when users sign up through the application
-- No need to insert default user subscriptions here
