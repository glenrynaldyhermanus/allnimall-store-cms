-- Week 4: Plan Restrictions and Feature Flag System
-- Migration for basic plan restrictions implementation

-- =============================================
-- FEATURE FLAGS SEED DATA
-- =============================================

-- Insert feature flags for different plans
INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature) VALUES
-- Free tier features
('basic_product_management', NULL, true, 10, 'monthly', 'Basic product management with limited features', 'product_management', true),
('basic_store_management', NULL, true, 1, 'monthly', 'Basic store management', 'store_management', true),
('basic_user_management', NULL, true, 2, 'monthly', 'Basic user management', 'user_management', true),
('basic_customer_management', NULL, true, 100, 'monthly', 'Basic customer management', 'customer_management', true),
('basic_sales_management', NULL, true, 50, 'monthly', 'Basic sales management', 'sales_management', true),
('basic_inventory_management', NULL, true, 50, 'monthly', 'Basic inventory management', 'inventory_management', true),

-- Premium tier features (unlimited or higher limits)
('advanced_product_management', NULL, true, -1, 'monthly', 'Advanced product management with unlimited features', 'product_management', false),
('advanced_store_management', NULL, true, -1, 'monthly', 'Advanced store management', 'store_management', false),
('advanced_user_management', NULL, true, -1, 'monthly', 'Advanced user management', 'user_management', false),
('advanced_customer_management', NULL, true, -1, 'monthly', 'Advanced customer management', 'customer_management', false),
('advanced_sales_management', NULL, true, -1, 'monthly', 'Advanced sales management', 'sales_management', false),
('advanced_inventory_management', NULL, true, -1, 'monthly', 'Advanced inventory management', 'inventory_management', false),
('reporting', NULL, true, 10, 'monthly', 'Advanced reporting features', 'reporting', false),
('api_access', NULL, true, 1000, 'monthly', 'API access for integrations', 'api', false),
('priority_support', NULL, true, -1, 'monthly', 'Priority customer support', 'support', false),

-- Enterprise tier features
('unlimited_reporting', NULL, true, -1, 'monthly', 'Unlimited reporting features', 'reporting', false),
('unlimited_api_access', NULL, true, -1, 'monthly', 'Unlimited API access', 'api', false),
('white_label', NULL, true, -1, 'monthly', 'White label customization', 'customization', false),
('advanced_analytics', NULL, true, -1, 'monthly', 'Advanced analytics dashboard', 'analytics', false),
('custom_integrations', NULL, true, -1, 'monthly', 'Custom integrations', 'integrations', false);

-- =============================================
-- PLAN-SPECIFIC FEATURE FLAGS
-- =============================================

-- Get plan IDs (assuming they exist from previous migrations)
-- Free Plan features
INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'basic_product_management',
    sp.id,
    true,
    10,
    'monthly',
    'Basic product management with limited features',
    'product_management',
    true
FROM subscription_plans sp 
WHERE sp.name = 'Free' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'basic_store_management',
    sp.id,
    true,
    1,
    'monthly',
    'Basic store management',
    'store_management',
    true
FROM subscription_plans sp 
WHERE sp.name = 'Free' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'basic_user_management',
    sp.id,
    true,
    2,
    'monthly',
    'Basic user management',
    'user_management',
    true
FROM subscription_plans sp 
WHERE sp.name = 'Free' AND sp.deleted_at IS NULL;

-- Premium Plan features
INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'advanced_product_management',
    sp.id,
    true,
    -1,
    'monthly',
    'Advanced product management with unlimited features',
    'product_management',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Premium' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'advanced_store_management',
    sp.id,
    true,
    -1,
    'monthly',
    'Advanced store management',
    'store_management',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Premium' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'reporting',
    sp.id,
    true,
    50,
    'monthly',
    'Advanced reporting features',
    'reporting',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Premium' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'api_access',
    sp.id,
    true,
    5000,
    'monthly',
    'API access for integrations',
    'api',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Premium' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'priority_support',
    sp.id,
    true,
    -1,
    'monthly',
    'Priority customer support',
    'support',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Premium' AND sp.deleted_at IS NULL;

-- Enterprise Plan features
INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'unlimited_reporting',
    sp.id,
    true,
    -1,
    'monthly',
    'Unlimited reporting features',
    'reporting',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Enterprise' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'unlimited_api_access',
    sp.id,
    true,
    -1,
    'monthly',
    'Unlimited API access',
    'api',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Enterprise' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'white_label',
    sp.id,
    true,
    -1,
    'monthly',
    'White label customization',
    'customization',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Enterprise' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'advanced_analytics',
    sp.id,
    true,
    -1,
    'monthly',
    'Advanced analytics dashboard',
    'analytics',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Enterprise' AND sp.deleted_at IS NULL;

INSERT INTO feature_flags (feature_name, plan_id, enabled, usage_limit, reset_period, description, category, is_core_feature)
SELECT 
    'custom_integrations',
    sp.id,
    true,
    -1,
    'monthly',
    'Custom integrations',
    'integrations',
    false
FROM subscription_plans sp 
WHERE sp.name = 'Enterprise' AND sp.deleted_at IS NULL;

-- =============================================
-- USAGE TRACKING FUNCTIONS
-- =============================================

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_user_perform_action(
    user_uuid UUID,
    feature_name_param TEXT,
    action_count INTEGER DEFAULT 1
)
RETURNS TABLE(
    can_perform BOOLEAN,
    reason TEXT,
    current_usage INTEGER,
    usage_limit INTEGER,
    remaining INTEGER
) AS $$
DECLARE
    current_usage INTEGER;
    usage_limit INTEGER;
    reset_date TIMESTAMPTZ;
    feature_enabled BOOLEAN;
