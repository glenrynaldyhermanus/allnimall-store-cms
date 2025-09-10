import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createBrowserClient>;

if (!supabaseUrl || !supabaseAnonKey) {
	console.error(
		"Missing Supabase environment variables. Please check your .env.local file."
	);
	console.error("Required variables:");
	console.error("- NEXT_PUBLIC_SUPABASE_URL");
	console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY");

	// Create a mock client for development
	const mockQueryBuilder = {
		select: (...args: unknown[]) => mockQueryBuilder,
		insert: (...args: unknown[]) => mockQueryBuilder,
		update: (...args: unknown[]) => mockQueryBuilder,
		delete: (...args: unknown[]) => mockQueryBuilder,
		eq: (...args: unknown[]) => mockQueryBuilder,
		is: (...args: unknown[]) => mockQueryBuilder,
		order: (...args: unknown[]) => mockQueryBuilder,
		single: (...args: unknown[]) => mockQueryBuilder,
		then: (
			callback: (result: { data: unknown; error: Error | null }) => void
		) => callback({ data: [], error: new Error("Supabase not configured") }),
	};

	supabase = {
		from: () => mockQueryBuilder,
	} as unknown as ReturnType<typeof createBrowserClient>;
} else {
	supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Database types based on schema
export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					name: string;
					phone: string;
					email: string;
					picture_url: string | null;
					is_active: boolean;
					staff_type: string;
					auth_id: string | null;
					username: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name: string;
					phone: string;
					email: string;
					picture_url?: string | null;
					is_active?: boolean;
					staff_type?: string;
					auth_id?: string | null;
					username?: string | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name?: string;
					phone?: string;
					email?: string;
					picture_url?: string | null;
					is_active?: boolean;
					staff_type?: string;
					auth_id?: string | null;
					username?: string | null;
				};
			};
			merchants: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					name: string;
					business_type: string;
					phone: string | null;
					email: string | null;
					address: string | null;
					city_id: string | null;
					province_id: string | null;
					country_id: string | null;
					logo_url: string | null;
					description: string | null;
					is_active: boolean;
					owner_id: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name: string;
					business_type: string;
					phone?: string | null;
					email?: string | null;
					address?: string | null;
					city_id?: string | null;
					province_id?: string | null;
					country_id?: string | null;
					logo_url?: string | null;
					description?: string | null;
					is_active?: boolean;
					owner_id?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name?: string;
					business_type?: string;
					phone?: string | null;
					email?: string | null;
					address?: string | null;
					city_id?: string | null;
					province_id?: string | null;
					country_id?: string | null;
					logo_url?: string | null;
					description?: string | null;
					is_active?: boolean;
					owner_id?: string;
				};
			};
			stores: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					merchant_id: string;
					name: string;
					address: string | null;
					city_id: string | null;
					province_id: string | null;
					country_id: string | null;
					phone: string | null;
					email: string | null;
					is_active: boolean;
					business_field: string;
					business_description: string | null;
					phone_number: string | null;
					phone_country_code: string | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					merchant_id: string;
					name: string;
					address?: string | null;
					city_id?: string | null;
					province_id?: string | null;
					country_id?: string | null;
					phone?: string | null;
					email?: string | null;
					is_active?: boolean;
					business_field?: string;
					business_description?: string | null;
					phone_number?: string | null;
					phone_country_code?: string | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					merchant_id?: string;
					name?: string;
					address?: string | null;
					city_id?: string | null;
					province_id?: string | null;
					country_id?: string | null;
					phone?: string | null;
					email?: string | null;
					is_active?: boolean;
					business_field?: string;
					business_description?: string | null;
					phone_number?: string | null;
					phone_country_code?: string | null;
				};
			};
			products: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					store_id: string;
					category_id: string;
					name: string;
					description: string | null;
					price: number;
					cost_price: number | null;
					stock_quantity: number;
					min_stock_level: number;
					max_stock_level: number | null;
					barcode: string | null;
					sku: string | null;
					picture_url: string | null;
					is_active: boolean;
					purchase_price: number;
					min_stock: number;
					unit: string;
					weight_grams: number;
					stock: number;
					code: string | null;
					product_type: string;
					duration_minutes: number | null;
					service_category: string | null;
					discount_type: number;
					discount_value: number;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					store_id: string;
					category_id: string;
					name: string;
					description?: string | null;
					price: number;
					cost_price?: number | null;
					stock_quantity?: number;
					min_stock_level?: number;
					max_stock_level?: number | null;
					barcode?: string | null;
					sku?: string | null;
					picture_url?: string | null;
					is_active?: boolean;
					purchase_price?: number;
					min_stock?: number;
					unit?: string;
					weight_grams?: number;
					stock?: number;
					code?: string | null;
					product_type?: string;
					duration_minutes?: number | null;
					service_category?: string | null;
					discount_type?: number;
					discount_value?: number;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					store_id?: string;
					category_id?: string;
					name?: string;
					description?: string | null;
					price?: number;
					cost_price?: number | null;
					stock_quantity?: number;
					min_stock_level?: number;
					max_stock_level?: number | null;
					barcode?: string | null;
					sku?: string | null;
					picture_url?: string | null;
					is_active?: boolean;
					purchase_price?: number;
					min_stock?: number;
					unit?: string;
					weight_grams?: number;
					stock?: number;
					code?: string | null;
					product_type?: string;
					duration_minutes?: number | null;
					service_category?: string | null;
					discount_type?: number;
					discount_value?: number;
				};
			};
			products_categories: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					name: string;
					picture_url: string | null;
					store_id: string;
					pet_category_id: string | null;
					description: string | null;
					type: string;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name: string;
					picture_url?: string | null;
					store_id: string;
					pet_category_id?: string | null;
					description?: string | null;
					type?: string;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name?: string;
					picture_url?: string | null;
					store_id?: string;
					pet_category_id?: string | null;
					description?: string | null;
					type?: string;
				};
			};
			roles: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					name: string;
					description: string | null;
					permissions: string[] | null;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name: string;
					description?: string | null;
					permissions?: string[] | null;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					name?: string;
					description?: string | null;
					permissions?: string[] | null;
				};
			};
			role_assignments: {
				Row: {
					id: string;
					created_at: string;
					created_by: string;
					updated_at: string | null;
					updated_by: string | null;
					deleted_at: string | null;
					user_id: string;
					merchant_id: string;
					role_id: string;
					store_id: string;
					is_active: boolean;
				};
				Insert: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					user_id: string;
					merchant_id: string;
					role_id: string;
					store_id: string;
					is_active?: boolean;
				};
				Update: {
					id?: string;
					created_at?: string;
					created_by?: string;
					updated_at?: string | null;
					updated_by?: string | null;
					deleted_at?: string | null;
					user_id?: string;
					merchant_id?: string;
					role_id?: string;
					store_id?: string;
					is_active?: boolean;
				};
			};
		};
	};
}
