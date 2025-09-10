# Store Setup System Specification

## Overview

This specification defines the store setup system for Allnimall Store CMS, including initial store configuration, store information management, and multi-store support.

## Functional Requirements

### 1. Initial Store Setup

#### 1.1 Store Creation Process

- **Post-Registration Setup**: Store setup after user registration and email verification
- **Store Information**: Basic store information collection
- **Store Configuration**: Initial store configuration and settings
- **Store Activation**: Activate store for business operations

#### 1.2 Store Information Collection

- **Basic Information**: Store name, description, phone number
- **Address Information**: Complete address details
- **Contact Information**: Email, website, social media
- **Business Settings**: Currency, timezone, language preferences

### 2. Store Management

#### 2.1 Store Profile Management

- **Store Information**: Update store basic information
- **Store Settings**: Manage store configuration settings
- **Store Branding**: Basic store branding and customization
- **Store Status**: Manage store active/inactive status

#### 2.2 Multi-Store Support

- **Store Creation**: Create additional stores for the same user
- **Store Selection**: Switch between different stores
- **Store Permissions**: Manage user permissions per store
- **Store Data Isolation**: Ensure data isolation between stores

### 3. Store Configuration

#### 3.1 Business Settings

- **Currency Settings**: Set store currency and formatting
- **Timezone Settings**: Configure store timezone
- **Language Settings**: Set store language preferences
- **Tax Settings**: Configure tax rates and settings

#### 3.2 Operational Settings

- **Business Hours**: Set store operating hours
- **Contact Information**: Manage store contact details
- **Location Settings**: Store location and delivery areas
- **Service Settings**: Available services and pricing

## Technical Requirements

### 1. Database Schema

#### 1.1 Store Tables

```sql
-- Store information
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Indonesia',
  currency VARCHAR(3) DEFAULT 'IDR',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  language VARCHAR(10) DEFAULT 'id',
  logo_url TEXT,
  banner_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Store settings
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  setting_key VARCHAR(100) NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, setting_key)
);

-- Store business hours
CREATE TABLE store_business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, day_of_week)
);

-- Store services
CREATE TABLE store_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  service_price DECIMAL(10,2),
  service_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 User-Store Relationship Tables

```sql
-- User store ownership
CREATE TABLE user_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'owner', -- owner, manager, employee
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

-- Store user roles
CREATE TABLE store_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(store_id, user_id)
);
```

### 2. API Endpoints

#### 2.1 Store Management

```
GET /api/stores - Get user's stores
POST /api/stores - Create new store
GET /api/stores/:id - Get store details
PUT /api/stores/:id - Update store
DELETE /api/stores/:id - Delete store
POST /api/stores/:id/activate - Activate store
POST /api/stores/:id/deactivate - Deactivate store
```

#### 2.2 Store Setup

```
POST /api/stores/setup - Complete initial store setup
GET /api/stores/setup/status - Get setup status
PUT /api/stores/setup/complete - Mark setup as complete
```

#### 2.3 Store Settings

```
GET /api/stores/:id/settings - Get store settings
PUT /api/stores/:id/settings - Update store settings
GET /api/stores/:id/business-hours - Get business hours
PUT /api/stores/:id/business-hours - Update business hours
GET /api/stores/:id/services - Get store services
POST /api/stores/:id/services - Add store service
PUT /api/stores/:id/services/:serviceId - Update store service
DELETE /api/stores/:id/services/:serviceId - Delete store service
```

### 3. Service Implementation

#### 3.1 Store Service

```typescript
export class StoreService {
	async createStore(
		userId: string,
		storeData: CreateStoreData
	): Promise<Store> {
		// Create store
		const store = await this.db.stores.create({
			data: {
				...storeData,
				is_active: true,
			},
		});

		// Create user-store relationship
		await this.db.user_stores.create({
			data: {
				user_id: userId,
				store_id: store.id,
				role: "owner",
				is_primary: true,
			},
		});

		// Create default store settings
		await this.createDefaultStoreSettings(store.id);

		// Create default business hours
		await this.createDefaultBusinessHours(store.id);

		return store;
	}

	async updateStore(
		storeId: string,
		updateData: UpdateStoreData
	): Promise<Store> {
		return await this.db.stores.update({
			where: { id: storeId },
			data: { ...updateData, updated_at: new Date() },
		});
	}

