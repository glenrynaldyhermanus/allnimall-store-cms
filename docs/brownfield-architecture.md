# Allnimall Store CMS Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Allnimall Store CMS codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements.

### Document Scope

Comprehensive documentation of entire system - a multi-tenant SaaS pet shop management platform with subscription billing, feature restrictions, and payment processing.

### Change Log

| Date       | Version | Description                 | Author              |
| ---------- | ------- | --------------------------- | ------------------- |
| 2024-12-19 | 1.0     | Initial brownfield analysis | Winston (Architect) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/app/page.tsx` (redirects to login)
- **Configuration**: `next.config.ts`, `tsconfig.json`, `package.json`
- **Core Business Logic**: `src/lib/subscription-service.ts`, `src/lib/midtrans-service.ts`
- **API Definitions**: `src/app/api/` (RESTful endpoints with feature restrictions)
- **Database Models**: `database/schema.sql` (comprehensive PostgreSQL schema)
- **Key Algorithms**: `src/middleware/feature-restriction.ts` (plan validation logic)

### Enhancement Impact Areas

The system is designed for SaaS subscription management with the following key areas:

- Subscription billing and plan management
- Feature access control and usage tracking
- Multi-tenant store management
- Payment processing via Midtrans
- Real-time usage monitoring and restrictions

## High Level Architecture

### Technical Summary

Allnimall Store CMS is a Next.js 15 SaaS application built for pet shop management with sophisticated subscription billing, multi-tenant architecture, and comprehensive feature restrictions. The system uses Supabase for database and authentication, Midtrans for payment processing, and implements a complex usage tracking system.

### Actual Tech Stack (from package.json)

| Category      | Technology      | Version | Notes                         |
| ------------- | --------------- | ------- | ----------------------------- |
| Runtime       | Node.js         | 20.x    | Next.js 15 requirement        |
| Framework     | Next.js         | 15.5.2  | App Router, Turbopack enabled |
| Database      | Supabase        | 2.57.2  | PostgreSQL with RLS           |
| UI            | React           | 19.1.0  | Latest React with hooks       |
| Styling       | Tailwind        | 4.x     | Latest Tailwind CSS           |
| Components    | shadcn/ui       | Latest  | Radix UI components           |
| Forms         | React Hook Form | 7.62.0  | With Zod validation           |
| Payments      | Midtrans        | 1.4.3   | Indonesian payment gateway    |
| Icons         | Lucide          | 0.542.0 | Modern icon library           |
| Notifications | Sonner          | 2.0.7   | Toast notifications           |

### Repository Structure Reality Check

- Type: Monorepo (single Next.js application)
- Package Manager: npm
- Notable: Uses Turbopack for faster builds, comprehensive TypeScript setup

## Source Tree and Module Organization

### Project Structure (Actual)

```text
allnimall-store-cms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Protected admin routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── products/      # Product management
│   │   │   ├── services/      # Service management
│   │   │   ├── inventory/     # Stock management
│   │   │   ├── employees/     # Staff management
│   │   │   ├── categories/    # Category management
│   │   │   ├── stores/        # Store configuration
│   │   │   ├── settings/      # User preferences
│   │   │   └── subscription/  # Subscription management
│   │   ├── api/               # API routes with feature restrictions
│   │   │   ├── billing/       # Billing and invoices
│   │   │   ├── payments/      # Midtrans payment processing
│   │   │   ├── plans/         # Subscription plans
│   │   │   ├── products/      # Product CRUD with usage tracking
│   │   │   ├── stores/        # Store management
│   │   │   ├── subscriptions/ # Subscription lifecycle
│   │   │   ├── usage/         # Usage tracking and limits
│   │   │   └── validation/    # Plan validation
│   │   ├── auth/              # Supabase auth callbacks
│   │   ├── login/             # Authentication pages
│   │   ├── signup/            # User registration
│   │   ├── setup-store/       # Initial store setup
│   │   ├── pricing/           # Subscription plans display
│   │   └── payment/           # Payment success/error pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── main-layout.tsx   # Main application layout
│   │   ├── sidebar-nav.tsx   # Navigation sidebar
│   │   ├── restriction-components.tsx # Feature restriction UI
│   │   ├── pricing-card.tsx  # Subscription plan cards
│   │   └── subscription-dashboard.tsx # Subscription management
│   ├── lib/                  # Core business logic
│   │   ├── supabase.ts       # Database client with types
│   │   ├── subscription-service.ts # Subscription management
│   │   ├── midtrans-service.ts # Payment processing
│   │   ├── plan-validation-service.ts # Plan validation
│   │   ├── usage-tracking-service.ts # Usage monitoring
│   │   ├── feature-flag-service.ts # Feature access control
│   │   └── user-store.ts     # User state management
│   ├── middleware/           # Feature restriction middleware
│   ├── hooks/               # Custom React hooks
│   └── types/               # TypeScript type definitions
├── database/                # Database schema and migrations
│   ├── schema.sql          # Complete PostgreSQL schema
│   ├── migrations/         # Database migration files
│   └── seeds/              # Sample data
├── docs/                   # Documentation (currently empty)
└── supabase/              # Supabase configuration
```

### Key Modules and Their Purpose

- **Subscription Management**: `src/lib/subscription-service.ts` - Complete subscription lifecycle, billing, usage tracking
- **Payment Processing**: `src/lib/midtrans-service.ts` - Midtrans integration for Indonesian payments
- **Feature Restrictions**: `src/middleware/feature-restriction.ts` - Plan-based access control
- **Usage Tracking**: `src/lib/usage-tracking-service.ts` - Real-time usage monitoring and limits
- **Plan Validation**: `src/lib/plan-validation-service.ts` - Subscription plan validation logic
- **Database Client**: `src/lib/supabase.ts` - Type-safe Supabase client with comprehensive types

## Data Models and APIs

### Data Models

Instead of duplicating, reference actual model files:

- **Database Schema**: See `database/schema.sql` (1,959 lines of comprehensive PostgreSQL schema)
- **TypeScript Types**: See `src/lib/supabase.ts` (442 lines of generated types)
- **Subscription Types**: See `src/types/subscription.ts`

### API Specifications

- **RESTful Endpoints**: All API routes in `src/app/api/` follow consistent patterns
- **Feature Restrictions**: Every API endpoint implements plan validation and usage tracking
- **Payment Integration**: Midtrans webhook handling in `src/app/api/payments/midtrans/`

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Mock Data in APIs**: Many API endpoints still return mock data instead of actual database queries
2. **Incomplete Feature Implementation**: Some features show "coming soon" or placeholder content
3. **Hardcoded Values**: Some configuration values are hardcoded instead of using environment variables
4. **Missing Error Handling**: Some API routes lack comprehensive error handling
5. **Inconsistent Validation**: Some forms use Zod validation, others don't

### Workarounds and Gotchas

- **Environment Variables**: Must set all Supabase and Midtrans environment variables for proper functionality
- **Database Setup**: Requires manual execution of `database/schema.sql` in Supabase
- **Authentication Flow**: Complex middleware logic for handling authenticated vs unauthenticated users
- **Feature Restrictions**: Every API call requires user ID for plan validation
- **Payment Processing**: Midtrans integration requires specific webhook handling for subscription billing

## Integration Points and External Dependencies

### External Services

| Service   | Purpose         | Integration Type | Key Files                     |
| --------- | --------------- | ---------------- | ----------------------------- |
| Supabase  | Database & Auth | SDK              | `src/lib/supabase.ts`         |
| Midtrans  | Payments        | REST API         | `src/lib/midtrans-service.ts` |
| shadcn/ui | UI Components   | NPM Package      | `src/components/ui/`          |

### Internal Integration Points

- **Frontend-Backend**: REST API on Next.js API routes, expects user authentication
- **Subscription System**: Tightly integrated with feature restrictions and usage tracking
- **Payment Flow**: Midtrans webhooks update subscription status in real-time

## Development and Deployment

### Local Development Setup

1. **Prerequisites**: Node.js 20+, npm, Supabase CLI
2. **Environment Setup**: Copy `.env.local` with Supabase and Midtrans credentials
3. **Database Setup**: Run `database/schema.sql` in Supabase dashboard
4. **Dependencies**: `npm install`
5. **Development Server**: `npm run dev` (uses Turbopack for faster builds)

### Build and Deployment Process

- **Build Command**: `npm run build` (Turbopack enabled)
- **Database Commands**: `npm run db:setup`, `npm run db:reset`, `npm run db:seed`
- **Supabase Commands**: `npm run db:start`, `npm run db:stop`

## Testing Reality

### Current Test Coverage

- Unit Tests: None implemented
- Integration Tests: None implemented
- E2E Tests: None implemented
- Manual Testing: Primary QA method

### Running Tests

```bash
npm run lint          # ESLint checking
npm run build         # Production build test
```

## SaaS Subscription System Architecture

### Core Subscription Features

The system implements a sophisticated SaaS subscription model with:

1. **Multi-Tier Plans**: Basic, Pro, Enterprise with different feature sets
2. **Usage Tracking**: Real-time monitoring of feature usage against plan limits
3. **Feature Restrictions**: Middleware-based access control for all API endpoints
4. **Billing Integration**: Midtrans payment processing with webhook handling
5. **Plan Validation**: Comprehensive validation before allowing feature access

### Subscription Flow

1. **User Registration**: Via Supabase Auth
2. **Plan Selection**: On pricing page with feature comparison
3. **Payment Processing**: Midtrans integration for subscription creation
4. **Feature Access**: Middleware validates plan and usage limits
5. **Usage Tracking**: Real-time monitoring and limit enforcement
6. **Billing Management**: Automated recurring billing with webhook updates

### Key Subscription Tables

- `subscription_plans`: Plan definitions with features and limits
- `user_subscriptions`: User subscription records and status
- `feature_usage`: Real-time usage tracking per user
- `billing_invoices`: Invoice management
- `billing_payments`: Payment records
- `feature_flags`: Feature access control per plan

## Feature Restriction System

### Implementation Pattern

Every API endpoint follows this pattern:

1. **User Authentication**: Extract user ID from request
2. **Plan Validation**: Check if user's plan allows the feature
3. **Usage Tracking**: Increment usage counter
4. **Limit Enforcement**: Block if usage limit exceeded
5. **Response**: Return data with usage information

### Restriction Components

- **API Middleware**: `src/middleware/feature-restriction.ts`
- **UI Components**: `src/components/restriction-components.tsx`
- **Validation Service**: `src/lib/plan-validation-service.ts`
- **Usage Tracking**: `src/lib/usage-tracking-service.ts`

## Payment Processing Architecture

### Midtrans Integration

- **Payment Creation**: `MidtransService.createPayment()`
- **Subscription Billing**: `MidtransService.createSubscriptionPayment()`
- **Webhook Handling**: Real-time payment status updates
- **Transaction Management**: Status checking, cancellation, approval

### Payment Flow

1. **Plan Selection**: User selects subscription plan
2. **Payment Creation**: Generate Midtrans payment token
3. **Payment Processing**: Redirect to Midtrans payment page
4. **Webhook Notification**: Real-time status updates
5. **Subscription Activation**: Update user subscription status

## Multi-Tenant Architecture

### Store Management

- **Merchant-Store Relationship**: One merchant can have multiple stores
- **User-Store Assignment**: Users assigned to specific stores via role_assignments
- **Data Isolation**: Row Level Security (RLS) policies for data separation
- **Store Configuration**: Each store has independent settings and inventory

### Data Isolation

- **RLS Policies**: Enabled on all tables for data security
- **Store Context**: All operations scoped to user's assigned store
- **Role-Based Access**: Different permission levels per store

## Performance Considerations

### Current Optimizations

- **Turbopack**: Enabled for faster development builds
- **Database Indexes**: Comprehensive indexing on frequently queried columns
- **Type Safety**: Full TypeScript coverage for better performance
- **Component Optimization**: shadcn/ui components for consistent performance

### Potential Bottlenecks

- **Feature Validation**: Every API call requires database queries for plan validation
- **Usage Tracking**: Real-time usage increment on every feature access
- **Complex Queries**: Some dashboard queries may be slow with large datasets

## Security Implementation

### Authentication & Authorization

- **Supabase Auth**: JWT-based authentication
- **Row Level Security**: Database-level security policies
- **Feature Restrictions**: Plan-based access control
- **API Protection**: Middleware-based request validation

### Data Protection

- **Environment Variables**: Sensitive data in environment variables
- **Input Validation**: Zod schemas for form validation
- **SQL Injection Prevention**: Supabase client handles parameterized queries
- **XSS Protection**: React's built-in XSS protection

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
npm run dev         # Start development server with Turbopack
npm run build       # Production build
npm run lint        # ESLint checking
npm run db:setup    # Setup database schema
npm run db:reset    # Reset database
npm run db:seed     # Seed sample data
```

