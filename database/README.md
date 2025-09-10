# Database Setup Guide

## Overview

This directory contains the database schema, migrations, and seed data for the Allnimall Store CMS SaaS system.

## Files Structure

```
database/
├── schema.sql                    # Complete database schema
├── migrations/
│   └── 001_saas_subscription_tables.sql  # SaaS subscription tables migration
├── seeds/
│   └── subscription_plans.sql    # Default subscription plans data
└── README.md                     # This file
```

## Setup Instructions

### 1. Apply Migration

Run the migration to create SaaS subscription tables:

```bash
# Using Supabase CLI
supabase db reset
supabase db push

# Or manually execute the migration file
psql -h your-host -U your-user -d your-database -f migrations/001_saas_subscription_tables.sql
```

### 2. Seed Default Data

Insert default subscription plans and feature flags:

```bash
# Using Supabase CLI
supabase db seed

# Or manually execute the seed file
psql -h your-host -U your-user -d your-database -f seeds/subscription_plans.sql
```

### 3. Verify Setup

Check that tables were created successfully:

```sql
-- Check subscription plans
SELECT * FROM subscription_plans;

-- Check feature flags
SELECT * FROM feature_flags;

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%subscription%' OR routine_name LIKE '%usage%';
```

## Subscription Plans

### Free Plan

- **Price**: Free
- **Features**: Basic product management, inventory, customer management
- **Limits**: 50 products, 100 transactions/month, 1 store, 0 employees
- **Restrictions**: No POS access, no advanced reports, no online store

### Pro Plan

- **Price**: Rp 299,000/month or Rp 2,990,000/year
- **Features**: All Free features + POS access, advanced reports, employee management, API access
- **Limits**: Unlimited products, transactions, stores, employees
- **Restrictions**: No online store, no priority support

### Enterprise Plan

- **Price**: Rp 599,000/month or Rp 5,990,000/year
- **Features**: All Pro features + online store, priority support, custom integrations
- **Limits**: Unlimited everything
- **Restrictions**: None

## Database Functions

### `check_user_subscription_status(user_uuid UUID)`

Returns the current subscription status for a user.

### `check_feature_usage_limit(user_uuid UUID, feature_name TEXT)`

Checks if a user is within their usage limit for a specific feature.

### `increment_feature_usage(user_uuid UUID, feature_name TEXT, increment_by INTEGER)`

Increments usage count for a feature and returns true if within limit.

### `reset_usage_counters()`

Resets usage counters for all users based on their reset periods.

## Usage Examples

### Check User Subscription

```sql
SELECT * FROM check_user_subscription_status('user-uuid-here');
```

### Check Feature Usage

```sql
SELECT * FROM check_feature_usage_limit('user-uuid-here', 'product_management');
```

### Increment Usage

```sql
SELECT increment_feature_usage('user-uuid-here', 'product_management', 1);
```

### Reset Usage Counters (run daily)

```sql
SELECT reset_usage_counters();
```

## Maintenance

### Daily Tasks

- Run `reset_usage_counters()` to reset daily/weekly/monthly usage counters
- Monitor subscription statuses for expired trials

### Weekly Tasks

- Review usage patterns and limits
- Update subscription plans if needed

### Monthly Tasks

- Generate billing reports
- Review and optimize feature limits
- Update pricing if needed

## Troubleshooting

### Common Issues

1. **Migration fails**: Check if tables already exist
2. **Seed data conflicts**: Check for duplicate IDs
3. **Function errors**: Verify user permissions

### Reset Database

```bash
# Complete reset (WARNING: This will delete all data)
supabase db reset
```

## Security Notes

- All tables have RLS (Row Level Security) enabled
- User data is isolated by user_id
- Sensitive billing data is encrypted
- Audit trails are maintained for all changes

## Support

For database-related issues, check:

1. Supabase documentation
2. PostgreSQL documentation
3. Contact development team
