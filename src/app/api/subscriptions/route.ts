// API Routes for Subscription Management
// GET /api/subscriptions - Get user's subscription
// POST /api/subscriptions - Create new subscription

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import SubscriptionService from "@/lib/subscription-service";
import type { CreateSubscriptionRequest } from "@/types/subscription";

const supabase = createClient();

export async function GET(request: NextRequest) {
	try {
		// Get user from session
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get user's subscription status
		const subscriptionStatus =
			await SubscriptionService.getUserSubscriptionStatus(user.id);

		// Get user's subscription details
		const subscription = await SubscriptionService.getUserSubscription(user.id);

		// Get user's feature usage
		const featureUsage = await SubscriptionService.getUserFeatureUsage(user.id);

		return NextResponse.json({
			subscription,
			subscriptionStatus,
			featureUsage,
		});
	} catch (error) {
		console.error("Error fetching subscription:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscription" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		// Get user from session
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body
		const body: CreateSubscriptionRequest = await request.json();

		// Validate request
		if (!body.plan_id || !body.payment_method_id || !body.billing_cycle) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check if user already has an active subscription
		const existingSubscription =
			await SubscriptionService.getUserSubscriptionStatus(user.id);
		if (existingSubscription && existingSubscription.is_active) {
			return NextResponse.json(
				{ error: "User already has an active subscription" },
				{ status: 400 }
			);
		}

		// Create subscription
		const subscription = await SubscriptionService.createSubscription(
			user.id,
			body
		);

		return NextResponse.json({
			subscription,
			message: "Subscription created successfully",
		});
	} catch (error) {
		console.error("Error creating subscription:", error);
		return NextResponse.json(
			{ error: "Failed to create subscription" },
			{ status: 500 }
		);
	}
}
