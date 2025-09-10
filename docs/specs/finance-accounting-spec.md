# Finance & Accounting Add-on Specification

## Overview

This specification defines the Finance & Accounting add-on module for Allnimall Store CMS, including accounting integration, tax management, financial reporting, and expense management.

## Functional Requirements

### 1. Accounting Integration

#### 1.1 Chart of Accounts

- **Asset Accounts**: Cash, inventory, equipment, accounts receivable
- **Liability Accounts**: Accounts payable, loans, taxes payable
- **Equity Accounts**: Owner's equity, retained earnings
- **Revenue Accounts**: Sales revenue, service revenue, other income
- **Expense Accounts**: Cost of goods sold, operating expenses, administrative expenses

#### 1.2 Journal Entries

- **Automatic Entries**: System-generated entries for sales, purchases, payments
- **Manual Entries**: User-created entries for adjustments, corrections
- **Entry Validation**: Debit/credit balance validation
- **Entry Approval**: Multi-level approval workflow

### 2. Tax Management

#### 2.1 Tax Configuration

- **VAT Settings**: 11% VAT rate for Indonesian market
- **Tax Categories**: Different tax rates for different product types
- **Tax Exemptions**: Tax-exempt products and services
- **Tax Reporting**: Monthly and annual tax reports

#### 2.2 Tax Calculations

- **Automatic Calculation**: System calculates tax on transactions
- **Tax Inclusivity**: Support for tax-inclusive and tax-exclusive pricing
- **Tax Adjustments**: Manual tax adjustments and corrections
- **Tax Compliance**: Indonesian tax compliance requirements

### 3. Financial Reporting

#### 3.1 Core Financial Statements

- **Balance Sheet**: Assets, liabilities, and equity
- **Income Statement**: Revenue, expenses, and profit/loss
- **Cash Flow Statement**: Operating, investing, and financing activities
- **Trial Balance**: Debit and credit balances

#### 3.2 Management Reports

- **Profit & Loss**: Monthly and annual P&L statements
- **Budget vs Actual**: Budget comparison reports
- **Variance Analysis**: Budget variance analysis
- **Financial Ratios**: Key financial performance indicators

### 4. Expense Management

#### 4.1 Expense Tracking

- **Expense Categories**: Travel, office supplies, utilities, marketing
- **Receipt Management**: Digital receipt storage and processing
- **Expense Approval**: Multi-level expense approval workflow
- **Reimbursement**: Employee expense reimbursement tracking

#### 4.2 Budget Management

- **Budget Creation**: Annual and monthly budget planning
- **Budget Monitoring**: Real-time budget vs actual tracking
- **Budget Alerts**: Budget limit warnings and notifications
- **Budget Reports**: Budget performance reports

## Technical Requirements

### 1. Database Schema

#### 1.1 Accounting Tables

```sql
-- Chart of accounts
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code VARCHAR(20) UNIQUE NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  account_type VARCHAR(20) NOT NULL, -- asset, liability, equity, revenue, expense
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number VARCHAR(50) UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  total_debit DECIMAL(15,2) NOT NULL,
  total_credit DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, approved, posted
  created_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Journal entry lines
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Tax Management Tables

```sql
-- Tax rates
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_name VARCHAR(100) NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL,
  tax_type VARCHAR(20) NOT NULL, -- vat, income_tax, withholding_tax
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax transactions
CREATE TABLE tax_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- sale, purchase, payment
  tax_rate_id UUID NOT NULL REFERENCES tax_rates(id),
  taxable_amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,
  tax_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Financial Reporting Tables

