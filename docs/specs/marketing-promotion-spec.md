# Marketing & Promotion Add-on Specification

## Overview

This specification defines the Marketing & Promotion add-on module for Allnimall Store CMS, including campaign management, customer engagement, communication tools, and analytics.

## Functional Requirements

### 1. Campaign Management

#### 1.1 Promotional Campaigns

- **Campaign Creation**: Create targeted marketing campaigns
- **Campaign Scheduling**: Schedule campaigns for specific dates/times
- **Campaign Tracking**: Track campaign performance and metrics
- **Campaign Templates**: Pre-built campaign templates

#### 1.2 Discount Management

- **Discount Types**: Percentage, fixed amount, buy-one-get-one
- **Discount Rules**: Minimum purchase, product categories, customer segments
- **Promotional Codes**: Generate and manage promotional codes
- **Bulk Discounts**: Apply discounts to multiple products

### 2. Customer Engagement

#### 2.1 Customer Segmentation

- **Demographic Segmentation**: Age, gender, location, income
- **Behavioral Segmentation**: Purchase history, browsing behavior, engagement
- **Value-based Segmentation**: Customer lifetime value, purchase frequency
- **Custom Segments**: User-defined customer segments

#### 2.2 Targeted Marketing

- **Personalized Campaigns**: Personalized marketing messages
- **Behavioral Targeting**: Target based on customer behavior
- **Predictive Marketing**: AI-powered marketing recommendations
- **A/B Testing**: Test different marketing approaches

### 3. Communication Tools

#### 3.1 Email Marketing

- **Email Campaigns**: Create and send email campaigns
- **Email Templates**: Professional email templates
- **Newsletter Management**: Manage customer newsletters
- **Delivery Tracking**: Track email delivery and engagement

#### 3.2 SMS Marketing

- **SMS Campaigns**: Send SMS marketing messages
- **Bulk Messaging**: Send messages to multiple customers
- **SMS Templates**: Pre-built SMS message templates
- **Delivery Reports**: Track SMS delivery status

#### 3.3 Social Media Integration

- **Social Media Posting**: Post to social media platforms
- **Social Media Analytics**: Track social media performance
- **Social Media Management**: Manage multiple social accounts
- **Social Media Advertising**: Create and manage social ads

### 4. Analytics & Insights

#### 4.1 Marketing ROI

- **Campaign ROI**: Calculate return on investment for campaigns
- **Channel Performance**: Compare performance across channels
- **Cost per Acquisition**: Track customer acquisition costs
- **Return on Investment**: Overall marketing ROI analysis

#### 4.2 Customer Behavior Analysis

- **Purchase Patterns**: Analyze customer purchase patterns
- **Engagement Metrics**: Track customer engagement levels
- **Retention Analysis**: Analyze customer retention rates
- **Lifetime Value**: Calculate customer lifetime value

## Technical Requirements

### 1. Database Schema

#### 1.1 Campaign Management Tables

```sql
-- Marketing campaigns
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL, -- email, sms, social, discount
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, active, completed, cancelled
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  target_audience JSONB, -- segmentation criteria
  campaign_data JSONB, -- campaign-specific data
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign performance
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  metric_name VARCHAR(100) NOT NULL, -- opens, clicks, conversions, revenue
  metric_value DECIMAL(15,2) NOT NULL,
  metric_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Discount campaigns
CREATE TABLE discount_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  discount_type VARCHAR(50) NOT NULL, -- percentage, fixed_amount, bogo
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_purchase DECIMAL(10,2),
  maximum_discount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Customer Segmentation Tables

```sql
-- Customer segments
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  segment_criteria JSONB NOT NULL, -- segmentation rules
  customer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Segment customers
CREATE TABLE segment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES customer_segments(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(segment_id, customer_id)
);

-- Customer engagement
CREATE TABLE customer_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  engagement_type VARCHAR(50) NOT NULL, -- email_open, email_click, sms_click, social_engagement
  engagement_data JSONB,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  engagement_date TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Communication Tables

