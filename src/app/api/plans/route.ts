// API Routes for Subscription Plans
// GET /api/plans - Get all available subscription plans

import { NextRequest, NextResponse } from "next/server";
import SubscriptionService from "@/lib/subscription-service";

export async function GET(request: NextRequest) {
	try {
		// Get all subscription plans
		const plans = await SubscriptionService.getSubscriptionPlans();

		return NextResponse.json({
			plans,
		});
	} catch (error) {
		console.error("Error fetching subscription plans:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscription plans" },
			{ status: 500 }
		);
	}
}