	async getUserStores(userId: string): Promise<Store[]> {
		const userStores = await this.db.user_stores.findMany({
			where: { user_id: userId },
			include: {
				store: true,
			},
		});

		return userStores.map((us) => us.store);
	}

	async getStoreById(storeId: string): Promise<Store | null> {
		return await this.db.stores.findUnique({
			where: { id: storeId },
			include: {
				settings: true,
				business_hours: true,
				services: true,
			},
		});
	}

	async completeStoreSetup(
		storeId: string,
		setupData: StoreSetupData
	): Promise<Store> {
		// Update store with setup data
		const store = await this.updateStore(storeId, setupData);

		// Create business hours if provided
		if (setupData.business_hours) {
			await this.updateBusinessHours(storeId, setupData.business_hours);
		}

		// Create services if provided
		if (setupData.services) {
			await this.createStoreServices(storeId, setupData.services);
		}

		// Mark setup as complete
		await this.updateStoreSetting(storeId, "setup_completed", true);

		return store;
	}

	private async createDefaultStoreSettings(storeId: string): Promise<void> {
		const defaultSettings = [
			{ key: "setup_completed", value: false },
			{ key: "tax_rate", value: 0.11 }, // 11% VAT
			{ key: "currency_format", value: "IDR" },
			{ key: "date_format", value: "DD/MM/YYYY" },
			{ key: "time_format", value: "24h" },
		];

		for (const setting of defaultSettings) {
			await this.db.store_settings.create({
				data: {
					store_id: storeId,
					setting_key: setting.key,
					setting_value: setting.value,
				},
			});
		}
	}

	private async createDefaultBusinessHours(storeId: string): Promise<void> {
		const defaultHours = [
			{ day: 1, open: "08:00", close: "17:00" }, // Monday
			{ day: 2, open: "08:00", close: "17:00" }, // Tuesday
			{ day: 3, open: "08:00", close: "17:00" }, // Wednesday
			{ day: 4, open: "08:00", close: "17:00" }, // Thursday
			{ day: 5, open: "08:00", close: "17:00" }, // Friday
			{ day: 6, open: "08:00", close: "15:00" }, // Saturday
			{ day: 0, is_closed: true }, // Sunday
		];

		for (const hours of defaultHours) {
			await this.db.store_business_hours.create({
				data: {
					store_id: storeId,
					day_of_week: hours.day,
					open_time: hours.open,
					close_time: hours.close,
					is_closed: hours.is_closed || false,
				},
			});
		}
	}

	async updateBusinessHours(
		storeId: string,
		businessHours: BusinessHoursData[]
	): Promise<void> {
		// Delete existing business hours
		await this.db.store_business_hours.deleteMany({
			where: { store_id: storeId },
		});

		// Create new business hours
		for (const hours of businessHours) {
			await this.db.store_business_hours.create({
				data: {
					store_id: storeId,
					day_of_week: hours.day_of_week,
					open_time: hours.open_time,
					close_time: hours.close_time,
					is_closed: hours.is_closed,
				},
			});
		}
	}

	async createStoreServices(
		storeId: string,
		services: CreateServiceData[]
	): Promise<void> {
		for (const service of services) {
			await this.db.store_services.create({
				data: {
					store_id: storeId,
					...service,
				},
			});
		}
	}

	async updateStoreSetting(
		storeId: string,
		key: string,
		value: any
	): Promise<void> {
		await this.db.store_settings.upsert({
			where: {
				store_id_setting_key: {
					store_id: storeId,
					setting_key: key,
				},
			},
			update: {
				setting_value: value,
				updated_at: new Date(),
			},
			create: {
				store_id: storeId,
				setting_key: key,
				setting_value: value,
			},
		});
	}
}
```

#### 3.2 Store Setup Service

```typescript
export class StoreSetupService {
	async checkSetupStatus(userId: string): Promise<SetupStatus> {
		const userStores = await this.storeService.getUserStores(userId);

		if (userStores.length === 0) {
			return {
				needs_setup: true,
				step: "create_store",
				message: "Please create your first store",
			};
		}

		const primaryStore = userStores.find((store) => store.is_primary);
		if (!primaryStore) {
			return {
				needs_setup: true,
				step: "select_primary",
				message: "Please select a primary store",
			};
		}

		const setupCompleted = await this.checkSetupCompleted(primaryStore.id);
		if (!setupCompleted) {
			return {
				needs_setup: true,
				step: "complete_setup",
				message: "Please complete your store setup",
			};
		}

		return {
			needs_setup: false,
			step: "completed",
			message: "Store setup completed",
		};
	}

