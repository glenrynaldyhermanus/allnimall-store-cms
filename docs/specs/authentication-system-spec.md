# Authentication System Specification

## Overview

This specification defines the authentication system for Allnimall Store CMS, including user registration, login, email verification, and session management using Supabase Auth.

## Functional Requirements

### 1. User Registration

#### 1.1 Registration Process

- **Email/Password Registration**: Standard email and password registration
- **Email Verification**: Email confirmation required before account activation
- **Password Requirements**: Minimum 6 characters, confirmation validation
- **Account Creation**: Create user account in Supabase Auth

#### 1.2 Registration Validation

- **Email Format**: Valid email format validation
- **Password Strength**: Minimum password requirements
- **Password Confirmation**: Password confirmation matching
- **Duplicate Email**: Prevent duplicate email registration

### 2. User Authentication

#### 2.1 Login Process

- **Email/Password Login**: Standard email and password authentication
- **Demo Credentials**: Demo account for testing (admin@allnimall.com / admin123)
- **Session Management**: JWT-based session management
- **Remember Me**: Optional persistent login

#### 2.2 Authentication States

- **Authenticated**: User is logged in with valid session
- **Unauthenticated**: User is not logged in
- **Email Pending**: User registered but email not verified
- **Session Expired**: User session has expired

### 3. Email Verification

#### 3.1 Email Confirmation Flow

- **Confirmation Email**: Send email with confirmation link
- **Confirmation Link**: Secure confirmation link with token
- **Account Activation**: Activate account after email confirmation
- **Redirect Handling**: Redirect to appropriate page after confirmation

#### 3.2 Email Templates

- **Confirmation Email**: Email confirmation template
- **Welcome Email**: Welcome email after successful registration
- **Password Reset**: Password reset email template
- **Custom Branding**: Branded email templates

### 4. Session Management

#### 4.1 Session Handling

- **JWT Tokens**: JSON Web Token-based authentication
- **Token Refresh**: Automatic token refresh
- **Session Persistence**: Persistent session across browser restarts
- **Logout**: Secure session termination

#### 4.2 Route Protection

- **Protected Routes**: Routes requiring authentication
- **Public Routes**: Routes accessible without authentication
- **Redirect Logic**: Automatic redirect based on auth state
- **Middleware Protection**: Middleware-based route protection

## Technical Requirements

### 1. Database Schema

#### 1.1 User Tables

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  language VARCHAR(10) DEFAULT 'id',
  is_store_owner BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions (for additional session tracking)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. API Endpoints

#### 2.1 Authentication

```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
POST /api/auth/logout - User logout
POST /api/auth/refresh - Refresh authentication token
GET /api/auth/me - Get current user profile
```

#### 2.2 Email Verification

```
POST /api/auth/send-verification - Send verification email
GET /api/auth/verify-email - Verify email with token
POST /api/auth/resend-verification - Resend verification email
```

#### 2.3 Password Management

```
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password - Reset password with token
POST /api/auth/change-password - Change password (authenticated)
```

### 3. Service Implementation

#### 3.1 Authentication Service

