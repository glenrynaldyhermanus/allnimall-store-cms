# Allnimall Store CMS Brownfield Enhancement PRD

## Intro Project Analysis and Context

### Existing Project Overview

#### Analysis Source

Document-project output available at: `docs/brownfield-architecture.md`

#### Current Project State

Allnimall Store CMS is a Next.js 15 SaaS application built for pet shop management with sophisticated subscription billing, multi-tenant architecture, and comprehensive feature restrictions. The system uses Supabase for database and authentication, Midtrans for payment processing, and implements a complex usage tracking system.

**Current System Capabilities:**

- Multi-tenant pet shop management platform
- Subscription billing with feature restrictions
- Payment processing via Midtrans (Indonesian market)
- Real-time usage monitoring and plan validation
- Comprehensive PostgreSQL database with RLS policies
- Next.js 15 with App Router and Turbopack optimization

### Available Documentation Analysis

#### Available Documentation

- ✅ Tech Stack Documentation (from document-project)
- ✅ Source Tree/Architecture (from document-project)
- ✅ API Documentation (from document-project)
- ✅ External API Documentation (from document-project)
- ✅ Technical Debt Documentation (from document-project)
- ✅ SaaS Roadmap & Pricing Strategy (`docs2/SAAS_ROADMAP.md`)
- ✅ Pricing Strategy (`docs2/PRICING_STRATEGY.md`)
- ✅ User Flow Documentation (`docs2/USER_FLOW.md`)
- ✅ Signup Success Flow (`docs2/SIGNUP_SUCCESS.md`)

Using existing project analysis from document-project output.

### Enhancement Scope Definition

#### Enhancement Type

- ✅ New Feature Addition
- ✅ Major Feature Modification
- ✅ Integration with New Systems
- ✅ Performance/Scalability Improvements
- ✅ UI/UX Overhaul

#### Enhancement Description

Transform the existing Allnimall Store CMS from a basic pet shop management system into a comprehensive SaaS platform with multi-tier subscription plans, advanced feature restrictions, and complete business management capabilities including HR, Finance, Marketing, and Design modules.

#### Impact Assessment

- ✅ Major Impact (architectural changes required)

### Goals and Background Context

#### Goals

- Implement comprehensive SaaS subscription model with Free, Paid, and Add-on tiers
- Add advanced feature restriction system with usage tracking and plan validation
- Integrate Midtrans payment processing for Indonesian market
- Develop modular add-on system for HR, Finance, Marketing, and Design features
- Create scalable multi-tenant architecture with proper data isolation
- Implement real-time usage monitoring and billing management
- Build comprehensive admin dashboard for subscription and billing management

#### Background Context

The current Allnimall Store CMS is a basic pet shop management system that needs to be transformed into a full-featured SaaS platform. Based on the existing documentation in `docs2/`, there's a clear vision for a multi-tier subscription model targeting the Indonesian pet business market. The system needs to evolve from a simple inventory management tool to a comprehensive business management platform with sophisticated billing, feature restrictions, and modular add-ons.

The existing codebase already has the foundation with Supabase integration, Next.js 15 architecture, and basic multi-tenant structure. The enhancement will build upon this foundation to create a scalable SaaS platform that can compete in the Indonesian market with appropriate pricing and feature sets.

### Change Log

| Change      | Date       | Version | Description                           | Author    |
| ----------- | ---------- | ------- | ------------------------------------- | --------- |
| Initial PRD | 2024-12-19 | 1.0     | Comprehensive SaaS transformation PRD | John (PM) |

## Requirements

### Functional

1. **FR1**: The system shall implement a multi-tier subscription model with Free (Rp 0), Paid (Rp 50,000), and Add-on modules (Rp 50,000-75,000 each) as defined in the pricing strategy.

2. **FR2**: The system shall enforce feature restrictions based on subscription plans, blocking access to premium features for users on lower-tier plans.

3. **FR3**: The system shall track real-time usage of features and enforce usage limits per subscription plan.

4. **FR4**: The system shall integrate with Midtrans payment gateway for subscription billing and recurring payments.

5. **FR5**: The system shall provide a comprehensive admin dashboard for subscription management, billing, and usage analytics.

6. **FR6**: The system shall support modular add-on architecture for HR Management, Finance & Accounting, Marketing & Promotion, and Design & Branding modules.

7. **FR7**: The system shall maintain existing pet shop management functionality while adding new SaaS features.

8. **FR8**: The system shall provide upgrade/downgrade flows with proper proration and billing adjustments.

9. **FR9**: The system shall implement comprehensive usage analytics and reporting for subscription management.

10. **FR10**: The system shall support bundle pricing with discounts for multiple add-ons.

