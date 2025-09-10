// API Routes for Individual Subscription Management
// PUT /api/subscriptions/[id] - Update subscription
// DELETE /api/subscriptions/[id] - Cancel subscription

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import SubscriptionService from "@/lib/subscription-service";
import type {
	UpdateSubscriptionRequest,
	CancelSubscriptionRequest,
} from "@/types/subscription";

const supabase = createClient();

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
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
		const body: UpdateSubscriptionRequest = await request.json();

		// Validate request
		if (!body.plan_id) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Verify subscription belongs to user
		const subscription = await SubscriptionService.getUserSubscription(user.id);
		if (!subscription || subscription.id !== params.id) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		// Update subscription
		const updatedSubscription = await SubscriptionService.updateSubscription(
			params.id,
			body
		);

		return NextResponse.json({
			subscription: updatedSubscription,
			message: "Subscription updated successfully",
		});
	} catch (error) {
		console.error("Error updating subscription:", error);
		return NextResponse.json(
			{ error: "Failed to update subscription" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Get user from session
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parse request body (optional)
		const body: CancelSubscriptionRequest = await request
			.json()
			.catch(() => ({}));

		// Verify subscription belongs to user
		const subscription = await SubscriptionService.getUserSubscription(user.id);
		if (!subscription || subscription.id !== params.id) {
			return NextResponse.json(
				{ error: "Subscription not found" },
				{ status: 404 }
			);
		}

		// Cancel subscription
		const cancelledSubscription = await SubscriptionService.cancelSubscription(
			params.id,
			body
		);

		return NextResponse.json({
			subscription: cancelledSubscription,
			message: "Subscription cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling subscription:", error);
		return NextResponse.json(
			{ error: "Failed to cancel subscription" },
			{ status: 500 }
		);
	}
}