```sql
-- Financial periods
CREATE TABLE financial_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMP,
  closed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget entries
CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
  period_id UUID NOT NULL REFERENCES financial_periods(id),
  budget_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) DEFAULT 0,
  variance_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Accounting Management

```
GET /api/finance/accounts - Get chart of accounts
POST /api/finance/accounts - Create account
PUT /api/finance/accounts/:id - Update account
GET /api/finance/journal-entries - Get journal entries
POST /api/finance/journal-entries - Create journal entry
PUT /api/finance/journal-entries/:id - Update journal entry
POST /api/finance/journal-entries/:id/approve - Approve journal entry
```

#### 2.2 Tax Management

```
GET /api/finance/tax-rates - Get tax rates
POST /api/finance/tax-rates - Create tax rate
GET /api/finance/tax-transactions - Get tax transactions
GET /api/finance/tax-reports - Get tax reports
```

#### 2.3 Financial Reporting

```
GET /api/finance/reports/balance-sheet - Get balance sheet
GET /api/finance/reports/income-statement - Get income statement
GET /api/finance/reports/cash-flow - Get cash flow statement
GET /api/finance/reports/trial-balance - Get trial balance
GET /api/finance/reports/budget-vs-actual - Get budget vs actual
```

#### 2.4 Expense Management

```
GET /api/finance/expenses - Get expenses
POST /api/finance/expenses - Create expense
PUT /api/finance/expenses/:id - Update expense
POST /api/finance/expenses/:id/approve - Approve expense
GET /api/finance/budgets - Get budgets
POST /api/finance/budgets - Create budget
```

### 3. Service Implementation

#### 3.1 Accounting Service

```typescript
export class AccountingService {
	async createJournalEntry(
		entryData: CreateJournalEntryData
	): Promise<JournalEntry> {
		// Validate debit/credit balance
		const totalDebit = entryData.lines.reduce(
			(sum, line) => sum + line.debit_amount,
			0
		);
		const totalCredit = entryData.lines.reduce(
			(sum, line) => sum + line.credit_amount,
			0
		);

		if (Math.abs(totalDebit - totalCredit) > 0.01) {
			throw new Error("Debit and credit amounts must be equal");
		}

		const entry = await this.db.journal_entries.create({
			data: {
				...entryData,
				entry_number: await this.generateEntryNumber(),
				total_debit: totalDebit,
				total_credit: totalCredit,
				status: "draft",
			},
		});

		// Create journal entry lines
		for (const line of entryData.lines) {
			await this.db.journal_entry_lines.create({
				data: {
					journal_entry_id: entry.id,
					...line,
				},
			});
		}

		return entry;
	}

	async approveJournalEntry(
		entryId: string,
		approverId: string
	): Promise<JournalEntry> {
		const entry = await this.db.journal_entries.update({
			where: { id: entryId },
			data: {
				status: "approved",
				approved_by: approverId,
				approved_at: new Date(),
			},
		});

		// Post the entry to general ledger
		await this.postToGeneralLedger(entryId);

		return entry;
	}

	private async postToGeneralLedger(entryId: string): Promise<void> {
		const entry = await this.db.journal_entries.findUnique({
			where: { id: entryId },
			include: { lines: true },
		});

		if (!entry) {
			throw new Error("Journal entry not found");
		}

		// Update account balances
		for (const line of entry.lines) {
			await this.updateAccountBalance(
				line.account_id,
				line.debit_amount,
				line.credit_amount
			);
		}

		// Update entry status
		await this.db.journal_entries.update({
			where: { id: entryId },
			data: { status: "posted" },
		});
	}
}
```

#### 3.2 Tax Service

```typescript
export class TaxService {
	async calculateTax(
		amount: number,
		taxRateId: string
	): Promise<TaxCalculation> {
		const taxRate = await this.db.tax_rates.findUnique({
			where: { id: taxRateId },
		});

		if (!taxRate) {
			throw new Error("Tax rate not found");
		}

		const taxAmount = amount * (taxRate.tax_rate / 100);
		const totalAmount = amount + taxAmount;

		return {
			taxable_amount: amount,
			tax_rate: taxRate.tax_rate,
			tax_amount: taxAmount,
			total_amount: totalAmount,
		};
	}

	async recordTaxTransaction(
		transactionData: TaxTransactionData
	): Promise<TaxTransaction> {
		const taxCalculation = await this.calculateTax(
			transactionData.taxable_amount,
			transactionData.tax_rate_id
		);

		return await this.db.tax_transactions.create({
			data: {
				...transactionData,
				tax_amount: taxCalculation.tax_amount,
			},
		});
	}

