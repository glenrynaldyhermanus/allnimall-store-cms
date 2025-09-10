-- Allnimall Store CMS Database Schema
-- Generated from Supabase public schema
-- Date: $(date)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE REFERENCE TABLES
-- =============================================

-- Countries table
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL
);

-- Provinces table
CREATE TABLE provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    country_id UUID NOT NULL REFERENCES countries(id)
);

-- Cities table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    province_id UUID NOT NULL REFERENCES provinces(id)
);

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- Users table (staff/employees)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    staff_type TEXT DEFAULT 'cashier',
    auth_id UUID COMMENT 'Supabase auth ID for staff authentication',
    username TEXT UNIQUE COMMENT 'Username for staff login (used to find email for Supabase auth)'
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    picture_url TEXT,
    experience_level TEXT DEFAULT 'beginner',
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    customer_type TEXT DEFAULT 'retail',
    address TEXT,
    city_id UUID REFERENCES cities(id),
    province_id UUID REFERENCES provinces(id),
    country_id UUID REFERENCES countries(id),
    auth_id UUID COMMENT 'Supabase auth ID. NULL = customer not logged in to Allnimall, NOT NULL = customer logged in to Allnimall'
);

-- =============================================
-- BUSINESS MANAGEMENT TABLES
-- =============================================

-- Merchants table
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    city_id UUID REFERENCES cities(id),
    province_id UUID REFERENCES provinces(id),
    country_id UUID REFERENCES countries(id),
    logo_url TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    owner_id UUID DEFAULT '00000000-0000-0000-0000-000000000000' COMMENT 'Reference to the user who owns this merchant/business'
);

-- Stores table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name TEXT NOT NULL,
    address TEXT,
    city_id UUID REFERENCES cities(id),
    province_id UUID REFERENCES provinces(id),
    country_id UUID REFERENCES countries(id),
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    business_field TEXT DEFAULT 'pet_shop' COMMENT 'Type of business: pet_shop, veterinary, grooming, etc.',
    business_description TEXT,
    phone_number TEXT,
    phone_country_code TEXT
);

-- =============================================
-- ROLE MANAGEMENT TABLES
-- =============================================

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT[]
);

-- Role assignments table
CREATE TABLE role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    user_id UUID NOT NULL REFERENCES users(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- PET MANAGEMENT TABLES
-- =============================================

-- Pet categories table
CREATE TABLE pet_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name_en TEXT NOT NULL,
    picture_url TEXT,
    icon_url TEXT,
    name_id TEXT NOT NULL,
    description TEXT
);

-- Characters table
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    character_en TEXT NOT NULL,
    character_id TEXT NOT NULL,
    good_character BOOLEAN NOT NULL
);

-- Pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    owner_id UUID NOT NULL REFERENCES customers(id),
    name TEXT NOT NULL,
    pet_category_id UUID NOT NULL REFERENCES pet_categories(id),
    breed TEXT,
    birth_date DATE,
    gender TEXT,
    color TEXT,
    weight NUMERIC,
    microchip_id TEXT,
    picture_url TEXT,
    notes TEXT
);

-- Pet characters junction table
CREATE TABLE pet_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    pet_id UUID NOT NULL REFERENCES pets(id),
    character_id UUID NOT NULL REFERENCES characters(id)
);

-- Pet health records table
CREATE TABLE pet_healths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    pet_id UUID NOT NULL REFERENCES pets(id),
    weight NUMERIC,
    weight_history JSONB,
    vaccination_status TEXT,
    last_vaccination_date DATE,
    next_vaccination_date DATE,
    health_notes TEXT,
    medical_conditions TEXT[],
    allergies TEXT[]
);

-- Schedule types table
CREATE TABLE schedule_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_recurring BOOLEAN DEFAULT false,
    default_duration_minutes INTEGER DEFAULT 60
);

-- Pet schedules table
CREATE TABLE pet_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    pet_id UUID NOT NULL REFERENCES pets(id),
    schedule_type_id UUID NOT NULL REFERENCES schedule_types(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    recurring_pattern_id UUID
);