```typescript
export class AuthenticationService {
	async registerUser(
		registrationData: RegisterUserData
	): Promise<AuthResponse> {
		const { email, password, fullName } = registrationData;

		// Validate input
		this.validateRegistrationData(registrationData);

		// Register user with Supabase
		const { data, error } = await this.supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
				},
			},
		});

		if (error) {
			throw new Error(`Registration failed: ${error.message}`);
		}

		// Create user profile
		if (data.user) {
			await this.createUserProfile(data.user.id, {
				full_name: fullName,
				email: email,
			});
		}

		return {
			user: data.user,
			session: data.session,
			message:
				"Registration successful. Please check your email for verification.",
		};
	}

	async loginUser(loginData: LoginUserData): Promise<AuthResponse> {
		const { email, password } = loginData;

		// Validate input
		this.validateLoginData(loginData);

		// Authenticate with Supabase
		const { data, error } = await this.supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw new Error(`Login failed: ${error.message}`);
		}

		// Create session record
		if (data.session) {
			await this.createSessionRecord(data.user.id, data.session);
		}

		return {
			user: data.user,
			session: data.session,
			message: "Login successful",
		};
	}

	async logoutUser(): Promise<void> {
		const { error } = await this.supabase.auth.signOut();

		if (error) {
			throw new Error(`Logout failed: ${error.message}`);
		}

		// Invalidate session records
		await this.invalidateUserSessions();
	}

	async getCurrentUser(): Promise<User | null> {
		const {
			data: { user },
			error,
		} = await this.supabase.auth.getUser();

		if (error || !user) {
			return null;
		}

		// Get user profile
		const profile = await this.getUserProfile(user.id);

		return {
			...user,
			profile,
		};
	}

	private async createUserProfile(
		userId: string,
		profileData: CreateProfileData
	): Promise<void> {
		await this.supabase.from("user_profiles").insert({
			id: userId,
			full_name: profileData.full_name,
			email: profileData.email,
		});
	}

	private async createSessionRecord(
		userId: string,
		session: Session
	): Promise<void> {
		await this.supabase.from("user_sessions").insert({
			user_id: userId,
			session_token: session.access_token,
			expires_at: new Date(session.expires_at * 1000),
			is_active: true,
		});
	}

	private validateRegistrationData(data: RegisterUserData): void {
		if (!data.email || !this.isValidEmail(data.email)) {
			throw new Error("Valid email is required");
		}

		if (!data.password || data.password.length < 6) {
			throw new Error("Password must be at least 6 characters");
		}

		if (data.password !== data.confirmPassword) {
			throw new Error("Passwords do not match");
		}

		if (!data.fullName || data.fullName.trim().length === 0) {
			throw new Error("Full name is required");
		}
	}

	private validateLoginData(data: LoginUserData): void {
		if (!data.email || !this.isValidEmail(data.email)) {
			throw new Error("Valid email is required");
		}

		if (!data.password) {
			throw new Error("Password is required");
		}
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
}
```

#### 3.2 Email Verification Service

```typescript
export class EmailVerificationService {
	async sendVerificationEmail(email: string): Promise<void> {
		const { error } = await this.supabase.auth.resend({
			type: "signup",
			email: email,
		});

		if (error) {
			throw new Error(`Failed to send verification email: ${error.message}`);
		}
	}

	async verifyEmail(token: string): Promise<AuthResponse> {
		const { data, error } = await this.supabase.auth.verifyOtp({
			token_hash: token,
			type: "email",
		});

		if (error) {
			throw new Error(`Email verification failed: ${error.message}`);
		}

		// Update user profile
		if (data.user) {
			await this.updateUserProfile(data.user.id, {
				email_verified: true,
			});
		}

		return {
			user: data.user,
			session: data.session,
			message: "Email verified successfully",
		};
	}

	async resendVerificationEmail(email: string): Promise<void> {
		await this.sendVerificationEmail(email);
	}

	private async updateUserProfile(
		userId: string,
		updates: Partial<UserProfile>
	): Promise<void> {
		await this.supabase.from("user_profiles").update(updates).eq("id", userId);
	}
}
```

### 4. Middleware Implementation

#### 4.1 Authentication Middleware

```typescript
export async function authMiddleware(req: NextRequest): Promise<AuthContext> {
	const token = req.headers.get("authorization")?.replace("Bearer ", "");

	if (!token) {
		return { user: null, isAuthenticated: false };
	}

	try {
		const {
			data: { user },
			error,
		} = await supabase.auth.getUser(token);

		if (error || !user) {
			return { user: null, isAuthenticated: false };
		}

		// Get user profile
		const profile = await getUserProfile(user.id);

		return {
			user: { ...user, profile },
			isAuthenticated: true,
		};
	} catch (error) {
		return { user: null, isAuthenticated: false };
	}
}

export function withAuth(handler: NextApiHandler): NextApiHandler {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const authContext = await authMiddleware(req as NextRequest);

		if (!authContext.isAuthenticated) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		// Add user to request context
		(req as any).user = authContext.user;

		return handler(req, res);
	};
}
```

#### 4.2 Route Protection Middleware

