import { NextRequest, NextResponse } from "next/server";
import { planValidationService } from "@/lib/plan-validation-service";
import { usageTrackingService } from "@/lib/usage-tracking-service";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const storeId = searchParams.get("storeId");

		if (!userId) {
			return NextResponse.json({ error: "User ID required" }, { status: 400 });
		}

		// Validate user can access product management
		const validation = await planValidationService.validateAction(
			userId,
			"product_management",
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
			"product_management"
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

		// Mock product data - replace with actual database query
		const products = [
			{
				id: "1",
				name: "Premium Dog Food",
				price: 150000,
				stock: 50,
				category: "Food",
			},
			{
				id: "2",
				name: "Cat Litter",
				price: 75000,
				stock: 25,
				category: "Accessories",
			},
		];

		return NextResponse.json({
			products,
			usageInfo: usageResult.usageLimit,
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, storeId, productData } = body;

		if (!userId || !storeId || !productData) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate user can create products
		const validation = await planValidationService.validateAction(
			userId,
			"product_management",
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
			"product_management"
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

		// Mock product creation - replace with actual database insert
		const newProduct = {
			id: Date.now().toString(),
			...productData,
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json({
			product: newProduct,
			usageInfo: usageResult.usageLimit,
		});
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