	async generateTaxReport(startDate: Date, endDate: Date): Promise<TaxReport> {
		const transactions = await this.db.tax_transactions.findMany({
			where: {
				tax_date: {
					gte: startDate,
					lte: endDate,
				},
			},
			include: {
				tax_rate: true,
			},
		});

		const report = {
			period: { start_date: startDate, end_date: endDate },
			total_taxable_amount: 0,
			total_tax_amount: 0,
			tax_breakdown: {},
		};

		for (const transaction of transactions) {
			report.total_taxable_amount += transaction.taxable_amount;
			report.total_tax_amount += transaction.tax_amount;

			const taxType = transaction.tax_rate.tax_type;
			if (!report.tax_breakdown[taxType]) {
				report.tax_breakdown[taxType] = {
					taxable_amount: 0,
					tax_amount: 0,
				};
			}

			report.tax_breakdown[taxType].taxable_amount +=
				transaction.taxable_amount;
			report.tax_breakdown[taxType].tax_amount += transaction.tax_amount;
		}

		return report;
	}
}
```

#### 3.3 Financial Reporting Service

```typescript
export class FinancialReportingService {
	async generateBalanceSheet(asOfDate: Date): Promise<BalanceSheet> {
		const accounts = await this.db.chart_of_accounts.findMany({
			where: { is_active: true },
			orderBy: { account_code: "asc" },
		});

		const balanceSheet = {
			as_of_date: asOfDate,
			assets: { current: [], fixed: [], total: 0 },
			liabilities: { current: [], long_term: [], total: 0 },
			equity: { accounts: [], total: 0 },
		};

		for (const account of accounts) {
			const balance = await this.getAccountBalance(account.id, asOfDate);

			switch (account.account_type) {
				case "asset":
					if (this.isCurrentAsset(account)) {
						balanceSheet.assets.current.push({
							account: account,
							balance: balance,
						});
					} else {
						balanceSheet.assets.fixed.push({
							account: account,
							balance: balance,
						});
					}
					balanceSheet.assets.total += balance;
					break;

				case "liability":
					if (this.isCurrentLiability(account)) {
						balanceSheet.liabilities.current.push({
							account: account,
							balance: balance,
						});
					} else {
						balanceSheet.liabilities.long_term.push({
							account: account,
							balance: balance,
						});
					}
					balanceSheet.liabilities.total += balance;
					break;

				case "equity":
					balanceSheet.equity.accounts.push({
						account: account,
						balance: balance,
					});
					balanceSheet.equity.total += balance;
					break;
			}
		}

		return balanceSheet;
	}

	async generateIncomeStatement(
		startDate: Date,
		endDate: Date
	): Promise<IncomeStatement> {
		const revenueAccounts = await this.db.chart_of_accounts.findMany({
			where: { account_type: "revenue", is_active: true },
		});

		const expenseAccounts = await this.db.chart_of_accounts.findMany({
			where: { account_type: "expense", is_active: true },
		});

		const incomeStatement = {
			period: { start_date: startDate, end_date: endDate },
			revenue: { accounts: [], total: 0 },
			expenses: { accounts: [], total: 0 },
			net_income: 0,
		};

		// Calculate revenue
		for (const account of revenueAccounts) {
			const balance = await this.getAccountBalanceForPeriod(
				account.id,
				startDate,
				endDate
			);
			incomeStatement.revenue.accounts.push({
				account: account,
				balance: balance,
			});
			incomeStatement.revenue.total += balance;
		}

		// Calculate expenses
		for (const account of expenseAccounts) {
			const balance = await this.getAccountBalanceForPeriod(
				account.id,
				startDate,
				endDate
			);
			incomeStatement.expenses.accounts.push({
				account: account,
				balance: balance,
			});
			incomeStatement.expenses.total += balance;
		}

		incomeStatement.net_income =
			incomeStatement.revenue.total - incomeStatement.expenses.total;

		return incomeStatement;
	}

