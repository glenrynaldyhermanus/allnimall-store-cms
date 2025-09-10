"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	redirectTo?: string;
	requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	fallback,
	redirectTo = "/login",
	requireEmailVerification = false,
}) => {
	const { user, loading } = useAuth();
	const router = useRouter();

	// Show loading state
	if (loading) {
		return (
			fallback || (
				<div className="flex items-center justify-center min-h-screen">
					<div className="flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin" />
						<p className="text-sm text-muted-foreground">Loading...</p>
					</div>
				</div>
			)
		);
	}

	// Redirect if not authenticated
	if (!user) {
		router.push(redirectTo);
		return null;
	}

	// Check email verification if required
	if (requireEmailVerification && !user.email_confirmed_at) {
		router.push("/verify-email");
		return null;
	}

	return <>{children}</>;
};

// HOC version for backward compatibility
export const withAuth = <P extends object>(
	Component: React.ComponentType<P>,
	options?: Omit<ProtectedRouteProps, "children">
) => {
	const WrappedComponent = (props: P) => {
		return (
			<ProtectedRoute {...options}>
				<Component {...props} />
			</ProtectedRoute>
		);
	};

	WrappedComponent.displayName = `withAuth(${
		Component.displayName || Component.name
	})`;
	return WrappedComponent;
};

// Hook for checking auth status
export const useRequireAuth = (redirectTo?: string) => {
	const { user, loading } = useAuth();
	const router = useRouter();

	React.useEffect(() => {
		if (!loading && !user) {
			router.push(redirectTo || "/login");
		}
	}, [user, loading, router, redirectTo]);

	return { user, loading, isAuthenticated: !!user };
};