```sql
-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  subject VARCHAR(255) NOT NULL,
  email_content TEXT NOT NULL,
  template_id UUID,
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- SMS campaigns
CREATE TABLE sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  message_content TEXT NOT NULL,
  sender_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social media campaigns
CREATE TABLE social_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id),
  platform VARCHAR(50) NOT NULL, -- facebook, instagram, twitter, linkedin
  post_content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_time TIMESTAMP,
  posted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Campaign Management

```
GET /api/marketing/campaigns - Get marketing campaigns
POST /api/marketing/campaigns - Create campaign
GET /api/marketing/campaigns/:id - Get campaign details
PUT /api/marketing/campaigns/:id - Update campaign
DELETE /api/marketing/campaigns/:id - Delete campaign
POST /api/marketing/campaigns/:id/launch - Launch campaign
POST /api/marketing/campaigns/:id/pause - Pause campaign
```

#### 2.2 Customer Segmentation

```
GET /api/marketing/segments - Get customer segments
POST /api/marketing/segments - Create segment
GET /api/marketing/segments/:id - Get segment details
PUT /api/marketing/segments/:id - Update segment
DELETE /api/marketing/segments/:id - Delete segment
POST /api/marketing/segments/:id/refresh - Refresh segment customers
```

#### 2.3 Communication Tools

```
GET /api/marketing/email-campaigns - Get email campaigns
POST /api/marketing/email-campaigns - Create email campaign
GET /api/marketing/sms-campaigns - Get SMS campaigns
POST /api/marketing/sms-campaigns - Create SMS campaign
GET /api/marketing/social-campaigns - Get social campaigns
POST /api/marketing/social-campaigns - Create social campaign
```

#### 2.4 Analytics & Reporting

```
GET /api/marketing/analytics/campaigns - Get campaign analytics
GET /api/marketing/analytics/roi - Get marketing ROI
GET /api/marketing/analytics/customer-behavior - Get customer behavior analytics
GET /api/marketing/analytics/engagement - Get engagement analytics
```

### 3. Service Implementation

#### 3.1 Campaign Service

```typescript
export class CampaignService {
	async createCampaign(
		campaignData: CreateCampaignData
	): Promise<MarketingCampaign> {
		const campaign = await this.db.marketing_campaigns.create({
			data: {
				...campaignData,
				status: "draft",
				created_by: campaignData.user_id,
			},
		});

		// Create campaign-specific data
		if (campaignData.campaign_type === "email") {
			await this.createEmailCampaign(campaign.id, campaignData.email_data);
		} else if (campaignData.campaign_type === "sms") {
			await this.createSMSCampaign(campaign.id, campaignData.sms_data);
		} else if (campaignData.campaign_type === "discount") {
			await this.createDiscountCampaign(
				campaign.id,
				campaignData.discount_data
			);
		}

		return campaign;
	}

	async launchCampaign(campaignId: string): Promise<MarketingCampaign> {
		const campaign = await this.db.marketing_campaigns.findUnique({
			where: { id: campaignId },
		});

		if (!campaign) {
			throw new Error("Campaign not found");
		}

		if (campaign.status !== "draft" && campaign.status !== "scheduled") {
			throw new Error("Campaign cannot be launched");
		}

		// Update campaign status
		const updatedCampaign = await this.db.marketing_campaigns.update({
			where: { id: campaignId },
			data: { status: "active" },
		});

		// Execute campaign based on type
		await this.executeCampaign(campaign);

		return updatedCampaign;
	}

	private async executeCampaign(campaign: MarketingCampaign): Promise<void> {
		switch (campaign.campaign_type) {
			case "email":
				await this.executeEmailCampaign(campaign);
				break;
			case "sms":
				await this.executeSMSCampaign(campaign);
				break;
			case "social":
				await this.executeSocialCampaign(campaign);
				break;
			case "discount":
				await this.activateDiscountCampaign(campaign);
				break;
		}
	}

	private async executeEmailCampaign(
		campaign: MarketingCampaign
	): Promise<void> {
		const emailCampaign = await this.db.email_campaigns.findFirst({
			where: { campaign_id: campaign.id },
		});

		if (!emailCampaign) {
			throw new Error("Email campaign data not found");
		}

		// Get target audience
		const targetCustomers = await this.getTargetCustomers(
			campaign.target_audience
		);

		// Send emails
		for (const customer of targetCustomers) {
			await this.sendEmail(customer, emailCampaign);
		}
	}

