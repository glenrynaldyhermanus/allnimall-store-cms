-- Week 3 Frontend Enhancements Migration
-- Additional tables and columns for pricing page and subscription management UI

-- =============================================
-- PRICING PAGE ENHANCEMENTS
-- =============================================

-- Add columns to subscription_plans for better UI display
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS badge_text TEXT,
ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS icon_url TEXT,
ADD COLUMN IF NOT EXISTS color_scheme TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS setup_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_stores INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_users INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_products INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_customers INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS storage_gb INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS api_calls_per_month INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS sla_percentage INTEGER DEFAULT 99;

-- Update existing plans with display information
UPDATE subscription_plans 
SET 
    display_name = CASE 
        WHEN name = 'Free Plan' THEN 'Free Forever'
        WHEN name = 'Basic Plan' THEN 'Starter'
        WHEN name = 'Professional Plan' THEN 'Professional'
        WHEN name = 'Enterprise Plan' THEN 'Enterprise'
        ELSE name
    END,
    short_description = CASE 
        WHEN name = 'Free Plan' THEN 'Perfect for small businesses getting started'
        WHEN name = 'Basic Plan' THEN 'Essential features for growing businesses'
        WHEN name = 'Professional Plan' THEN 'Advanced features for established businesses'
        WHEN name = 'Enterprise Plan' THEN 'Full-featured solution for large enterprises'
        ELSE 'Subscription plan'
    END,
    popular = CASE 
        WHEN name = 'Professional Plan' THEN true
        ELSE false
    END,
    badge_text = CASE 
        WHEN name = 'Professional Plan' THEN 'Most Popular'
        WHEN name = 'Enterprise Plan' THEN 'Best Value'
        ELSE NULL
    END,
    badge_color = CASE 
        WHEN name = 'Professional Plan' THEN 'green'
        WHEN name = 'Enterprise Plan' THEN 'purple'
        ELSE 'blue'
    END,
    color_scheme = CASE 
        WHEN name = 'Free Plan' THEN 'gray'
        WHEN name = 'Basic Plan' THEN 'blue'
        WHEN name = 'Professional Plan' THEN 'green'
        WHEN name = 'Enterprise Plan' THEN 'purple'
        ELSE 'blue'
    END,
    max_stores = CASE 
        WHEN name = 'Free Plan' THEN 1
        WHEN name = 'Basic Plan' THEN 3
        WHEN name = 'Professional Plan' THEN 10
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 1
    END,
    max_users = CASE 
        WHEN name = 'Free Plan' THEN 2
        WHEN name = 'Basic Plan' THEN 5
        WHEN name = 'Professional Plan' THEN 25
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 2
    END,
    max_products = CASE 
        WHEN name = 'Free Plan' THEN 50
        WHEN name = 'Basic Plan' THEN 500
        WHEN name = 'Professional Plan' THEN 5000
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 50
    END,
    max_customers = CASE 
        WHEN name = 'Free Plan' THEN 100
        WHEN name = 'Basic Plan' THEN 1000
        WHEN name = 'Professional Plan' THEN 10000
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 100
    END,
    storage_gb = CASE 
        WHEN name = 'Free Plan' THEN 1
        WHEN name = 'Basic Plan' THEN 10
        WHEN name = 'Professional Plan' THEN 100
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 1
    END,
    api_calls_per_month = CASE 
        WHEN name = 'Free Plan' THEN 1000
        WHEN name = 'Basic Plan' THEN 10000
        WHEN name = 'Professional Plan' THEN 100000
        WHEN name = 'Enterprise Plan' THEN -1 -- unlimited
        ELSE 1000
    END,
    support_level = CASE 
        WHEN name = 'Free Plan' THEN 'community'
        WHEN name = 'Basic Plan' THEN 'email'
        WHEN name = 'Professional Plan' THEN 'priority'
        WHEN name = 'Enterprise Plan' THEN 'dedicated'
        ELSE 'email'
    END,
    sla_percentage = CASE 
        WHEN name = 'Free Plan' THEN 95
        WHEN name = 'Basic Plan' THEN 99
        WHEN name = 'Professional Plan' THEN 99.5
        WHEN name = 'Enterprise Plan' THEN 99.9
        ELSE 99
    END;