### Non Functional

1. **NFR1**: The system must maintain existing performance characteristics and not exceed current response times by more than 20%.

2. **NFR2**: The system must support up to 3,500 free users, 1,500 paid users, and 300 add-on users as per Year 3 targets.

3. **NFR3**: The system must maintain 99% uptime for subscription and billing operations.

4. **NFR4**: The system must process payments within 5 seconds and handle webhook notifications in real-time.

5. **NFR5**: The system must maintain data isolation between tenants using existing RLS policies.

6. **NFR6**: The system must support Indonesian Rupiah (IDR) currency and local payment methods.

7. **NFR7**: The system must maintain backward compatibility with existing API endpoints.

8. **NFR8**: The system must provide comprehensive error handling and user feedback for subscription operations.

### Compatibility Requirements

1. **CR1**: Existing API endpoints must remain functional and maintain current response formats for backward compatibility.

2. **CR2**: Database schema changes must be additive only, preserving existing data structure and relationships.

3. **CR3**: UI/UX changes must maintain consistency with existing shadcn/ui design system and component patterns.

4. **CR4**: Integration with existing Supabase authentication and database must remain unchanged.

## User Interface Enhancement Goals

### Integration with Existing UI

New UI elements will integrate seamlessly with the existing shadcn/ui component library and Tailwind CSS styling. The subscription management interface will follow the same design patterns as existing admin pages, maintaining visual consistency with the current dashboard layout and navigation structure.

### Modified/New Screens and Views

- **New**: `/pricing` - Subscription plans display and selection
- **New**: `/admin/subscription` - Subscription management dashboard
- **New**: `/admin/billing` - Billing history and invoice management
- **Modified**: `/admin/dashboard` - Add subscription status and usage widgets
- **Modified**: All admin pages - Add feature restriction prompts and upgrade buttons
- **New**: `/payment/success`, `/payment/error`, `/payment/unfinish` - Payment result pages

### UI Consistency Requirements

- Maintain existing shadcn/ui component usage patterns
- Follow established color scheme and typography
- Use consistent spacing and layout patterns from existing admin pages
- Implement feature restriction UI components that match existing design language
- Ensure responsive design consistency across all new subscription-related pages

## Technical Constraints and Integration Requirements

### Existing Technology Stack

**Languages**: TypeScript, JavaScript
**Frameworks**: Next.js 15.5.2 (App Router, Turbopack enabled)
**Database**: Supabase 2.57.2 (PostgreSQL with RLS)
**UI**: React 19.1.0, Tailwind CSS 4.x, shadcn/ui components
**Forms**: React Hook Form 7.62.0 with Zod validation
**Payments**: Midtrans 1.4.3 (Indonesian payment gateway)
**Icons**: Lucide React 0.542.0
**Notifications**: Sonner 2.0.7

### Integration Approach

**Database Integration Strategy**: Extend existing PostgreSQL schema with subscription tables while maintaining RLS policies and data isolation
**API Integration Strategy**: Build upon existing API route patterns in `src/app/api/` with consistent feature restriction middleware
**Frontend Integration Strategy**: Integrate with existing Next.js App Router structure and component patterns
**Testing Integration Strategy**: Maintain existing manual testing approach while adding subscription-specific test scenarios

### Code Organization and Standards

**File Structure Approach**: Follow existing patterns in `src/app/`, `src/lib/`, and `src/components/` directories
**Naming Conventions**: Maintain existing camelCase for variables and kebab-case for file names
**Coding Standards**: Follow existing TypeScript strict mode and ESLint configuration
**Documentation Standards**: Maintain existing inline documentation and add comprehensive subscription system documentation

### Deployment and Operations

**Build Process Integration**: Use existing Turbopack-enabled build process with `npm run build`
**Deployment Strategy**: Maintain existing deployment pipeline with environment variable management
**Monitoring and Logging**: Extend existing console logging with subscription-specific monitoring
**Configuration Management**: Use existing environment variable system for Midtrans and Supabase configuration

### Risk Assessment and Mitigation

**Technical Risks**:

- Complex subscription logic may impact performance
- Midtrans integration requires careful webhook handling
- Feature restriction middleware adds complexity to every API call

**Integration Risks**:

- Existing API endpoints may be affected by feature restriction middleware
- Database schema changes must be carefully planned to avoid data loss
- Payment processing integration may introduce new failure points

**Deployment Risks**:

- Subscription system changes require careful testing to avoid billing issues
- Feature restrictions must be thoroughly tested to prevent user access issues

**Mitigation Strategies**:

- Implement comprehensive feature flag system for gradual rollout
- Add extensive error handling and user feedback for subscription operations
- Create detailed rollback procedures for subscription system changes
- Implement comprehensive testing for all subscription-related functionality