	private async sendEmail(
		customer: Customer,
		emailCampaign: EmailCampaign
	): Promise<void> {
		// Personalize email content
		const personalizedContent = this.personalizeEmailContent(
			emailCampaign.email_content,
			customer
		);

		// Send email via email service
		await this.emailService.send({
			to: customer.email,
			subject: emailCampaign.subject,
			content: personalizedContent,
			from: {
				name: emailCampaign.sender_name,
				email: emailCampaign.sender_email,
			},
		});

		// Track email sent
		await this.trackEngagement(customer.id, "email_sent", {
			campaign_id: emailCampaign.campaign_id,
		});
	}
}
```

#### 3.2 Segmentation Service

```typescript
export class SegmentationService {
	async createSegment(
		segmentData: CreateSegmentData
	): Promise<CustomerSegment> {
		const segment = await this.db.customer_segments.create({
			data: {
				...segmentData,
				created_by: segmentData.user_id,
			},
		});

		// Calculate initial customer count
		await this.refreshSegmentCustomers(segment.id);

		return segment;
	}

	async refreshSegmentCustomers(segmentId: string): Promise<void> {
		const segment = await this.db.customer_segments.findUnique({
			where: { id: segmentId },
		});

		if (!segment) {
			throw new Error("Segment not found");
		}

		// Clear existing segment customers
		await this.db.segment_customers.deleteMany({
			where: { segment_id: segmentId },
		});

		// Find customers matching criteria
		const matchingCustomers = await this.findMatchingCustomers(
			segment.segment_criteria
		);

		// Add customers to segment
		for (const customer of matchingCustomers) {
			await this.db.segment_customers.create({
				data: {
					segment_id: segmentId,
					customer_id: customer.id,
				},
			});
		}

		// Update customer count
		await this.db.customer_segments.update({
			where: { id: segmentId },
			data: { customer_count: matchingCustomers.length },
		});
	}

	private async findMatchingCustomers(
		criteria: SegmentCriteria
	): Promise<Customer[]> {
		let query = this.db.customers.findMany({
			where: {
				is_active: true,
			},
		});

		// Apply demographic filters
		if (criteria.demographics) {
			const demoFilters: any = {};

			if (criteria.demographics.age_range) {
				demoFilters.age = {
					gte: criteria.demographics.age_range.min,
					lte: criteria.demographics.age_range.max,
				};
			}

			if (criteria.demographics.gender) {
				demoFilters.gender = criteria.demographics.gender;
			}

			if (criteria.demographics.location) {
				demoFilters.city = criteria.demographics.location;
			}

			query = this.db.customers.findMany({
				where: {
					...demoFilters,
					is_active: true,
				},
			});
		}

		// Apply behavioral filters
		if (criteria.behavior) {
			// Add behavioral filtering logic
			// This would involve complex queries based on purchase history, engagement, etc.
		}

		// Apply value-based filters
		if (criteria.value_based) {
			// Add value-based filtering logic
			// This would involve calculating customer lifetime value, purchase frequency, etc.
		}

		return await query;
	}
}
```

#### 3.3 Analytics Service

```typescript
export class MarketingAnalyticsService {
	async getCampaignAnalytics(
		campaignId: string,
		dateRange: DateRange
	): Promise<CampaignAnalytics> {
		const campaign = await this.db.marketing_campaigns.findUnique({
			where: { id: campaignId },
		});

		if (!campaign) {
			throw new Error("Campaign not found");
		}

		// Get performance metrics
		const performance = await this.db.campaign_performance.findMany({
			where: {
				campaign_id: campaignId,
				metric_date: {
					gte: dateRange.start,
					lte: dateRange.end,
				},
			},
		});

		// Calculate metrics
		const metrics = this.calculateCampaignMetrics(performance);

		// Get engagement data
		const engagement = await this.db.customer_engagement.findMany({
			where: {
				campaign_id: campaignId,
				engagement_date: {
					gte: dateRange.start,
					lte: dateRange.end,
				},
			},
		});

		return {
			campaign: campaign,
			metrics: metrics,
			engagement: this.analyzeEngagement(engagement),
			roi: await this.calculateCampaignROI(campaignId, dateRange),
		};
	}

