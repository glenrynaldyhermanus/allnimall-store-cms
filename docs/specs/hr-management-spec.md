# HR Management Add-on Specification

## Overview

This specification defines the HR Management add-on module for Allnimall Store CMS, including employee management, attendance tracking, payroll integration, and performance management.

## Functional Requirements

### 1. Employee Management

#### 1.1 Employee Profiles

- **Personal Information**: Name, email, phone, address
- **Employment Details**: Position, department, hire date, salary
- **Document Management**: Contracts, certificates, ID documents
- **Role & Permissions**: Access levels, feature permissions

#### 1.2 Employee Operations

- **Add Employee**: Create new employee profile
- **Edit Employee**: Update employee information
- **Deactivate Employee**: Deactivate employee account
- **Employee Search**: Search and filter employees

### 2. Attendance System

#### 2.1 Clock In/Out

- **Digital Time Tracking**: Web and mobile clock in/out
- **GPS Verification**: Location-based verification
- **Photo Verification**: Photo capture for verification
- **Break Management**: Break time tracking

#### 2.2 Attendance Tracking

- **Daily Reports**: Daily attendance summaries
- **Monthly Reports**: Monthly attendance reports
- **Absence Tracking**: Sick leave, vacation tracking
- **Overtime Calculation**: Automatic overtime calculation

### 3. Leave Management

#### 3.1 Leave Types

- **Sick Leave**: Medical leave tracking
- **Vacation Leave**: Annual leave tracking
- **Personal Leave**: Personal time off
- **Emergency Leave**: Emergency time off

#### 3.2 Leave Operations

- **Leave Requests**: Submit leave requests
- **Approval Workflow**: Manager approval process
- **Leave Balance**: Track remaining leave days
- **Leave Calendar**: Visual leave calendar

### 4. Payroll Integration

#### 4.1 Salary Management

- **Salary Calculation**: Base salary calculations
- **Commission Tracking**: Sales commission tracking
- **Bonus Management**: Performance bonuses
- **Deductions**: Tax, insurance, other deductions

#### 4.2 Payroll Reports

- **Payroll Summary**: Monthly payroll summaries
- **Tax Reports**: Tax calculation reports
- **Benefits Tracking**: Employee benefits tracking
- **Compliance Reports**: Regulatory compliance reports

## Technical Requirements

### 1. Database Schema

#### 1.1 Employee Tables

```sql
-- Employee profiles
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  store_id UUID NOT NULL REFERENCES stores(id),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  hire_date DATE NOT NULL,
  salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee documents
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  document_type VARCHAR(50) NOT NULL, -- contract, certificate, id, etc.
  document_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Employee roles and permissions
CREATE TABLE employee_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  role_name VARCHAR(100) NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Attendance Tables

```sql
-- Attendance records
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  clock_in_time TIMESTAMP,
  clock_out_time TIMESTAMP,
  break_start_time TIMESTAMP,
  break_end_time TIMESTAMP,
  total_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2),
  status VARCHAR(20) NOT NULL, -- present, absent, late, half_day
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance locations
CREATE TABLE attendance_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_id UUID NOT NULL REFERENCES attendance_records(id),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 Leave Management Tables

