# Product Management System Specification

## Overview

This specification defines the product management system for Allnimall Store CMS, including product catalog management, inventory tracking, pricing, and product categorization.

## Functional Requirements

### 1. Product Catalog Management

#### 1.1 Product Information

- **Basic Information**: Product name, description, SKU, barcode
- **Product Details**: Brand, category, weight, dimensions
- **Product Images**: Multiple product images with primary image
- **Product Status**: Active, inactive, out of stock, discontinued

#### 1.2 Product Categories

- **Category Management**: Create and manage product categories
- **Category Hierarchy**: Parent-child category relationships
- **Category Attributes**: Category-specific attributes and filters
- **Category Images**: Category images and icons

### 2. Inventory Management

#### 2.1 Stock Tracking

- **Stock Levels**: Current stock quantity tracking
- **Stock Alerts**: Low stock notifications and alerts
- **Stock Movements**: Track stock in/out movements
- **Stock Adjustments**: Manual stock adjustments and corrections

#### 2.2 Inventory Operations

- **Stock Receiving**: Receive stock from suppliers
- **Stock Transfer**: Transfer stock between locations
- **Stock Count**: Physical stock counting and reconciliation
- **Stock Reports**: Inventory reports and analytics

### 3. Pricing Management

#### 3.1 Price Configuration

- **Base Price**: Product base selling price
- **Cost Price**: Product cost price for profit calculation
- **Price Tiers**: Multiple price tiers for different customer types
- **Price History**: Track price changes over time

#### 3.2 Discount Management

- **Product Discounts**: Individual product discounts
- **Category Discounts**: Category-wide discounts
- **Bulk Discounts**: Quantity-based discounts
- **Promotional Pricing**: Time-limited promotional prices

### 4. Product Variants

#### 4.1 Variant Management

- **Product Variants**: Size, color, flavor, etc.
- **Variant Attributes**: Variant-specific attributes
- **Variant Pricing**: Different pricing per variant
- **Variant Inventory**: Separate inventory per variant

#### 4.2 Bundle Products

- **Product Bundles**: Group products into bundles
- **Bundle Pricing**: Special pricing for bundles
- **Bundle Inventory**: Bundle inventory management
- **Bundle Components**: Track bundle components

## Technical Requirements

### 1. Database Schema

#### 1.1 Product Tables

```sql
-- Product categories
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES product_categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  brand VARCHAR(100),
  weight DECIMAL(10,3),
  dimensions JSONB, -- {length, width, height, unit}
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, out_of_stock, discontinued
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  variant_value VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  barcode VARCHAR(100),
  price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight DECIMAL(10,3),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product pricing
CREATE TABLE product_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  price_type VARCHAR(50) NOT NULL, -- base, tier, promotional
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Inventory Tables

```sql
-- Inventory locations
CREATE TABLE inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product inventory
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID NOT NULL REFERENCES inventory_locations(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER,
  reorder_point INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, variant_id, location_id)
);

-- Stock movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  location_id UUID NOT NULL REFERENCES inventory_locations(id),
  movement_type VARCHAR(50) NOT NULL, -- in, out, adjustment, transfer
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50), -- purchase, sale, adjustment, transfer
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Product Attributes Tables

