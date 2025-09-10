# Subscription Management System Specification

## Overview

This specification defines the subscription management system for Allnimall Store CMS, including plan management, billing, usage tracking, and feature restrictions.

## Functional Requirements

### 1. Subscription Plans Management

#### 1.1 Plan Structure

- **Free Tier**: Rp 0/month - Basic product management
- **Paid Tier**: Rp 50,000/month - Full business features
- **Add-on Modules**: HR (Rp 50,000), Finance (Rp 75,000), Marketing (Rp 50,000), Design (Rp 75,000)

#### 1.2 Plan Features Matrix

| Feature                | Free | Paid | HR Add-on | Finance Add-on | Marketing Add-on | Design Add-on |
| ---------------------- | ---- | ---- | --------- | -------------- | ---------------- | ------------- |
| Product Management     | ✅   | ✅   | ✅        | ✅             | ✅               | ✅            |
| POS System             | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Multi-store            | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Customer Management    | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Employee Management    | ❌   | ❌   | ✅        | ✅             | ✅               | ✅            |
| Accounting Integration | ❌   | ❌   | ❌        | ✅             | ✅               | ✅            |
| Marketing Tools        | ❌   | ❌   | ❌        | ❌             | ✅               | ✅            |
| Custom Branding        | ❌   | ❌   | ❌        | ❌             | ❌               | ✅            |

### 2. Subscription Lifecycle

#### 2.1 Subscription States

- **Trial**: 14-day free trial for paid features
- **Active**: Subscription is active and paid
- **Past Due**: Payment failed, grace period
- **Cancelled**: Subscription cancelled
- **Expired**: Subscription expired

#### 2.2 Subscription Operations

- **Upgrade**: Move to higher tier or add modules
- **Downgrade**: Move to lower tier or remove modules
- **Cancel**: Cancel subscription
- **Reactivate**: Reactivate cancelled subscription

### 3. Usage Tracking

#### 3.1 Usage Metrics

- **Product Count**: Number of products created
- **Store Count**: Number of stores managed
- **Employee Count**: Number of employees
- **Transaction Count**: Number of POS transactions
- **API Calls**: Number of API requests

#### 3.2 Usage Limits

| Metric       | Free       | Paid      | HR Add-on | Finance Add-on | Marketing Add-on | Design Add-on |
| ------------ | ---------- | --------- | --------- | -------------- | ---------------- | ------------- |
| Products     | Unlimited  | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Stores       | 1          | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Employees    | 0          | 0         | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Transactions | 0          | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| API Calls    | 1000/month | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |

### 4. Feature Restrictions

#### 4.1 Access Control

- **Middleware-based**: All API endpoints check user subscription
- **UI-based**: Components show/hide based on subscription
- **Database-level**: RLS policies enforce data access

#### 4.2 Restriction Components

- **Upgrade Prompts**: Show when user hits limits
- **Usage Warnings**: Alert when approaching limits
- **Feature Blocks**: Prevent access to restricted features

## Technical Requirements

### 1. Database Schema

#### 1.1 Core Tables

```sql
-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
  features JSONB NOT NULL,
  usage_limits JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL, -- trial, active, past_due, cancelled, expired
  trial_ends_at TIMESTAMP,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Feature usage tracking
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Add-on Tables

```sql
-- Add-on subscriptions
CREATE TABLE addon_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  addon_type VARCHAR(50) NOT NULL, -- hr, finance, marketing, design
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Subscription Management

```
GET /api/subscriptions - Get user subscription
POST /api/subscriptions - Create subscription
PUT /api/subscriptions/:id - Update subscription
DELETE /api/subscriptions/:id - Cancel subscription
```

#### 2.2 Plan Management

```
GET /api/plans - Get available plans
GET /api/plans/:id - Get plan details
```

#### 2.3 Usage Tracking

```
GET /api/usage - Get usage metrics
POST /api/usage/track - Track feature usage
GET /api/usage/warnings - Get usage warnings
```

### 3. Middleware Implementation

#### 3.1 Feature Restriction Middleware

```typescript
export async function featureRestrictionMiddleware(
	req: NextRequest,
	feature: string
): Promise<boolean> {
	const user = await getUserFromRequest(req);
	const subscription = await getSubscription(user.id);
	const usage = await getUsage(user.id, feature);

	return validateFeatureAccess(subscription, usage, feature);
}
```

#### 3.2 Usage Tracking Middleware

```typescript
export async function trackUsage(
	userId: string,
	feature: string,
	increment: number = 1
): Promise<void> {
	await incrementUsageCounter(userId, feature, increment);
	await checkUsageLimits(userId, feature);
}
```

## Business Logic

### 1. Plan Validation

#### 1.1 Feature Access Check

