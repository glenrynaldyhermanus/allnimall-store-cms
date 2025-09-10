import Midtrans from "midtrans-client";
import { createHash } from "node:crypto";

// Midtrans configuration
const midtransClient = new Midtrans.Snap({
	isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
	serverKey: process.env.MIDTRANS_SERVER_KEY!,
	clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export interface MidtransPaymentRequest {
	transaction_details: {
		order_id: string;
		gross_amount: number;
	};
	customer_details: {
		first_name: string;
		last_name?: string;
		email: string;
		phone: string;
	};
	item_details: Array<{
		id: string;
		price: number;
		quantity: number;
		name: string;
		category?: string;
	}>;
	callbacks?: {
		finish?: string;
		unfinish?: string;
		error?: string;
	};
	expiry?: {
		start_time: string;
		unit: "minute" | "hour" | "day";
		duration: number;
	};
}

export interface MidtransPaymentResponse {
	token: string;
	redirect_url: string;
}

export interface MidtransNotification {
	order_id: string;
	status_code: string;
	gross_amount: string;
	transaction_status:
		| "capture"
		| "settlement"
		| "pending"
		| "deny"
		| "cancel"
		| "expire"
		| "failure";
	fraud_status?: "accept" | "deny" | "challenge";
	payment_type: string;
	transaction_time: string;
	transaction_id: string;
	merchant_id: string;
	settlement_time?: string;
	approval_code?: string;
	signature_key: string;
	bank?: string;
	va_number?: string;
	bill_key?: string;
	biller_code?: string;
	permata_va_number?: string;
	eci?: string;
	masked_card?: string;
	card_type?: string;
	channel_response_code?: string;
	channel_response_message?: string;
	currency?: string;
}

export class MidtransService {
	/**
	 * Create a payment transaction
	 */
	static async createPayment(
		request: MidtransPaymentRequest
	): Promise<MidtransPaymentResponse> {
		try {
			const response = await midtransClient.createTransaction(request);

			return {
				token: response.token,
				redirect_url: response.redirect_url,
			};
		} catch (error) {
			console.error("Midtrans payment creation error:", error);
			throw new Error("Failed to create payment transaction");
		}
	}

	/**
	 * Create a subscription payment (recurring)
	 */
	static async createSubscriptionPayment(
		subscriptionId: string,
		amount: number,
		customerDetails: MidtransPaymentRequest["customer_details"],
		billingCycle: "monthly" | "yearly"
	): Promise<MidtransPaymentResponse> {
		const orderId = `SUB-${subscriptionId}-${Date.now()}`;

		const request: MidtransPaymentRequest = {
			transaction_details: {
				order_id: orderId,
				gross_amount: amount,
			},
			customer_details: customerDetails,
			item_details: [
				{
					id: subscriptionId,
					price: amount,
					quantity: 1,
					name: `Subscription Payment (${billingCycle})`,
					category: "subscription",
				},
			],
			callbacks: {
				finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
				unfinish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/unfinish`,
				error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`,
			},
			expiry: {
				start_time: new Date().toISOString(),
				unit: "day",
				duration: 1, // 1 day expiry
			},
		};

		return this.createPayment(request);
	}

	/**
	 * Verify webhook notification signature
	 */
	static verifyNotificationSignature(
		notification: MidtransNotification
	): boolean {
		try {
			const signatureKey = process.env.MIDTRANS_SERVER_KEY!;

			const orderId = notification.order_id;
			const statusCode = notification.status_code;
			const grossAmount = notification.gross_amount;
			const serverKey = signatureKey;

			const signature = createHash("sha512")
				.update(orderId + statusCode + grossAmount + serverKey)
				.digest("hex");

			return signature === notification.signature_key;
		} catch (error) {
			console.error("Signature verification error:", error);
			return false;
		}
	}

	/**
	 * Handle payment notification
	 */
	static async handlePaymentNotification(
		notification: MidtransNotification
	): Promise<{
		success: boolean;
		message: string;
	}> {
		try {
			// Verify signature
			if (!this.verifyNotificationSignature(notification)) {
				return {
					success: false,
					message: "Invalid signature",
				};
			}

			// Process based on transaction status
			switch (notification.transaction_status) {
				case "capture":
				case "settlement":
					await this.handleSuccessfulPayment(notification);
					break;
				case "pending":
					await this.handlePendingPayment(notification);
					break;
				case "deny":
				case "cancel":
				case "expire":
				case "failure":
					await this.handleFailedPayment(notification);
					break;
				default:
					console.log(
						"Unknown transaction status:",
						notification.transaction_status
					);
			}

			return {
				success: true,
				message: "Notification processed successfully",
			};
		} catch (error) {
			console.error("Payment notification handling error:", error);
			return {
				success: false,
				message: "Failed to process notification",
			};
		}
	}

	/**
	 * Handle successful payment
	 */
	private static async handleSuccessfulPayment(
		notification: MidtransNotification
	): Promise<void> {
		// Extract subscription ID from order_id
		const orderIdParts = notification.order_id.split("-");
		if (orderIdParts[0] === "SUB" && orderIdParts.length >= 3) {
			const subscriptionId = orderIdParts[1];

			// Update subscription status in database
			// This will be implemented in the subscription service
			console.log(`Payment successful for subscription: ${subscriptionId}`);
		}
	}

	/**
	 * Handle pending payment
	 */
	private static async handlePendingPayment(
		notification: MidtransNotification
	): Promise<void> {
		console.log(`Payment pending for order: ${notification.order_id}`);
	}

	/**
	 * Handle failed payment
	 */
	private static async handleFailedPayment(
		notification: MidtransNotification
	): Promise<void> {
		console.log(`Payment failed for order: ${notification.order_id}`);
	}

	/**
	 * Get transaction status
	 */
	static async getTransactionStatus(
		orderId: string
	): Promise<Record<string, unknown>> {
		try {
			const baseUrl =
				process.env.MIDTRANS_IS_PRODUCTION === "true"
					? "https://api.midtrans.com"
					: "https://api.sandbox.midtrans.com";

			const response = await fetch(`${baseUrl}/v2/${orderId}/status`, {
				method: "GET",
				headers: {
					Authorization: `Basic ${Buffer.from(
						process.env.MIDTRANS_SERVER_KEY! + ":"
					).toString("base64")}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Get transaction status error:", error);
			throw new Error("Failed to get transaction status");
		}
	}

	/**
	 * Cancel transaction
	 */
	static async cancelTransaction(
		orderId: string
	): Promise<Record<string, unknown>> {
		try {
			const baseUrl =
				process.env.MIDTRANS_IS_PRODUCTION === "true"
					? "https://api.midtrans.com"
					: "https://api.sandbox.midtrans.com";

			const response = await fetch(`${baseUrl}/v2/${orderId}/cancel`, {
				method: "POST",
				headers: {
					Authorization: `Basic ${Buffer.from(
						process.env.MIDTRANS_SERVER_KEY! + ":"
					).toString("base64")}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Cancel transaction error:", error);
			throw new Error("Failed to cancel transaction");
		}
	}

	/**
	 * Approve transaction (for manual review)
	 */
	static async approveTransaction(
		orderId: string
	): Promise<Record<string, unknown>> {
		try {
			const baseUrl =
				process.env.MIDTRANS_IS_PRODUCTION === "true"
					? "https://api.midtrans.com"
					: "https://api.sandbox.midtrans.com";

			const response = await fetch(`${baseUrl}/v2/${orderId}/approve`, {
				method: "POST",
				headers: {
					Authorization: `Basic ${Buffer.from(
						process.env.MIDTRANS_SERVER_KEY! + ":"
					).toString("base64")}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Approve transaction error:", error);
			throw new Error("Failed to approve transaction");
		}
	}
}

export default MidtransService;