## Epic and Story Structure

### Epic Approach

**Epic Structure Decision**: Single comprehensive epic for SaaS transformation with rationale that this is a cohesive enhancement to transform the existing system into a full SaaS platform. The subscription system, feature restrictions, payment integration, and add-on modules are all interconnected and should be delivered as a unified enhancement.

## Epic 1: Complete SaaS Platform Transformation

**Epic Goal**: Transform Allnimall Store CMS from a basic pet shop management system into a comprehensive SaaS platform with multi-tier subscriptions, feature restrictions, payment processing, and modular add-ons.

**Integration Requirements**: Maintain existing functionality while adding comprehensive subscription management, ensure seamless integration with existing Supabase architecture, and preserve all current user workflows.

### Story 1.1: Implement Core Subscription Infrastructure

As a **system administrator**,
I want **to implement the core subscription database schema and services**,
so that **the foundation for SaaS functionality is established**.

#### Acceptance Criteria

1. **AC1**: Create comprehensive subscription database schema with all required tables (subscription_plans, user_subscriptions, feature_usage, billing_invoices, billing_payments, feature_flags)
2. **AC2**: Implement SubscriptionService class with full CRUD operations for subscription management
3. **AC3**: Create plan validation service with feature access checking
4. **AC4**: Implement usage tracking service with real-time monitoring
5. **AC5**: Add comprehensive TypeScript types for all subscription-related data structures

#### Integration Verification

1. **IV1**: Verify existing database connections and RLS policies remain functional
2. **IV2**: Confirm existing API endpoints continue to work without subscription restrictions
3. **IV3**: Validate that new database tables integrate properly with existing schema

### Story 1.2: Implement Feature Restriction System

As a **system administrator**,
I want **to implement comprehensive feature restrictions based on subscription plans**,
so that **users can only access features appropriate to their subscription tier**.

#### Acceptance Criteria

1. **AC1**: Create feature restriction middleware that validates user plans before API access
2. **AC2**: Implement feature flag system with plan-based access control
3. **AC3**: Add usage limit enforcement with real-time tracking
4. **AC4**: Create restriction UI components for upgrade prompts and usage warnings
5. **AC5**: Integrate feature restrictions with all existing API endpoints

#### Integration Verification

1. **IV1**: Verify existing admin pages continue to function for users with appropriate plans
2. **IV2**: Confirm feature restriction prompts appear correctly for users on lower-tier plans
3. **IV3**: Validate that usage tracking doesn't impact existing page performance

### Story 1.3: Integrate Midtrans Payment Processing

As a **business owner**,
I want **to process subscription payments through Midtrans**,
so that **I can accept payments from Indonesian customers using local payment methods**.

#### Acceptance Criteria

1. **AC1**: Implement MidtransService with payment creation and webhook handling
2. **AC2**: Create subscription payment flow with Midtrans integration
3. **AC3**: Implement webhook handlers for payment status updates
4. **AC4**: Add payment success/error pages with proper user feedback
5. **AC5**: Create recurring billing system for subscription renewals

#### Integration Verification

1. **IV1**: Verify existing user authentication flow remains unchanged
2. **IV2**: Confirm payment processing doesn't interfere with existing store management
3. **IV3**: Validate that webhook processing maintains system performance

### Story 1.4: Create Subscription Management Dashboard

As a **business owner**,
I want **to manage my subscription and billing through a comprehensive dashboard**,
so that **I can monitor usage, view invoices, and manage my subscription plan**.

#### Acceptance Criteria

1. **AC1**: Create subscription management page with current plan display and usage metrics
2. **AC2**: Implement billing history page with invoice viewing and payment tracking
3. **AC3**: Add plan upgrade/downgrade interface with proration calculations
4. **AC4**: Create usage analytics dashboard with detailed metrics and warnings
5. **AC5**: Implement subscription cancellation flow with proper data handling

#### Integration Verification

1. **IV1**: Verify new subscription pages integrate seamlessly with existing admin layout
2. **IV2**: Confirm subscription management doesn't affect existing store management functionality
3. **IV3**: Validate that usage analytics don't impact dashboard performance

### Story 1.5: Implement Pricing Page and Plan Selection

As a **potential customer**,
I want **to view available subscription plans and select the appropriate tier**,
so that **I can choose the best plan for my business needs**.

#### Acceptance Criteria

1. **AC1**: Create comprehensive pricing page with all subscription tiers and add-ons
2. **AC2**: Implement plan comparison interface with feature breakdowns
3. **AC3**: Add plan selection flow with payment integration
4. **AC4**: Create FAQ section addressing common pricing questions
5. **AC5**: Implement bundle pricing display with discount calculations

