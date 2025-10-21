# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

eMediCard is a digital health card management system with three main applications:
- **Mobile App** (React Native + Expo): For applicants to submit health card applications
- **Web Admin** (Next.js): For administrators to review and process applications
- **Backend** (Convex): Unified serverless backend serving both clients

## Development Commands

### Setup
```bash
pnpm install
```

Global tools (if needed):
```bash
npm install -g @expo/cli convex
```

### Development
```bash
# Start all apps
pnpm run dev

# Start individual apps
pnpm run dev --filter=mobile     # Mobile: expo start --dev-client
pnpm run dev --filter=webadmin   # Webadmin: next dev
pnpm run dev --filter=backend    # Backend: convex dev
```

### Testing
```bash
# Run all tests
pnpm run test

# Mobile app specific tests
pnpm run test --filter=mobile
pnpm run test:unit --filter=mobile              # Unit tests only
pnpm run test:integration --filter=mobile       # Integration tests only
pnpm run test:coverage --filter=mobile          # With coverage
pnpm run test:watch --filter=mobile             # Watch mode
```

### Code Quality
```bash
pnpm run lint       # Lint all code
pnpm run typecheck  # TypeScript type checking
pnpm run format     # Format code (if configured)
pnpm run build      # Build all apps
```

### Convex Backend
```bash
# Run in backend directory
cd backend

npx convex dev      # Start development server with live updates
npx convex deploy   # Deploy to production
npx convex codegen  # Generate TypeScript types from schema
```

### Database Seeding
```bash
# From mobile app directory
pnpm run seed:seedJobCategoriesAndRequirements
pnpm run seed:clearSeedData
```

### Mobile App Specific
```bash
pnpm run android    # Run on Android
pnpm run ios        # Run on iOS
pnpm run web        # Run on web browser
```

## Architecture

### Monorepo Structure
This is a **pnpm workspace** managed by **Turborepo** with the following structure:
- `apps/mobile` - React Native + Expo mobile application
- `apps/webadmin` - Next.js admin web application
- `backend/` - Convex serverless backend
- `packages/` - Shared code across applications

### Shared Packages
All packages are prefixed with `@emedicard/`:
- **types**: Shared TypeScript types (application, user, health-card, payment)
- **validation**: Shared validation schemas using Ajv
- **utils**: Shared utility functions
- **constants**: Shared constants (e.g., payment configuration)

To import from shared packages:
```typescript
import { ApplicationType } from "@emedicard/types";
import { validateApplication } from "@emedicard/validation";
import { formatDate } from "@emedicard/utils";
```

### Backend Architecture (Convex)

The backend is **domain-organized** with consolidated functions serving both mobile and webadmin:

**Key domains:**
- `applications/` - Application creation, retrieval, status updates
- `users/` - User management, roles, authentication
- `admin/` - Administrative functions (review, approval, finalization)
- `documents/` & `documentUploads/` - Document management and review
- `payments/` - Payment processing and tracking
- `healthCards/` - Health card issuance and management
- `notifications/` - User notifications system
- `orientations/` & `orientationSchedules/` - Orientation scheduling
- `jobCategories/` - Job category management with requirements
- `verification/` - QR code verification and logging
- `ocr/` - OCR processing for document text extraction
- `storage/` - File upload and storage

**Important notes:**
- Backend serves both mobile and webadmin with some shared and some app-specific functions
- Functions may have suffixes (e.g., `getByIdWebadmin`) to distinguish client-specific implementations
- Schema uses `v.float64()` for timestamps
- Authentication uses Clerk with environment-specific configuration

### Mobile App Architecture (Feature-Sliced Design)

The mobile app follows **Feature-Sliced Design** with clear separation:
- `app-layer/` - Application initialization and routing (Expo Router)
- `entities/` - Business entities and their models
- `features/` - Feature-specific logic and components
- `processes/` - Cross-feature business processes
- `screens/` - Screen components
- `shared/` - Shared UI components, hooks, utilities
- `widgets/` - Complex UI widgets composed of features
- `types/` - App-specific TypeScript types

### Web Admin Architecture (Next.js)

The webadmin uses **Next.js App Router**:
- `src/app/` - App router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Library code and utilities
- `src/utils/` - Utility functions

### Database Schema (Convex)

