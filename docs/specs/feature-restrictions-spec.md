# Feature Restrictions System Specification

## Overview

This specification defines the feature restrictions system for Allnimall Store CMS, including plan-based access control, usage tracking, and feature gating.

## Functional Requirements

### 1. Feature Access Control

#### 1.1 Plan-based Access

- **Free Tier**: Limited feature access
- **Paid Tier**: Full feature access
- **Add-on Modules**: Additional feature access

#### 1.2 Feature Categories

| Category               | Free | Paid | HR Add-on | Finance Add-on | Marketing Add-on | Design Add-on |
| ---------------------- | ---- | ---- | --------- | -------------- | ---------------- | ------------- |
| Product Management     | ✅   | ✅   | ✅        | ✅             | ✅               | ✅            |
| POS System             | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Multi-store            | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Customer Management    | ❌   | ✅   | ✅        | ✅             | ✅               | ✅            |
| Employee Management    | ❌   | ❌   | ✅        | ✅             | ✅               | ✅            |
| Accounting Integration | ❌   | ❌   | ❌        | ✅             | ✅               | ✅            |
| Marketing Tools        | ❌   | ❌   | ❌        | ❌             | ✅               | ✅            |
| Custom Branding        | ❌   | ❌   | ❌        | ❌             | ❌               | ✅            |

### 2. Usage Tracking

#### 2.1 Usage Metrics

- **Product Count**: Number of products created
- **Store Count**: Number of stores managed
- **Employee Count**: Number of employees
- **Transaction Count**: Number of POS transactions
- **API Calls**: Number of API requests

#### 2.2 Usage Limits

| Metric       | Free       | Paid      | HR Add-on | Finance Add-on | Marketing Add-on | Design Add-on |
| ------------ | ---------- | --------- | --------- | -------------- | ---------------- | ------------- |
| Products     | Unlimited  | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Stores       | 1          | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Employees    | 0          | 0         | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| Transactions | 0          | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |
| API Calls    | 1000/month | Unlimited | Unlimited | Unlimited      | Unlimited        | Unlimited     |

### 3. Feature Gating

#### 3.1 Access Control Levels

- **Blocked**: Feature completely inaccessible
- **Limited**: Feature accessible with usage limits
- **Unlimited**: Feature fully accessible

#### 3.2 Restriction Types

- **Hard Limits**: Hard blocks on feature access
- **Soft Limits**: Warnings with upgrade prompts
- **Usage Limits**: Limits on feature usage

## Technical Requirements

### 1. Database Schema

#### 1.1 Feature Flags

```sql
-- Feature flags
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Plan feature access
CREATE TABLE plan_feature_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  feature_name VARCHAR(100) NOT NULL,
  access_level VARCHAR(20) NOT NULL, -- blocked, limited, unlimited
  usage_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User feature usage
CREATE TABLE user_feature_usage (
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

### 2. Middleware Implementation

#### 2.1 Feature Restriction Middleware

```typescript
export async function featureRestrictionMiddleware(
	req: NextRequest,
	feature: string
): Promise<boolean> {
	const user = await getUserFromRequest(req);
	if (!user) return false;

	const subscription = await getSubscription(user.id);
	const plan = await getPlan(subscription.plan_id);
	const addons = await getAddons(user.id);

	return validateFeatureAccess(plan, addons, feature);
}

function validateFeatureAccess(
	plan: SubscriptionPlan,
	addons: AddonSubscription[],
	feature: string
): boolean {
	// Check plan access
	const planAccess = plan.feature_access.find(
		(f) => f.feature_name === feature
	);
	if (planAccess && planAccess.access_level === "blocked") {
		return false;
	}

	// Check addon access
	const addonAccess = addons.some((addon) => addon.features.includes(feature));

	return planAccess?.access_level === "unlimited" || addonAccess;
}
```

#### 2.2 Usage Tracking Middleware

```typescript
export async function trackUsage(
	userId: string,
	feature: string,
	increment: number = 1
): Promise<void> {
	const currentPeriod = getCurrentPeriod();
	const usage = await getUsage(userId, feature, currentPeriod);

	if (usage) {
		await updateUsage(usage.id, usage.usage_count + increment);
	} else {
		await createUsage(userId, feature, increment, currentPeriod);
	}

	await checkUsageLimits(userId, feature);
}

