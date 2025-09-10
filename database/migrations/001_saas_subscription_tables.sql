-- Migration: Add SaaS Subscription Tables
-- Date: $(date)
-- Description: Add subscription management tables for SaaS functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SAAS SUBSCRIPTION MANAGEMENT TABLES
-- =============================================

-- Subscription plans table
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    limits JSONB NOT NULL DEFAULT '{}'::jsonb,
    restrictions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT,
    sort_order INTEGER DEFAULT 0
);

-- User subscriptions table
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'trial', 'cancelled', 'expired', 'past_due')),
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    auto_renew BOOLEAN DEFAULT true
);

-- Feature usage tracking table
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER NOT NULL,
    reset_date TIMESTAMPTZ NOT NULL,
    last_reset_date TIMESTAMPTZ,
    usage_period TEXT NOT NULL CHECK (usage_period IN ('daily', 'weekly', 'monthly', 'yearly'))
);

-- Billing invoices table
CREATE TABLE billing_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    stripe_invoice_id TEXT,
    invoice_number TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IDR',
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    invoice_url TEXT,
    pdf_url TEXT
);

-- Billing payments table
CREATE TABLE billing_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    invoice_id UUID NOT NULL REFERENCES billing_invoices(id),
    stripe_payment_intent_id TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IDR',
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'cancelled')),
    failure_reason TEXT,
    failure_code TEXT,
    receipt_url TEXT
);

-- Billing transactions table
CREATE TABLE billing_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'upgrade', 'downgrade', 'refund', 'credit')),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IDR',
    description TEXT,
    reference_id UUID,
    reference_type TEXT,
    stripe_transaction_id TEXT
);

-- Feature flags table
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    feature_name TEXT NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id),
    enabled BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    reset_period TEXT CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly')),
    description TEXT,
    category TEXT,
    is_core_feature BOOLEAN DEFAULT false
);

-- =============================================
-- SAAS SUBSCRIPTION FUNCTIONS
-- =============================================

-- Function to check user subscription status
CREATE OR REPLACE FUNCTION check_user_subscription_status(user_uuid UUID)
RETURNS TABLE(
    subscription_id UUID,
    plan_id UUID,
    plan_name TEXT,
    status TEXT,
    is_active BOOLEAN,
    trial_end_date TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.id as subscription_id,
        us.plan_id,
        sp.name as plan_name,
        us.status,
        (us.status = 'active' AND (us.end_date IS NULL OR us.end_date > NOW())) as is_active,
        us.trial_end_date,
        us.next_billing_date
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid
    AND us.deleted_at IS NULL
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check feature usage limit
CREATE OR REPLACE FUNCTION check_feature_usage_limit(
    user_uuid UUID,
    feature_name_param TEXT
)
RETURNS TABLE(
    usage_count INTEGER,
    usage_limit INTEGER,
    remaining INTEGER,
    reset_date TIMESTAMPTZ,
    is_within_limit BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fu.usage_count,
        fu.usage_limit,
        GREATEST(0, fu.usage_limit - fu.usage_count) as remaining,
        fu.reset_date,
        (fu.usage_count < fu.usage_limit) as is_within_limit
    FROM feature_usage fu
    WHERE fu.user_id = user_uuid
    AND fu.feature_name = feature_name_param
    AND fu.deleted_at IS NULL
    ORDER BY fu.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
    user_uuid UUID,
    feature_name_param TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage INTEGER;
    usage_limit INTEGER;
    reset_date TIMESTAMPTZ;
BEGIN
    -- Get current usage
    SELECT fu.usage_count, fu.usage_limit, fu.reset_date
    INTO current_usage, usage_limit, reset_date
    FROM feature_usage fu
    WHERE fu.user_id = user_uuid
    AND fu.feature_name = feature_name_param
    AND fu.deleted_at IS NULL
    ORDER BY fu.created_at DESC
    LIMIT 1;
    
    -- If no record exists, create one
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
            increment_by,
            0, -- Will be set by plan limits
            NOW() + INTERVAL '1 month',
            'monthly'
        );
        RETURN TRUE;
    END IF;
    
    -- Check if within limit
    IF current_usage + increment_by <= usage_limit THEN
        UPDATE feature_usage 
        SET usage_count = usage_count + increment_by,
            updated_at = NOW()
        WHERE user_id = user_uuid
        AND feature_name = feature_name_param
        AND deleted_at IS NULL;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to reset usage counters
CREATE OR REPLACE FUNCTION reset_usage_counters()
RETURNS INTEGER AS $$
DECLARE
    reset_count INTEGER := 0;
    usage_record RECORD;
BEGIN
    -- Reset counters where reset_date has passed
    FOR usage_record IN 
        SELECT id FROM feature_usage 
        WHERE reset_date <= NOW() 
        AND deleted_at IS NULL
    LOOP
        UPDATE feature_usage 
        SET usage_count = 0,
            last_reset_date = reset_date,
            reset_date = CASE 
                WHEN usage_period = 'daily' THEN NOW() + INTERVAL '1 day'
                WHEN usage_period = 'weekly' THEN NOW() + INTERVAL '1 week'
                WHEN usage_period = 'monthly' THEN NOW() + INTERVAL '1 month'
                WHEN usage_period = 'yearly' THEN NOW() + INTERVAL '1 year'
                ELSE NOW() + INTERVAL '1 month'
            END,
            updated_at = NOW()
        WHERE id = usage_record.id;
        
        reset_count := reset_count + 1;
    END LOOP;
    
    RETURN reset_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAAS SUBSCRIPTION INDEXES
-- =============================================

-- Indexes for subscription tables
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX idx_feature_usage_feature_name ON feature_usage(feature_name);
CREATE INDEX idx_feature_usage_reset_date ON feature_usage(reset_date);
CREATE INDEX idx_billing_invoices_user_id ON billing_invoices(user_id);
CREATE INDEX idx_billing_invoices_subscription_id ON billing_invoices(subscription_id);
CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_payments_invoice_id ON billing_payments(invoice_id);
CREATE INDEX idx_billing_transactions_user_id ON billing_transactions(user_id);
CREATE INDEX idx_feature_flags_feature_name ON feature_flags(feature_name);
CREATE INDEX idx_feature_flags_plan_id ON feature_flags(plan_id);

-- =============================================
-- SAAS SUBSCRIPTION COMMENTS
-- =============================================

COMMENT ON TABLE subscription_plans IS 'Subscription plans with pricing and feature definitions';
COMMENT ON TABLE user_subscriptions IS 'User subscription records and status tracking';
COMMENT ON TABLE feature_usage IS 'Feature usage tracking and limits enforcement';
COMMENT ON TABLE billing_invoices IS 'Billing invoices for subscription payments';
COMMENT ON TABLE billing_payments IS 'Payment records for invoices';
COMMENT ON TABLE billing_transactions IS 'All billing-related transactions';
COMMENT ON TABLE feature_flags IS 'Feature flags and access control per plan';