	private calculateCampaignMetrics(
		performance: CampaignPerformance[]
	): CampaignMetrics {
		const metrics: CampaignMetrics = {
			opens: 0,
			clicks: 0,
			conversions: 0,
			revenue: 0,
			open_rate: 0,
			click_rate: 0,
			conversion_rate: 0,
		};

		for (const record of performance) {
			switch (record.metric_name) {
				case "opens":
					metrics.opens += record.metric_value;
					break;
				case "clicks":
					metrics.clicks += record.metric_value;
					break;
				case "conversions":
					metrics.conversions += record.metric_value;
					break;
				case "revenue":
					metrics.revenue += record.metric_value;
					break;
			}
		}

		// Calculate rates
		if (metrics.opens > 0) {
			metrics.click_rate = (metrics.clicks / metrics.opens) * 100;
			metrics.conversion_rate = (metrics.conversions / metrics.opens) * 100;
		}

		return metrics;
	}

	async calculateMarketingROI(dateRange: DateRange): Promise<MarketingROI> {
		// Get all campaigns in date range
		const campaigns = await this.db.marketing_campaigns.findMany({
			where: {
				start_date: { lte: dateRange.end },
				end_date: { gte: dateRange.start },
			},
		});

		let totalCost = 0;
		let totalRevenue = 0;

		for (const campaign of campaigns) {
			const campaignROI = await this.calculateCampaignROI(
				campaign.id,
				dateRange
			);
			totalCost += campaignROI.cost;
			totalRevenue += campaignROI.revenue;
		}

		return {
			total_cost: totalCost,
			total_revenue: totalRevenue,
			roi_percentage:
				totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0,
			campaign_count: campaigns.length,
		};
	}
}
```

## Frontend Components

### 1. Campaign Management Components

#### 1.1 Campaign List Component

```typescript
export function CampaignList() {
	const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCampaigns() {
			try {
				const data = await fetch("/api/marketing/campaigns").then((res) =>
					res.json()
				);
				setCampaigns(data);
			} catch (error) {
				console.error("Error fetching campaigns:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchCampaigns();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="campaign-list">
			<div className="campaigns-header">
				<h2>Marketing Campaigns</h2>
				<Button onClick={() => router.push("/admin/marketing/campaigns/new")}>
					Create Campaign
				</Button>
			</div>

			<div className="campaigns-table">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Type</th>
							<th>Status</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Performance</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{campaigns.map((campaign) => (
							<tr key={campaign.id}>
								<td>{campaign.name}</td>
								<td>
									<Badge variant="outline">{campaign.campaign_type}</Badge>
								</td>
								<td>
									<Badge
										variant={
											campaign.status === "active"
												? "success"
												: campaign.status === "draft"
												? "secondary"
												: "warning"
										}>
										{campaign.status}
									</Badge>
								</td>
								<td>{formatDate(campaign.start_date)}</td>
								<td>{formatDate(campaign.end_date)}</td>
								<td>
									<CampaignPerformance campaignId={campaign.id} />
								</td>
								<td>
									<Button variant="outline" size="sm">
										View
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
```

#### 1.2 Campaign Form Component

```typescript
export function CampaignForm({ campaignId }: { campaignId?: string }) {
	const [formData, setFormData] = useState<CampaignFormData>({
		name: "",
		description: "",
		campaign_type: "email",
		start_date: "",
		end_date: "",
		target_audience: {},
		campaign_data: {},
	});

	const [campaignType, setCampaignType] = useState("email");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (campaignId) {
				await updateCampaign(campaignId, formData);
			} else {
				await createCampaign(formData);
			}

			router.push("/admin/marketing/campaigns");
		} catch (error) {
			console.error("Error saving campaign:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="campaign-form">
			<div className="form-group">
				<Label htmlFor="name">Campaign Name</Label>
				<Input
					id="name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					required
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={(e) =>
						setFormData({ ...formData, description: e.target.value })
					}
				/>
			</div>

			<div className="form-row">
				<div className="form-group">
					<Label htmlFor="campaign_type">Campaign Type</Label>
					<Select
						value={formData.campaign_type}
						onValueChange={(value) => {
							setFormData({ ...formData, campaign_type: value });
							setCampaignType(value);
						}}>
						<SelectItem value="email">Email Campaign</SelectItem>
						<SelectItem value="sms">SMS Campaign</SelectItem>
						<SelectItem value="social">Social Media Campaign</SelectItem>
						<SelectItem value="discount">Discount Campaign</SelectItem>
					</Select>
				</div>

				<div className="form-group">
					<Label htmlFor="start_date">Start Date</Label>
					<Input
						id="start_date"
						type="datetime-local"
						value={formData.start_date}
						onChange={(e) =>
							setFormData({ ...formData, start_date: e.target.value })
						}
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="end_date">End Date</Label>
					<Input
						id="end_date"
						type="datetime-local"
						value={formData.end_date}
						onChange={(e) =>
							setFormData({ ...formData, end_date: e.target.value })
						}
						required
					/>
				</div>
			</div>

			{/* Campaign Type Specific Fields */}
			{campaignType === "email" && (
				<EmailCampaignFields
					data={formData.campaign_data}
					onChange={(data) => setFormData({ ...formData, campaign_data: data })}
				/>
			)}

			{campaignType === "sms" && (
				<SMSCampaignFields
					data={formData.campaign_data}
					onChange={(data) => setFormData({ ...formData, campaign_data: data })}
				/>
			)}

			{campaignType === "discount" && (
				<DiscountCampaignFields
					data={formData.campaign_data}
					onChange={(data) => setFormData({ ...formData, campaign_data: data })}
				/>
			)}

			{/* Target Audience */}
			<TargetAudienceSelector
				audience={formData.target_audience}
				onChange={(audience) =>
					setFormData({ ...formData, target_audience: audience })
				}
			/>

			<Button type="submit">
				{campaignId ? "Update Campaign" : "Create Campaign"}
			</Button>
		</form>
	);
}
```

### 2. Customer Segmentation Components

#### 2.1 Segment List Component

```typescript
export function SegmentList() {
	const [segments, setSegments] = useState<CustomerSegment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSegments() {
			try {
				const data = await fetch("/api/marketing/segments").then((res) =>
					res.json()
				);
				setSegments(data);
			} catch (error) {
				console.error("Error fetching segments:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchSegments();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="segment-list">
			<div className="segments-header">
				<h2>Customer Segments</h2>
				<Button onClick={() => router.push("/admin/marketing/segments/new")}>
					Create Segment
				</Button>
			</div>

			<div className="segments-grid">
				{segments.map((segment) => (
					<div key={segment.id} className="segment-card">
						<div className="segment-header">
							<h3>{segment.name}</h3>
							<Badge variant="outline">
								{segment.customer_count} customers
							</Badge>
						</div>
						<p className="segment-description">{segment.description}</p>
						<div className="segment-actions">
							<Button variant="outline" size="sm">
								View Customers
							</Button>
							<Button variant="outline" size="sm">
								Edit
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
```

### 3. Analytics Components

#### 3.1 Marketing Dashboard Component

```typescript
export function MarketingDashboard() {
	const [analytics, setAnalytics] = useState<MarketingAnalytics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAnalytics() {
			try {
				const data = await fetch("/api/marketing/analytics/dashboard").then(
					(res) => res.json()
				);
				setAnalytics(data);
			} catch (error) {
				console.error("Error fetching analytics:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchAnalytics();
	}, []);

	if (loading) return <LoadingSpinner />;
	if (!analytics) return <div>No data available</div>;

	return (
		<div className="marketing-dashboard">
			<div className="dashboard-header">
				<h2>Marketing Dashboard</h2>
				<div className="date-range-selector">
					<DateRangePicker />
				</div>
			</div>

			<div className="metrics-grid">
				<div className="metric-card">
					<h3>Total Campaigns</h3>
					<p className="metric-value">{analytics.total_campaigns}</p>
				</div>

				<div className="metric-card">
					<h3>Active Campaigns</h3>
					<p className="metric-value">{analytics.active_campaigns}</p>
				</div>

				<div className="metric-card">
					<h3>Total ROI</h3>
					<p className="metric-value">{analytics.total_roi}%</p>
				</div>

				<div className="metric-card">
					<h3>Customer Engagement</h3>
					<p className="metric-value">{analytics.engagement_rate}%</p>
				</div>
			</div>

			<div className="charts-grid">
				<div className="chart-card">
					<h3>Campaign Performance</h3>
					<CampaignPerformanceChart data={analytics.campaign_performance} />
				</div>

				<div className="chart-card">
					<h3>Customer Engagement</h3>
					<EngagementChart data={analytics.engagement_data} />
				</div>

				<div className="chart-card">
					<h3>Marketing ROI</h3>
					<ROIChart data={analytics.roi_data} />
				</div>

				<div className="chart-card">
					<h3>Channel Performance</h3>
					<ChannelPerformanceChart data={analytics.channel_performance} />
				</div>
			</div>
		</div>
	);
}
```

## Integration Points

### 1. Subscription System Integration

- **Add-on Validation**: Validate Marketing add-on subscription
- **Feature Access**: Control Marketing feature access
- **Usage Tracking**: Track Marketing feature usage

### 2. Customer Management Integration

- **Customer Data**: Access customer information for segmentation
- **Purchase History**: Use purchase data for behavioral targeting
- **Customer Profiles**: Personalize marketing based on customer profiles

### 3. Sales System Integration

- **Revenue Tracking**: Track revenue from marketing campaigns
- **Conversion Tracking**: Track conversions from marketing activities
- **Sales Attribution**: Attribute sales to marketing campaigns

## Security Considerations

### 1. Data Protection

- **Customer Data**: Protect customer personal information
- **Marketing Data**: Secure marketing campaign data
- **Analytics Data**: Protect marketing analytics data

### 2. Access Control

- **Role-based Access**: Role-based access to marketing features
- **Campaign Permissions**: Control who can create and manage campaigns
- **Data Privacy**: Ensure compliance with data privacy regulations

### 3. Communication Security

- **Email Security**: Secure email delivery and tracking
- **SMS Security**: Secure SMS delivery and tracking
- **Social Media Security**: Secure social media integration

## Performance Considerations

### 1. Campaign Performance

- **Email Delivery**: Optimize email delivery performance
- **SMS Delivery**: Optimize SMS delivery performance
- **Social Media**: Optimize social media posting performance

### 2. Analytics Performance

- **Data Processing**: Optimize analytics data processing
- **Report Generation**: Optimize report generation performance
- **Real-time Updates**: Optimize real-time analytics updates

### 3. Segmentation Performance

- **Customer Queries**: Optimize customer segmentation queries
- **Segment Updates**: Optimize segment customer updates
- **Real-time Segmentation**: Optimize real-time segmentation

## Testing Strategy

### 1. Unit Tests

- **Campaign Logic**: Test campaign creation and management logic
- **Segmentation Logic**: Test customer segmentation logic
- **Analytics Logic**: Test marketing analytics calculations

### 2. Integration Tests

- **API Integration**: Test Marketing API endpoints
- **Database Integration**: Test Marketing data persistence
- **Frontend Integration**: Test Marketing UI components

### 3. End-to-End Tests

- **Campaign Flow**: Test complete campaign workflow
- **Segmentation Flow**: Test customer segmentation workflow
- **Analytics Flow**: Test marketing analytics workflow

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development environment
- **Staging**: Staging environment for testing
- **Production**: Production environment

### 2. Configuration

- **Marketing Settings**: Marketing module configuration
- **Email Settings**: Email service configuration
- **SMS Settings**: SMS service configuration

### 3. External Services

- **Email Service**: Email delivery service integration
- **SMS Service**: SMS delivery service integration
- **Social Media APIs**: Social media platform API integration

---

**This specification provides a comprehensive foundation for implementing the Marketing & Promotion add-on module in Allnimall Store CMS.**