```typescript
export function createRouteProtection() {
	return async (req: NextRequest): Promise<NextResponse | null> => {
		const { pathname } = req.nextUrl;
		const authContext = await authMiddleware(req);

		// Public routes that don't require authentication
		const publicRoutes = ["/", "/login", "/signup", "/auth/callback"];
		const isPublicRoute = publicRoutes.some((route) =>
			pathname.startsWith(route)
		);

		// If accessing protected route without authentication
		if (!isPublicRoute && !authContext.isAuthenticated) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		// If accessing auth routes while authenticated
		if (
			(pathname === "/login" || pathname === "/signup") &&
			authContext.isAuthenticated
		) {
			// Check if user has store setup
			const hasStore = await checkUserHasStore(authContext.user.id);
			return NextResponse.redirect(
				new URL(hasStore ? "/admin/dashboard" : "/setup-store", req.url)
			);
		}

		// If accessing setup-store without authentication
		if (pathname === "/setup-store" && !authContext.isAuthenticated) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		return null; // Allow request to proceed
	};
}
```

## Frontend Components

### 1. Authentication Components

#### 1.1 Login Form Component

```typescript
export function LoginForm() {
	const [formData, setFormData] = useState<LoginFormData>({
		email: "",
		password: "",
		rememberMe: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Login failed");
			}

			// Redirect based on user state
			const hasStore = await checkUserHasStore();
			router.push(hasStore ? "/admin/dashboard" : "/setup-store");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="login-form">
			<div className="form-header">
				<h2>Login to Allnimall</h2>
				<p>Welcome back! Please sign in to your account.</p>
			</div>

			{error && (
				<div className="error-message">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			)}

			<div className="form-group">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					required
					placeholder="Enter your email"
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
					placeholder="Enter your password"
				/>
			</div>

			<div className="form-options">
				<div className="remember-me">
					<Checkbox
						id="rememberMe"
						checked={formData.rememberMe}
						onCheckedChange={(checked) =>
							setFormData({ ...formData, rememberMe: checked })
						}
					/>
					<Label htmlFor="rememberMe">Remember me</Label>
				</div>

				<Link href="/forgot-password" className="forgot-password">
					Forgot password?
				</Link>
			</div>

			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Signing in..." : "Sign In"}
			</Button>

			<div className="form-footer">
				<p>
					Don't have an account?{" "}
					<Link href="/signup" className="signup-link">
						Sign up
					</Link>
				</p>
			</div>

			<div className="demo-credentials">
				<p className="demo-text">Demo Account:</p>
				<p className="demo-email">admin@allnimall.com</p>
				<p className="demo-password">admin123</p>
			</div>
		</form>
	);
}
```

#### 1.2 Registration Form Component

```typescript
export function RegistrationForm() {
	const [formData, setFormData] = useState<RegistrationFormData>({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Registration failed");
			}

			setSuccess(true);
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="registration-success">
				<div className="success-content">
					<CheckCircle className="h-16 w-16 text-green-500" />
					<h2>Registration Successful!</h2>
					<p>
						We've sent a verification email to <strong>{formData.email}</strong>.
						Please check your email and click the verification link to activate your
						account.
					</p>
					<Button onClick={() => router.push("/login")}>Go to Login</Button>
				</div>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="registration-form">
			<div className="form-header">
				<h2>Create Account</h2>
				<p>Join Allnimall and start managing your pet business.</p>
			</div>

			{error && (
				<div className="error-message">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				</div>
			)}

			<div className="form-group">
				<Label htmlFor="fullName">Full Name</Label>
				<Input
					id="fullName"
					value={formData.fullName}
					onChange={(e) =>
						setFormData({ ...formData, fullName: e.target.value })
					}
					required
					placeholder="Enter your full name"
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					required
					placeholder="Enter your email"
				/>
			</div>

			<div className="form-group">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					type="password"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
					placeholder="Enter your password"
					minLength={6}
				/>
				<p className="password-hint">Password must be at least 6 characters</p>
			</div>

			<div className="form-group">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					type="password"
					value={formData.confirmPassword}
					onChange={(e) =>
						setFormData({ ...formData, confirmPassword: e.target.value })
					}
					required
					placeholder="Confirm your password"
				/>
			</div>

			<Button type="submit" disabled={loading} className="w-full">
				{loading ? "Creating Account..." : "Create Account"}
			</Button>

			<div className="form-footer">
				<p>
					Already have an account?{" "}
					<Link href="/login" className="login-link">
						Sign in
					</Link>
				</p>
			</div>
		</form>
	);
}
```

