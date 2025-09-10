// API Routes for Feature Usage Tracking
// GET /api/usage - Get user's feature usage
// POST /api/usage/track - Track feature usage

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import SubscriptionService from "@/lib/subscription-service";
import type { TrackUsageRequest } from "@/types/subscription";

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

		// Get user's feature usage
		const featureUsage = await SubscriptionService.getUserFeatureUsage(user.id);

		return NextResponse.json({
			features: featureUsage,
		});
	} catch (error) {
		console.error("Error fetching feature usage:", error);
		return NextResponse.json(
			{ error: "Failed to fetch feature usage" },
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
		const body: TrackUsageRequest = await request.json();

		// Validate request
		if (!body.feature_name) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Check if user has access to the feature
		const hasAccess = await SubscriptionService.hasFeatureAccess(
			user.id,
			body.feature_name
		);
		if (!hasAccess) {
			return NextResponse.json(
				{ error: "Feature not available in current plan" },
				{ status: 403 }
			);
		}

		// Track feature usage
		const success = await SubscriptionService.trackFeatureUsage(user.id, body);

		if (!success) {
			return NextResponse.json(
				{ error: "Usage limit exceeded" },
				{ status: 429 }
			);
		}

		// Get updated usage info
		const usageInfo = await SubscriptionService.checkFeatureUsageLimit(
			user.id,
			body.feature_name
		);

		return NextResponse.json({
			success: true,
			usage: usageInfo,
			message: "Feature usage tracked successfully",
		});
	} catch (error) {
		console.error("Error tracking feature usage:", error);
		return NextResponse.json(
			{ error: "Failed to track feature usage" },
			{ status: 500 }
		);
	}
}