```sql
-- Product attributes
CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(50) NOT NULL, -- text, number, select, boolean
  is_required BOOLEAN DEFAULT false,
  is_filterable BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product attribute values
CREATE TABLE product_attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES product_attributes(id),
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, attribute_id)
);

-- Attribute options (for select type attributes)
CREATE TABLE attribute_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  option_value VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Product Management

```
GET /api/products - Get products list
POST /api/products - Create new product
GET /api/products/:id - Get product details
PUT /api/products/:id - Update product
DELETE /api/products/:id - Delete product
POST /api/products/:id/duplicate - Duplicate product
```

#### 2.2 Category Management

```
GET /api/products/categories - Get product categories
POST /api/products/categories - Create category
GET /api/products/categories/:id - Get category details
PUT /api/products/categories/:id - Update category
DELETE /api/products/categories/:id - Delete category
```

#### 2.3 Inventory Management

```
GET /api/products/:id/inventory - Get product inventory
PUT /api/products/:id/inventory - Update product inventory
POST /api/products/:id/inventory/adjust - Adjust inventory
GET /api/products/inventory/movements - Get stock movements
POST /api/products/inventory/transfer - Transfer stock
```

#### 2.4 Product Variants

```
GET /api/products/:id/variants - Get product variants
POST /api/products/:id/variants - Create product variant
PUT /api/products/variants/:id - Update variant
DELETE /api/products/variants/:id - Delete variant
```

### 3. Service Implementation

#### 3.1 Product Service

```typescript
export class ProductService {
	async createProduct(
		storeId: string,
		productData: CreateProductData
	): Promise<Product> {
		// Create product
		const product = await this.db.products.create({
			data: {
				...productData,
				store_id: storeId,
				status: "active",
			},
		});

		// Create product images
		if (productData.images && productData.images.length > 0) {
			await this.createProductImages(product.id, productData.images);
		}

		// Create product pricing
		if (productData.pricing) {
			await this.createProductPricing(product.id, productData.pricing);
		}

		// Create product attributes
		if (productData.attributes) {
			await this.createProductAttributes(product.id, productData.attributes);
		}

		// Create initial inventory
		await this.createInitialInventory(product.id, productData.inventory);

		return product;
	}

	async updateProduct(
		productId: string,
		updateData: UpdateProductData
	): Promise<Product> {
		const product = await this.db.products.update({
			where: { id: productId },
			data: { ...updateData, updated_at: new Date() },
		});

		// Update images if provided
		if (updateData.images) {
			await this.updateProductImages(productId, updateData.images);
		}

		// Update pricing if provided
		if (updateData.pricing) {
			await this.updateProductPricing(productId, updateData.pricing);
		}

		// Update attributes if provided
		if (updateData.attributes) {
			await this.updateProductAttributes(productId, updateData.attributes);
		}

		return product;
	}

	async getProducts(
		storeId: string,
		filters?: ProductFilters
	): Promise<Product[]> {
		const where: any = {
			store_id: storeId,
		};

		if (filters?.category_id) {
			where.category_id = filters.category_id;
		}

		if (filters?.status) {
			where.status = filters.status;
		}

		if (filters?.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: "insensitive" } },
				{ sku: { contains: filters.search, mode: "insensitive" } },
				{ barcode: { contains: filters.search, mode: "insensitive" } },
			];
		}

		return await this.db.products.findMany({
			where,
			include: {
				category: true,
				images: true,
				pricing: {
					where: { is_active: true },
					orderBy: { effective_date: "desc" },
					take: 1,
				},
				inventory: {
					include: { location: true },
				},
				variants: true,
			},
			orderBy: { created_at: "desc" },
		});
	}

	async getProductById(productId: string): Promise<Product | null> {
		return await this.db.products.findUnique({
			where: { id: productId },
			include: {
				category: true,
				images: true,
				pricing: {
					where: { is_active: true },
					orderBy: { effective_date: "desc" },
				},
				inventory: {
					include: { location: true },
				},
				variants: true,
				attributes: {
					include: { attribute: true },
				},
			},
		});
	}

	private async createProductImages(
		productId: string,
		images: CreateImageData[]
	): Promise<void> {
		for (const [index, image] of images.entries()) {
			await this.db.product_images.create({
				data: {
					product_id: productId,
					image_url: image.url,
					alt_text: image.alt_text,
					is_primary: index === 0,
					sort_order: index,
				},
			});
		}
	}

	private async createProductPricing(
		productId: string,
		pricing: CreatePricingData
	): Promise<void> {
		await this.db.product_pricing.create({
			data: {
				product_id: productId,
				price_type: "base",
				price: pricing.price,
				cost_price: pricing.cost_price,
				effective_date: new Date(),
				is_active: true,
			},
		});
	}

	private async createInitialInventory(
		productId: string,
		inventory: CreateInventoryData
	): Promise<void> {
		const defaultLocation = await this.getDefaultLocation(inventory.store_id);

		await this.db.product_inventory.create({
			data: {
				product_id: productId,
				location_id: defaultLocation.id,
				quantity: inventory.initial_quantity || 0,
				min_stock_level: inventory.min_stock_level || 0,
				max_stock_level: inventory.max_stock_level,
				reorder_point: inventory.reorder_point || 0,
			},
		});
	}
}
```

#### 3.2 Inventory Service

```typescript
export class InventoryService {
	async updateInventory(
		productId: string,
		variantId: string | null,
		locationId: string,
		quantity: number
	): Promise<ProductInventory> {
		const inventory = await this.db.product_inventory.upsert({
			where: {
				product_id_variant_id_location_id: {
					product_id: productId,
					variant_id: variantId,
					location_id: locationId,
				},
			},
			update: {
				quantity: quantity,
				last_updated: new Date(),
			},
			create: {
				product_id: productId,
				variant_id: variantId,
				location_id: locationId,
				quantity: quantity,
			},
		});

		// Record stock movement
		await this.recordStockMovement(
			productId,
			variantId,
			locationId,
			quantity,
			"adjustment"
		);

		return inventory;
	}