async function checkUsageLimits(
	userId: string,
	feature: string
): Promise<void> {
	const subscription = await getSubscription(userId);
	const plan = await getPlan(subscription.plan_id);
	const usage = await getUsage(userId, feature);

	const limit = plan.usage_limits[feature];
	if (usage.usage_count >= limit) {
		await sendUsageLimitWarning(userId, feature, usage.usage_count, limit);
	}
}
```

### 3. API Route Protection

#### 3.1 Protected API Routes

```typescript
export async function GET(req: NextRequest) {
	const user = await getUserFromRequest(req);
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Check feature access
	const hasAccess = await featureRestrictionMiddleware(req, "products");
	if (!hasAccess) {
		return NextResponse.json(
			{
				error: "Feature not available in your plan",
				upgradeRequired: true,
			},
			{ status: 403 }
		);
	}

	// Track usage
	await trackUsage(user.id, "products");

	// Process request
	const products = await getProducts(user.id);
	return NextResponse.json(products);
}
```

#### 3.2 Usage-based API Protection

```typescript
export async function POST(req: NextRequest) {
	const user = await getUserFromRequest(req);
	const data = await req.json();

	// Check usage limits
	const canCreate = await checkUsageLimit(user.id, "products");
	if (!canCreate) {
		return NextResponse.json(
			{
				error: "Usage limit exceeded",
				upgradeRequired: true,
			},
			{ status: 403 }
		);
	}

	// Create product
	const product = await createProduct(user.id, data);

	// Track usage
	await trackUsage(user.id, "products");

	return NextResponse.json(product);
}
```

### 4. Frontend Components

#### 4.1 Feature Restriction Component

```typescript
export function FeatureRestriction({
	feature,
	children,
	fallback,
}: FeatureRestrictionProps) {
	const { user } = useAuth();
	const { subscription } = useSubscription();
	const [hasAccess, setHasAccess] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkAccess() {
			if (user && subscription) {
				const access = await checkFeatureAccess(user.id, feature);
				setHasAccess(access);
			}
			setIsLoading(false);
		}

		checkAccess();
	}, [user, subscription, feature]);

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (!hasAccess) {
		return fallback || <UpgradePrompt feature={feature} />;
	}

	return <>{children}</>;
}
```

#### 4.2 Upgrade Prompt Component

```typescript
export function UpgradePrompt({ feature }: { feature: string }) {
	const { subscription } = useSubscription();

	return (
		<div className="upgrade-prompt">
			<div className="upgrade-content">
				<h3>Upgrade Required</h3>
				<p>This feature is not available in your current plan.</p>
				<p>Upgrade to access {feature} and more features.</p>
				<Button onClick={() => router.push("/pricing")}>View Plans</Button>
			</div>
		</div>
	);
}
```

#### 4.3 Usage Warning Component

```typescript
export function UsageWarning({
	feature,
	currentUsage,
	limit,
}: UsageWarningProps) {
	const percentage = (currentUsage / limit) * 100;

	if (percentage < 80) return null;

	return (
		<div
			className={`usage-warning ${percentage >= 100 ? "critical" : "warning"}`}>
			<div className="usage-content">
				<h4>Usage Warning</h4>
				<p>
					You've used {currentUsage} of {limit} {feature} this month.
					{percentage >= 100 && " You have reached your limit."}
				</p>
				{percentage >= 100 && (
					<Button onClick={() => router.push("/pricing")}>Upgrade Now</Button>
				)}
			</div>
		</div>
	);
}
```

## Business Logic

### 1. Feature Access Validation

#### 1.1 Plan-based Validation

```typescript
function validatePlanAccess(plan: SubscriptionPlan, feature: string): boolean {
	const featureAccess = plan.feature_access.find(
		(f) => f.feature_name === feature
	);

	if (!featureAccess) return false;

	switch (featureAccess.access_level) {
		case "unlimited":
			return true;
		case "limited":
			return true; // Check usage limits separately
		case "blocked":
			return false;
		default:
			return false;
	}
}
```

#### 1.2 Addon-based Validation

```typescript
function validateAddonAccess(
	addons: AddonSubscription[],
	feature: string
): boolean {
	return addons.some(
		(addon) => addon.features.includes(feature) && addon.status === "active"
	);
}
```

### 2. Usage Limit Validation

#### 2.1 Usage Limit Check

```typescript
async function checkUsageLimit(
	userId: string,
	feature: string
): Promise<boolean> {
	const subscription = await getSubscription(userId);
	const plan = await getPlan(subscription.plan_id);
	const usage = await getUsage(userId, feature);

	const limit = plan.usage_limits[feature];
	if (!limit) return true; // No limit

	return usage.usage_count < limit;
}
```

#### 2.2 Usage Increment

```typescript
async function incrementUsage(
	userId: string,
	feature: string,
	increment: number = 1
): Promise<void> {
	const currentPeriod = getCurrentPeriod();
	const usage = await getUsage(userId, feature, currentPeriod);

	if (usage) {
		await updateUsage(usage.id, usage.usage_count + increment);
	} else {
		await createUsage(userId, feature, increment, currentPeriod);
	}
}
```

### 3. Restriction Enforcement

#### 3.1 API Restriction

```typescript
export function withFeatureRestriction(feature: string) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const req = args[0];
			const user = await getUserFromRequest(req);

			if (!user) {
				throw new Error("Unauthorized");
			}

			const hasAccess = await checkFeatureAccess(user.id, feature);
			if (!hasAccess) {
				throw new Error("Feature not available in your plan");
			}

			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}