-- Schedule recurring patterns table
CREATE TABLE schedule_recurring_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    pattern_type TEXT NOT NULL,
    interval_value INTEGER NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- PRODUCT MANAGEMENT TABLES
-- =============================================

-- Product categories table
CREATE TABLE products_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    name TEXT NOT NULL,
    picture_url TEXT,
    store_id UUID NOT NULL REFERENCES stores(id),
    pet_category_id UUID REFERENCES pet_categories(id),
    description TEXT,
    type TEXT DEFAULT 'item'
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    category_id UUID NOT NULL REFERENCES products_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    cost_price NUMERIC,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    barcode TEXT,
    sku TEXT,
    picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    purchase_price NUMERIC DEFAULT 0 COMMENT 'Purchase price of the product',
    min_stock INTEGER DEFAULT 0 COMMENT 'Minimum stock level for reorder',
    unit TEXT DEFAULT 'pcs' COMMENT 'Unit of measurement (pcs, kg, etc)',
    weight_grams INTEGER DEFAULT 0 COMMENT 'Weight in grams',
    stock INTEGER DEFAULT 0,
    code TEXT UNIQUE,
    product_type TEXT DEFAULT 'item',
    duration_minutes INTEGER COMMENT 'Duration for services',
    service_category TEXT COMMENT 'Category for services',
    discount_type INTEGER DEFAULT 1 COMMENT 'Discount type: 1=none, 2=percentage, 3=fixed',
    discount_value NUMERIC DEFAULT 0 COMMENT 'Discount amount - percentage (if discount_type=2) or fixed amount (if discount_type=3)'
);

-- =============================================
-- PAYMENT MANAGEMENT TABLES
-- =============================================

-- Payment types table
CREATE TABLE payment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    code TEXT NOT NULL,
    name TEXT NOT NULL
);

-- Payment methods table
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    payment_type_id UUID NOT NULL REFERENCES payment_types(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Store payment methods table
CREATE TABLE store_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- INVENTORY MANAGEMENT TABLES
-- =============================================

-- Inventory transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    product_id UUID NOT NULL REFERENCES products(id),
    transaction_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC,
    total_amount NUMERIC,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT
);

-- =============================================
-- SALES MANAGEMENT TABLES
-- =============================================

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    customer_id UUID REFERENCES customers(id),
    user_id UUID NOT NULL REFERENCES users(id),
    sale_number TEXT NOT NULL,
    sale_date TIMESTAMPTZ NOT NULL,
    subtotal NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    payment_status TEXT DEFAULT 'pending',
    status TEXT DEFAULT 'completed',
    notes TEXT
);

-- Sales items table
CREATE TABLE sales_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    sale_id UUID NOT NULL REFERENCES sales(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    notes TEXT,
    item_type TEXT DEFAULT 'product' COMMENT 'Tipe item: product atau service',
    booking_date DATE COMMENT 'Tanggal booking untuk service',
    booking_time TIME COMMENT 'Waktu booking untuk service',
    duration_minutes INTEGER COMMENT 'Durasi service dalam menit',
    assigned_staff_id UUID REFERENCES users(id) COMMENT 'Staff yang ditugaskan untuk service',
    customer_notes TEXT COMMENT 'Catatan customer untuk service',
    booking_reference TEXT COMMENT 'Referensi booking yang di-generate'
);

-- =============================================
-- CART MANAGEMENT TABLES
-- =============================================

-- Store carts table
CREATE TABLE store_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    session_id TEXT,
    customer_id UUID REFERENCES customers(id),
    status TEXT DEFAULT 'active'
);

-- Store cart items table
CREATE TABLE store_cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    cart_id UUID NOT NULL REFERENCES store_carts(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity SMALLINT DEFAULT 1,
    unit_price NUMERIC DEFAULT 0,
    item_type TEXT DEFAULT 'product' COMMENT 'Tipe item: product atau service',
    booking_date DATE COMMENT 'Tanggal booking untuk service',
    booking_time TIME COMMENT 'Waktu booking untuk service',
    duration_minutes INTEGER COMMENT 'Durasi service dalam menit',
    assigned_staff_id UUID REFERENCES users(id) COMMENT 'Staff yang ditugaskan untuk service',
    customer_notes TEXT COMMENT 'Catatan customer untuk service',
    booking_reference TEXT COMMENT 'Referensi booking yang akan di-generate'
);

