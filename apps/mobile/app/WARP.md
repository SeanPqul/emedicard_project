# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start

### Development Commands

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
npm start                    # Start Expo dev server with dev client

# Platform-specific development
npm run android             # Run on Android emulator
npm run ios                # Run on iOS simulator
npm run web                # Run on web

# Start with monorepo (from root)
pnpm run dev --filter=mobile

# Backend development (from backend/)
cd ../../backend && npx convex dev
```

### Testing & Code Quality

```bash
# Type checking
npm run typecheck

# Linting (uses expo lint)
npm run lint

# Run tests
npm test

# Clean build artifacts
npm run clean
```

### Database Seeding

```bash
# Seed job categories and requirements
npm run seed:seedJobCategoriesAndRequirements

# Clear seeded data
npm run seed:clearSeedData
```

## Architecture Overview

This is an eMediCard mobile application built with React Native Expo, implementing a sophisticated dual architecture pattern:

### 1. Expo Router Layer (`app/`)
Handles navigation and routing:
- `(auth)/` - Authentication screens (sign-in, sign-up, verification)
- `(tabs)/` - Main tab navigation (dashboard, apply, applications, notifications, profile)
- `(screens)/(shared)/` - Shared screens including payment flow

### 2. Feature-Slice Design Layer (`src/`)
8-layer FSD v2 Extended architecture:
- `screens/` - Complete screen components
- `widgets/` - Complex UI blocks
- `features/` - User-facing functionality (auth, payment, document-upload)
- `processes/` - Cross-feature workflows (paymentFlow, applicationFlow)
- `entities/` - Business entities (user, application, healthCard)
- `shared/` - UI components, utilities, design system
- `types/` - Generic type definitions

### Backend Integration
- Consolidated backend at `../../backend/convex/`
- Real-time data synchronization via Convex
- Clerk authentication integration
- Maya payment gateway integration

## Key Features

1. **Submit-First-Pay-Later Flow**: Applications are submitted before payment
2. **Maya Payment Integration**: Complete payment processing with webhooks
3. **QR Code Health Cards**: Digital health cards with QR verification
4. **Multi-Step Forms**: Complex application workflow
5. **Real-Time Updates**: Live data sync via Convex subscriptions
6. **Role-Based Access**: Applicant, Inspector, and Admin roles

## Import Patterns

### FSD Layer Imports (Preferred)
```typescript
import { PaymentForm } from '@features/payment';
import { UserEntity } from '@entities/user';
import { Button } from '@shared/ui';
```

### Backend Imports
```typescript
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
```

## Common Development Tasks

### Adding New Features
1. Define entities in `src/entities/` if needed
2. Create backend functions in `../../backend/convex/[domain]/`
3. Implement feature in `src/features/[feature-name]/`
4. Create cross-feature workflows in `src/processes/` if needed
5. Compose widgets in `src/widgets/`
6. Create screens in `src/screens/`
7. Add navigation in `app/` directory

### Working with Payments
- Payment screens: `app/(screens)/(shared)/payment/`
- Backend handlers: `../../backend/convex/payments/maya/`
- Environment variables required: `MAYA_PUBLIC_KEY`, `MAYA_SECRET_KEY`

### Running Single Tests
```bash
# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests in watch mode
npm test -- --watch
```

## Environment Setup

Copy environment variables:
```bash
cp .env.example .env.local
```

Required environment variables:
- Maya Payment: `MAYA_PUBLIC_KEY`, `MAYA_SECRET_KEY`, `MAYA_WEBHOOK_SIGNATURE_KEY`
- Authentication: `CLERK_PUBLISHABLE_KEY`
- Backend: `CONVEX_URL`

## Project Context

- **Monorepo Structure**: Part of a larger monorepo with web admin and shared packages
- **Mobile-First**: Designed for applicants to apply for health cards via mobile
- **Real-Time**: Uses Convex for real-time data synchronization
- **Type-Safe**: Strict TypeScript with comprehensive type definitions
- **Production-Ready**: Complete with payment processing, error handling, and user feedback

## Related Documentation

- Read `CLAUDE.md` for comprehensive development guidelines
- Backend functions are in `../../backend/convex/`
- Shared packages in `../../packages/`
- Web admin app in `../../apps/webadmin/`
