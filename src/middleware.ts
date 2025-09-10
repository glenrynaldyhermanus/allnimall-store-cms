import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: req.headers,
		},
	});

	console.log("Environment check:", {
		url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "EXISTS" : "MISSING",
		key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "EXISTS" : "MISSING",
	});

	console.log(
		"Cookies:",
		req.cookies.getAll().map((c) => c.name)
	);

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return req.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					req.cookies.set({
						name,
						value,
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: req.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
					});
				},
				remove(name: string, options: any) {
					req.cookies.set({
						name,
						value: "",
						...options,
					});
					response = NextResponse.next({
						request: {
							headers: req.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
					});
				},
			},
		}
	);

	const {
		data: { session },
		error: sessionError,
	} = await supabase.auth.getSession();

	console.log("Middleware: Session check:", {
		session: session
			? { user_id: session.user.id, email: session.user.email }
			: null,
		sessionError,
		path: req.nextUrl.pathname,
	});

	// Public routes that don't require authentication
	const publicRoutes = ["/", "/login", "/signup", "/setup-store"];
	const isPublicRoute =
		publicRoutes.includes(req.nextUrl.pathname) ||
		req.nextUrl.pathname.startsWith("/signup/success");

	// Auth callback route for email confirmation
	const isAuthCallback = req.nextUrl.pathname.startsWith("/auth/callback");

	// Admin routes that require authentication and store
	const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

	// If user is not authenticated and trying to access protected route
	if (!session && !isPublicRoute && !isAuthCallback) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	// If user is authenticated
	if (session) {
		// Redirect authenticated users away from auth pages
		if (
			req.nextUrl.pathname === "/login" ||
			req.nextUrl.pathname === "/signup"
		) {
			console.log(
				"Middleware: User authenticated, checking role assignments for:",
				session.user.id
			);

			// Check if user has a store by checking role_assignments
			const { data: roleAssignments, error: roleError } = await supabase
				.from("role_assignments")
				.select("store_id")
				.eq("user_id", session.user.id)
				.eq("is_active", true);

			console.log("Middleware: Role assignments result:", {
				roleAssignments,
				roleError,
			});

			if (roleAssignments && roleAssignments.length > 0) {
				console.log("Middleware: Redirecting to dashboard");
				return NextResponse.redirect(new URL("/admin/dashboard", req.url));
			} else {
				console.log("Middleware: Redirecting to setup-store");
				return NextResponse.redirect(new URL("/setup-store", req.url));
			}
		}

		// Check if user has a store for admin routes
		if (isAdminRoute) {
			console.log(
				"Middleware: Checking admin route access for:",
				session.user.id
			);

			// Check if user has any stores via role_assignments
			const { data: roleAssignments, error: roleError } = await supabase
				.from("role_assignments")
				.select("store_id")
				.eq("user_id", session.user.id)
				.eq("is_active", true);

			console.log("Middleware: Admin route role check:", {
				roleAssignments,
				roleError,
			});

			// If user doesn't have any stores, redirect to setup
			if (!roleAssignments || roleAssignments.length === 0) {
				console.log("Middleware: No stores found, redirecting to setup-store");
				return NextResponse.redirect(new URL("/setup-store", req.url));
			} else {
				console.log("Middleware: User has stores, allowing admin access");
			}
		}
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