-- =============================================
-- MERCHANT-CUSTOMER RELATIONSHIP TABLES
-- =============================================

-- Merchant customers table
CREATE TABLE merchant_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    joined_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    is_active BOOLEAN DEFAULT true,
    customer_code TEXT,
    notes TEXT,
    COMMENT 'Mapping table between merchants and customers. One customer can be registered with multiple merchants.'
);

-- =============================================
-- SERVICE BOOKING TABLES
-- =============================================

-- Merchant partnerships table
CREATE TABLE merchant_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    partnership_status TEXT DEFAULT 'pending',
    partnership_type TEXT DEFAULT 'service_provider',
    commission_rate NUMERIC DEFAULT 0,
    service_areas JSONB,
    is_featured BOOLEAN DEFAULT false,
    partnership_start_date DATE,
    partnership_end_date DATE,
    COMMENT 'Partnership antara merchant dengan Allnimall untuk layanan jasa'
);

-- Merchant service availability table
CREATE TABLE merchant_service_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    store_id UUID NOT NULL REFERENCES stores(id),
    service_product_id UUID NOT NULL REFERENCES products(id),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 60,
    max_concurrent_bookings INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    COMMENT 'Jadwal availability layanan per merchant'
);

-- Service bookings table
CREATE TABLE service_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT (now() AT TIME ZONE 'utc'),
    created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000',
    updated_at TIMESTAMPTZ,
    updated_by UUID,
    deleted_at TIMESTAMPTZ,
    booking_source TEXT NOT NULL COMMENT 'Sumber booking: merchant_online_store, allnimall_app, offline_store',
    booking_reference TEXT UNIQUE COMMENT 'Nomor referensi booking unik (format: BK-YYYYMMDD-XXXX)',
    customer_id UUID NOT NULL REFERENCES customers(id),
    pet_id UUID REFERENCES pets(id) COMMENT 'ID pet (optional - bisa NULL jika tidak ada pet)',
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    store_id UUID NOT NULL REFERENCES stores(id),
    service_product_id UUID NOT NULL REFERENCES products(id),
    service_name TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    service_type TEXT DEFAULT 'in_store' COMMENT 'Tipe layanan: in_store atau on_site',
    customer_address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT DEFAULT 'pending' COMMENT 'Status booking: pending, confirmed, in_progress, completed, cancelled, no_show',
    payment_status TEXT DEFAULT 'pending' COMMENT 'Status pembayaran: pending, paid, refunded',
    service_fee NUMERIC DEFAULT 0,
    on_site_fee NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    assigned_staff_id UUID REFERENCES users(id),
    staff_notes TEXT,
    customer_notes TEXT,
    allnimall_commission NUMERIC DEFAULT 0 COMMENT 'Komisi untuk Allnimall jika booking dari Allnimall app',
    partnership_id UUID REFERENCES merchant_partnerships(id),
    sale_id UUID REFERENCES sales(id),
    COMMENT 'Sistem booking terpadu untuk semua jenis booking (merchant online, Allnimall app, offline store)'
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_healths ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_customers ENABLE ROW LEVEL SECURITY;

-- Note: merchant_partnerships, merchant_service_availability, and service_bookings have RLS disabled

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    reference TEXT;
    date_part TEXT;
    sequence_part TEXT;
BEGIN
    -- Get current date in YYYYMMDD format
    date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
    
    -- Generate sequence part (4 digits)
    sequence_part := LPAD((EXTRACT(EPOCH FROM NOW()) % 10000)::TEXT, 4, '0');
    
    -- Combine to create reference
    reference := 'BK-' || date_part || '-' || sequence_part;
    
    RETURN reference;
END;
$$ LANGUAGE plpgsql;

