# Allnimall Store CMS

A comprehensive pet shop management system built with Next.js 15, TypeScript, and Supabase.

## 🚀 Features

### Core Management

- **Dashboard** - Overview of business metrics and recent activities
- **Product Management** - CRUD operations for products with categories
- **Service Management** - Manage pet services with pricing and duration
- **Inventory Management** - Track stock levels and inventory transactions
- **Employee Management** - Manage staff with role assignments
- **Category Management** - Organize products and services by categories
- **Store Management** - Configure multiple store locations
- **Settings** - User preferences and system configuration

### Technical Features

- **Real-time Database** - Powered by Supabase PostgreSQL
- **Modern UI** - Built with shadcn/ui components
- **Responsive Design** - Works on desktop and mobile
- **Type Safety** - Full TypeScript support
- **Authentication** - Ready for Supabase Auth integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd allnimall-store-cms
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Supabase**

   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Get your project URL and anon key

4. **Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   **To get these values:**

   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon public key
   - Copy the service_role secret key (for server-side operations)

5. **Run the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses a comprehensive database schema designed for pet shop management:

### Core Tables

- `users` - Staff/employee management
- `merchants` - Business information
- `stores` - Store locations
- `products` - Products and services
- `products_categories` - Product/service categories
- `customers` - Customer information
- `pets` - Pet records
- `sales` - Sales transactions
- `inventory_transactions` - Stock movements

### Key Features

- **Multi-tenant** - Support for multiple merchants and stores
- **Role-based Access** - Flexible permission system
- **Audit Trail** - Created/updated timestamps and user tracking
- **Soft Deletes** - Data preservation with deleted_at timestamps
- **Row Level Security** - Database-level security policies

## 🎯 MVP Features Implemented

### ✅ Completed

- [x] Employee Management (CRUD operations)
- [x] Category Management (Product/Service categories)
- [x] Store Setup (Multi-location support)
- [x] Product Management (Connected to database)
- [x] Service Management (Connected to database)
- [x] Settings Page (User preferences)
- [x] Database Integration (Supabase)
- [x] Responsive UI (Mobile-friendly)

### 🔄 In Progress

- [ ] Inventory Management (Database integration)
- [ ] Sales Management
- [ ] Customer Management
- [ ] Authentication System
- [ ] Role-based Permissions

## 🚀 Getting Started

1. **Login**: Use demo credentials `admin@allnimall.com` / `admin123`
2. **Setup Store**: Go to Stores page to configure your business
3. **Add Categories**: Create product and service categories
4. **Add Employees**: Register your staff members
5. **Add Products**: Start adding your inventory
6. **Add Services**: Configure your service offerings

## 📱 Pages Overview

- **`/dashboard`** - Business overview and metrics
- **`/products`** - Product management
- **`/services`** - Service management
- **`/inventory`** - Stock management
- **`/employees`** - Staff management
- **`/categories`** - Category management
- **`/stores`** - Store configuration
- **`/settings`** - User preferences

## 🔧 Development

### Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── main-layout.tsx # Main application layout
│   └── sidebar-nav.tsx # Navigation sidebar
├── lib/                # Utility functions
│   ├── utils.ts        # General utilities
│   └── supabase.ts     # Database client
└── hooks/              # Custom React hooks
```

### Database Client

The Supabase client is configured in `src/lib/supabase.ts` with:

- Type-safe database operations
- Real-time subscriptions support
- Row Level Security policies
- Comprehensive TypeScript types

## 🎨 UI Components

Built with shadcn/ui components:

- **Forms**: Input, Select, Textarea, Switch
- **Data Display**: Table, Card, Badge, Avatar
- **Navigation**: Sidebar, Dialog, Tabs
- **Feedback**: Toast notifications, Loading states
- **Layout**: Responsive grid system

## 🔐 Security

- **Row Level Security** enabled on all tables
- **Environment variables** for sensitive data
- **Type-safe** database operations
- **Input validation** with Zod schemas
- **Soft deletes** for data preservation

## 📈 Performance

- **Next.js 15** with App Router
- **Server Components** for better performance
- **Optimized queries** with Supabase
- **Lazy loading** for better UX
- **Responsive images** and assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**1. "supabaseUrl is required" Error**

- Make sure you have created `.env.local` file in the root directory
- Check that your environment variables are correctly set
- Restart your development server after adding environment variables

**2. Database Connection Issues**

- Verify your Supabase project is active
- Check that the SQL schema has been applied
- Ensure Row Level Security policies are properly configured

**3. Authentication Issues**

- Use demo credentials: `admin@allnimall.com` / `admin123`
- Check that Supabase Auth is enabled in your project

**4. Build Errors**

- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors with `npm run build`
- Clear Next.js cache with `rm -rf .next`

## 🆘 Support

For support and questions:

- Check the documentation
- Review the database schema
- Test with demo data
- Contact the development team

---

**Built with ❤️ for pet shop management**