### Debugging and Troubleshooting

- **Logs**: Check browser console and Supabase logs
- **Environment**: Verify all environment variables are set
- **Database**: Check Supabase dashboard for RLS policies
- **Payments**: Use Midtrans sandbox for testing

### Common Issues

1. **"supabaseUrl is required" Error**: Missing environment variables
2. **Feature Access Denied**: Check user's subscription plan and usage limits
3. **Payment Failures**: Verify Midtrans configuration and webhook setup
4. **Database Connection Issues**: Check Supabase project status and RLS policies

## Future Enhancement Areas

### Immediate Improvements Needed

1. **Replace Mock Data**: Implement actual database queries in API endpoints
2. **Add Error Handling**: Comprehensive error handling across all components
3. **Implement Tests**: Unit and integration tests for critical functionality
4. **Performance Optimization**: Optimize database queries and caching
5. **Documentation**: Complete API documentation and user guides

### Scalability Considerations

1. **Database Optimization**: Query optimization and connection pooling
2. **Caching Strategy**: Implement Redis for frequently accessed data
3. **CDN Integration**: For static assets and images
4. **Monitoring**: Application performance monitoring and alerting
5. **Backup Strategy**: Automated database backups and disaster recovery

---

**Built with ❤️ for comprehensive pet shop management**

This brownfield architecture document reflects the actual state of the Allnimall Store CMS system as of December 2024, including all technical debt, workarounds, and real-world implementation patterns that AI agents need to understand when working on this codebase.