	private async checkSetupCompleted(storeId: string): Promise<boolean> {
		const setting = await this.db.store_settings.findUnique({
			where: {
				store_id_setting_key: {
					store_id: storeId,
					setting_key: "setup_completed",
				},
			},
		});

		return setting?.setting_value === true;
	}

	async getSetupProgress(storeId: string): Promise<SetupProgress> {
		const store = await this.storeService.getStoreById(storeId);
		if (!store) {
			throw new Error("Store not found");
		}

		const progress = {
			basic_info: this.checkBasicInfo(store),
			business_hours: this.checkBusinessHours(store),
			services: this.checkServices(store),
			settings: this.checkSettings(store),
		};

		const completedSteps = Object.values(progress).filter(Boolean).length;
		const totalSteps = Object.keys(progress).length;
		const percentage = (completedSteps / totalSteps) * 100;

		return {
			...progress,
			percentage,
			completed_steps: completedSteps,
			total_steps: totalSteps,
		};
	}

	private checkBasicInfo(store: Store): boolean {
		return !!(
			store.name &&
			store.phone &&
			store.email &&
			store.address &&
			store.city
		);
	}

	private checkBusinessHours(store: Store): boolean {
		return store.business_hours && store.business_hours.length > 0;
	}

	private checkServices(store: Store): boolean {
		return store.services && store.services.length > 0;
	}