```sql
-- Leave types
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_days_per_year INTEGER,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leave requests
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave balances
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  remaining_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.4 Payroll Tables

```sql
-- Payroll records
CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL,
  tax_deduction DECIMAL(10,2) DEFAULT 0,
  insurance_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  net_pay DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processed, paid
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Commission tracking
CREATE TABLE commission_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  sale_id UUID NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  pay_period_id UUID REFERENCES payroll_records(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Employee Management

```
GET /api/hr/employees - Get employee list
POST /api/hr/employees - Create employee
GET /api/hr/employees/:id - Get employee details
PUT /api/hr/employees/:id - Update employee
DELETE /api/hr/employees/:id - Deactivate employee
GET /api/hr/employees/:id/documents - Get employee documents
POST /api/hr/employees/:id/documents - Upload document
```

#### 2.2 Attendance Management

```
GET /api/hr/attendance - Get attendance records
POST /api/hr/attendance/clock-in - Clock in
POST /api/hr/attendance/clock-out - Clock out
GET /api/hr/attendance/reports - Get attendance reports
PUT /api/hr/attendance/:id - Update attendance record
```

#### 2.3 Leave Management

```
GET /api/hr/leave-types - Get leave types
GET /api/hr/leave-requests - Get leave requests
POST /api/hr/leave-requests - Create leave request
PUT /api/hr/leave-requests/:id - Update leave request
GET /api/hr/leave-balances - Get leave balances
```

#### 2.4 Payroll Management

```
GET /api/hr/payroll - Get payroll records
POST /api/hr/payroll/calculate - Calculate payroll
GET /api/hr/payroll/reports - Get payroll reports
GET /api/hr/commission - Get commission records
POST /api/hr/commission - Add commission
```

### 3. Service Implementation

#### 3.1 Employee Service

```typescript
export class EmployeeService {
	async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
		const employee = await this.db.employees.create({
			data: {
				...employeeData,
				employee_id: await this.generateEmployeeId(),
				status: "active",
			},
		});

		// Create user account if needed
		if (employeeData.create_user_account) {
			await this.createUserAccount(employee);
		}

		return employee;
	}

	async updateEmployee(
		id: string,
		data: UpdateEmployeeData
	): Promise<Employee> {
		return await this.db.employees.update({
			where: { id },
			data: { ...data, updated_at: new Date() },
		});
	}

	async getEmployees(
		storeId: string,
		filters?: EmployeeFilters
	): Promise<Employee[]> {
		return await this.db.employees.findMany({
			where: {
				store_id: storeId,
				...filters,
			},
			include: {
				documents: true,
				roles: true,
			},
		});
	}
}
```

#### 3.2 Attendance Service

```typescript
export class AttendanceService {
	async clockIn(
		employeeId: string,
		location?: LocationData
	): Promise<AttendanceRecord> {
		const today = new Date();
		const existingRecord = await this.getTodayAttendance(employeeId, today);

		if (existingRecord) {
			throw new Error("Already clocked in today");
		}

		const record = await this.db.attendance_records.create({
			data: {
				employee_id: employeeId,
				clock_in_time: new Date(),
				status: "present",
			},
		});

		if (location) {
			await this.db.attendance_locations.create({
				data: {
					employee_id: employeeId,
					attendance_id: record.id,
					...location,
				},
			});
		}

		return record;
	}

	async clockOut(employeeId: string): Promise<AttendanceRecord> {
		const today = new Date();
		const record = await this.getTodayAttendance(employeeId, today);

		if (!record || record.clock_out_time) {
			throw new Error("No active clock-in record found");
		}

		const clockOutTime = new Date();
		const totalHours = this.calculateHours(record.clock_in_time, clockOutTime);
		const overtimeHours = this.calculateOvertime(totalHours);

		return await this.db.attendance_records.update({
			where: { id: record.id },
			data: {
				clock_out_time: clockOutTime,
				total_hours: totalHours,
				overtime_hours: overtimeHours,
			},
		});
	}

	private calculateHours(clockIn: Date, clockOut: Date): number {
		const diffMs = clockOut.getTime() - clockIn.getTime();
		return diffMs / (1000 * 60 * 60); // Convert to hours
	}

	private calculateOvertime(totalHours: number): number {
		const regularHours = 8; // 8 hours per day
		return Math.max(0, totalHours - regularHours);
	}
}
```

#### 3.3 Leave Service

```typescript
export class LeaveService {
	async createLeaveRequest(
		employeeId: string,
		leaveData: CreateLeaveRequestData
	): Promise<LeaveRequest> {
		// Check leave balance
		const balance = await this.getLeaveBalance(
			employeeId,
			leaveData.leave_type_id
		);
		if (balance.remaining_days < leaveData.total_days) {
			throw new Error("Insufficient leave balance");
		}

		// Check for overlapping requests
		const overlapping = await this.checkOverlappingRequests(
			employeeId,
			leaveData
		);
		if (overlapping) {
			throw new Error("Overlapping leave request exists");
		}

		const request = await this.db.leave_requests.create({
			data: {
				employee_id: employeeId,
				...leaveData,
				status: "pending",
			},
		});

		// Send notification to manager
		await this.notifyManager(request);

		return request;
	}

	async approveLeaveRequest(
		requestId: string,
		approverId: string
	): Promise<LeaveRequest> {
		const request = await this.db.leave_requests.update({
			where: { id: requestId },
			data: {
				status: "approved",
				approved_by: approverId,
				approved_at: new Date(),
			},
		});

		// Update leave balance
		await this.updateLeaveBalance(
			request.employee_id,
			request.leave_type_id,
			request.total_days
		);

		// Send notification to employee
		await this.notifyEmployee(
			request.employee_id,
			"Your leave request has been approved"
		);

		return request;
	}

	async getLeaveBalance(
		employeeId: string,
		leaveTypeId: string
	): Promise<LeaveBalance> {
		const currentYear = new Date().getFullYear();

		let balance = await this.db.leave_balances.findFirst({
			where: {
				employee_id: employeeId,
				leave_type_id: leaveTypeId,
				year: currentYear,
			},
		});

		if (!balance) {
			const leaveType = await this.db.leave_types.findUnique({
				where: { id: leaveTypeId },
			});

			balance = await this.db.leave_balances.create({
				data: {
					employee_id: employeeId,
					leave_type_id: leaveTypeId,
					year: currentYear,
					total_days: leaveType.max_days_per_year || 0,
					used_days: 0,
					remaining_days: leaveType.max_days_per_year || 0,
				},
			});
		}

		return balance;
	}
}
```

#### 3.4 Payroll Service

```typescript
export class PayrollService {
	async calculatePayroll(
		employeeId: string,
		payPeriod: DateRange
	): Promise<PayrollRecord> {
		const employee = await this.getEmployee(employeeId);
		const attendance = await this.getAttendanceForPeriod(employeeId, payPeriod);
		const commissions = await this.getCommissionsForPeriod(
			employeeId,
			payPeriod
		);

		const baseSalary = employee.salary;
		const overtimePay = this.calculateOvertimePay(attendance);
		const commissionAmount = this.calculateCommission(commissions);
		const grossPay = baseSalary + overtimePay + commissionAmount;

		const deductions = await this.calculateDeductions(employeeId, grossPay);
		const netPay = grossPay - deductions.total;

		const payroll = await this.db.payroll_records.create({
			data: {
				employee_id: employeeId,
				pay_period_start: payPeriod.start,
				pay_period_end: payPeriod.end,
				base_salary: baseSalary,
				overtime_pay: overtimePay,
				commission: commissionAmount,
				gross_pay: grossPay,
				tax_deduction: deductions.tax,
				insurance_deduction: deductions.insurance,
				other_deductions: deductions.other,
				net_pay: netPay,
				status: "pending",
			},
		});

		return payroll;
	}

	private calculateOvertimePay(attendance: AttendanceRecord[]): number {
		const overtimeRate = 1.5; // 1.5x regular rate
		const regularRate = 50000; // Rp 50,000 per hour

		const totalOvertimeHours = attendance.reduce(
			(sum, record) => sum + (record.overtime_hours || 0),
			0
		);

		return totalOvertimeHours * regularRate * overtimeRate;
	}

	private calculateCommission(commissions: CommissionRecord[]): number {
		return commissions.reduce(
			(sum, commission) => sum + commission.commission_amount,
			0
		);
	}

	private async calculateDeductions(
		employeeId: string,
		grossPay: number
	): Promise<Deductions> {
		const taxRate = 0.05; // 5% tax rate
		const insuranceRate = 0.02; // 2% insurance rate

		return {
			tax: grossPay * taxRate,
			insurance: grossPay * insuranceRate,
			other: 0,
			total: grossPay * (taxRate + insuranceRate),
		};
	}
}
```

## Frontend Components

### 1. Employee Management Components

#### 1.1 Employee List Component

```typescript
export function EmployeeList() {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchEmployees() {
			try {
				const data = await fetch("/api/hr/employees").then((res) => res.json());
				setEmployees(data);
			} catch (error) {
				console.error("Error fetching employees:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchEmployees();
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<div className="employee-list">
			<div className="employee-header">
				<h2>Employees</h2>
				<Button onClick={() => router.push("/admin/hr/employees/new")}>
					Add Employee
				</Button>
			</div>

			<div className="employee-table">
				<table>
					<thead>
						<tr>
							<th>Employee ID</th>
							<th>Name</th>
							<th>Position</th>
							<th>Department</th>
							<th>Status</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{employees.map((employee) => (
							<tr key={employee.id}>
								<td>{employee.employee_id}</td>
								<td>
									{employee.first_name} {employee.last_name}
								</td>
								<td>{employee.position}</td>
								<td>{employee.department}</td>
								<td>
									<Badge
										variant={
											employee.status === "active" ? "success" : "secondary"
										}>
										{employee.status}
									</Badge>
								</td>
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

#### 1.2 Employee Form Component

```typescript
export function EmployeeForm({ employeeId }: { employeeId?: string }) {
	const [formData, setFormData] = useState<EmployeeFormData>({
		first_name: "",
		last_name: "",
		email: "",
		phone: "",
		position: "",
		department: "",
		hire_date: "",
		salary: 0,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			if (employeeId) {
				await updateEmployee(employeeId, formData);
			} else {
				await createEmployee(formData);
			}

			router.push("/admin/hr/employees");
		} catch (error) {
			console.error("Error saving employee:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="employee-form">
			<div className="form-row">
				<div className="form-group">
					<Label htmlFor="first_name">First Name</Label>
					<Input
						id="first_name"
						value={formData.first_name}
						onChange={(e) =>
							setFormData({ ...formData, first_name: e.target.value })
						}
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="last_name">Last Name</Label>
					<Input
						id="last_name"
						value={formData.last_name}
						onChange={(e) =>
							setFormData({ ...formData, last_name: e.target.value })
						}
						required
					/>
				</div>
			</div>

			<div className="form-group">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					required
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="position">Position</Label>
				<Input
					id="position"
					value={formData.position}
					onChange={(e) =>
						setFormData({ ...formData, position: e.target.value })
					}
					required
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="salary">Salary</Label>
				<Input
					id="salary"
					type="number"
					value={formData.salary}
					onChange={(e) =>
						setFormData({ ...formData, salary: Number(e.target.value) })
					}
					required
				/>
			</div>

			<Button type="submit">
				{employeeId ? "Update Employee" : "Create Employee"}
			</Button>
		</form>
	);
}
```

### 2. Attendance Components

#### 2.1 Attendance Dashboard

```typescript
export function AttendanceDashboard() {
	const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
	const [currentStatus, setCurrentStatus] = useState<"in" | "out" | "none">(
		"none"
	);

	const handleClockIn = async () => {
		try {
			await fetch("/api/hr/attendance/clock-in", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ location: await getCurrentLocation() }),
			});

			setCurrentStatus("in");
			toast.success("Clocked in successfully");
		} catch (error) {
			toast.error("Failed to clock in");
		}
	};

	const handleClockOut = async () => {
		try {
			await fetch("/api/hr/attendance/clock-out", {
				method: "POST",
			});

			setCurrentStatus("out");
			toast.success("Clocked out successfully");
		} catch (error) {
			toast.error("Failed to clock out");
		}
	};

	return (
		<div className="attendance-dashboard">
			<div className="attendance-controls">
				<h2>Attendance</h2>

				<div className="clock-buttons">
					{currentStatus === "none" && (
						<Button onClick={handleClockIn} size="lg">
							Clock In
						</Button>
					)}

					{currentStatus === "in" && (
						<Button onClick={handleClockOut} size="lg" variant="destructive">
							Clock Out
						</Button>
					)}

					{currentStatus === "out" && <p>You have clocked out for today</p>}
				</div>
			</div>

			<div className="attendance-summary">
				<div className="summary-card">
					<h3>Today's Hours</h3>
					<p>8.5 hours</p>
				</div>

				<div className="summary-card">
					<h3>This Week</h3>
					<p>42.5 hours</p>
				</div>

				<div className="summary-card">
					<h3>Overtime</h3>
					<p>2.5 hours</p>
				</div>
			</div>
		</div>
	);
}
```

### 3. Leave Management Components

#### 3.1 Leave Request Form

```typescript
export function LeaveRequestForm() {
	const [formData, setFormData] = useState<LeaveRequestFormData>({
		leave_type_id: "",
		start_date: "",
		end_date: "",
		reason: "",
	});

	const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
	const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);

	useEffect(() => {
		async function fetchData() {
			const types = await fetch("/api/hr/leave-types").then((res) =>
				res.json()
			);
			setLeaveTypes(types);
		}

		fetchData();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await fetch("/api/hr/leave-requests", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			toast.success("Leave request submitted successfully");
			router.push("/admin/hr/leave-requests");
		} catch (error) {
			toast.error("Failed to submit leave request");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="leave-request-form">
			<div className="form-group">
				<Label htmlFor="leave_type">Leave Type</Label>
				<Select
					value={formData.leave_type_id}
					onValueChange={(value) =>
						setFormData({ ...formData, leave_type_id: value })
					}>
					{leaveTypes.map((type) => (
						<SelectItem key={type.id} value={type.id}>
							{type.name}
						</SelectItem>
					))}
				</Select>
			</div>

			<div className="form-row">
				<div className="form-group">
					<Label htmlFor="start_date">Start Date</Label>
					<Input
						id="start_date"
						type="date"
						value={formData.start_date}
						onChange={(e) =>
							setFormData({ ...formData, start_date: e.target.value })
						}
						required
					/>
				</div>

				<div className="form-group">
					<Label htmlFor="end_date">End Date</Label>
					<Input
						id="end_date"
						type="date"
						value={formData.end_date}
						onChange={(e) =>
							setFormData({ ...formData, end_date: e.target.value })
						}
						required
					/>
				</div>
			</div>

			<div className="form-group">
				<Label htmlFor="reason">Reason</Label>
				<Textarea
					id="reason"
					value={formData.reason}
					onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
					required
				/>
			</div>

			{leaveBalance && (
				<div className="leave-balance">
					<p>Remaining days: {leaveBalance.remaining_days}</p>
				</div>
			)}

			<Button type="submit">Submit Request</Button>
		</form>
	);
}
```

## Integration Points

### 1. Subscription System Integration

- **Add-on Validation**: Validate HR add-on subscription
- **Feature Access**: Control HR feature access
- **Usage Tracking**: Track HR feature usage

### 2. User Management Integration

- **Employee Accounts**: Link employees to user accounts
- **Role Management**: Integrate with user role system
- **Permission System**: Integrate with permission system

### 3. Store Management Integration

- **Store Context**: Employee data scoped to store
- **Multi-store Support**: Support multiple store locations
- **Data Isolation**: Store-level data isolation

## Security Considerations

### 1. Data Protection

- **Employee Data**: Protect sensitive employee information
- **Payroll Data**: Secure payroll information
- **Document Storage**: Secure document storage

### 2. Access Control

- **Role-based Access**: Role-based feature access
- **Manager Permissions**: Manager-level permissions
- **Employee Privacy**: Employee data privacy

### 3. Compliance

- **Labor Law Compliance**: Indonesian labor law compliance
- **Data Retention**: Employee data retention policies
- **Audit Logging**: HR operation audit logging

## Performance Considerations

### 1. Data Optimization

- **Employee Data**: Optimize employee data queries
- **Attendance Data**: Optimize attendance data queries
- **Payroll Data**: Optimize payroll calculations

### 2. Caching Strategy

- **Employee Data**: Cache employee data
- **Leave Balances**: Cache leave balance data
- **Attendance Data**: Cache attendance data

### 3. Reporting Performance

- **Payroll Reports**: Optimize payroll report generation
- **Attendance Reports**: Optimize attendance report generation
- **Leave Reports**: Optimize leave report generation

## Testing Strategy

### 1. Unit Tests

- **Employee Management**: Test employee CRUD operations
- **Attendance Tracking**: Test attendance tracking logic
- **Leave Management**: Test leave management logic
- **Payroll Calculation**: Test payroll calculation logic

### 2. Integration Tests

- **API Integration**: Test HR API endpoints
- **Database Integration**: Test HR data persistence
- **Frontend Integration**: Test HR UI components

### 3. End-to-End Tests

- **Employee Lifecycle**: Test complete employee lifecycle
- **Attendance Flow**: Test attendance tracking flow
- **Leave Flow**: Test leave request flow
- **Payroll Flow**: Test payroll processing flow

## Deployment Considerations

### 1. Environment Setup

- **Development**: Local development environment
- **Staging**: Staging environment for testing
- **Production**: Production environment

### 2. Configuration

- **HR Settings**: HR module configuration
- **Payroll Settings**: Payroll configuration
- **Leave Settings**: Leave management configuration

### 3. Data Migration

- **Employee Data**: Migrate existing employee data
- **Attendance Data**: Migrate attendance data
- **Payroll Data**: Migrate payroll data

---

**This specification provides a comprehensive foundation for implementing the HR Management add-on module in Allnimall Store CMS.**