**Core tables:**
- `users` - User profiles with roles (applicant, inspector, admin)
- `applications` - Health card applications with status tracking
- `documentTypes` - Document type definitions
- `documentUploads` - Uploaded documents with review status and OCR data
- `healthCards` - Issued health cards with QR verification
- `jobCategories` - Job categories with orientation requirements
- `jobCategoryDocuments` - Document requirements per job category
- `notifications` - User notifications
- `orientations` - Orientation session tracking
- `orientationSchedules` - Available orientation time slots
- `orientationSessions` - User orientation bookings
- `paymentLogs` - Payment transaction logs

**Key relationships:**
- Applications belong to users and job categories
- Documents belong to applications
- Health cards are issued for approved applications
- Notifications are sent to users
- Orientations are linked to applications

## Key Technologies

- **Frontend Mobile**: React Native 0.81, Expo 54, Expo Router, Clerk Auth
- **Frontend Web**: Next.js 15, React 19, Tailwind CSS 4, Clerk Auth
- **Backend**: Convex (serverless)
- **Authentication**: Clerk
- **Payment**: Maya Payment Gateway
- **OCR**: Google Cloud Vision API
- **Testing**: Jest (mobile)
- **Validation**: Ajv
- **Monorepo**: pnpm + Turborepo

## Environment Configuration

Each app requires environment variables:
- Copy `.env.example` to `.env.local` in each app directory
- Mobile: `apps/mobile/.env.local`
- Webadmin: `apps/webadmin/.env.local`
- Backend: `backend/.env.local`

**Required variables include:**
- Clerk authentication credentials (different for mobile/webadmin)
- Convex deployment URL
- Payment gateway credentials (Maya)
- Google Cloud Vision API key (for OCR)

## Development Workflows

### Adding New Features
1. Determine if it affects mobile, webadmin, or both
2. Add shared types to `packages/types/src/`
3. Add validation schemas to `packages/validation/src/`
4. Implement Convex backend functions in appropriate domain folder
5. Generate types: `cd backend && npx convex codegen`
6. Implement UI in respective app(s)

### Working with Convex
- Schema changes require deployment: `npx convex deploy` or auto-deploy on `convex dev`
- Always run `convex codegen` after schema changes to update TypeScript types
- Backend functions are automatically available to clients after deployment
- Use `backend/convex/README.md` for detailed backend architecture

### Working with Documents
- Document uploads go through Convex storage
- OCR processing extracts text using Google Cloud Vision
- Documents can be classified and reviewed by admins
- Review status: "Pending", "Approved", "Rejected"

### Working with Payments
- Payment integration uses Maya Payment Gateway
- Payment logs track entire payment lifecycle
- Refer to `docs/MAYA_PAYMENT_IMPLEMENTATION_SUMMARY.md` for details

## Testing Strategy

### Mobile App
- Jest is configured with `jest-expo`
- Tests located in `__tests__/` directories and `*.test.ts(x)` files
- Unit tests: Test individual functions and components
- Integration tests: Test feature workflows
- Use `pnpm run test:watch` during development

### Backend
- No test suite currently configured
- Test using Convex dashboard and client apps

### Web Admin
- No test suite currently configured

## Important Patterns

### Authentication
- Both apps use Clerk for authentication
- Mobile uses `EXPO_CLERK_FRONTEND_API_URL`
- Webadmin uses `CLERK_JWT_ISSUER_DOMAIN`
- Backend validates JWT tokens from both sources

### Type Safety
- Convex auto-generates types from schema
- Import generated types from `backend/convex/_generated/`
- Use shared types from `@emedicard/types` for cross-app consistency
- Run `typecheck` before committing changes

### Code Organization
- Mobile: Follow Feature-Sliced Design principles
- Backend: Group by domain (feature area), not by technical layer
- Webadmin: Follow Next.js conventions with App Router

### Data Flow
1. Client (mobile/web) → Convex function call
2. Convex validates with Clerk auth
3. Convex performs database operations
4. Convex returns typed data to client
5. Client updates UI

## Common Issues

### Convex Codegen
- If types are missing, run `cd backend && npx convex codegen`
- Mobile postinstall script runs codegen automatically

### Expo Development
- Use `expo start --dev-client` (not standard Expo Go)
- Custom native code requires development build

### Workspace Dependencies
- Changes to shared packages require rebuilding dependent apps
- Use `pnpm run dev` to watch for changes across workspace

## Documentation

Refer to these files for additional context:
- `backend/convex/README.md` - Detailed backend architecture
- `backend/convex/API_ORGANIZATION_HANDOFF.md` - Backend API organization
- `docs/MAYA_PAYMENT_SETUP.md` - Payment integration guide
- `docs/MAYA_PAYMENT_IMPLEMENTATION_SUMMARY.md` - Payment implementation details
- `README.md` - Quick start guide