-- Function to check cart slot availability
CREATE OR REPLACE FUNCTION check_cart_slot_availability(
    p_booking_date DATE,
    p_booking_time TIME,
    p_service_product_id UUID,
    p_store_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN := FALSE;
    day_of_week INTEGER;
BEGIN
    -- Get day of week (0 = Sunday, 1 = Monday, etc.)
    day_of_week := EXTRACT(DOW FROM p_booking_date);
    
    -- Check if there's availability for this service on this day/time
    SELECT EXISTS(
        SELECT 1 
        FROM merchant_service_availability msa
        WHERE msa.store_id = p_store_id
        AND msa.service_product_id = p_service_product_id
        AND msa.day_of_week = day_of_week
        AND msa.start_time <= p_booking_time
        AND msa.end_time > p_booking_time
        AND msa.is_available = TRUE
    ) INTO is_available;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- Function to get available staff
CREATE OR REPLACE FUNCTION get_available_staff(
    p_booking_date DATE,
    p_booking_time TIME,
    p_duration_minutes INTEGER,
    p_store_id UUID
)
RETURNS TABLE(
    staff_id UUID,
    staff_name TEXT,
    staff_phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as staff_id,
        u.name as staff_name,
        u.phone as staff_phone
    FROM users u
    JOIN role_assignments ra ON u.id = ra.user_id
    WHERE ra.store_id = p_store_id
    AND ra.is_active = TRUE
    AND u.is_active = TRUE
    AND u.staff_type IN ('groomer', 'veterinarian', 'service_staff')
    AND NOT EXISTS (
        SELECT 1 
        FROM service_bookings sb
        WHERE sb.assigned_staff_id = u.id
        AND sb.booking_date = p_booking_date
        AND sb.status IN ('confirmed', 'in_progress')
        AND (
            (sb.booking_time <= p_booking_time AND 
             sb.booking_time + INTERVAL '1 minute' * sb.duration_minutes > p_booking_time)
            OR
            (p_booking_time <= sb.booking_time AND 
             p_booking_time + INTERVAL '1 minute' * p_duration_minutes > sb.booking_time)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if staff is available for time range
CREATE OR REPLACE FUNCTION is_staff_available_for_range(
    p_booking_date DATE,
    p_start_time TIME,
    p_duration_minutes INTEGER,
    p_staff_id UUID,
    p_service_product_id UUID,
    p_store_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN := FALSE;
BEGIN
    -- Check if staff has any conflicting bookings
    SELECT NOT EXISTS(
        SELECT 1 
        FROM service_bookings sb
        WHERE sb.assigned_staff_id = p_staff_id
        AND sb.booking_date = p_booking_date
        AND sb.status IN ('confirmed', 'in_progress')
        AND (
            (sb.booking_time <= p_start_time AND 
             sb.booking_time + INTERVAL '1 minute' * sb.duration_minutes > p_start_time)
            OR
            (p_start_time <= sb.booking_time AND 
             p_start_time + INTERVAL '1 minute' * p_duration_minutes > sb.booking_time)
        )
    ) INTO is_available;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- Function to get calendar slots with staff
CREATE OR REPLACE FUNCTION get_calendar_slots_with_staff(
    p_booking_date DATE,
    p_service_product_id UUID,
    p_store_id UUID,
    p_start_hour INTEGER DEFAULT 8,
    p_end_hour INTEGER DEFAULT 18
)
RETURNS TABLE(
    slot_time TIME,
    staff_id UUID,
    staff_name TEXT,
    staff_phone TEXT,
    avatar TEXT,
    is_available BOOLEAN
) AS $$
DECLARE
    slot_duration INTEGER;
    current_hour INTEGER;
    current_minute INTEGER;
    slot_time TIME;
BEGIN
    -- Get slot duration from service availability
    SELECT msa.slot_duration_minutes INTO slot_duration
    FROM merchant_service_availability msa
    WHERE msa.store_id = p_store_id
    AND msa.service_product_id = p_service_product_id
    AND msa.day_of_week = EXTRACT(DOW FROM p_booking_date)
    LIMIT 1;
    
    -- Default to 60 minutes if not found
    IF slot_duration IS NULL THEN
        slot_duration := 60;
    END IF;
    
    -- Generate time slots
    current_hour := p_start_hour;
    WHILE current_hour < p_end_hour LOOP
        current_minute := 0;
        WHILE current_minute < 60 LOOP
            slot_time := (current_hour || ':' || LPAD(current_minute::TEXT, 2, '0'))::TIME;
            
            -- Check if this slot is within availability hours
            IF EXISTS (
                SELECT 1 
                FROM merchant_service_availability msa
                WHERE msa.store_id = p_store_id
                AND msa.service_product_id = p_service_product_id
                AND msa.day_of_week = EXTRACT(DOW FROM p_booking_date)
                AND msa.start_time <= slot_time
                AND msa.end_time > slot_time
                AND msa.is_available = TRUE
            ) THEN
                -- Get available staff for this slot
                RETURN QUERY
                SELECT 
                    slot_time,
                    u.id as staff_id,
                    u.name as staff_name,
                    u.phone as staff_phone,
                    u.picture_url as avatar,
                    is_staff_available_for_range(
                        p_booking_date,
                        slot_time,
                        slot_duration,
                        u.id,
                        p_service_product_id,
                        p_store_id
                    ) as is_available
                FROM users u
                JOIN role_assignments ra ON u.id = ra.user_id
                WHERE ra.store_id = p_store_id
                AND ra.is_active = TRUE
                AND u.is_active = TRUE
                AND u.staff_type IN ('groomer', 'veterinarian', 'service_staff');
            ELSE
                -- Slot not available
                RETURN QUERY
                SELECT 
                    slot_time,
                    NULL::UUID as staff_id,
                    NULL::TEXT as staff_name,
                    NULL::TEXT as staff_phone,
                    NULL::TEXT as avatar,
                    FALSE as is_available;
            END IF;
            
            current_minute := current_minute + slot_duration;
        END LOOP;
        current_hour := current_hour + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get customer merchants
CREATE OR REPLACE FUNCTION get_customer_merchants(customer_uuid UUID)
RETURNS TABLE(
    merchant_id UUID,
    merchant_name TEXT,
    store_id UUID,
    store_name TEXT,
    customer_code TEXT,
    joined_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as merchant_id,
        m.name as merchant_name,
        s.id as store_id,
        s.name as store_name,
        mc.customer_code,
        mc.joined_at
    FROM merchant_customers mc
    JOIN merchants m ON mc.merchant_id = m.id
    JOIN stores s ON mc.store_id = s.id
    WHERE mc.customer_id = customer_uuid
    AND mc.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get merchant customers
CREATE OR REPLACE FUNCTION get_merchant_customers(merchant_uuid UUID)
RETURNS TABLE(
    customer_id UUID,
    customer_name TEXT,
    customer_phone TEXT,
    has_allnimall_account BOOLEAN,
    store_id UUID,
    store_name TEXT,
    customer_code TEXT,
    joined_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.phone as customer_phone,
        (c.auth_id IS NOT NULL) as has_allnimall_account,
        s.id as store_id,
        s.name as store_name,
        mc.customer_code,
        mc.joined_at
    FROM merchant_customers mc
    JOIN customers c ON mc.customer_id = c.id
    JOIN stores s ON mc.store_id = s.id
    WHERE mc.merchant_id = merchant_uuid
    AND mc.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to process unified checkout
CREATE OR REPLACE FUNCTION process_unified_checkout(
    p_cart_id UUID,
    p_cashier_id UUID,
    p_customer_id UUID,
    p_payment_method_id UUID
)
RETURNS TEXT AS $$
DECLARE
    sale_id UUID;
    sale_number TEXT;
    total_amount NUMERIC := 0;
    cart_item RECORD;
BEGIN
    -- Generate sale number
    sale_number := 'SALE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW()) % 10000)::TEXT, 4, '0');
    
    -- Calculate total amount
    SELECT COALESCE(SUM(sci.quantity * sci.unit_price), 0) INTO total_amount
    FROM store_cart_items sci
    WHERE sci.cart_id = p_cart_id;
    
    -- Create sale record
    INSERT INTO sales (
        store_id,
        customer_id,
        user_id,
        sale_number,
        sale_date,
        subtotal,
        total_amount,
        payment_method_id,
        payment_status,
        status
    )
    SELECT 
        sc.store_id,
        p_customer_id,
        p_cashier_id,
        sale_number,
        NOW(),
        total_amount,
        total_amount,
        p_payment_method_id,
        'paid',
        'completed'
    FROM store_carts sc
    WHERE sc.id = p_cart_id
    RETURNING id INTO sale_id;
    
    -- Create sale items
    FOR cart_item IN 
        SELECT sci.*, p.name as product_name
        FROM store_cart_items sci
        JOIN products p ON sci.product_id = p.id
        WHERE sci.cart_id = p_cart_id
    LOOP
        INSERT INTO sales_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            total_amount,
            item_type,
            booking_date,
            booking_time,
            duration_minutes,
            assigned_staff_id,
            customer_notes,
            booking_reference
        ) VALUES (
            sale_id,
            cart_item.product_id,
            cart_item.quantity,
            cart_item.unit_price,
            cart_item.quantity * cart_item.unit_price,
            cart_item.item_type,
            cart_item.booking_date,
            cart_item.booking_time,
            cart_item.duration_minutes,
            cart_item.assigned_staff_id,
            cart_item.customer_notes,
            cart_item.booking_reference
        );
        
        -- Update inventory if it's a product
        IF cart_item.item_type = 'product' THEN
            INSERT INTO inventory_transactions (
                store_id,
                product_id,
                transaction_type,
                quantity,
                unit_price,
                total_amount,
                reference_id,
                reference_type,
                notes
            ) VALUES (
                (SELECT store_id FROM store_carts WHERE id = p_cart_id),
                cart_item.product_id,
                'sale',
                -cart_item.quantity,
                cart_item.unit_price,
                cart_item.quantity * cart_item.unit_price,
                sale_id,
                'sale',
                'Sale transaction from checkout'
            );
        END IF;
    END LOOP;
    
    -- Update cart status
    UPDATE store_carts 
    SET status = 'completed', updated_at = NOW()
    WHERE id = p_cart_id;
    
    -- Clear cart items
    DELETE FROM store_cart_items WHERE cart_id = p_cart_id;
    
    RETURN sale_number;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for frequently queried columns
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_auth_id ON customers(auth_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_sales_store_id ON sales(store_id);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_items_sale_id ON sales_items(sale_id);
CREATE INDEX idx_sales_items_product_id ON sales_items(product_id);
CREATE INDEX idx_store_carts_store_id ON store_carts(store_id);
CREATE INDEX idx_store_carts_customer_id ON store_carts(customer_id);
CREATE INDEX idx_store_cart_items_cart_id ON store_cart_items(cart_id);
CREATE INDEX idx_service_bookings_store_id ON service_bookings(store_id);
CREATE INDEX idx_service_bookings_customer_id ON service_bookings(customer_id);
CREATE INDEX idx_service_bookings_date ON service_bookings(booking_date);
CREATE INDEX idx_merchant_customers_merchant_id ON merchant_customers(merchant_id);
CREATE INDEX idx_merchant_customers_customer_id ON merchant_customers(customer_id);
CREATE INDEX idx_role_assignments_user_id ON role_assignments(user_id);
CREATE INDEX idx_role_assignments_store_id ON role_assignments(store_id);
CREATE INDEX idx_inventory_transactions_store_id ON inventory_transactions(store_id);
CREATE INDEX idx_inventory_transactions_product_id ON inventory_transactions(product_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_products_store_category ON products(store_id, category_id);
CREATE INDEX idx_sales_store_date ON sales(store_id, sale_date);
CREATE INDEX idx_service_bookings_store_date ON service_bookings(store_id, booking_date);
CREATE INDEX idx_merchant_customers_merchant_store ON merchant_customers(merchant_id, store_id);

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON DATABASE postgres IS 'Allnimall Store CMS Database - Pet shop management system with multi-merchant support';

COMMENT ON TABLE countries IS 'Reference table for countries';
COMMENT ON TABLE provinces IS 'Reference table for provinces/states within countries';
COMMENT ON TABLE cities IS 'Reference table for cities within provinces';
COMMENT ON TABLE users IS 'Staff/employee users who work at stores';
COMMENT ON TABLE customers IS 'Customer information and profiles';
COMMENT ON TABLE merchants IS 'Business/merchant information';
COMMENT ON TABLE stores IS 'Individual store locations belonging to merchants';
COMMENT ON TABLE roles IS 'Role definitions with permissions';
COMMENT ON TABLE role_assignments IS 'User role assignments for specific merchants/stores';
COMMENT ON TABLE pet_categories IS 'Categories of pets (dog, cat, bird, etc.)';
COMMENT ON TABLE characters IS 'Pet character traits';
COMMENT ON TABLE pets IS 'Individual pet records owned by customers';
COMMENT ON TABLE pet_characters IS 'Junction table linking pets to their character traits';
COMMENT ON TABLE pet_healths IS 'Health records and medical information for pets';
COMMENT ON TABLE schedule_types IS 'Types of scheduled activities (feeding, grooming, etc.)';
COMMENT ON TABLE pet_schedules IS 'Scheduled activities for pets';
COMMENT ON TABLE schedule_recurring_patterns IS 'Recurring schedule patterns';
COMMENT ON TABLE products_categories IS 'Product categories specific to each store';
COMMENT ON TABLE products IS 'Products and services offered by stores';
COMMENT ON TABLE payment_types IS 'Types of payment methods (cash, card, etc.)';
COMMENT ON TABLE payment_methods IS 'Specific payment methods available';
COMMENT ON TABLE store_payment_methods IS 'Payment methods enabled for each store';
COMMENT ON TABLE inventory_transactions IS 'Inventory movement transactions';
COMMENT ON TABLE sales IS 'Sales transactions';
COMMENT ON TABLE sales_items IS 'Individual items within sales';
COMMENT ON TABLE store_carts IS 'Shopping carts for customers';
COMMENT ON TABLE store_cart_items IS 'Items in shopping carts';
COMMENT ON TABLE merchant_customers IS 'Customer relationships with merchants';
COMMENT ON TABLE merchant_partnerships IS 'Partnership agreements between merchants and Allnimall';
COMMENT ON TABLE merchant_service_availability IS 'Service availability schedules for merchants';
COMMENT ON TABLE service_bookings IS 'Unified booking system for all service types';

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
    sort_order INTEGER DEFAULT 0,
    -- Week 3 enhancements
    display_name TEXT,
    short_description TEXT,
    popular BOOLEAN DEFAULT false,
    badge_text TEXT,
    badge_color TEXT DEFAULT 'blue',
    icon_url TEXT,
    color_scheme TEXT DEFAULT 'blue',
    trial_days INTEGER DEFAULT 14,
    setup_fee NUMERIC DEFAULT 0,
    cancellation_fee NUMERIC DEFAULT 0,
    max_stores INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 1,
    max_products INTEGER DEFAULT 100,
    max_customers INTEGER DEFAULT 1000,
    storage_gb INTEGER DEFAULT 1,
    api_calls_per_month INTEGER DEFAULT 1000,
    support_level TEXT DEFAULT 'email',
    sla_percentage INTEGER DEFAULT 99
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
    auto_renew BOOLEAN DEFAULT true,
    -- Week 3 enhancements
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    proration_amount NUMERIC DEFAULT 0,
    upgrade_credit NUMERIC DEFAULT 0,
    downgrade_credit NUMERIC DEFAULT 0,
    change_effective_date TIMESTAMPTZ,
    change_reason TEXT,
    last_payment_date TIMESTAMPTZ,
    last_payment_amount NUMERIC,
    payment_failure_count INTEGER DEFAULT 0,
    grace_period_end TIMESTAMPTZ,
    suspension_reason TEXT,
    reactivation_date TIMESTAMPTZ
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
    pdf_url TEXT,
    -- Week 3 enhancements
    subtotal NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    late_fee NUMERIC DEFAULT 0,
    payment_terms_days INTEGER DEFAULT 30,
    notes TEXT,
    billing_address JSONB,
    line_items JSONB,
    metadata JSONB
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
    receipt_url TEXT,
    -- Week 3 enhancements
    payment_date TIMESTAMPTZ,
    payment_reference TEXT,
    payment_gateway TEXT DEFAULT 'midtrans',
    gateway_transaction_id TEXT,
    gateway_fee NUMERIC DEFAULT 0,
    net_amount NUMERIC,
    refund_amount NUMERIC DEFAULT 0,
    refund_reason TEXT,
    refund_date TIMESTAMPTZ
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
-- WEEK 3 FRONTEND ENHANCEMENT TABLES
-- =============================================

-- Plan change requests table
CREATE TABLE plan_change_requests (
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
CREATE TABLE subscription_usage_analytics (
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
CREATE TABLE pricing_faq (
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
CREATE TABLE subscription_notifications (
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

-- Week 3 enhancement indexes
CREATE INDEX idx_subscription_plans_popular ON subscription_plans(popular);
CREATE INDEX idx_user_subscriptions_period ON user_subscriptions(current_period_start, current_period_end);
CREATE INDEX idx_billing_invoices_terms ON billing_invoices(payment_terms_days);
CREATE INDEX idx_billing_payments_gateway ON billing_payments(payment_gateway);

-- Indexes for new tables
CREATE INDEX idx_plan_change_requests_user_id ON plan_change_requests(user_id);
CREATE INDEX idx_plan_change_requests_subscription_id ON plan_change_requests(subscription_id);
CREATE INDEX idx_plan_change_requests_status ON plan_change_requests(status);
CREATE INDEX idx_subscription_usage_analytics_user_id ON subscription_usage_analytics(user_id);
CREATE INDEX idx_subscription_usage_analytics_subscription_id ON subscription_usage_analytics(subscription_id);
CREATE INDEX idx_subscription_usage_analytics_period ON subscription_usage_analytics(period_start, period_end);
CREATE INDEX idx_pricing_faq_category ON pricing_faq(category);
CREATE INDEX idx_pricing_faq_active ON pricing_faq(is_active);
CREATE INDEX idx_subscription_notifications_user_id ON subscription_notifications(user_id);
CREATE INDEX idx_subscription_notifications_type ON subscription_notifications(notification_type);
CREATE INDEX idx_subscription_notifications_read ON subscription_notifications(is_read);

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

-- Week 3 enhancement table comments
COMMENT ON TABLE plan_change_requests IS 'Track plan change requests and approvals';
COMMENT ON TABLE subscription_usage_analytics IS 'Analytics data for subscription usage tracking';
COMMENT ON TABLE pricing_faq IS 'Frequently asked questions for pricing page';
COMMENT ON TABLE subscription_notifications IS 'User notifications for subscription events';

-- Week 3 enhancement column comments
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

-- =============================================
-- WEEK 4 PLAN RESTRICTIONS ENHANCEMENTS
-- =============================================

-- Week 4 enhancement column comments for feature_flags
COMMENT ON COLUMN feature_flags.usage_limit IS 'Usage limit for this feature (-1 for unlimited, NULL for no limit)';
COMMENT ON COLUMN feature_flags.reset_period IS 'Period for usage limit reset (daily, weekly, monthly, yearly)';
COMMENT ON COLUMN feature_flags.category IS 'Category grouping for features (product_management, store_management, etc.)';
COMMENT ON COLUMN feature_flags.is_core_feature IS 'Whether this is a core feature available in all plans';

-- Week 4 enhancement indexes for feature flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_plan_feature ON feature_flags(plan_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);

-- Week 4 enhancement indexes for feature usage
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_reset_date ON feature_usage(reset_date);

-- =============================================
-- WEEK 4 PLAN RESTRICTIONS FUNCTIONS
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

COMMENT ON FUNCTION can_user_perform_action IS 'Check if user can perform an action based on their plan and usage limits';
COMMENT ON FUNCTION get_user_feature_access_summary IS 'Get comprehensive feature access summary for a user';