#### Integration Verification

1. **IV1**: Verify pricing page integrates with existing authentication flow
2. **IV2**: Confirm plan selection doesn't interfere with existing user registration
3. **IV3**: Validate that pricing calculations are accurate and consistent

### Story 1.6: Implement HR Management Add-on Module

As a **business owner with employees**,
I want **to manage my staff through the HR Management add-on**,
so that **I can handle attendance, payroll, and performance management**.

#### Acceptance Criteria

1. **AC1**: Create employee management system with profiles and role assignments
2. **AC2**: Implement attendance tracking with clock in/out functionality
3. **AC3**: Add payroll integration with salary calculations and commission tracking
4. **AC4**: Create performance management system with reviews and metrics
5. **AC5**: Implement HR-specific feature restrictions and usage tracking

#### Integration Verification

1. **IV1**: Verify HR module integrates with existing user management system
2. **IV2**: Confirm HR features are properly restricted to users with HR add-on
3. **IV3**: Validate that HR functionality doesn't impact existing store management

### Story 1.7: Implement Finance & Accounting Add-on Module

As a **business owner**,
I want **to manage my finances through the Finance & Accounting add-on**,
so that **I can handle accounting, tax management, and financial reporting**.

#### Acceptance Criteria

1. **AC1**: Create accounting integration with chart of accounts and journal entries
2. **AC2**: Implement tax management with VAT calculations and compliance tracking
3. **AC3**: Add financial reporting with balance sheets and income statements
4. **AC4**: Create expense management with categorization and approval workflows
5. **AC5**: Implement invoice management with professional templates and payment tracking

#### Integration Verification

1. **IV1**: Verify finance module integrates with existing sales and inventory data
2. **IV2**: Confirm financial features are properly restricted to users with Finance add-on
3. **IV3**: Validate that financial calculations are accurate and comply with Indonesian regulations

### Story 1.8: Implement Marketing & Promotion Add-on Module

As a **business owner**,
I want **to manage my marketing through the Marketing & Promotion add-on**,
so that **I can create campaigns, engage customers, and track marketing performance**.

#### Acceptance Criteria

1. **AC1**: Create campaign management system with promotional campaigns and discount management
2. **AC2**: Implement customer engagement tools with segmentation and targeted marketing
3. **AC3**: Add communication tools with email marketing and SMS campaigns
4. **AC4**: Create marketing analytics with ROI tracking and performance metrics
5. **AC5**: Implement advanced loyalty programs with referral systems and rewards management

#### Integration Verification

1. **IV1**: Verify marketing module integrates with existing customer management system
2. **IV2**: Confirm marketing features are properly restricted to users with Marketing add-on
3. **IV3**: Validate that marketing campaigns don't impact existing sales functionality

### Story 1.9: Implement Design & Branding Add-on Module

As a **business owner**,
I want **to customize my brand through the Design & Branding add-on**,
so that **I can create a professional brand identity across all touchpoints**.

#### Acceptance Criteria

1. **AC1**: Create custom branding system with white-label options and logo integration
2. **AC2**: Implement receipt design customization with branded templates
3. **AC3**: Add website design customization with custom themes and domains
4. **AC4**: Create mobile app branding with custom icons and splash screens
5. **AC5**: Implement marketing materials generation with templates and brand assets

#### Integration Verification

1. **IV1**: Verify design module integrates with existing UI components and styling
2. **IV2**: Confirm branding features are properly restricted to users with Design add-on
3. **IV3**: Validate that custom branding doesn't break existing functionality

### Story 1.10: Implement Comprehensive Testing and Quality Assurance

As a **system administrator**,
I want **to ensure all subscription functionality is thoroughly tested**,
so that **the SaaS platform is reliable and ready for production use**.

#### Acceptance Criteria

1. **AC1**: Create comprehensive test suite for all subscription-related functionality
2. **AC2**: Implement integration tests for payment processing and webhook handling
3. **AC3**: Add performance tests for feature restriction middleware
4. **AC4**: Create user acceptance tests for all subscription workflows
5. **AC5**: Implement monitoring and alerting for subscription system health

#### Integration Verification

1. **IV1**: Verify all existing functionality continues to work after subscription implementation
2. **IV2**: Confirm subscription system doesn't introduce performance regressions
3. **IV3**: Validate that error handling and user feedback work correctly across all scenarios

---

**This PRD represents a comprehensive transformation of the Allnimall Store CMS into a full-featured SaaS platform. The story sequence is designed to minimize risk to the existing system while delivering incremental value. Each story builds upon the previous ones, ensuring that the existing functionality remains intact while new SaaS capabilities are added.**