-- =============================================
-- SUBSCRIPTION MANAGEMENT ENHANCEMENTS
-- =============================================

-- Add columns to user_subscriptions for better management
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS proration_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS upgrade_credit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS downgrade_credit NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS change_effective_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS change_reason TEXT,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS payment_failure_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS reactivation_date TIMESTAMPTZ;

-- =============================================
-- BILLING ENHANCEMENTS
-- =============================================

-- Add columns to billing_invoices for better display
ALTER TABLE billing_invoices 
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS late_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_terms_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS line_items JSONB,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add columns to billing_payments for better tracking
ALTER TABLE billing_payments 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'midtrans',
ADD COLUMN IF NOT EXISTS gateway_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_amount NUMERIC,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMPTZ;

-- =============================================
-- NEW TABLES FOR ENHANCED FEATURES
-- =============================================

-- Plan change requests table
CREATE TABLE IF NOT EXISTS plan_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    from_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    to_plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    effective_date TIMESTAMPTZ,
    proration_amount NUMERIC DEFAULT 0,
    credit_amount NUMERIC DEFAULT 0,
    reason TEXT,
    admin_notes TEXT,
    processed_at TIMESTAMPTZ,
    processed_by UUID
);

-- Subscription usage analytics table
CREATE TABLE IF NOT EXISTS subscription_usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    stores_used INTEGER DEFAULT 0,
    users_used INTEGER DEFAULT 0,
    products_used INTEGER DEFAULT 0,
    customers_used INTEGER DEFAULT 0,
    storage_used_gb NUMERIC DEFAULT 0,
    api_calls_used INTEGER DEFAULT 0,
    features_used JSONB DEFAULT '{}'::jsonb,
    usage_percentage JSONB DEFAULT '{}'::jsonb,
    overage_amount NUMERIC DEFAULT 0,
    overage_fee NUMERIC DEFAULT 0
);