### 2. Auth Context and Hooks

#### 2.1 Auth Context

```typescript
interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	register: (data: RegisterUserData) => Promise<void>;
	refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Initialize auth state
		initializeAuth();
	}, []);

	const initializeAuth = async () => {
		try {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
		} catch (error) {
			console.error("Auth initialization error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		const response = await fetch("/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		const data = await response.json();
		setUser(data.user);
	};

	const logout = async () => {
		await fetch("/api/auth/logout", { method: "POST" });
		setUser(null);
	};

	const register = async (data: RegisterUserData) => {
		const response = await fetch("/api/auth/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}
	};

	const refreshUser = async () => {
		const currentUser = await getCurrentUser();
		setUser(currentUser);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				logout,
				register,
				refreshUser,
			}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
```

## Integration Points

### 1. Supabase Integration

- **Auth Service**: Direct integration with Supabase Auth
- **Database**: User profiles stored in Supabase PostgreSQL
- **Real-time**: Real-time auth state updates
- **Storage**: User avatar storage in Supabase Storage

### 2. Next.js Integration

- **Middleware**: Next.js middleware for route protection
- **API Routes**: Next.js API routes for auth endpoints
- **Server Components**: Server-side auth state management
- **Client Components**: Client-side auth state management

### 3. Frontend Integration

- **React Context**: Global auth state management
- **Protected Routes**: Route protection based on auth state
- **Form Handling**: Form validation and submission
- **Error Handling**: Comprehensive error handling

## Security Considerations

### 1. Authentication Security

- **JWT Tokens**: Secure JWT token handling
- **Password Hashing**: Supabase handles password hashing
- **Session Management**: Secure session management
- **Token Expiration**: Automatic token expiration

### 2. Data Protection

- **User Data**: Protection of user personal data
- **Email Verification**: Secure email verification process
- **Password Reset**: Secure password reset flow
- **Session Security**: Secure session handling

### 3. API Security

- **Input Validation**: Comprehensive input validation
- **Rate Limiting**: API rate limiting
- **CORS Configuration**: Proper CORS setup
- **Error Handling**: Secure error handling

## Performance Considerations

### 1. Authentication Performance

- **Token Caching**: JWT token caching
- **Session Persistence**: Efficient session persistence
- **Auth State**: Optimized auth state management
- **API Calls**: Minimized API calls

### 2. Database Performance

- **User Queries**: Optimized user profile queries
- **Session Queries**: Efficient session queries
- **Indexing**: Proper database indexing
- **Connection Pooling**: Efficient connection management

### 3. Frontend Performance

- **Component Optimization**: Optimized auth components
- **State Management**: Efficient state management
- **Loading States**: Proper loading state handling
- **Error Boundaries**: Error boundary implementation

## Testing Strategy

### 1. Unit Tests

- **Auth Service**: Test authentication service functions
- **Validation**: Test input validation functions
- **Middleware**: Test authentication middleware
- **Components**: Test auth components

### 2. Integration Tests

- **API Integration**: Test auth API endpoints
- **Database Integration**: Test user data persistence
- **Supabase Integration**: Test Supabase auth integration
- **Frontend Integration**: Test auth UI components

### 3. End-to-End Tests

- **Registration Flow**: Test complete registration flow
- **Login Flow**: Test complete login flow
- **Email Verification**: Test email verification flow
- **Session Management**: Test session management

## Deployment Considerations

### 1. Environment Setup

- **Supabase Configuration**: Supabase project configuration
- **Environment Variables**: Auth-related environment variables
- **Email Configuration**: Email service configuration
- **Domain Configuration**: Domain and redirect URL configuration

### 2. Security Configuration

- **JWT Configuration**: JWT token configuration
- **CORS Configuration**: CORS policy configuration
- **Rate Limiting**: Rate limiting configuration
- **Security Headers**: Security header configuration

### 3. Monitoring

- **Auth Monitoring**: Authentication event monitoring
- **Error Tracking**: Auth error tracking
- **Performance Monitoring**: Auth performance monitoring
- **User Analytics**: User behavior analytics

---

**This specification provides a comprehensive foundation for implementing the authentication system in Allnimall Store CMS.**