```

#### 3.2 Component Restriction

```typescript
export function withFeatureGate(feature: string) {
	return function <P extends object>(Component: React.ComponentType<P>) {
		return function FeatureGatedComponent(props: P) {
			const { user } = useAuth();
			const { subscription } = useSubscription();
			const [hasAccess, setHasAccess] = useState(false);

			useEffect(() => {
				async function checkAccess() {
					if (user && subscription) {
						const access = await checkFeatureAccess(user.id, feature);
						setHasAccess(access);
					}
				}

				checkAccess();
			}, [user, subscription]);

			if (!hasAccess) {
				return <UpgradePrompt feature={feature} />;
			}

			return <Component {...props} />;
		};
	};
}
```

## Integration Points

### 1. Subscription System Integration

- **Plan Validation**: Validate user subscription plan
- **Addon Validation**: Validate user addon subscriptions
- **Usage Tracking**: Track feature usage against limits

### 2. Database Integration

- **Supabase**: PostgreSQL database for feature data
- **Real-time Updates**: Real-time feature access updates
- **Data Consistency**: Consistent feature access data

### 3. Frontend Integration

- **React Components**: Feature restriction components
- **State Management**: Feature access state management
- **Route Protection**: Feature-based route protection

## Security Considerations

### 1. Access Control

- **Authentication**: Verify user authentication
- **Authorization**: Verify user authorization
- **Plan Validation**: Validate user subscription plan

### 2. Data Protection

- **Usage Data**: Protect usage tracking data
- **Feature Data**: Protect feature access data
- **Audit Logging**: Log all feature access attempts

### 3. API Security

- **Rate Limiting**: Limit API requests
- **Input Validation**: Validate all inputs
- **Error Handling**: Secure error handling

## Performance Considerations

### 1. Caching Strategy

- **Feature Access**: Cache feature access data
- **Usage Data**: Cache usage tracking data
- **Plan Data**: Cache subscription plan data

### 2. Database Optimization

- **Indexes**: Optimize feature queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimize feature queries

### 3. API Performance

- **Response Caching**: Cache API responses
- **Batch Operations**: Batch usage tracking
- **Async Processing**: Async feature validation

## Monitoring and Analytics

### 1. Feature Usage Metrics

- **Feature Adoption**: Track feature adoption rates
- **Usage Patterns**: Analyze usage patterns
- **Limit Breaches**: Monitor usage limit breaches

### 2. Access Control Metrics

- **Access Denials**: Track access denials
- **Upgrade Conversions**: Track upgrade conversions
- **Feature Requests**: Track feature requests

### 3. Business Analytics

- **Plan Performance**: Analyze plan performance
- **Feature Value**: Analyze feature value
- **User Behavior**: Analyze user behavior

## Testing Strategy

### 1. Unit Tests

- **Feature Validation**: Test feature validation logic
- **Usage Tracking**: Test usage tracking functions
- **Access Control**: Test access control logic

### 2. Integration Tests

- **API Integration**: Test API feature restrictions
- **Database Integration**: Test feature data persistence
- **Frontend Integration**: Test frontend feature gates

### 3. End-to-End Tests

- **Feature Flow**: Test complete feature flow
- **Restriction Flow**: Test feature restriction flow
- **Upgrade Flow**: Test upgrade flow

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development environment
- **Staging**: Staging environment for testing
- **Production**: Production environment

### 2. Configuration

- **Feature Flags**: Feature flag configuration
- **Usage Limits**: Usage limit configuration
- **Access Control**: Access control configuration

### 3. Monitoring

- **Feature Monitoring**: Monitor feature usage
- **Access Monitoring**: Monitor access control
- **Performance Monitoring**: Monitor system performance

---

**This specification provides a comprehensive foundation for implementing the feature restrictions system in Allnimall Store CMS.**