-- Pricing FAQ table
CREATE TABLE IF NOT EXISTS pricing_faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Subscription notifications table
CREATE TABLE IF NOT EXISTS subscription_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    notification_type TEXT NOT NULL CHECK (notification_type IN ('payment_due', 'payment_failed', 'subscription_expiring', 'subscription_expired', 'usage_warning', 'usage_exceeded', 'plan_change', 'trial_ending')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_user_id ON plan_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_subscription_id ON plan_change_requests(subscription_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_status ON plan_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_analytics_user_id ON subscription_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_analytics_subscription_id ON subscription_usage_analytics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_analytics_period ON subscription_usage_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_pricing_faq_category ON pricing_faq(category);
CREATE INDEX IF NOT EXISTS idx_pricing_faq_active ON pricing_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_user_id ON subscription_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_type ON subscription_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_subscription_notifications_read ON subscription_notifications(is_read);

-- Additional indexes for enhanced columns
CREATE INDEX IF NOT EXISTS idx_subscription_plans_popular ON subscription_plans(popular);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period ON user_subscriptions(current_period_start, current_period_end);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_terms ON billing_invoices(payment_terms_days);
CREATE INDEX IF NOT EXISTS idx_billing_payments_gateway ON billing_payments(payment_gateway);

-- =============================================
-- FUNCTIONS FOR ENHANCED FEATURES
-- =============================================

-- Function to get user's current usage
CREATE OR REPLACE FUNCTION get_user_current_usage(user_uuid UUID)
RETURNS TABLE(
    stores_used INTEGER,
    users_used INTEGER,
    products_used INTEGER,
    customers_used INTEGER,
    storage_used_gb NUMERIC,
    api_calls_used INTEGER,
    usage_percentage JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(COUNT(DISTINCT s.id), 0)::INTEGER as stores_used,
        COALESCE(COUNT(DISTINCT u.id), 0)::INTEGER as users_used,
        COALESCE(SUM(p.stock), 0)::INTEGER as products_used,
        COALESCE(COUNT(DISTINCT c.id), 0)::INTEGER as customers_used,
        COALESCE(SUM(p.weight_grams) / 1000000.0, 0) as storage_used_gb, -- Convert grams to GB
        COALESCE(COUNT(bt.id), 0)::INTEGER as api_calls_used,
        jsonb_build_object(
            'stores', COALESCE(COUNT(DISTINCT s.id), 0),
            'users', COALESCE(COUNT(DISTINCT u.id), 0),
            'products', COALESCE(SUM(p.stock), 0),
            'customers', COALESCE(COUNT(DISTINCT c.id), 0),
            'storage', COALESCE(SUM(p.weight_grams) / 1000000.0, 0),
            'api_calls', COALESCE(COUNT(bt.id), 0)
        ) as usage_percentage
    FROM user_subscriptions us
    LEFT JOIN merchants m ON m.owner_id = user_uuid
    LEFT JOIN stores s ON s.merchant_id = m.id
    LEFT JOIN users u ON u.id IN (
        SELECT ra.user_id FROM role_assignments ra WHERE ra.store_id = s.id
    )
    LEFT JOIN products p ON p.store_id = s.id
    LEFT JOIN customers c ON c.id IN (
        SELECT mc.customer_id FROM merchant_customers mc WHERE mc.merchant_id = m.id
    )
    LEFT JOIN billing_transactions bt ON bt.user_id = user_uuid
    WHERE us.user_id = user_uuid
    AND us.status = 'active'
    AND us.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can upgrade/downgrade
CREATE OR REPLACE FUNCTION can_change_plan(
    user_uuid UUID,
    target_plan_id UUID,
    change_type TEXT
)
RETURNS TABLE(
    can_change BOOLEAN,
    reason TEXT,
    proration_amount NUMERIC,
    effective_date TIMESTAMPTZ
) AS $$
DECLARE
    current_subscription RECORD;
    target_plan RECORD;
    current_usage RECORD;
BEGIN
    -- Get current subscription
    SELECT * INTO current_subscription
    FROM user_subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get target plan
    SELECT * INTO target_plan
    FROM subscription_plans
    WHERE id = target_plan_id
    AND is_active = true
    AND deleted_at IS NULL;
    
    -- Get current usage
    SELECT * INTO current_usage
    FROM get_user_current_usage(user_uuid);
    
    -- Check if change is possible
    IF current_subscription IS NULL THEN
        RETURN QUERY SELECT false, 'No active subscription found', 0::NUMERIC, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;
    
    IF target_plan IS NULL THEN
        RETURN QUERY SELECT false, 'Target plan not found', 0::NUMERIC, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;
    
    -- Check usage limits for downgrade
    IF change_type = 'downgrade' THEN
        IF current_usage.stores_used > target_plan.max_stores AND target_plan.max_stores > 0 THEN
            RETURN QUERY SELECT false, 'Too many stores for target plan', 0::NUMERIC, NULL::TIMESTAMPTZ;
            RETURN;
        END IF;
        
        IF current_usage.users_used > target_plan.max_users AND target_plan.max_users > 0 THEN
            RETURN QUERY SELECT false, 'Too many users for target plan', 0::NUMERIC, NULL::TIMESTAMPTZ;
            RETURN;
        END IF;
        
        IF current_usage.products_used > target_plan.max_products AND target_plan.max_products > 0 THEN
            RETURN QUERY SELECT false, 'Too many products for target plan', 0::NUMERIC, NULL::TIMESTAMPTZ;
            RETURN;
        END IF;
    END IF;
    
    -- Calculate proration
    DECLARE
        days_remaining INTEGER;
        daily_rate_current NUMERIC;
        daily_rate_target NUMERIC;
        proration NUMERIC;
    BEGIN
        days_remaining := EXTRACT(DAY FROM (current_subscription.current_period_end - NOW()));
        daily_rate_current := current_subscription.plan_id::TEXT::NUMERIC / 30; -- Assuming monthly
        daily_rate_target := target_plan.price / 30;
        proration := (daily_rate_target - daily_rate_current) * days_remaining;
    END;
    
    RETURN QUERY SELECT 
        true, 
        'Change allowed', 
        proration, 
        NOW() + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SEED DATA FOR PRICING FAQ
-- =============================================

INSERT INTO pricing_faq (question, answer, category, sort_order) VALUES
('What payment methods do you accept?', 'We accept all major credit cards, bank transfers, and e-wallets through Midtrans payment gateway.', 'billing', 1),
('Can I change my plan anytime?', 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.', 'billing', 2),
('Is there a setup fee?', 'No setup fees for any of our plans. You only pay the monthly or yearly subscription fee.', 'billing', 3),
('What happens if I exceed my limits?', 'We will notify you when you approach your limits. You can upgrade your plan or purchase additional capacity.', 'limits', 1),
('Do you offer refunds?', 'We offer a 30-day money-back guarantee for all paid plans. Contact support for refund requests.', 'billing', 4),
('How does the trial work?', 'All plans come with a 14-day free trial. No credit card required to start.', 'trial', 1),
('Can I cancel anytime?', 'Yes, you can cancel your subscription anytime. Your access continues until the end of your billing period.', 'billing', 5),
('What support do you provide?', 'Free plan gets community support, paid plans get email support, and Enterprise gets dedicated support.', 'support', 1),
('Is my data secure?', 'Yes, we use enterprise-grade security with SSL encryption and regular backups.', 'security', 1),
('Do you offer custom plans?', 'Yes, we offer custom plans for Enterprise customers with specific requirements.', 'enterprise', 1)
ON CONFLICT DO NOTHING;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE plan_change_requests IS 'Track plan change requests and approvals';
COMMENT ON TABLE subscription_usage_analytics IS 'Analytics data for subscription usage tracking';
COMMENT ON TABLE pricing_faq IS 'Frequently asked questions for pricing page';
COMMENT ON TABLE subscription_notifications IS 'User notifications for subscription events';

COMMENT ON COLUMN subscription_plans.popular IS 'Whether this plan is marked as popular/recommended';
COMMENT ON COLUMN subscription_plans.badge_text IS 'Text to display on plan badge (e.g., "Most Popular")';
COMMENT ON COLUMN subscription_plans.max_stores IS 'Maximum number of stores allowed (-1 for unlimited)';
COMMENT ON COLUMN subscription_plans.max_users IS 'Maximum number of users allowed (-1 for unlimited)';
COMMENT ON COLUMN subscription_plans.max_products IS 'Maximum number of products allowed (-1 for unlimited)';
COMMENT ON COLUMN subscription_plans.max_customers IS 'Maximum number of customers allowed (-1 for unlimited)';
COMMENT ON COLUMN subscription_plans.storage_gb IS 'Storage limit in GB (-1 for unlimited)';
COMMENT ON COLUMN subscription_plans.api_calls_per_month IS 'API calls limit per month (-1 for unlimited)';

COMMENT ON COLUMN user_subscriptions.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN user_subscriptions.current_period_end IS 'End of current billing period';
COMMENT ON COLUMN user_subscriptions.cancel_at_period_end IS 'Whether subscription will cancel at period end';
COMMENT ON COLUMN user_subscriptions.proration_amount IS 'Amount for prorated billing';
COMMENT ON COLUMN user_subscriptions.change_effective_date IS 'When plan change takes effect';

COMMENT ON COLUMN billing_invoices.subtotal IS 'Amount before tax and fees';
COMMENT ON COLUMN billing_invoices.tax_amount IS 'Tax amount';
COMMENT ON COLUMN billing_invoices.discount_amount IS 'Discount amount applied';
COMMENT ON COLUMN billing_invoices.late_fee IS 'Late payment fee';
COMMENT ON COLUMN billing_invoices.line_items IS 'Detailed line items for the invoice';
COMMENT ON COLUMN billing_invoices.billing_address IS 'Billing address information';

COMMENT ON COLUMN billing_payments.payment_gateway IS 'Payment gateway used (midtrans, stripe, etc.)';
COMMENT ON COLUMN billing_payments.gateway_transaction_id IS 'Transaction ID from payment gateway';
COMMENT ON COLUMN billing_payments.gateway_fee IS 'Fee charged by payment gateway';
COMMENT ON COLUMN billing_payments.net_amount IS 'Amount received after gateway fees';
COMMENT ON COLUMN billing_payments.refund_amount IS 'Amount refunded';
