"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { TokenRefreshService } from "@/lib/token-refresh-service";
import { toast } from "sonner";

interface AuthContextType {
	user: User | null;
	session: Session | null;
	loading: boolean;
	signIn: (
		email: string,
		password: string
	) => Promise<{ success: boolean; error?: string }>;
	signUp: (
		email: string,
		password: string,
		metadata?: any
	) => Promise<{ success: boolean; error?: string }>;
	signOut: () => Promise<void>;
	resetPassword: (
		email: string
	) => Promise<{ success: boolean; error?: string }>;
	updatePassword: (
		password: string
	) => Promise<{ success: boolean; error?: string }>;
	resendVerification: (
		email: string
	) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Initialize token refresh service
		TokenRefreshService.initialize();

		// Get initial session
		const getInitialSession = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();
				if (error) {
					console.error("Error getting session:", error);
				} else {
					setSession(session);
					setUser(session?.user ?? null);
				}
			} catch (error) {
				console.error("Error in getInitialSession:", error);
			} finally {
				setLoading(false);
			}
		};

		getInitialSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event, session?.user?.email);

			setSession(session);
			setUser(session?.user ?? null);
			setLoading(false);

			// Handle different auth events
			switch (event) {
				case "SIGNED_IN":
					toast.success("Successfully signed in!");
					break;
				case "SIGNED_OUT":
					toast.success("Successfully signed out!");
					break;
				case "TOKEN_REFRESHED":
					console.log("Token refreshed");
					break;
				case "PASSWORD_RECOVERY":
					toast.info("Password recovery email sent!");
					break;
				case "SIGNED_IN_ERROR":
					// This will be handled by the login page
					break;
			}
		});

		return () => {
			subscription.unsubscribe();
			TokenRefreshService.cleanup();
		};
	}, []);

	const signIn = async (email: string, password: string) => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (email: string, password: string, metadata?: any) => {
		try {
			setLoading(true);
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

			if (data.user && !data.session) {
				toast.info("Please check your email for verification link");
			}

			return { success: true };
		} catch (error) {
			return { success: false, error: "An unexpected error occurred" };
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) {
				toast.error("Error signing out: " + error.message);
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const resetPassword = async (email: string) => {
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
	};

	const updatePassword = async (password: string) => {
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
	};

	const resendVerification = async (email: string) => {
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
	};

	const value: AuthContextType = {
		user,
		session,
		loading,
		signIn,
		signUp,
		signOut,
		resetPassword,
		updatePassword,
		resendVerification,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