BEGIN
    -- Get user's subscription
    DECLARE
        user_plan_id UUID;
    BEGIN
        SELECT plan_id INTO user_plan_id
        FROM user_subscriptions
        WHERE user_id = user_uuid
        AND status = 'active'
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF user_plan_id IS NULL THEN
            RETURN QUERY SELECT false, 'No active subscription found', 0, 0, 0;
            RETURN;
        END IF;
    END;
    
    -- Check if feature is enabled for user's plan
    SELECT ff.enabled, ff.usage_limit INTO feature_enabled, usage_limit
    FROM feature_flags ff
    WHERE ff.feature_name = feature_name_param
    AND (ff.plan_id = user_plan_id OR ff.plan_id IS NULL)
    AND ff.deleted_at IS NULL
    ORDER BY ff.plan_id DESC NULLS LAST
    LIMIT 1;
    
    IF NOT feature_enabled THEN
        RETURN QUERY SELECT false, 'Feature not enabled for this plan', 0, 0, 0;
        RETURN;
    END IF;
    
    -- If no usage limit, allow unlimited usage
    IF usage_limit IS NULL OR usage_limit = -1 THEN
        RETURN QUERY SELECT true, 'Unlimited usage', 0, -1, -1;
        RETURN;
    END IF;
    
    -- Get current usage
    SELECT fu.usage_count INTO current_usage
    FROM feature_usage fu
    WHERE fu.user_id = user_uuid
    AND fu.feature_name = feature_name_param
    AND fu.deleted_at IS NULL
    ORDER BY fu.created_at DESC
    LIMIT 1;
    
    -- If no usage record exists, create one
    IF current_usage IS NULL THEN
        INSERT INTO feature_usage (
            user_id,
            feature_name,
            usage_count,
            usage_limit,
            reset_date,
            usage_period
        ) VALUES (
            user_uuid,
            feature_name_param,
            0,
            usage_limit,
            NOW() + INTERVAL '1 month',
            'monthly'
        );
        current_usage := 0;
    END IF;
    
    -- Check if action can be performed
    IF current_usage + action_count <= usage_limit THEN
        RETURN QUERY SELECT 
            true, 
            'Action allowed', 
            current_usage, 
            usage_limit, 
            usage_limit - current_usage;
    ELSE
        RETURN QUERY SELECT 
            false, 
            'Usage limit would be exceeded', 
            current_usage, 
            usage_limit, 
            GREATEST(0, usage_limit - current_usage);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's feature access summary
CREATE OR REPLACE FUNCTION get_user_feature_access_summary(user_uuid UUID)
RETURNS TABLE(
    feature_name TEXT,
    enabled BOOLEAN,
    usage_count INTEGER,
    usage_limit INTEGER,
    remaining INTEGER,
    reset_date TIMESTAMPTZ,
    is_near_limit BOOLEAN,
    is_at_limit BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ff.feature_name,
        ff.enabled,
        COALESCE(fu.usage_count, 0) as usage_count,
        ff.usage_limit,
        CASE 
            WHEN ff.usage_limit = -1 THEN -1
            WHEN ff.usage_limit IS NULL THEN 0
            ELSE GREATEST(0, ff.usage_limit - COALESCE(fu.usage_count, 0))
        END as remaining,
        COALESCE(fu.reset_date, NOW() + INTERVAL '1 month') as reset_date,
        CASE 
            WHEN ff.usage_limit = -1 OR ff.usage_limit IS NULL THEN false
            ELSE (COALESCE(fu.usage_count, 0)::FLOAT / ff.usage_limit) >= 0.8
        END as is_near_limit,
        CASE 
            WHEN ff.usage_limit = -1 OR ff.usage_limit IS NULL THEN false
            ELSE COALESCE(fu.usage_count, 0) >= ff.usage_limit
        END as is_at_limit
    FROM feature_flags ff
    LEFT JOIN feature_usage fu ON ff.feature_name = fu.feature_name 
        AND fu.user_id = user_uuid 
        AND fu.deleted_at IS NULL
    WHERE ff.plan_id IN (
        SELECT plan_id 
        FROM user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active' 
        AND deleted_at IS NULL
    ) OR ff.plan_id IS NULL
    AND ff.deleted_at IS NULL
    ORDER BY ff.category, ff.feature_name;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for feature flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_plan_feature ON feature_flags(plan_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Indexes for feature usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_reset_date ON feature_usage(reset_date);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION can_user_perform_action IS 'Check if user can perform an action based on their plan and usage limits';
COMMENT ON FUNCTION get_user_feature_access_summary IS 'Get comprehensive feature access summary for a user';

COMMENT ON TABLE feature_flags IS 'Feature flags and access control per plan with usage limits';
COMMENT ON COLUMN feature_flags.usage_limit IS 'Usage limit for this feature (-1 for unlimited, NULL for no limit)';
COMMENT ON COLUMN feature_flags.reset_period IS 'Period for usage limit reset (daily, weekly, monthly, yearly)';
COMMENT ON COLUMN feature_flags.category IS 'Category grouping for features (product_management, store_management, etc.)';
COMMENT ON COLUMN feature_flags.is_core_feature IS 'Whether this is a core feature available in all plans';