	private checkSettings(store: Store): boolean {
		return store.settings && store.settings.length > 0;
	}
}
```

## Frontend Components

### 1. Store Setup Components

#### 1.1 Store Setup Form Component

```typescript
export function StoreSetupForm() {
	const [currentStep, setCurrentStep] = useState(1);
	const [formData, setFormData] = useState<StoreSetupFormData>({
		// Basic Information
		name: "",
		description: "",
		phone: "",
		email: "",
		website: "",

		// Address Information
		address: "",
		city: "",
		state: "",
		postal_code: "",

		// Business Settings
		currency: "IDR",
		timezone: "Asia/Jakarta",
		language: "id",

		// Business Hours
		business_hours: [],

		// Services
		services: [],
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const steps = [
		{ id: 1, title: "Basic Information", description: "Store details" },
		{ id: 2, title: "Address", description: "Store location" },
		{ id: 3, title: "Business Hours", description: "Operating hours" },
		{ id: 4, title: "Services", description: "Available services" },
		{ id: 5, title: "Review", description: "Review and complete" },
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/stores/setup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Setup failed");
			}

			// Redirect to dashboard
			router.push("/admin/dashboard");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const nextStep = () => {
		if (currentStep < steps.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	return (
		<div className="store-setup">
			<div className="setup-header">
				<h1>Store Setup</h1>
				<p>Let's set up your pet business store</p>
			</div>

			<div className="setup-progress">
				<div className="progress-bar">
					{steps.map((step, index) => (
						<div
							key={step.id}
							className={`progress-step ${
								currentStep >= step.id ? "active" : ""
							}`}>
							<div className="step-number">{step.id}</div>
							<div className="step-info">
								<h3>{step.title}</h3>
								<p>{step.description}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<form onSubmit={handleSubmit} className="setup-form">
				{error && (
					<div className="error-message">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</div>
				)}

				{currentStep === 1 && (
					<BasicInfoStep data={formData} onChange={setFormData} />
				)}

				{currentStep === 2 && (
					<AddressStep data={formData} onChange={setFormData} />
				)}

				{currentStep === 3 && (
					<BusinessHoursStep data={formData} onChange={setFormData} />
				)}

				{currentStep === 4 && (
					<ServicesStep data={formData} onChange={setFormData} />
				)}

				{currentStep === 5 && <ReviewStep data={formData} />}

				<div className="form-navigation">
					{currentStep > 1 && (
						<Button type="button" variant="outline" onClick={prevStep}>
							Previous
						</Button>
					)}

					{currentStep < steps.length ? (
						<Button type="button" onClick={nextStep}>
							Next
						</Button>
					) : (
						<Button type="submit" disabled={loading}>
							{loading ? "Setting up..." : "Complete Setup"}
						</Button>
					)}
				</div>
			</form>
		</div>
	);
}
```

#### 1.2 Basic Information Step Component

```typescript
export function BasicInfoStep({
	data,
	onChange,
}: {
	data: StoreSetupFormData;
	onChange: (data: StoreSetupFormData) => void;
}) {
	const updateField = (field: string, value: any) => {
		onChange({ ...data, [field]: value });
	};

	return (
		<div className="basic-info-step">
			<div className="step-header">
				<h2>Basic Information</h2>
				<p>Tell us about your pet business</p>
			</div>

			<div className="form-grid">
				<div className="form-group">
					<Label htmlFor="name">Store Name *</Label>
					<Input
						id="name"
						value={data.name}
						onChange={(e) => updateField("name", e.target.value)}
						placeholder="e.g., Happy Pet Shop"
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="phone">Phone Number *</Label>
					<Input
						id="phone"
						value={data.phone}
						onChange={(e) => updateField("phone", e.target.value)}
						placeholder="e.g., +62 812 3456 7890"
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="email">Email Address *</Label>
					<Input
						id="email"
						type="email"
						value={data.email}
						onChange={(e) => updateField("email", e.target.value)}
						placeholder="e.g., info@happypetshop.com"
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="website">Website (Optional)</Label>
					<Input
						id="website"
						value={data.website}
						onChange={(e) => updateField("website", e.target.value)}
						placeholder="e.g., https://happypetshop.com"
					/>
				</div>

				<div className="form-group full-width">
					<Label htmlFor="description">Store Description</Label>
					<Textarea
						id="description"
						value={data.description}
						onChange={(e) => updateField("description", e.target.value)}
						placeholder="Describe your pet business..."
						rows={4}
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="currency">Currency</Label>
					<Select
						value={data.currency}
						onValueChange={(value) => updateField("currency", value)}>
						<SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
						<SelectItem value="USD">US Dollar (USD)</SelectItem>
					</Select>
				</div>

				<div className="form-group">
					<Label htmlFor="timezone">Timezone</Label>
					<Select
						value={data.timezone}
						onValueChange={(value) => updateField("timezone", value)}>
						<SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
						<SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
						<SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
					</Select>
				</div>
			</div>
		</div>
	);
}
```

#### 1.3 Business Hours Step Component

```typescript
export function BusinessHoursStep({
	data,
	onChange,
}: {
	data: StoreSetupFormData;
	onChange: (data: StoreSetupFormData) => void;
}) {
	const days = [
		{ id: 0, name: "Sunday" },
		{ id: 1, name: "Monday" },
		{ id: 2, name: "Tuesday" },
		{ id: 3, name: "Wednesday" },
		{ id: 4, name: "Thursday" },
		{ id: 5, name: "Friday" },
		{ id: 6, name: "Saturday" },
	];

	const updateBusinessHours = (dayId: number, field: string, value: any) => {
		const updatedHours = data.business_hours.map((hours) =>
			hours.day_of_week === dayId ? { ...hours, [field]: value } : hours
		);

		// If day doesn't exist, add it
		if (!updatedHours.find((h) => h.day_of_week === dayId)) {
			updatedHours.push({
				day_of_week: dayId,
				open_time: "08:00",
				close_time: "17:00",
				is_closed: false,
			});
		}

		onChange({ ...data, business_hours: updatedHours });
	};

	return (
		<div className="business-hours-step">
			<div className="step-header">
				<h2>Business Hours</h2>
				<p>Set your store operating hours</p>
			</div>

			<div className="business-hours-list">
				{days.map((day) => {
					const dayHours = data.business_hours.find(
						(h) => h.day_of_week === day.id
					) || {
						day_of_week: day.id,
						open_time: "08:00",
						close_time: "17:00",
						is_closed: false,
					};

					return (
						<div key={day.id} className="business-hour-item">
							<div className="day-info">
								<Label>{day.name}</Label>
							</div>

							<div className="hours-controls">
								<Checkbox
									checked={dayHours.is_closed}
									onCheckedChange={(checked) =>
										updateBusinessHours(day.id, "is_closed", checked)
									}>
									Closed
								</Checkbox>

								{!dayHours.is_closed && (
									<div className="time-inputs">
										<Input
											type="time"
											value={dayHours.open_time}
											onChange={(e) =>
												updateBusinessHours(day.id, "open_time", e.target.value)
											}
										/>
										<span>to</span>
										<Input
											type="time"
											value={dayHours.close_time}
											onChange={(e) =>
												updateBusinessHours(
													day.id,
													"close_time",
													e.target.value
												)
											}
										/>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
```

### 2. Store Management Components

#### 2.1 Store Selector Component

```typescript
export function StoreSelector() {
	const [stores, setStores] = useState<Store[]>([]);
	const [currentStore, setCurrentStore] = useState<Store | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchStores() {
			try {
				const response = await fetch("/api/stores");
				const data = await response.json();
				setStores(data);

				// Set current store from context or first store
				const primaryStore = data.find((store: Store) => store.is_primary);
				setCurrentStore(primaryStore || data[0]);
			} catch (error) {
				console.error("Error fetching stores:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchStores();
	}, []);

	const switchStore = async (storeId: string) => {
		try {
			const response = await fetch(`/api/stores/${storeId}/switch`, {
				method: "POST",
			});

			if (response.ok) {
				const store = stores.find((s) => s.id === storeId);
				setCurrentStore(store || null);
				// Refresh page or update context
				window.location.reload();
			}
		} catch (error) {
			console.error("Error switching store:", error);
		}
	};

	if (loading) return <LoadingSpinner />;

	return (
		<div className="store-selector">
			<Select value={currentStore?.id || ""} onValueChange={switchStore}>
				{stores.map((store) => (
					<SelectItem key={store.id} value={store.id}>
						<div className="store-option">
							<span className="store-name">{store.name}</span>
							{store.is_primary && (
								<Badge variant="secondary" size="sm">
									Primary
								</Badge>
							)}
						</div>
					</SelectItem>
				))}
			</Select>

			<Button
				variant="outline"
				size="sm"
				onClick={() => router.push("/admin/stores/new")}>
				<Plus className="h-4 w-4" />
				Add Store
			</Button>
		</div>
	);
}
```

## Integration Points

### 1. Authentication Integration

- **User Context**: Store setup tied to authenticated user
- **User Permissions**: Store access based on user roles
- **Session Management**: Store context in user session

### 2. Database Integration

- **Supabase**: Store data stored in Supabase PostgreSQL
- **RLS Policies**: Row Level Security for store data
- **Real-time Updates**: Real-time store data updates

### 3. Frontend Integration

- **Store Context**: Global store state management
- **Navigation**: Store-aware navigation
- **Data Isolation**: Store-specific data isolation

## Security Considerations

### 1. Data Protection

- **Store Data**: Protection of store business data
- **User Permissions**: Role-based store access
- **Data Isolation**: Multi-tenant data separation

### 2. Access Control

- **Store Ownership**: Store ownership validation
- **User Roles**: Role-based store permissions
- **API Security**: Secure store API endpoints

### 3. Business Logic Security

- **Store Validation**: Store data validation
- **Permission Checks**: Store permission validation
- **Data Integrity**: Store data integrity checks

## Performance Considerations

### 1. Store Data Management

- **Store Caching**: Cache frequently accessed store data
- **Query Optimization**: Optimize store queries
- **Data Loading**: Efficient store data loading

### 2. Multi-Store Performance

- **Store Switching**: Efficient store switching
- **Context Management**: Optimized store context
- **Data Isolation**: Efficient data isolation

### 3. Setup Performance

- **Setup Flow**: Optimized setup flow
- **Form Performance**: Efficient form handling
- **Validation**: Optimized form validation

## Testing Strategy

### 1. Unit Tests

- **Store Service**: Test store service functions
- **Setup Service**: Test setup service functions
- **Validation**: Test store data validation

### 2. Integration Tests

- **API Integration**: Test store API endpoints
- **Database Integration**: Test store data persistence
- **Frontend Integration**: Test store UI components

### 3. End-to-End Tests

- **Setup Flow**: Test complete setup flow
- **Store Management**: Test store management flow
- **Multi-Store**: Test multi-store functionality

## Deployment Considerations

### 1. Environment Setup

- **Database Setup**: Store schema setup
- **Environment Variables**: Store-related configuration
- **Default Data**: Default store settings

### 2. Configuration

- **Store Settings**: Default store configuration
- **Business Rules**: Store business rules
- **Validation Rules**: Store validation configuration

### 3. Data Migration

- **Existing Stores**: Migrate existing store data
- **User Stores**: Migrate user-store relationships
- **Settings Migration**: Migrate store settings

---

**This specification provides a comprehensive foundation for implementing the store setup system in Allnimall Store CMS.**