```typescript
function canAccessFeature(
	subscription: UserSubscription,
	feature: string
): boolean {
	const plan = getPlan(subscription.plan_id);
	const addons = getAddons(subscription.user_id);

	return (
		plan.features.includes(feature) ||
		addons.some((addon) => addon.features.includes(feature))
	);
}
```

#### 1.2 Usage Limit Check

```typescript
function checkUsageLimit(
	userId: string,
	feature: string,
	currentUsage: number
): boolean {
	const subscription = getSubscription(userId);
	const plan = getPlan(subscription.plan_id);
	const limit = plan.usage_limits[feature];

	return currentUsage < limit;
}
```

### 2. Billing Logic

#### 2.1 Subscription Creation

```typescript
async function createSubscription(
	userId: string,
	planId: string,
	paymentMethodId: string
): Promise<Subscription> {
	const plan = await getPlan(planId);
	const subscription = await createSubscriptionRecord(userId, planId);
	const payment = await createPayment(
		subscription.id,
		plan.price,
		paymentMethodId
	);

	if (payment.status === "success") {
		await activateSubscription(subscription.id);
	}

	return subscription;
}
```

#### 2.2 Usage-based Billing

```typescript
async function calculateUsageBill(
	userId: string,
	period: DateRange
): Promise<number> {
	const usage = await getUsageForPeriod(userId, period);
	const subscription = await getSubscription(userId);
	const plan = await getPlan(subscription.plan_id);

	let total = plan.base_price;

	// Add overage charges
	for (const [feature, usage] of Object.entries(usage)) {
		const limit = plan.usage_limits[feature];
		if (usage > limit) {
			total += (usage - limit) * plan.overage_rates[feature];
		}
	}

	return total;
}
```

## Integration Points

### 1. Payment Integration

- **Midtrans**: Primary payment gateway for Indonesian market
- **Webhook Handling**: Real-time payment status updates
- **Recurring Billing**: Automated subscription renewals

### 2. Database Integration

- **Supabase**: PostgreSQL database with RLS policies
- **Real-time Updates**: Subscription status changes
- **Data Isolation**: Multi-tenant data separation

### 3. Frontend Integration

- **React Components**: Subscription management UI
- **State Management**: Subscription status in app state
- **Route Protection**: Feature-based route access

## Security Considerations

### 1. Data Protection

- **RLS Policies**: Database-level access control
- **API Authentication**: JWT-based API access
- **Input Validation**: Zod schema validation

### 2. Payment Security

- **PCI Compliance**: Secure payment processing
- **Webhook Verification**: Secure webhook handling
- **Fraud Prevention**: Payment fraud detection

### 3. Usage Tracking Security

- **Rate Limiting**: API rate limiting
- **Usage Validation**: Prevent usage manipulation
- **Audit Logging**: Track all subscription changes

## Performance Considerations

### 1. Caching Strategy

- **Plan Data**: Cache subscription plans
- **Usage Data**: Cache usage metrics
- **User Subscriptions**: Cache user subscription status

### 2. Database Optimization

- **Indexes**: Optimize subscription queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimize subscription queries

### 3. API Performance

- **Response Caching**: Cache API responses
- **Batch Operations**: Batch usage tracking
- **Async Processing**: Async subscription operations

## Monitoring and Analytics

### 1. Key Metrics

- **MRR**: Monthly Recurring Revenue
- **Churn Rate**: Subscription cancellation rate
- **Usage Metrics**: Feature usage statistics
- **Conversion Rate**: Free to paid conversion

### 2. Alerting

- **Payment Failures**: Alert on failed payments
- **Usage Limits**: Alert on usage limit breaches
- **System Errors**: Alert on subscription errors

### 3. Reporting

- **Revenue Reports**: Subscription revenue tracking
- **Usage Reports**: Feature usage analytics
- **Customer Reports**: Customer subscription analytics

## Testing Strategy

### 1. Unit Tests

- **Plan Validation**: Test plan validation logic
- **Usage Tracking**: Test usage tracking functions
- **Billing Logic**: Test billing calculations

### 2. Integration Tests

- **Payment Integration**: Test payment processing
- **Database Integration**: Test subscription CRUD
- **API Integration**: Test subscription APIs

### 3. End-to-End Tests

- **Subscription Flow**: Test complete subscription flow
- **Feature Restrictions**: Test feature access control
- **Usage Tracking**: Test usage tracking flow

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development environment
- **Staging**: Staging environment for testing
- **Production**: Production environment

### 2. Configuration

- **Environment Variables**: Subscription configuration
- **Feature Flags**: Feature toggle configuration
- **Payment Settings**: Payment gateway configuration

### 3. Migration Strategy

- **Database Migration**: Subscription schema migration
- **Data Migration**: Existing user data migration
- **Feature Rollout**: Gradual feature rollout

---

**This specification provides a comprehensive foundation for implementing the subscription management system in Allnimall Store CMS.**