	private async getAccountBalance(
		accountId: string,
		asOfDate: Date
	): Promise<number> {
		const result = await this.db.journal_entry_lines.aggregate({
			where: {
				account_id: accountId,
				journal_entry: {
					entry_date: { lte: asOfDate },
					status: "posted",
				},
			},
			_sum: {
				debit_amount: true,
				credit_amount: true,
			},
		});

		const debitTotal = result._sum.debit_amount || 0;
		const creditTotal = result._sum.credit_amount || 0;

		// Assets and expenses: debit - credit
		// Liabilities, equity, and revenue: credit - debit
		const account = await this.db.chart_of_accounts.findUnique({
			where: { id: accountId },
		});

		if (["asset", "expense"].includes(account.account_type)) {
			return debitTotal - creditTotal;
		} else {
			return creditTotal - debitTotal;
		}
	}
}
```

## Frontend Components

### 1. Accounting Components

#### 1.1 Chart of Accounts Component

```typescript
export function ChartOfAccounts() {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAccounts() {
			try {
				const data = await fetch("/api/finance/accounts").then((res) =>
					res.json()
				);
				setAccounts(data);
			} catch (error) {
				console.error("Error fetching accounts:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchAccounts();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="chart-of-accounts">
			<div className="accounts-header">
				<h2>Chart of Accounts</h2>
				<Button onClick={() => router.push("/admin/finance/accounts/new")}>
					Add Account
				</Button>
			</div>

			<div className="accounts-table">
				<table>
					<thead>
						<tr>
							<th>Account Code</th>
							<th>Account Name</th>
							<th>Type</th>
							<th>Balance</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{accounts.map((account) => (
							<tr key={account.id}>
								<td>{account.account_code}</td>
								<td>{account.account_name}</td>
								<td>
									<Badge variant="outline">{account.account_type}</Badge>
								</td>
								<td>{formatCurrency(account.balance)}</td>
								<td>
									<Button variant="outline" size="sm">
										Edit
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
```

#### 1.2 Journal Entry Form

```typescript
export function JournalEntryForm({ entryId }: { entryId?: string }) {
	const [formData, setFormData] = useState<JournalEntryFormData>({
		entry_date: new Date().toISOString().split("T")[0],
		description: "",
		reference: "",
		lines: [
			{ account_id: "", debit_amount: 0, credit_amount: 0, description: "" },
		],
	});

	const [accounts, setAccounts] = useState<Account[]>([]);

	useEffect(() => {
		async function fetchAccounts() {
			const data = await fetch("/api/finance/accounts").then((res) =>
				res.json()
			);
			setAccounts(data);
		}
		fetchAccounts();
	}, []);

	const addLine = () => {
		setFormData({
			...formData,
			lines: [
				...formData.lines,
				{ account_id: "", debit_amount: 0, credit_amount: 0, description: "" },
			],
		});
	};

	const removeLine = (index: number) => {
		setFormData({
			...formData,
			lines: formData.lines.filter((_, i) => i !== index),
		});
	};

	const updateLine = (index: number, field: string, value: any) => {
		const newLines = [...formData.lines];
		newLines[index] = { ...newLines[index], [field]: value };
		setFormData({ ...formData, lines: newLines });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (entryId) {
				await updateJournalEntry(entryId, formData);
			} else {
				await createJournalEntry(formData);
			}

			router.push("/admin/finance/journal-entries");
		} catch (error) {
			console.error("Error saving journal entry:", error);
		}
	};

	const totalDebit = formData.lines.reduce(
		(sum, line) => sum + line.debit_amount,
		0
	);
	const totalCredit = formData.lines.reduce(
		(sum, line) => sum + line.credit_amount,
		0
	);
	const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

	return (
		<form onSubmit={handleSubmit} className="journal-entry-form">
			<div className="form-row">
				<div className="form-group">
					<Label htmlFor="entry_date">Entry Date</Label>
					<Input
						id="entry_date"
						type="date"
						value={formData.entry_date}
						onChange={(e) =>
							setFormData({ ...formData, entry_date: e.target.value })
						}
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="reference">Reference</Label>
					<Input
						id="reference"
						value={formData.reference}
						onChange={(e) =>
							setFormData({ ...formData, reference: e.target.value })
						}
					/>
				</div>
			</div>

			<div className="form-group">
				<Label htmlFor="description">Description</Label>
				<Textarea
					id="description"
					value={formData.description}
					onChange={(e) =>
						setFormData({ ...formData, description: e.target.value })
					}
					required
				/>
			</div>

			<div className="journal-lines">
				<div className="lines-header">
					<h3>Journal Entry Lines</h3>
					<Button type="button" onClick={addLine}>
						Add Line
					</Button>
				</div>

				{formData.lines.map((line, index) => (
					<div key={index} className="journal-line">
						<div className="form-group">
							<Label>Account</Label>
							<Select
								value={line.account_id}
								onValueChange={(value) =>
									updateLine(index, "account_id", value)
								}>
								{accounts.map((account) => (
									<SelectItem key={account.id} value={account.id}>
										{account.account_code} - {account.account_name}
									</SelectItem>
								))}
							</Select>
						</div>

						<div className="form-group">
							<Label>Debit Amount</Label>
							<Input
								type="number"
								step="0.01"
								value={line.debit_amount}
								onChange={(e) =>
									updateLine(index, "debit_amount", Number(e.target.value))
								}
							/>
						</div>

						<div className="form-group">
							<Label>Credit Amount</Label>
							<Input
								type="number"
								step="0.01"
								value={line.credit_amount}
								onChange={(e) =>
									updateLine(index, "credit_amount", Number(e.target.value))
								}
							/>
						</div>

						<div className="form-group">
							<Label>Description</Label>
							<Input
								value={line.description}
								onChange={(e) =>
									updateLine(index, "description", e.target.value)
								}
							/>
						</div>

						<Button
							type="button"
							variant="destructive"
							size="sm"
							onClick={() => removeLine(index)}>
							Remove
						</Button>
					</div>
				))}
			</div>

			<div className="entry-totals">
				<div className="total-row">
					<span>Total Debit: {formatCurrency(totalDebit)}</span>
					<span>Total Credit: {formatCurrency(totalCredit)}</span>
					<span className={isBalanced ? "balanced" : "unbalanced"}>
						{isBalanced ? "Balanced" : "Unbalanced"}
					</span>
				</div>
			</div>

			<Button type="submit" disabled={!isBalanced}>
				{entryId ? "Update Entry" : "Create Entry"}
			</Button>
		</form>
	);
}
```

### 2. Financial Reporting Components

#### 2.1 Balance Sheet Component

```typescript
export function BalanceSheet({ asOfDate }: { asOfDate: Date }) {
	const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchBalanceSheet() {
			try {
				const data = await fetch(
					`/api/finance/reports/balance-sheet?as_of_date=${asOfDate.toISOString()}`
				).then((res) => res.json());
				setBalanceSheet(data);
			} catch (error) {
				console.error("Error fetching balance sheet:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchBalanceSheet();
	}, [asOfDate]);

	if (loading) return <LoadingSpinner />;
	if (!balanceSheet) return <div>No data available</div>;

	return (
		<div className="balance-sheet">
			<div className="report-header">
				<h2>Balance Sheet</h2>
				<p>As of {formatDate(balanceSheet.as_of_date)}</p>
			</div>

			<div className="balance-sheet-content">
				<div className="assets-section">
					<h3>Assets</h3>

					<div className="current-assets">
						<h4>Current Assets</h4>
						{balanceSheet.assets.current.map((item) => (
							<div key={item.account.id} className="account-row">
								<span>{item.account.account_name}</span>
								<span>{formatCurrency(item.balance)}</span>
							</div>
						))}
					</div>

					<div className="fixed-assets">
						<h4>Fixed Assets</h4>
						{balanceSheet.assets.fixed.map((item) => (
							<div key={item.account.id} className="account-row">
								<span>{item.account.account_name}</span>
								<span>{formatCurrency(item.balance)}</span>
							</div>
						))}
					</div>

					<div className="total-row">
						<span>Total Assets</span>
						<span>{formatCurrency(balanceSheet.assets.total)}</span>
					</div>
				</div>

				<div className="liabilities-section">
					<h3>Liabilities</h3>

					<div className="current-liabilities">
						<h4>Current Liabilities</h4>
						{balanceSheet.liabilities.current.map((item) => (
							<div key={item.account.id} className="account-row">
								<span>{item.account.account_name}</span>
								<span>{formatCurrency(item.balance)}</span>
							</div>
						))}
					</div>

					<div className="long-term-liabilities">
						<h4>Long-term Liabilities</h4>
						{balanceSheet.liabilities.long_term.map((item) => (
							<div key={item.account.id} className="account-row">
								<span>{item.account.account_name}</span>
								<span>{formatCurrency(item.balance)}</span>
							</div>
						))}
					</div>

					<div className="total-row">
						<span>Total Liabilities</span>
						<span>{formatCurrency(balanceSheet.liabilities.total)}</span>
					</div>
				</div>

				<div className="equity-section">
					<h3>Equity</h3>
					{balanceSheet.equity.accounts.map((item) => (
						<div key={item.account.id} className="account-row">
							<span>{item.account.account_name}</span>
							<span>{formatCurrency(item.balance)}</span>
						</div>
					))}
					<div className="total-row">
						<span>Total Equity</span>
						<span>{formatCurrency(balanceSheet.equity.total)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}
```

## Integration Points

### 1. Subscription System Integration

- **Add-on Validation**: Validate Finance add-on subscription
- **Feature Access**: Control Finance feature access
- **Usage Tracking**: Track Finance feature usage

### 2. Sales System Integration

- **Automatic Entries**: Generate journal entries for sales transactions
- **Tax Calculation**: Calculate tax on sales transactions
- **Revenue Recognition**: Recognize revenue from sales

### 3. Inventory System Integration

- **Cost of Goods Sold**: Track COGS for inventory sales
- **Inventory Valuation**: Value inventory for balance sheet
- **Purchase Entries**: Generate entries for inventory purchases

## Security Considerations

### 1. Data Protection

- **Financial Data**: Protect sensitive financial information
- **Tax Data**: Secure tax calculation and reporting data
- **Audit Trail**: Maintain complete audit trail for all transactions

### 2. Access Control

- **Role-based Access**: Role-based access to financial data
- **Approval Workflows**: Multi-level approval for financial transactions
- **Data Segregation**: Separate financial data by store/entity

### 3. Compliance

- **Accounting Standards**: Indonesian accounting standards compliance
- **Tax Compliance**: Indonesian tax law compliance
- **Audit Requirements**: Meet audit and regulatory requirements

## Performance Considerations

### 1. Data Optimization

- **Financial Queries**: Optimize financial reporting queries
- **Tax Calculations**: Optimize tax calculation performance
- **Report Generation**: Optimize report generation performance

### 2. Caching Strategy

- **Account Balances**: Cache account balance calculations
- **Tax Rates**: Cache tax rate data
- **Financial Reports**: Cache generated financial reports

### 3. Reporting Performance

- **Report Caching**: Cache frequently accessed reports
- **Batch Processing**: Batch process large financial operations
- **Data Archiving**: Archive old financial data

## Testing Strategy

### 1. Unit Tests

- **Accounting Logic**: Test accounting calculation logic
- **Tax Calculations**: Test tax calculation functions
- **Financial Reports**: Test financial report generation

### 2. Integration Tests

- **API Integration**: Test Finance API endpoints
- **Database Integration**: Test Finance data persistence
- **Frontend Integration**: Test Finance UI components

### 3. End-to-End Tests

- **Accounting Flow**: Test complete accounting workflow
- **Tax Flow**: Test tax calculation and reporting flow
- **Financial Reporting**: Test financial report generation flow

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development environment
- **Staging**: Staging environment for testing
- **Production**: Production environment

### 2. Configuration

- **Finance Settings**: Finance module configuration
- **Tax Settings**: Tax calculation configuration
- **Reporting Settings**: Financial reporting configuration

### 3. Data Migration

- **Chart of Accounts**: Migrate existing chart of accounts
- **Historical Data**: Migrate historical financial data
- **Tax Data**: Migrate tax configuration data

---

**This specification provides a comprehensive foundation for implementing the Finance & Accounting add-on module in Allnimall Store CMS.**