	async adjustInventory(
		productId: string,
		variantId: string | null,
		locationId: string,
		adjustment: number,
		reason: string,
		userId: string
	): Promise<ProductInventory> {
		const currentInventory = await this.getCurrentInventory(
			productId,
			variantId,
			locationId
		);

		const newQuantity = currentInventory.quantity + adjustment;

		const inventory = await this.updateInventory(
			productId,
			variantId,
			locationId,
			newQuantity
		);

		// Record stock movement
		await this.recordStockMovement(
			productId,
			variantId,
			locationId,
			adjustment,
			"adjustment",
			{
				reason,
				created_by: userId,
			}
		);

		// Check stock alerts
		await this.checkStockAlerts(productId, variantId, locationId, newQuantity);

		return inventory;
	}

	async transferStock(
		productId: string,
		variantId: string | null,
		fromLocationId: string,
		toLocationId: string,
		quantity: number,
		userId: string
	): Promise<void> {
		// Check if source has enough stock
		const sourceInventory = await this.getCurrentInventory(
			productId,
			variantId,
			fromLocationId
		);

		if (sourceInventory.quantity < quantity) {
			throw new Error("Insufficient stock for transfer");
		}

		// Reduce stock from source
		await this.adjustInventory(
			productId,
			variantId,
			fromLocationId,
			-quantity,
			`Transfer to ${toLocationId}`,
			userId
		);

		// Add stock to destination
		await this.adjustInventory(
			productId,
			variantId,
			toLocationId,
			quantity,
			`Transfer from ${fromLocationId}`,
			userId
		);

		// Record transfer movement
		await this.recordStockMovement(
			productId,
			variantId,
			toLocationId,
			quantity,
			"transfer",
			{
				reference_type: "transfer",
				notes: `Transfer from ${fromLocationId}`,
				created_by: userId,
			}
		);
	}

	async getStockMovements(
		productId?: string,
		locationId?: string,
		dateRange?: DateRange
	): Promise<StockMovement[]> {
		const where: any = {};

		if (productId) {
			where.product_id = productId;
		}

		if (locationId) {
			where.location_id = locationId;
		}

		if (dateRange) {
			where.created_at = {
				gte: dateRange.start,
				lte: dateRange.end,
			};
		}

		return await this.db.stock_movements.findMany({
			where,
			include: {
				product: true,
				variant: true,
				location: true,
				created_by_user: {
					select: { id: true, email: true },
				},
			},
			orderBy: { created_at: "desc" },
		});
	}

