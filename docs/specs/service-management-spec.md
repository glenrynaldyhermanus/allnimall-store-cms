# Service Management System Specification

## Overview

This specification defines the service management system for Allnimall Store CMS, including service catalog management, service scheduling, pricing, and service delivery tracking.

## Functional Requirements

### 1. Service Catalog Management

#### 1.1 Service Information

- **Basic Information**: Service name, description, category, duration
- **Service Details**: Service type, requirements, preparation notes
- **Service Images**: Service images and before/after photos
- **Service Status**: Active, inactive, seasonal, discontinued

#### 1.2 Service Categories

- **Category Management**: Create and manage service categories
- **Category Hierarchy**: Parent-child category relationships
- **Category Pricing**: Category-specific pricing rules
- **Category Scheduling**: Category-specific scheduling rules

### 2. Service Pricing

#### 2.1 Pricing Structure

- **Base Price**: Service base price
- **Variable Pricing**: Size-based, weight-based, or complexity-based pricing
- **Package Pricing**: Service packages and bundles
- **Promotional Pricing**: Time-limited promotional prices

#### 2.2 Pricing Rules

- **Dynamic Pricing**: Dynamic pricing based on demand
- **Customer Pricing**: Customer-specific pricing tiers
- **Bulk Discounts**: Volume-based discounts
- **Seasonal Pricing**: Seasonal price adjustments

### 3. Service Scheduling

#### 3.1 Appointment Management

- **Service Booking**: Book service appointments
- **Availability Management**: Manage service availability
- **Time Slot Management**: Manage available time slots
- **Resource Allocation**: Allocate staff and resources

#### 3.2 Scheduling Rules

- **Business Hours**: Service availability during business hours
- **Staff Availability**: Staff-specific availability
- **Service Duration**: Service-specific duration requirements
- **Buffer Time**: Buffer time between appointments

### 4. Service Delivery

#### 4.1 Service Tracking

- **Service Status**: Track service progress and status
- **Service Notes**: Add notes and observations
- **Service Photos**: Before/after service photos
- **Service Completion**: Mark services as completed

#### 4.2 Service Quality

- **Service Ratings**: Customer service ratings
- **Service Feedback**: Customer feedback collection
- **Service Issues**: Track and resolve service issues
- **Service Improvements**: Service improvement tracking

## Technical Requirements

### 1. Database Schema

#### 1.1 Service Tables

```sql
-- Service categories
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES service_categories(id),
  image_url TEXT,
  color VARCHAR(7), -- hex color for UI
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  service_type VARCHAR(50) NOT NULL, -- grooming, boarding, training, medical, etc.
  duration_minutes INTEGER NOT NULL,
  preparation_notes TEXT,
  requirements TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, seasonal, discontinued
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service images
CREATE TABLE service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  image_type VARCHAR(50) DEFAULT 'gallery', -- gallery, before, after
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service pricing
CREATE TABLE service_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  pricing_type VARCHAR(50) NOT NULL, -- base, variable, package, promotional
  base_price DECIMAL(10,2) NOT NULL,
  pricing_rules JSONB, -- variable pricing rules
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service packages
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  package_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service package items
CREATE TABLE service_package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Service Scheduling Tables

```sql
-- Service appointments
CREATE TABLE service_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  staff_id UUID REFERENCES employees(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled, no_show
  notes TEXT,
  special_instructions TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service availability
CREATE TABLE service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_appointments INTEGER DEFAULT 1,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, day_of_week, start_time)
);

