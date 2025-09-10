import { NextRequest, NextResponse } from "next/server";
import { planValidationService } from "@/lib/plan-validation-service";
import { usageTrackingService } from "@/lib/usage-tracking-service";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json({ error: "User ID required" }, { status: 400 });
		}

		// Validate user can access store management
		const validation = await planValidationService.validateAction(
			userId,
			"store_management",
			"read"
		);

		if (!validation.isValid) {
			return NextResponse.json(
				{
					error: validation.reason || "Access denied",
					upgradeRequired: true,
					currentPlan: validation.currentPlan,
					requiredPlan: validation.requiredPlan,
				},
				{ status: 403 }
			);
		}

		// Track usage
		const usageResult = await usageTrackingService.trackUsage(
			userId,
			"store_management"
		);

		if (!usageResult.success) {
			return NextResponse.json(
				{
					error: "Usage limit exceeded",
					notification: usageResult.notification,
				},
				{ status: 429 }
			);
		}

		// Mock store data - replace with actual database query
		const stores = [
			{
				id: "1",
				name: "Pet Shop Central",
				address: "Jl. Sudirman No. 123",
				phone: "+62-21-1234567",
				isActive: true,
			},
			{
				id: "2",
				name: "Pet Care Plus",
				address: "Jl. Thamrin No. 456",
				phone: "+62-21-7654321",
				isActive: true,
			},
		];

		return NextResponse.json({
			stores,
			usageInfo: usageResult.usageLimit,
		});
	} catch (error) {
		console.error("Error fetching stores:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, storeData } = body;

		if (!userId || !storeData) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate user can create stores
		const validation = await planValidationService.validateAction(
			userId,
			"store_management",
			"create"
		);

		if (!validation.isValid) {
			return NextResponse.json(
				{
					error: validation.reason || "Access denied",
					upgradeRequired: true,
					currentPlan: validation.currentPlan,
					requiredPlan: validation.requiredPlan,
				},
				{ status: 403 }
			);
		}

		// Track usage
		const usageResult = await usageTrackingService.trackUsage(
			userId,
			"store_management"
		);

		if (!usageResult.success) {
			return NextResponse.json(
				{
					error: "Usage limit exceeded",
					notification: usageResult.notification,
				},
				{ status: 429 }
			);
		}

		// Mock store creation - replace with actual database insert
		const newStore = {
			id: Date.now().toString(),
			...storeData,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json({
			store: newStore,
			usageInfo: usageResult.usageLimit,
		});
	} catch (error) {
		console.error("Error creating store:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
