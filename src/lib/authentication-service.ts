import { supabase } from "./supabase";
import { User, Session } from "@supabase/supabase-js";

export interface UserProfile {
	user_id: string;
	email: string;
	full_name: string;
	phone: string;
	role_id: string;
	role_name: string;
	store_id: string;
	store_name: string;
	merchant_id: string;
	merchant_name: string;
	is_active: boolean;
}

export interface UserStore {
	store_id: string;
	store_name: string;
	merchant_id: string;
	merchant_name: string;
	role_id: string;
	role_name: string;
}

export class AuthenticationService {
	/**
	 * Register a new user
	 */
	static async registerUser(
		email: string,
		password: string,
		metadata?: any
	): Promise<{ success: boolean; error?: string; user?: User }> {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: metadata,
				},
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, user: data.user || undefined };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Login user with email and password
	 */
	static async loginUser(
		email: string,
		password: string
	): Promise<{ success: boolean; error?: string; session?: Session }> {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, session: data.session || undefined };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Logout current user
	 */
	static async logoutUser(): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				return { success: false, error: error.message };
			}

			// Clear localStorage
			localStorage.removeItem("user_id");
			localStorage.removeItem("store_id");
			localStorage.removeItem("merchant_id");
			localStorage.removeItem("role_id");
			localStorage.removeItem("store_name");
			localStorage.removeItem("merchant_name");
			localStorage.removeItem("role_name");

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Get current user
	 */
	static async getCurrentUser(): Promise<{
		success: boolean;
		error?: string;
		user?: User;
	}> {
		try {
			const {
				data: { user },
				error,
			} = await supabase.auth.getUser();

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, user: user || undefined };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Get user profile with role and store information
	 */
	static async getUserProfile(
		userId: string
	): Promise<{ success: boolean; error?: string; profile?: UserProfile }> {
		try {
			const { data, error } = await supabase.rpc("get_user_profile", {
				user_uuid: userId,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			if (!data || data.length === 0) {
				return { success: false, error: "User profile not found" };
			}

			return { success: true, profile: data[0] };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Get user's accessible stores
	 */
	static async getUserStores(
		userId: string
	): Promise<{ success: boolean; error?: string; stores?: UserStore[] }> {
		try {
			const { data, error } = await supabase.rpc("get_user_stores", {
				user_uuid: userId,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, stores: data || [] };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Check if user has specific permission
	 */
	static async userHasPermission(
		userId: string,
		permissionName: string
	): Promise<{ success: boolean; error?: string; hasPermission?: boolean }> {
		try {
			const { data, error } = await supabase.rpc("user_has_permission", {
				user_uuid: userId,
				permission_name: permissionName,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, hasPermission: data || false };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Check if user has access to specific store
	 */
	static async userHasStoreAccess(
		userId: string,
		storeId: string
	): Promise<{ success: boolean; error?: string; hasAccess?: boolean }> {
		try {
			const { data, error } = await supabase.rpc("user_has_store_access", {
				user_uuid: userId,
				store_uuid: storeId,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, hasAccess: data || false };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Check if user is admin
	 */
	static async isUserAdmin(
		userId: string
	): Promise<{ success: boolean; error?: string; isAdmin?: boolean }> {
		try {
			const { data, error } = await supabase.rpc("is_user_admin", {
				user_uuid: userId,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, isAdmin: data || false };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Get user's role in specific store
	 */
	static async getUserStoreRole(
		userId: string,
		storeId: string
	): Promise<{
		success: boolean;
		error?: string;
		role?: { role_id: string; role_name: string; is_active: boolean };
	}> {
		try {
			const { data, error } = await supabase.rpc("get_user_store_role", {
				user_uuid: userId,
				store_uuid: storeId,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			if (!data || data.length === 0) {
				return { success: false, error: "User role not found for this store" };
			}

			return { success: true, role: data[0] };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Refresh session token
	 */
	static async refreshSession(): Promise<{
		success: boolean;
		error?: string;
		session?: Session;
	}> {
		try {
			const { data, error } = await supabase.auth.refreshSession();

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true, session: data.session || undefined };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Reset password for email
	 */
	static async resetPassword(
		email: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Update user password
	 */
	static async updatePassword(
		password: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase.auth.updateUser({
				password,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Resend verification email
	 */
	static async resendVerification(
		email: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase.auth.resend({
				type: "signup",
				email,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		}
	}
}
