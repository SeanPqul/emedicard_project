# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Overview

eMediCard is a digital health card management system built with a microservices architecture using:
- **Mobile App**: React Native + Expo (for applicants and inspectors)
- **Web Admin**: Next.js (for administrators)
- **Backend**: Convex (serverless functions and database)
- **Shared Packages**: TypeScript types, constants, utils, and validation

## Development Commands

### Initial Setup
```bash
# Install all dependencies
pnpm install

# Install global tools (if needed)
npm install -g @expo/cli convex

# Copy environment files and configure
cp backend/.env.example backend/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/webadmin/.env.example apps/webadmin/.env.local
```

### Development Workflow
```bash
# Start all applications simultaneously
pnpm run dev

# Start individual applications
pnpm run dev --filter=mobile    # Expo dev client
pnpm run dev --filter=webadmin  # Next.js dev server
pnpm run dev --filter=backend   # Convex dev mode

# For mobile app specifically
cd apps/mobile
expo start --dev-client         # Development client
expo run:android                # Run on Android
expo run:ios                    # Run on iOS
expo start --web               # Web version
```

### Testing
```bash
# Run all tests
pnpm run test

# Run mobile app tests specifically
cd apps/mobile
npm run test                    # Jest tests
npm run test -- --watch        # Watch mode

# Run single test file
npm run test -- ComponentName.test.tsx
```

### Code Quality
```bash
# Lint all projects
pnpm run lint

# Type checking
pnpm run typecheck

# Format code
pnpm run format

# Build all projects
pnpm run build
```

### Backend/Database Operations
```bash
# Deploy Convex functions
cd backend
npx convex deploy

# Run database seeds (from mobile app)
cd apps/mobile
npm run seed:seedJobCategoriesAndRequirements
npm run seed:clearSeedData

# Generate Convex types
cd backend
npx convex codegen
```

### Maya Payment Testing
```bash
# Test Maya payment webhook
cd backend
node test-maya-payment.js

# Test webhook with different scenarios
node test-webhook.js connectivity
node test-webhook.js signature
node test-webhook.js payment pay_123456789
```

## Architecture Overview

### Project Structure
- `apps/mobile/` - React Native Expo app with role-based navigation
- `apps/webadmin/` - Next.js admin dashboard
- `backend/` - Convex serverless backend with all API functions
- `packages/` - Shared TypeScript packages for consistency

### Database Schema (Convex)
The database uses Convex with a normalized schema centered around:
- **Users**: Role-based access (applicant, inspector, admin)
- **Applications**: Health card applications with status tracking
- **Payments**: Maya payment gateway integration with audit logs
- **HealthCards**: Issued cards with QR codes for verification
- **Notifications**: Real-time user notifications

Key tables: `users`, `applications`, `payments`, `healthCards`, `documentUploads`, `paymentLogs`

### Mobile App Architecture
- **Expo Router**: File-based routing with nested layouts
- **Role-Based Navigation**: Different UI for applicants vs inspectors
- **Clerk Authentication**: User management and auth
- **Context Providers**: Toast notifications and form state management
- **Responsive Design**: Adaptive layouts using react-native-responsive-screen

Navigation structure:
- `(auth)/` - Authentication screens
- `(tabs)/` - Tab-based navigation for applicants
- `(screens)/(inspector)/` - Stack navigation for inspectors
- `(shared)/` - Common screens across roles

### Payment Integration
Maya payment gateway is integrated with:
- REST API approach via Convex HTTP actions
- Webhook handling for real-time status updates
- Payment logs for audit trail
- Support for abandoned payment recovery

### Shared Packages
- `@emedicard/types` - TypeScript type definitions
- `@emedicard/constants` - Application constants and enums
- `@emedicard/utils` - Utility functions
- `@emedicard/validation` - Form validation schemas

## Key Development Patterns

### State Management
- Use Convex React hooks for data fetching
- Custom hooks in `src/hooks/` for business logic
- Context providers for global state (Toast, Auth)
- Form state managed with controlled components

### Error Handling
- Global error boundary in root layout
- API error handling in shared utilities
- User-friendly error messages via Toast system
- Payment error logging in paymentLogs table

### File Conventions
- Components use index.ts for clean imports
- Styles organized by feature/screen
- Types centralized in packages and local type files
- Constants extracted to shared packages

### Testing Strategy
- Jest for unit testing React Native components
- Integration tests for authentication flows
- Manual testing for payment flows (Maya sandbox)
- Test utilities in `__tests__` directories

## Environment Configuration

### Required Environment Variables
**Backend** (`backend/.env.local`):
- `CONVEX_DEPLOYMENT` - Convex deployment URL
- `CLERK_WEBHOOK_SECRET` - Clerk webhook validation
- `MAYA_PUBLIC_KEY` / `MAYA_SECRET_KEY` - Maya payment API
- `MAYA_WEBHOOK_SECRET` - Maya webhook validation

**Mobile** (`apps/mobile/.env.local`):
- `EXPO_PUBLIC_CONVEX_URL` - Convex API endpoint
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key

**WebAdmin** (`apps/webadmin/.env.local`):
- `NEXT_PUBLIC_CONVEX_URL` - Convex API endpoint
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk server key

### Build & Deployment Notes
- Mobile app uses Expo for builds (EAS Build for production)
- Web admin deploys as standard Next.js app
- Convex functions auto-deploy on push to main branch
- Environment variables managed per deployment environment

## Development Tips

### Working with Convex
- Functions are automatically typed - use generated types
- Use Convex dev mode for hot reloading of functions
- Database queries are reactive - components auto-update
- Test database operations in Convex dashboard

### Mobile Development
- Use Expo dev client for testing native modules
- Test on both iOS and Android for platform-specific issues
- Use responsive utilities for different screen sizes
- Leverage Expo modules for native functionality

### Payment Integration
- Always test in Maya sandbox environment first
- Use webhook test scripts for debugging payment flows
- Monitor payment logs table for debugging issues
- Handle edge cases like abandoned/expired payments

### Debugging Common Issues
- **Convex connection issues**: Check deployment URL and network
- **Authentication problems**: Verify Clerk configuration
- **Payment webhook failures**: Check webhook URL accessibility and signature validation
- **Mobile app crashes**: Check Expo dev client logs and error boundaries
