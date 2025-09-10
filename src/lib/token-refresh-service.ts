import { supabase } from "./supabase";
import { Session } from "@supabase/supabase-js";

export class TokenRefreshService {
	private static refreshTimer: NodeJS.Timeout | null = null;
	private static readonly REFRESH_INTERVAL = 50 * 60 * 1000; // 50 minutes (tokens expire in 1 hour)

	/**
	 * Start automatic token refresh
	 */
	static startAutoRefresh(): void {
		// Clear existing timer if any
		this.stopAutoRefresh();

		// Set up automatic refresh
		this.refreshTimer = setInterval(async () => {
			await this.refreshToken();
		}, this.REFRESH_INTERVAL);

		console.log("Token auto-refresh started");
	}

	/**
	 * Stop automatic token refresh
	 */
	static stopAutoRefresh(): void {
		if (this.refreshTimer) {
			clearInterval(this.refreshTimer);
			this.refreshTimer = null;
			console.log("Token auto-refresh stopped");
		}
	}

	/**
	 * Manually refresh token
	 */
	static async refreshToken(): Promise<{
		success: boolean;
		error?: string;
		session?: Session;
	}> {
		try {
			const { data, error } = await supabase.auth.refreshSession();

			if (error) {
				console.error("Token refresh failed:", error);
				return { success: false, error: error.message };
			}

			console.log("Token refreshed successfully");
			return { success: true, session: data.session || undefined };
		} catch (error) {
			console.error("Token refresh error:", error);
			return { success: false, error: "An unexpected error occurred" };
		}
	}

	/**
	 * Check if token is about to expire (within 10 minutes)
	 */
	static isTokenExpiringSoon(): boolean {
		try {
			const session = supabase.auth.getSession();
			if (!session) return false;

			// Check if we have access to the session data
			// This is a simplified check - in practice, you'd need to decode the JWT
			return false; // Placeholder - implement JWT expiration check if needed
		} catch (error) {
			console.error("Error checking token expiration:", error);
			return false;
		}
	}

	/**
	 * Get token expiration time (if available)
	 */
	static getTokenExpiration(): Date | null {
		try {
			// This would require JWT decoding
			// For now, return null as Supabase handles this internally
			return null;
		} catch (error) {
			console.error("Error getting token expiration:", error);
			return null;
		}
	}

	/**
	 * Initialize token refresh service
	 */
	static initialize(): void {
		// Start auto-refresh when the service is initialized
		this.startAutoRefresh();

		// Listen for auth state changes
		supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && session) {
				// Start auto-refresh when user signs in
				this.startAutoRefresh();
			} else if (event === "SIGNED_OUT") {
				// Stop auto-refresh when user signs out
				this.stopAutoRefresh();
			} else if (event === "TOKEN_REFRESHED") {
				// Token was refreshed, restart the timer
				this.startAutoRefresh();
			}
		});
	}

	/**
	 * Cleanup method to stop all timers
	 */
	static cleanup(): void {
		this.stopAutoRefresh();
	}
}
