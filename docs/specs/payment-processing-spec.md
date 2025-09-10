# Payment Processing System Specification

## Overview

This specification defines the payment processing system for Allnimall Store CMS, including Midtrans integration, subscription billing, and payment management.

## Functional Requirements

### 1. Payment Gateway Integration

#### 1.1 Midtrans Integration

- **Primary Gateway**: Midtrans for Indonesian market
- **Payment Methods**: Credit cards, bank transfers, e-wallets, convenience stores
- **Currency**: Indonesian Rupiah (IDR)
- **Language**: Indonesian language support

#### 1.2 Supported Payment Methods

| Payment Method    | Type    | Processing Time | Fees |
| ----------------- | ------- | --------------- | ---- |
| Credit Card       | Online  | Instant         | 2.9% |
| Bank Transfer     | Online  | Instant         | 1.5% |
| E-Wallet          | Online  | Instant         | 1.8% |
| Convenience Store | Offline | 24 hours        | 1.2% |
| Virtual Account   | Online  | Instant         | 1.0% |

### 2. Subscription Billing

#### 2.1 Billing Cycles

- **Monthly**: 30-day billing cycle
- **Yearly**: 365-day billing cycle with 20% discount
- **Trial**: 14-day free trial

#### 2.2 Billing Operations

- **Initial Payment**: First subscription payment
- **Recurring Payment**: Automated recurring billing
- **Payment Retry**: Failed payment retry logic
- **Payment Failure**: Payment failure handling

### 3. Payment Processing Flow

#### 3.1 Payment Creation

```
User selects plan → Payment form → Midtrans token → Payment processing → Webhook notification
```

#### 3.2 Payment States

- **Pending**: Payment initiated, waiting for completion
- **Processing**: Payment being processed
- **Success**: Payment completed successfully
- **Failed**: Payment failed
- **Cancelled**: Payment cancelled by user
- **Expired**: Payment expired

### 4. Invoice Management

#### 4.1 Invoice Generation

- **Automatic**: Generated on subscription creation/renewal
- **Manual**: Generated for one-time payments
- **Template**: Customizable invoice templates

#### 4.2 Invoice Features

- **PDF Generation**: PDF invoice generation
- **Email Delivery**: Automatic email delivery
- **Payment Tracking**: Payment status tracking
- **Tax Calculation**: VAT calculation and compliance

## Technical Requirements

### 1. Database Schema

#### 1.1 Payment Tables

```sql
-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  midtrans_transaction_id VARCHAR(100) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'IDR',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, processing, success, failed, cancelled, expired
  payment_url TEXT,
  callback_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Billing invoices
CREATE TABLE billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES user_subscriptions(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- draft, sent, paid, overdue, cancelled
  due_date TIMESTAMP NOT NULL,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods
CREATE TABLE user_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  payment_method_type VARCHAR(50) NOT NULL,
  payment_method_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Payment Processing

```
POST /api/payments/midtrans/create - Create payment
GET /api/payments/midtrans/status/:id - Get payment status
POST /api/payments/midtrans/cancel/:id - Cancel payment
POST /api/payments/midtrans/webhook - Webhook handler
```

#### 2.2 Invoice Management

```
GET /api/billing/invoices - Get user invoices
GET /api/billing/invoices/:id - Get invoice details
POST /api/billing/invoices/:id/pay - Pay invoice
GET /api/billing/invoices/:id/pdf - Download invoice PDF
```

#### 2.3 Payment Methods

```
GET /api/payments/methods - Get user payment methods
POST /api/payments/methods - Add payment method
PUT /api/payments/methods/:id - Update payment method
DELETE /api/payments/methods/:id - Remove payment method
```

### 3. Midtrans Service Implementation

#### 3.1 Payment Creation

```typescript
export class MidtransService {
	async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
		const transaction = await this.createTransaction(paymentData);
		const midtransResponse = await this.callMidtransAPI(transaction);