	private async recordStockMovement(
		productId: string,
		variantId: string | null,
		locationId: string,
		quantity: number,
		movementType: string,
		additionalData?: any
	): Promise<void> {
		await this.db.stock_movements.create({
			data: {
				product_id: productId,
				variant_id: variantId,
				location_id: locationId,
				movement_type: movementType,
				quantity: quantity,
				...additionalData,
			},
		});
	}

	private async checkStockAlerts(
		productId: string,
		variantId: string | null,
		locationId: string,
		quantity: number
	): Promise<void> {
		const inventory = await this.getCurrentInventory(
			productId,
			variantId,
			locationId
		);

		if (quantity <= inventory.reorder_point) {
			// Send low stock alert
			await this.sendLowStockAlert(productId, variantId, locationId, quantity);
		}
	}
}
```

## Frontend Components

### 1. Product Management Components

#### 1.1 Product List Component

```typescript
export function ProductList() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<ProductFilters>({
		search: "",
		category_id: "",
		status: "active",
	});

	useEffect(() => {
		async function fetchProducts() {
			try {
				const queryParams = new URLSearchParams();
				if (filters.search) queryParams.append("search", filters.search);
				if (filters.category_id)
					queryParams.append("category_id", filters.category_id);
				if (filters.status) queryParams.append("status", filters.status);

				const response = await fetch(`/api/products?${queryParams}`);
				const data = await response.json();
				setProducts(data);
			} catch (error) {
				console.error("Error fetching products:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchProducts();
	}, [filters]);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="product-list">
			<div className="list-header">
				<h2>Products</h2>
				<div className="header-actions">
					<ProductFilters filters={filters} onFiltersChange={setFilters} />
					<Button onClick={() => router.push("/admin/products/new")}>
						<Plus className="h-4 w-4" />
						Add Product
					</Button>
				</div>
			</div>

			<div className="products-grid">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>

			{products.length === 0 && (
				<div className="empty-state">
					<Package className="h-12 w-12 text-muted-foreground" />
					<h3>No products found</h3>
					<p>Get started by adding your first product.</p>
					<Button onClick={() => router.push("/admin/products/new")}>
						Add Product
					</Button>
				</div>
			)}
		</div>
	);
}
```

#### 1.2 Product Form Component

```typescript
export function ProductForm({ productId }: { productId?: string }) {
	const [formData, setFormData] = useState<ProductFormData>({
		name: "",
		description: "",
		sku: "",
		barcode: "",
		brand: "",
		category_id: "",
		weight: 0,
		dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
		status: "active",
		is_featured: false,
		images: [],
		pricing: {
			price: 0,
			cost_price: 0,
		},
		inventory: {
			initial_quantity: 0,
			min_stock_level: 0,
			max_stock_level: 0,
			reorder_point: 0,
		},
		variants: [],
		attributes: [],
	});

	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchCategories() {
			const response = await fetch("/api/products/categories");
			const data = await response.json();
			setCategories(data);
		}
		fetchCategories();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const url = productId ? `/api/products/${productId}` : "/api/products";
			const method = productId ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message);
			}

			router.push("/admin/products");
		} catch (error) {
			console.error("Error saving product:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="product-form">
			<div className="form-header">
				<h2>{productId ? "Edit Product" : "Add New Product"}</h2>
			</div>

			<div className="form-sections">
				{/* Basic Information */}
				<div className="form-section">
					<h3>Basic Information</h3>
					<div className="form-grid">
						<div className="form-group">
							<Label htmlFor="name">Product Name *</Label>
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
							<Label htmlFor="sku">SKU</Label>
							<Input
								id="sku"
								value={formData.sku}
								onChange={(e) =>
									setFormData({ ...formData, sku: e.target.value })
								}
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="barcode">Barcode</Label>
							<Input
								id="barcode"
								value={formData.barcode}
								onChange={(e) =>
									setFormData({ ...formData, barcode: e.target.value })
								}
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="brand">Brand</Label>
							<Input
								id="brand"
								value={formData.brand}
								onChange={(e) =>
									setFormData({ ...formData, brand: e.target.value })
								}
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
								<SelectItem value="out_of_stock">Out of Stock</SelectItem>
								<SelectItem value="discontinued">Discontinued</SelectItem>
							</Select>
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
				</div>

				{/* Pricing */}
				<div className="form-section">
					<h3>Pricing</h3>
					<div className="form-grid">
						<div className="form-group">
							<Label htmlFor="price">Selling Price *</Label>
							<Input
								id="price"
								type="number"
								step="0.01"
								value={formData.pricing.price}
								onChange={(e) =>
									setFormData({
										...formData,
										pricing: {
											...formData.pricing,
											price: Number(e.target.value),
										},
									})
								}
								required
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="cost_price">Cost Price</Label>
							<Input
								id="cost_price"
								type="number"
								step="0.01"
								value={formData.pricing.cost_price}
								onChange={(e) =>
									setFormData({
										...formData,
										pricing: {
											...formData.pricing,
											cost_price: Number(e.target.value),
										},
									})
								}
							/>
						</div>
					</div>
				</div>

				{/* Inventory */}
				<div className="form-section">
					<h3>Inventory</h3>
					<div className="form-grid">
						<div className="form-group">
							<Label htmlFor="initial_quantity">Initial Quantity</Label>
							<Input
								id="initial_quantity"
								type="number"
								value={formData.inventory.initial_quantity}
								onChange={(e) =>
									setFormData({
										...formData,
										inventory: {
											...formData.inventory,
											initial_quantity: Number(e.target.value),
										},
									})
								}
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="min_stock_level">Minimum Stock Level</Label>
							<Input
								id="min_stock_level"
								type="number"
								value={formData.inventory.min_stock_level}
								onChange={(e) =>
									setFormData({
										...formData,
										inventory: {
											...formData.inventory,
											min_stock_level: Number(e.target.value),
										},
									})
								}
							/>
						</div>

						<div className="form-group">
							<Label htmlFor="reorder_point">Reorder Point</Label>
							<Input
								id="reorder_point"
								type="number"
								value={formData.inventory.reorder_point}
								onChange={(e) =>
									setFormData({
										...formData,
										inventory: {
											...formData.inventory,
											reorder_point: Number(e.target.value),
										},
									})
								}
							/>
						</div>
					</div>
				</div>

				{/* Images */}
				<div className="form-section">
					<h3>Product Images</h3>
					<ProductImageUpload
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
					{loading ? "Saving..." : "Save Product"}
				</Button>
			</div>
		</form>
	);
}
```

### 2. Inventory Management Components

#### 2.1 Inventory Dashboard Component

```typescript
export function InventoryDashboard() {
	const [inventory, setInventory] = useState<ProductInventory[]>([]);
	const [loading, setLoading] = useState(true);
	const [lowStockAlerts, setLowStockAlerts] = useState<ProductInventory[]>([]);

	useEffect(() => {
		async function fetchInventory() {
			try {
				const [inventoryResponse, alertsResponse] = await Promise.all([
					fetch("/api/products/inventory"),
					fetch("/api/products/inventory/alerts"),
				]);

				const inventoryData = await inventoryResponse.json();
				const alertsData = await alertsResponse.json();

				setInventory(inventoryData);
				setLowStockAlerts(alertsData);
			} catch (error) {
				console.error("Error fetching inventory:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchInventory();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="inventory-dashboard">
			<div className="dashboard-header">
				<h2>Inventory Dashboard</h2>
				<div className="header-actions">
					<Button
						onClick={() => router.push("/admin/products/inventory/adjust")}>
						<Package className="h-4 w-4" />
						Adjust Inventory
					</Button>
					<Button
						onClick={() => router.push("/admin/products/inventory/transfer")}>
						<ArrowRightLeft className="h-4 w-4" />
						Transfer Stock
					</Button>
				</div>
			</div>

			{/* Low Stock Alerts */}
			{lowStockAlerts.length > 0 && (
				<div className="alerts-section">
					<h3>Low Stock Alerts</h3>
					<div className="alerts-grid">
						{lowStockAlerts.map((item) => (
							<Alert key={item.id} variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertTitle>Low Stock</AlertTitle>
								<AlertDescription>
									{item.product.name} - {item.available_quantity} remaining
									{item.variant && ` (${item.variant.variant_value})`}
								</AlertDescription>
							</Alert>
						))}
					</div>
				</div>
			)}

			{/* Inventory Summary */}
			<div className="inventory-summary">
				<div className="summary-cards">
					<div className="summary-card">
						<h3>Total Products</h3>
						<p>{inventory.length}</p>
					</div>
					<div className="summary-card">
						<h3>Low Stock Items</h3>
						<p>{lowStockAlerts.length}</p>
					</div>
					<div className="summary-card">
						<h3>Out of Stock</h3>
						<p>
							{inventory.filter((item) => item.available_quantity === 0).length}
						</p>
					</div>
					<div className="summary-card">
						<h3>Total Value</h3>
						<p>
							{formatCurrency(
								inventory.reduce(
									(total, item) =>
										total + item.quantity * (item.product.pricing?.price || 0),
									0
								)
							)}
						</p>
					</div>
				</div>
			</div>

			{/* Inventory Table */}
			<div className="inventory-table">
				<InventoryTable inventory={inventory} />
			</div>
		</div>
	);
}
```

## Integration Points

### 1. Store Management Integration

- **Store Context**: Products scoped to specific store
- **Multi-store Support**: Support for multiple store locations
- **Store Settings**: Store-specific product settings

### 2. Subscription System Integration

- **Feature Access**: Product management based on subscription plan
- **Usage Limits**: Product count limits based on plan
- **Feature Restrictions**: Advanced features for paid plans

### 3. Sales System Integration

- **Product Sales**: Products used in sales transactions
- **Inventory Updates**: Automatic inventory updates on sales
- **Pricing Integration**: Product pricing in sales

## Security Considerations

### 1. Data Protection

- **Product Data**: Protection of product information
- **Inventory Data**: Secure inventory tracking
- **Pricing Data**: Protection of pricing information

### 2. Access Control

- **Store Permissions**: Store-based product access
- **User Roles**: Role-based product management
- **API Security**: Secure product API endpoints

### 3. Business Logic Security

- **Inventory Validation**: Inventory operation validation
- **Price Validation**: Price change validation
- **Data Integrity**: Product data integrity checks

## Performance Considerations

### 1. Product Data Management

- **Product Caching**: Cache frequently accessed products
- **Image Optimization**: Optimize product images
- **Search Performance**: Optimize product search

### 2. Inventory Performance

- **Inventory Queries**: Optimize inventory queries
- **Stock Calculations**: Efficient stock calculations
- **Movement Tracking**: Optimized movement tracking

### 3. Database Performance

- **Indexing**: Strategic database indexing
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Efficient connection management

## Testing Strategy

### 1. Unit Tests

- **Product Service**: Test product service functions
- **Inventory Service**: Test inventory service functions
- **Validation**: Test product data validation

### 2. Integration Tests

- **API Integration**: Test product API endpoints
- **Database Integration**: Test product data persistence
- **Frontend Integration**: Test product UI components

### 3. End-to-End Tests

- **Product Flow**: Test complete product management flow
- **Inventory Flow**: Test inventory management flow
- **Sales Integration**: Test product-sales integration

## Deployment Considerations

### 1. Environment Setup

- **Database Setup**: Product schema setup
- **Image Storage**: Product image storage configuration
- **Environment Variables**: Product-related configuration

### 2. Configuration

- **Product Settings**: Default product configuration
- **Inventory Settings**: Inventory management settings
- **Pricing Settings**: Pricing configuration

### 3. Data Migration

- **Existing Products**: Migrate existing product data
- **Inventory Data**: Migrate inventory data
- **Category Data**: Migrate category data

---

**This specification provides a comprehensive foundation for implementing the product management system in Allnimall Store CMS.**