-- Service staff assignments
CREATE TABLE service_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, staff_id)
);
```

#### 1.3 Service Delivery Tables

```sql
-- Service delivery records
CREATE TABLE service_delivery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES service_appointments(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  staff_id UUID NOT NULL REFERENCES employees(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  service_notes TEXT,
  customer_notes TEXT,
  before_photos TEXT[], -- array of photo URLs
  after_photos TEXT[], -- array of photo URLs
  rating INTEGER, -- 1-5 star rating
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Service issues
CREATE TABLE service_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_record_id UUID NOT NULL REFERENCES service_delivery_records(id) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL, -- quality, timing, communication, other
  issue_description TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
  resolution_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Service Management

```
GET /api/services - Get services list
POST /api/services - Create new service
GET /api/services/:id - Get service details
PUT /api/services/:id - Update service
DELETE /api/services/:id - Delete service
POST /api/services/:id/duplicate - Duplicate service
```

#### 2.2 Service Categories

```
GET /api/services/categories - Get service categories
POST /api/services/categories - Create category
GET /api/services/categories/:id - Get category details
PUT /api/services/categories/:id - Update category
DELETE /api/services/categories/:id - Delete category
```

#### 2.3 Service Pricing

```
GET /api/services/:id/pricing - Get service pricing
POST /api/services/:id/pricing - Create pricing rule
PUT /api/services/pricing/:id - Update pricing rule
DELETE /api/services/pricing/:id - Delete pricing rule
```

#### 2.4 Service Scheduling

```
GET /api/services/appointments - Get appointments
POST /api/services/appointments - Create appointment
GET /api/services/appointments/:id - Get appointment details
PUT /api/services/appointments/:id - Update appointment
DELETE /api/services/appointments/:id - Cancel appointment
GET /api/services/availability - Get service availability
```

#### 2.5 Service Delivery

```
GET /api/services/delivery/:id - Get delivery record
POST /api/services/delivery - Create delivery record
PUT /api/services/delivery/:id - Update delivery record
POST /api/services/delivery/:id/complete - Complete service
POST /api/services/delivery/:id/rate - Rate service
```

### 3. Service Implementation

#### 3.1 Service Management Service

```typescript
export class ServiceManagementService {
	async createService(
		storeId: string,
		serviceData: CreateServiceData
	): Promise<Service> {
		// Create service
		const service = await this.db.services.create({
			data: {
				...serviceData,
				store_id: storeId,
				status: "active",
			},
		});

		// Create service images
		if (serviceData.images && serviceData.images.length > 0) {
			await this.createServiceImages(service.id, serviceData.images);
		}

		// Create service pricing
		if (serviceData.pricing) {
			await this.createServicePricing(service.id, serviceData.pricing);
		}

		// Create service availability
		if (serviceData.availability) {
			await this.createServiceAvailability(
				service.id,
				serviceData.availability
			);
		}

		// Assign staff if provided
		if (serviceData.staff_assignments) {
			await this.assignServiceStaff(service.id, serviceData.staff_assignments);
		}

		return service;
	}

	async updateService(
		serviceId: string,
		updateData: UpdateServiceData
	): Promise<Service> {
		const service = await this.db.services.update({
			where: { id: serviceId },
			data: { ...updateData, updated_at: new Date() },
		});

		// Update images if provided
		if (updateData.images) {
			await this.updateServiceImages(serviceId, updateData.images);
		}

		// Update pricing if provided
		if (updateData.pricing) {
			await this.updateServicePricing(serviceId, updateData.pricing);
		}

		// Update availability if provided
		if (updateData.availability) {
			await this.updateServiceAvailability(serviceId, updateData.availability);
		}

		return service;
	}

	async getServices(
		storeId: string,
		filters?: ServiceFilters
	): Promise<Service[]> {
		const where: any = {
			store_id: storeId,
		};

		if (filters?.category_id) {
			where.category_id = filters.category_id;
		}

		if (filters?.service_type) {
			where.service_type = filters.service_type;
		}

		if (filters?.status) {
			where.status = filters.status;
		}

		if (filters?.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ description: { contains: filters.search, mode: "insensitive" } },
			];
		}

		return await this.db.services.findMany({
			where,
			include: {
				category: true,
				images: true,
				pricing: {
					where: { is_active: true },
					orderBy: { effective_date: "desc" },
					take: 1,
				},
				availability: true,
				staff_assignments: {
					include: { staff: true },
				},
			},
			orderBy: { sort_order: "asc" },
		});
	}

	async getServiceById(serviceId: string): Promise<Service | null> {
		return await this.db.services.findUnique({
			where: { id: serviceId },
			include: {
				category: true,
				images: true,
				pricing: {
					where: { is_active: true },
					orderBy: { effective_date: "desc" },
				},
				availability: true,
				staff_assignments: {
					include: { staff: true },
				},
			},
		});
	}

	private async createServiceImages(
		serviceId: string,
		images: CreateImageData[]
	): Promise<void> {
		for (const [index, image] of images.entries()) {
			await this.db.service_images.create({
				data: {
					service_id: serviceId,
					image_url: image.url,
					alt_text: image.alt_text,
					image_type: image.type || "gallery",
					sort_order: index,
				},
			});
		}
	}

	private async createServicePricing(
		serviceId: string,
		pricing: CreatePricingData
	): Promise<void> {
		await this.db.service_pricing.create({
			data: {
				service_id: serviceId,
				pricing_type: pricing.type || "base",
				base_price: pricing.base_price,
				pricing_rules: pricing.rules,
				effective_date: new Date(),
				is_active: true,
			},
		});
	}

	private async createServiceAvailability(
		serviceId: string,
		availability: CreateAvailabilityData[]
	): Promise<void> {
		for (const avail of availability) {
			await this.db.service_availability.create({
				data: {
					service_id: serviceId,
					day_of_week: avail.day_of_week,
					start_time: avail.start_time,
					end_time: avail.end_time,
					max_appointments: avail.max_appointments || 1,
					is_available: true,
				},
			});
		}
	}

	private async assignServiceStaff(
		serviceId: string,
		staffAssignments: CreateStaffAssignmentData[]
	): Promise<void> {
		for (const assignment of staffAssignments) {
			await this.db.service_staff_assignments.create({
				data: {
					service_id: serviceId,
					staff_id: assignment.staff_id,
					is_primary: assignment.is_primary || false,
				},
			});
		}
	}
}
```

#### 3.2 Service Scheduling Service

```typescript
export class ServiceSchedulingService {
	async createAppointment(
		appointmentData: CreateAppointmentData
	): Promise<ServiceAppointment> {
		// Validate appointment time
		await this.validateAppointmentTime(appointmentData);

		// Check availability
		const isAvailable = await this.checkAvailability(appointmentData);
		if (!isAvailable) {
			throw new Error("Time slot not available");
		}

		// Create appointment
		const appointment = await this.db.service_appointments.create({
			data: {
				...appointmentData,
				status: "scheduled",
			},
		});

		// Send confirmation notification
		await this.sendAppointmentConfirmation(appointment);

		return appointment;
	}

	async updateAppointment(
		appointmentId: string,
		updateData: UpdateAppointmentData
	): Promise<ServiceAppointment> {
		const appointment = await this.db.service_appointments.update({
			where: { id: appointmentId },
			data: { ...updateData, updated_at: new Date() },
		});

		// Send update notification
		await this.sendAppointmentUpdate(appointment);

		return appointment;
	}

	async cancelAppointment(
		appointmentId: string,
		reason: string
	): Promise<ServiceAppointment> {
		const appointment = await this.db.service_appointments.update({
			where: { id: appointmentId },
			data: {
				status: "cancelled",
				notes: reason,
				updated_at: new Date(),
			},
		});

		// Send cancellation notification
		await this.sendAppointmentCancellation(appointment);

		return appointment;
	}

	async getAvailableTimeSlots(
		serviceId: string,
		date: Date
	): Promise<TimeSlot[]> {
		const service = await this.getServiceById(serviceId);
		if (!service) {
			throw new Error("Service not found");
		}

		const dayOfWeek = date.getDay();
		const serviceAvailability = service.availability.filter(
			(avail) => avail.day_of_week === dayOfWeek && avail.is_available
		);

		const availableSlots: TimeSlot[] = [];

		for (const avail of serviceAvailability) {
			const slots = this.generateTimeSlots(
				avail.start_time,
				avail.end_time,
				service.duration_minutes
			);

			// Check existing appointments
			const existingAppointments = await this.getAppointmentsForDate(
				serviceId,
				date
			);

			// Filter out booked slots
			const freeSlots = slots.filter((slot) => {
				const isBooked = existingAppointments.some((apt) => {
					const aptStart = new Date(
						`${date.toISOString().split("T")[0]}T${apt.start_time}`
					);
					const aptEnd = new Date(
						`${date.toISOString().split("T")[0]}T${apt.end_time}`
					);
					const slotStart = new Date(
						`${date.toISOString().split("T")[0]}T${slot.start_time}`
					);
					const slotEnd = new Date(
						`${date.toISOString().split("T")[0]}T${slot.end_time}`
					);

					return (
						(slotStart >= aptStart && slotStart < aptEnd) ||
						(slotEnd > aptStart && slotEnd <= aptEnd) ||
						(slotStart <= aptStart && slotEnd >= aptEnd)
					);
				});

				return !isBooked;
			});

			availableSlots.push(...freeSlots);
		}

		return availableSlots.sort((a, b) =>
			a.start_time.localeCompare(b.start_time)
		);
	}

	private generateTimeSlots(
		startTime: string,
		endTime: string,
		durationMinutes: number
	): TimeSlot[] {
		const slots: TimeSlot[] = [];
		const start = new Date(`2000-01-01T${startTime}`);
		const end = new Date(`2000-01-01T${endTime}`);

		let current = new Date(start);

		while (current < end) {
			const slotEnd = new Date(current.getTime() + durationMinutes * 60000);

			if (slotEnd <= end) {
				slots.push({
					start_time: current.toTimeString().slice(0, 5),
					end_time: slotEnd.toTimeString().slice(0, 5),
					available: true,
				});
			}

			current = new Date(current.getTime() + 30 * 60000); // 30-minute intervals
		}

		return slots;
	}

	private async validateAppointmentTime(
		appointmentData: CreateAppointmentData
	): Promise<void> {
		const appointmentDate = new Date(appointmentData.appointment_date);
		const now = new Date();

		// Check if appointment is in the past
		if (appointmentDate < now) {
			throw new Error("Cannot book appointment in the past");
		}

		// Check if appointment is within business hours
		const dayOfWeek = appointmentDate.getDay();
		const service = await this.getServiceById(appointmentData.service_id);

		if (service) {
			const availability = service.availability.find(
				(avail) => avail.day_of_week === dayOfWeek
			);

			if (!availability || !availability.is_available) {
				throw new Error("Service not available on this day");
			}

			const appointmentStart = new Date(
				`${appointmentData.appointment_date}T${appointmentData.start_time}`
			);
			const appointmentEnd = new Date(
				`${appointmentData.appointment_date}T${appointmentData.end_time}`
			);
			const availableStart = new Date(
				`${appointmentData.appointment_date}T${availability.start_time}`
			);
			const availableEnd = new Date(
				`${appointmentData.appointment_date}T${availability.end_time}`
			);

			if (appointmentStart < availableStart || appointmentEnd > availableEnd) {
				throw new Error("Appointment time outside business hours");
			}
		}
	}

	private async checkAvailability(
		appointmentData: CreateAppointmentData
	): Promise<boolean> {
		const existingAppointments = await this.getAppointmentsForDate(
			appointmentData.service_id,
			new Date(appointmentData.appointment_date)
		);

		const appointmentStart = new Date(
			`${appointmentData.appointment_date}T${appointmentData.start_time}`
		);
		const appointmentEnd = new Date(
			`${appointmentData.appointment_date}T${appointmentData.end_time}`
		);

		const hasConflict = existingAppointments.some((apt) => {
			const aptStart = new Date(
				`${appointmentData.appointment_date}T${apt.start_time}`
			);
			const aptEnd = new Date(
				`${appointmentData.appointment_date}T${apt.end_time}`
			);

			return (
				(appointmentStart >= aptStart && appointmentStart < aptEnd) ||
				(appointmentEnd > aptStart && appointmentEnd <= aptEnd) ||
				(appointmentStart <= aptStart && appointmentEnd >= aptEnd)
			);
		});

		return !hasConflict;
	}
}
```

#### 3.3 Service Delivery Service

```typescript
export class ServiceDeliveryService {
	async startService(
		appointmentId: string,
		staffId: string
	): Promise<ServiceDeliveryRecord> {
		const appointment = await this.getAppointmentById(appointmentId);
		if (!appointment) {
			throw new Error("Appointment not found");
		}

		if (appointment.status !== "confirmed") {
			throw new Error("Appointment must be confirmed to start service");
		}

		// Create delivery record
		const deliveryRecord = await this.db.service_delivery_records.create({
			data: {
				appointment_id: appointmentId,
				service_id: appointment.service_id,
				customer_id: appointment.customer_id,
				staff_id: staffId,
				start_time: new Date(),
				status: "in_progress",
			},
		});

		// Update appointment status
		await this.updateAppointmentStatus(appointmentId, "in_progress");

		return deliveryRecord;
	}

	async completeService(
		deliveryRecordId: string,
		completionData: ServiceCompletionData
	): Promise<ServiceDeliveryRecord> {
		const deliveryRecord = await this.db.service_delivery_records.update({
			where: { id: deliveryRecordId },
			data: {
				end_time: new Date(),
				status: "completed",
				service_notes: completionData.service_notes,
				customer_notes: completionData.customer_notes,
				before_photos: completionData.before_photos,
				after_photos: completionData.after_photos,
				updated_at: new Date(),
			},
		});

		// Update appointment status
		await this.updateAppointmentStatus(
			deliveryRecord.appointment_id,
			"completed"
		);

		// Send completion notification
		await this.sendServiceCompletionNotification(deliveryRecord);

		return deliveryRecord;
	}

	async rateService(
		deliveryRecordId: string,
		ratingData: ServiceRatingData
	): Promise<ServiceDeliveryRecord> {
		const deliveryRecord = await this.db.service_delivery_records.update({
			where: { id: deliveryRecordId },
			data: {
				rating: ratingData.rating,
				feedback: ratingData.feedback,
				updated_at: new Date(),
			},
		});

		// Update service average rating
		await this.updateServiceRating(deliveryRecord.service_id);

		return deliveryRecord;
	}

	async reportServiceIssue(
		deliveryRecordId: string,
		issueData: ServiceIssueData
	): Promise<ServiceIssue> {
		const issue = await this.db.service_issues.create({
			data: {
				delivery_record_id: deliveryRecordId,
				issue_type: issueData.issue_type,
				issue_description: issueData.issue_description,
				severity: issueData.severity || "medium",
				status: "open",
			},
		});

		// Send issue notification to management
		await this.sendIssueNotification(issue);

		return issue;
	}

	async resolveServiceIssue(
		issueId: string,
		resolutionData: IssueResolutionData
	): Promise<ServiceIssue> {
		const issue = await this.db.service_issues.update({
			where: { id: issueId },
			data: {
				status: "resolved",
				resolution_notes: resolutionData.resolution_notes,
				resolved_by: resolutionData.resolved_by,
				resolved_at: new Date(),
				updated_at: new Date(),
			},
		});

		// Send resolution notification
		await this.sendIssueResolutionNotification(issue);

		return issue;
	}

	private async updateServiceRating(serviceId: string): Promise<void> {
		const ratings = await this.db.service_delivery_records.findMany({
			where: {
				service_id: serviceId,
				rating: { not: null },
			},
			select: { rating: true },
		});

		if (ratings.length > 0) {
			const averageRating =
				ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;

			// Update service with average rating
			await this.db.services.update({
				where: { id: serviceId },
				data: { average_rating: averageRating },
			});
		}
	}
}
```

## Frontend Components

### 1. Service Management Components

#### 1.1 Service List Component

```typescript
export function ServiceList() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<ServiceFilters>({
		search: "",
		category_id: "",
		service_type: "",
		status: "active",
	});

	useEffect(() => {
		async function fetchServices() {
			try {
				const queryParams = new URLSearchParams();
				if (filters.search) queryParams.append("search", filters.search);
				if (filters.category_id)
					queryParams.append("category_id", filters.category_id);
				if (filters.service_type)
					queryParams.append("service_type", filters.service_type);
				if (filters.status) queryParams.append("status", filters.status);

				const response = await fetch(`/api/services?${queryParams}`);
				const data = await response.json();
				setServices(data);
			} catch (error) {
				console.error("Error fetching services:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchServices();
	}, [filters]);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="service-list">
			<div className="list-header">
				<h2>Services</h2>
				<div className="header-actions">
					<ServiceFilters filters={filters} onFiltersChange={setFilters} />
					<Button onClick={() => router.push("/admin/services/new")}>
						<Plus className="h-4 w-4" />
						Add Service
					</Button>
				</div>
			</div>

			<div className="services-grid">
				{services.map((service) => (
					<ServiceCard key={service.id} service={service} />
				))}
			</div>

			{services.length === 0 && (
				<div className="empty-state">
					<Scissors className="h-12 w-12 text-muted-foreground" />
					<h3>No services found</h3>
					<p>Get started by adding your first service.</p>
					<Button onClick={() => router.push("/admin/services/new")}>
						Add Service
					</Button>
				</div>
			)}
		</div>
	);
}
```

#### 1.2 Service Form Component

```typescript
export function ServiceForm({ serviceId }: { serviceId?: string }) {
	const [formData, setFormData] = useState<ServiceFormData>({
		name: "",
		description: "",
		service_type: "grooming",
		duration_minutes: 60,
		preparation_notes: "",
		requirements: "",
		category_id: "",
		status: "active",
		is_featured: false,
		images: [],
		pricing: {
			type: "base",
			base_price: 0,
			rules: {},
		},
		availability: [],
		staff_assignments: [],
	});

	const [categories, setCategories] = useState<ServiceCategory[]>([]);
	const [staff, setStaff] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchData() {
			const [categoriesResponse, staffResponse] = await Promise.all([
				fetch("/api/services/categories"),
				fetch("/api/employees"),
			]);

			const categoriesData = await categoriesResponse.json();
			const staffData = await staffResponse.json();

			setCategories(categoriesData);
			setStaff(staffData);
		}
		fetchData();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = serviceId ? `/api/services/${serviceId}` : "/api/services";
			const method = serviceId ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}

			router.push("/admin/services");
		} catch (error) {
			console.error("Error saving service:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="service-form">
			<div className="form-header">
				<h2>{serviceId ? "Edit Service" : "Add New Service"}</h2>
			</div>

			<div className="form-sections">
				{/* Basic Information */}
				<div className="form-section">
					<h3>Basic Information</h3>
					<div className="form-grid">
						<div className="form-group">
							<Label htmlFor="name">Service Name *</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								required
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="service_type">Service Type *</Label>
							<Select
								value={formData.service_type}
								onValueChange={(value) =>
									setFormData({ ...formData, service_type: value })
								}>
								<SelectItem value="grooming">Grooming</SelectItem>
								<SelectItem value="boarding">Boarding</SelectItem>
								<SelectItem value="training">Training</SelectItem>
								<SelectItem value="medical">Medical</SelectItem>
								<SelectItem value="spa">Spa</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</Select>
						</div>

						<div className="form-group">
							<Label htmlFor="duration">Duration (minutes) *</Label>
							<Input
								id="duration"
								type="number"
								value={formData.duration_minutes}
								onChange={(e) =>
									setFormData({
										...formData,
										duration_minutes: Number(e.target.value),
									})
								}
								required
								min="15"
								step="15"
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="category">Category</Label>
							<Select
								value={formData.category_id}
								onValueChange={(value) =>
									setFormData({ ...formData, category_id: value })
								}>
								<SelectItem value="">Select Category</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</Select>
						</div>

						<div className="form-group">
							<Label htmlFor="status">Status</Label>
							<Select
								value={formData.status}
								onValueChange={(value) =>
									setFormData({ ...formData, status: value })
								}>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
								<SelectItem value="seasonal">Seasonal</SelectItem>
								<SelectItem value="discontinued">Discontinued</SelectItem>
							</Select>
						</div>

						<div className="form-group">
							<Checkbox
								id="is_featured"
								checked={formData.is_featured}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, is_featured: checked })
								}>
								Featured Service
							</Checkbox>
						</div>
					</div>

					<div className="form-group">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={4}
						/>
					</div>

					<div className="form-group">
						<Label htmlFor="preparation_notes">Preparation Notes</Label>
						<Textarea
							id="preparation_notes"
							value={formData.preparation_notes}
							onChange={(e) =>
								setFormData({ ...formData, preparation_notes: e.target.value })
							}
							rows={3}
						/>
					</div>

					<div className="form-group">
						<Label htmlFor="requirements">Requirements</Label>
						<Textarea
							id="requirements"
							value={formData.requirements}
							onChange={(e) =>
								setFormData({ ...formData, requirements: e.target.value })
							}
							rows={3}
						/>
					</div>
				</div>

				{/* Pricing */}
				<div className="form-section">
					<h3>Pricing</h3>
					<div className="form-grid">
						<div className="form-group">
							<Label htmlFor="base_price">Base Price *</Label>
							<Input
								id="base_price"
								type="number"
								step="0.01"
								value={formData.pricing.base_price}
								onChange={(e) =>
									setFormData({
										...formData,
										pricing: {
											...formData.pricing,
											base_price: Number(e.target.value),
										},
									})
								}
								required
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="pricing_type">Pricing Type</Label>
							<Select
								value={formData.pricing.type}
								onValueChange={(value) =>
									setFormData({
										...formData,
										pricing: { ...formData.pricing, type: value },
									})
								}>
								<SelectItem value="base">Base Price</SelectItem>
								<SelectItem value="variable">Variable Pricing</SelectItem>
								<SelectItem value="package">Package Pricing</SelectItem>
							</Select>
						</div>
					</div>
				</div>

				{/* Availability */}
				<div className="form-section">
					<h3>Availability</h3>
					<ServiceAvailabilityForm
						availability={formData.availability}
						onAvailabilityChange={(availability) =>
							setFormData({ ...formData, availability })
						}
					/>
				</div>

				{/* Staff Assignments */}
				<div className="form-section">
					<h3>Staff Assignments</h3>
					<ServiceStaffAssignmentForm
						staff={staff}
						assignments={formData.staff_assignments}
						onAssignmentsChange={(assignments) =>
							setFormData({ ...formData, staff_assignments: assignments })
						}
					/>
				</div>

				{/* Images */}
				<div className="form-section">
					<h3>Service Images</h3>
					<ServiceImageUpload
						images={formData.images}
						onImagesChange={(images) => setFormData({ ...formData, images })}
					/>
				</div>
			</div>

			<div className="form-actions">
				<Button type="button" variant="outline" onClick={() => router.back()}>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? "Saving..." : "Save Service"}
				</Button>
			</div>
		</form>
	);
}
```

### 2. Service Scheduling Components

#### 2.1 Appointment Calendar Component

```typescript
export function AppointmentCalendar() {
	const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAppointments() {
			try {
				const response = await fetch(
					`/api/services/appointments?date=${
						selectedDate.toISOString().split("T")[0]
					}`
				);
				const data = await response.json();
				setAppointments(data);
			} catch (error) {
				console.error("Error fetching appointments:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchAppointments();
	}, [selectedDate]);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="appointment-calendar">
			<div className="calendar-header">
				<h2>Appointment Calendar</h2>
				<div className="header-actions">
					<Button
						onClick={() => router.push("/admin/services/appointments/new")}>
						<Plus className="h-4 w-4" />
						New Appointment
					</Button>
				</div>
			</div>

			<div className="calendar-controls">
				<Button
					variant="outline"
					onClick={() =>
						setSelectedDate(
							new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000)
						)
					}>
					<ChevronLeft className="h-4 w-4" />
					Previous
				</Button>
				<h3>{formatDate(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
				<Button
					variant="outline"
					onClick={() =>
						setSelectedDate(
							new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000)
						)
					}>
					Next
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="appointments-timeline">
				{Array.from({ length: 24 }, (_, hour) => {
					const timeSlots = appointments.filter((apt) => {
						const aptHour = parseInt(apt.start_time.split(":")[0]);
						return aptHour === hour;
					});

					return (
						<div key={hour} className="time-slot">
							<div className="time-label">
								{hour.toString().padStart(2, "0")}:00
							</div>
							<div className="appointments">
								{timeSlots.map((appointment) => (
									<AppointmentCard
										key={appointment.id}
										appointment={appointment}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
```

## Integration Points

### 1. Store Management Integration

- **Store Context**: Services scoped to specific store
- **Multi-store Support**: Support for multiple store locations
- **Store Settings**: Store-specific service settings

### 2. Customer Management Integration

- **Customer Appointments**: Customer-specific appointment history
- **Customer Preferences**: Customer service preferences
- **Customer Communication**: Appointment notifications

### 3. Employee Management Integration

- **Staff Scheduling**: Staff availability and assignments
- **Staff Performance**: Service delivery performance tracking
- **Staff Workload**: Staff workload management

## Security Considerations

### 1. Data Protection

- **Service Data**: Protection of service information
- **Appointment Data**: Secure appointment management
- **Customer Data**: Protection of customer information

### 2. Access Control

- **Store Permissions**: Store-based service access
- **User Roles**: Role-based service management
- **API Security**: Secure service API endpoints

### 3. Business Logic Security

- **Appointment Validation**: Appointment time validation
- **Availability Checks**: Service availability validation
- **Data Integrity**: Service data integrity checks

## Performance Considerations

### 1. Service Data Management

- **Service Caching**: Cache frequently accessed services
- **Image Optimization**: Optimize service images
- **Search Performance**: Optimize service search

### 2. Scheduling Performance

- **Availability Queries**: Optimize availability queries
- **Time Slot Generation**: Efficient time slot generation
- **Appointment Conflicts**: Optimized conflict detection

### 3. Database Performance

- **Indexing**: Strategic database indexing
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Efficient connection management

## Testing Strategy

### 1. Unit Tests

- **Service Management**: Test service management functions
- **Scheduling Logic**: Test scheduling logic functions
- **Validation**: Test service data validation

### 2. Integration Tests

- **API Integration**: Test service API endpoints
- **Database Integration**: Test service data persistence
- **Frontend Integration**: Test service UI components

### 3. End-to-End Tests

- **Service Flow**: Test complete service management flow
- **Appointment Flow**: Test appointment booking flow
- **Delivery Flow**: Test service delivery flow

## Deployment Considerations

### 1. Environment Setup

- **Database Setup**: Service schema setup
- **Image Storage**: Service image storage configuration
- **Environment Variables**: Service-related configuration

### 2. Configuration

- **Service Settings**: Default service configuration
- **Scheduling Settings**: Appointment scheduling settings
- **Notification Settings**: Service notification configuration

### 3. Data Migration

- **Existing Services**: Migrate existing service data
- **Appointment Data**: Migrate appointment data
- **Category Data**: Migrate service category data

---

**This specification provides a comprehensive foundation for implementing the service management system in Allnimall Store CMS.**