		await this.savePaymentTransaction(transaction.id, midtransResponse);

		return {
			transactionId: transaction.id,
			paymentUrl: midtransResponse.redirect_url,
			status: "pending",
		};
	}

	async createSubscriptionPayment(
		subscriptionId: string,
		amount: number
	): Promise<PaymentResponse> {
		const subscription = await this.getSubscription(subscriptionId);
		const user = await this.getUser(subscription.user_id);

		const paymentData = {
			user_id: user.id,
			subscription_id: subscriptionId,
			amount: amount,
			payment_method: "credit_card",
			currency: "IDR",
		};

		return await this.createPayment(paymentData);
	}
}
```

#### 3.2 Webhook Handling

```typescript
export async function handleMidtransWebhook(
	req: NextRequest
): Promise<NextResponse> {
	const webhookData = await req.json();

	// Verify webhook signature
	if (!verifyWebhookSignature(webhookData)) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const transaction = await getPaymentTransaction(webhookData.transaction_id);

	if (!transaction) {
		return NextResponse.json(
			{ error: "Transaction not found" },
			{ status: 404 }
		);
	}

	// Update transaction status
	await updatePaymentStatus(transaction.id, webhookData.status);

	// Handle subscription activation
	if (webhookData.status === "success" && transaction.subscription_id) {
		await activateSubscription(transaction.subscription_id);
	}

	return NextResponse.json({ success: true });
}
```

### 4. Payment Form Component

#### 4.1 Payment Form UI

```typescript
export function MidtransPaymentForm({
	amount,
	onSuccess,
	onError,
}: PaymentFormProps) {
	const [paymentMethod, setPaymentMethod] = useState("credit_card");
	const [isProcessing, setIsProcessing] = useState(false);

	const handlePayment = async (paymentData: PaymentData) => {
		setIsProcessing(true);

		try {
			const response = await createPayment(paymentData);

			if (response.paymentUrl) {
				window.location.href = response.paymentUrl;
			} else {
				onSuccess(response);
			}
		} catch (error) {
			onError(error);
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handlePayment}>
			<PaymentMethodSelector
				value={paymentMethod}
				onChange={setPaymentMethod}
			/>
			<PaymentAmount amount={amount} />
			<PaymentButton disabled={isProcessing} loading={isProcessing} />
		</form>
	);
}
```

## Business Logic

### 1. Payment Validation

#### 1.1 Amount Validation

```typescript
function validatePaymentAmount(amount: number): boolean {
	return amount > 0 && amount <= 100000000; // Max 100M IDR
}
```

#### 1.2 Payment Method Validation

```typescript
function validatePaymentMethod(method: string): boolean {
	const validMethods = [
		"credit_card",
		"bank_transfer",
		"ewallet",
		"convenience_store",
	];
	return validMethods.includes(method);
}
```

### 2. Subscription Billing Logic

#### 2.1 Recurring Billing

```typescript
async function processRecurringBilling(): Promise<void> {
	const dueSubscriptions = await getDueSubscriptions();

	for (const subscription of dueSubscriptions) {
		try {
			const payment = await createSubscriptionPayment(
				subscription.id,
				subscription.plan.price
			);

			if (payment.status === "success") {
				await renewSubscription(subscription.id);
			} else {
				await handlePaymentFailure(subscription.id);
			}
		} catch (error) {
			await logBillingError(subscription.id, error);
		}
	}
}
```

#### 2.2 Payment Failure Handling

```typescript
async function handlePaymentFailure(subscriptionId: string): Promise<void> {
	const subscription = await getSubscription(subscriptionId);

	// Update subscription status
	await updateSubscriptionStatus(subscriptionId, "past_due");

	// Send payment failure notification
	await sendPaymentFailureNotification(subscription.user_id);

	// Schedule retry
	await schedulePaymentRetry(subscriptionId, 3); // 3 retries
}
```

### 3. Invoice Generation

#### 3.1 Invoice Creation

```typescript
async function generateInvoice(
	userId: string,
	subscriptionId: string,
	amount: number
): Promise<Invoice> {
	const invoiceNumber = await generateInvoiceNumber();
	const taxAmount = calculateTax(amount);
	const totalAmount = amount + taxAmount;

	const invoice = await createInvoice({
		user_id: userId,
		subscription_id: subscriptionId,
		invoice_number: invoiceNumber,
		amount: amount,
		tax_amount: taxAmount,
		total_amount: totalAmount,
		status: "draft",
		due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
	});

	// Generate PDF
	const pdfBuffer = await generateInvoicePDF(invoice);
	await saveInvoicePDF(invoice.id, pdfBuffer);

	// Send email
	await sendInvoiceEmail(userId, invoice);

	return invoice;
}
```

## Integration Points

### 1. Midtrans Integration

- **API Integration**: REST API for payment processing
- **Webhook Integration**: Real-time payment status updates
- **SDK Integration**: Midtrans Node.js SDK

### 2. Database Integration

- **Supabase**: PostgreSQL database for payment data
- **Real-time Updates**: Payment status updates
- **Data Consistency**: Transaction consistency

### 3. Frontend Integration

- **React Components**: Payment form components
- **State Management**: Payment state management
- **Error Handling**: Payment error handling

## Security Considerations

### 1. Payment Security

- **PCI Compliance**: Secure payment data handling
- **Webhook Verification**: Secure webhook signature verification
- **Data Encryption**: Encrypt sensitive payment data

### 2. Fraud Prevention

- **Amount Validation**: Validate payment amounts
- **Rate Limiting**: Limit payment attempts
- **Suspicious Activity**: Monitor for suspicious activity

### 3. Data Protection

- **PII Protection**: Protect personally identifiable information
- **Audit Logging**: Log all payment operations
- **Access Control**: Restrict payment data access

## Performance Considerations

### 1. Payment Processing

- **Async Processing**: Async payment processing
- **Queue System**: Payment queue for high volume
- **Caching**: Cache payment methods and user data

### 2. Database Optimization

- **Indexes**: Optimize payment queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Optimize payment queries

### 3. API Performance

- **Response Caching**: Cache payment responses
- **Rate Limiting**: API rate limiting
- **Load Balancing**: Distribute payment load

## Monitoring and Analytics

### 1. Payment Metrics

- **Success Rate**: Payment success rate
- **Failure Rate**: Payment failure rate
- **Processing Time**: Payment processing time
- **Revenue**: Payment revenue tracking

### 2. Error Monitoring

- **Payment Errors**: Monitor payment errors
- **Webhook Errors**: Monitor webhook errors
- **System Errors**: Monitor system errors

### 3. Business Analytics

- **Payment Methods**: Payment method usage
- **Subscription Revenue**: Subscription revenue tracking
- **Churn Analysis**: Payment failure churn analysis

## Testing Strategy

### 1. Unit Tests

- **Payment Logic**: Test payment processing logic
- **Validation**: Test payment validation
- **Billing Logic**: Test billing calculations

### 2. Integration Tests

- **Midtrans Integration**: Test Midtrans API integration
- **Webhook Handling**: Test webhook processing
- **Database Integration**: Test payment data persistence

### 3. End-to-End Tests

- **Payment Flow**: Test complete payment flow
- **Subscription Billing**: Test subscription billing
- **Invoice Generation**: Test invoice generation

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development with Midtrans sandbox
- **Staging**: Staging environment with test payments
- **Production**: Production environment with live payments

### 2. Configuration

- **Midtrans Settings**: Payment gateway configuration
- **Webhook URLs**: Webhook endpoint configuration
- **Security Settings**: Payment security configuration

### 3. Monitoring

- **Payment Monitoring**: Monitor payment processing
- **Error Alerting**: Alert on payment errors
- **Performance Monitoring**: Monitor payment performance

---

**This specification provides a comprehensive foundation for implementing the payment processing system in Allnimall Store CMS.**
