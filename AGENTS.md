# AGENTS.md - eMediCard Project Documentation

This file provides comprehensive guidance for AI agents and developers working with the eMediCard monorepo project.

## 🎯 Project Purpose

eMediCard is a comprehensive digital health card management system designed to modernize and streamline healthcare card services in the Philippines. The system enables workers to apply for, receive, and verify digital health cards through a seamless mobile-first experience, while providing administrators with powerful tools for application processing and verification.

## Project Overview

The **eMediCard Project** is a production-ready monorepo consisting of:

### 📱 Mobile Application (`apps/mobile/`)
- **Purpose**: Primary interface for health card applicants
- **Tech Stack**: React Native + Expo + TypeScript
- **Architecture**: Dual architecture with Expo Router + Feature-Slice Design v2
- **Key Features**: Multi-step applications, Maya payments, QR health cards, document uploads

### 🌐 Web Admin Dashboard (`apps/webadmin/`)
- **Purpose**: Administrative portal for application management
- **Tech Stack**: Next.js 15 + React 19 + Tailwind CSS 4
- **Architecture**: App Router with server/client components
- **Key Features**: Application review, payment verification, orientation scheduling, analytics

### ⚡ Consolidated Backend (`backend/`)
- **Purpose**: Unified serverless backend serving all applications
- **Tech Stack**: Convex (real-time database + serverless functions)
- **Architecture**: Domain-driven design with modular organization
- **Key Features**: Real-time subscriptions, file storage, webhook handling, role-based access

### 🏗️ Infrastructure
- **Monorepo Management**: Turbo + pnpm workspaces
- **Development**: Unified scripts, shared dependencies, optimized builds
- **Deployment**: Vercel (web), EAS (mobile), Convex (backend)

## Quick Start Commands

### Root Level (Monorepo)
- `pnpm install` - Install all dependencies
- `pnpm run dev` - Start all applications in development mode
- `pnpm run build` - Build all applications
- `pnpm run lint` - Lint all applications
- `pnpm run typecheck` - Type check all applications
- `pnpm run test` - Run tests across all applications
- `pnpm run format` - Format code across all applications
- `pnpm run clean` - Clean build artifacts across all applications

### Individual Application Commands
- `pnpm run dev --filter=mobile` - Start mobile app only
- `pnpm run dev --filter=webadmin` - Start web admin only
- `pnpm run dev --filter=backend` - Start Convex backend only

### Backend Specific
- `cd backend && npx convex dev` - Start Convex development server
- `cd backend && npx convex deploy` - Deploy to production

## Architecture Overview

### System Architecture
```
┌─────────────────────────────────────────────────────┐
│                   User Interfaces                    │
├──────────────────────┬──────────────────────────────┤
│    Mobile App        │       Web Admin              │
│  (React Native)      │      (Next.js)               │
└──────────┬───────────┴──────────┬───────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────────────────────────────────────────┐
│             Consolidated Backend                     │
│                  (Convex)                           │
├─────────────────────────────────────────────────────┤
│  • Real-time subscriptions                          │
│  • Serverless functions                             │
│  • File storage                                     │
│  • Database                                         │
└─────────────────────────────────────────────────────┘
           │                      │
           ▼                      ▼
┌──────────────────────┬──────────────────────────────┐
│   Authentication     │     Payment Gateway          │
│      (Clerk)        │    (Maya PayMaya)            │
└──────────────────────┴──────────────────────────────┘
```

### Consolidated Backend Strategy
The project employs a **single consolidated Convex backend** at `backend/convex/` serving all applications:

#### Benefits
- **Unified Data Model**: Single source of truth for all data
- **Shared Business Logic**: Consistent rules across platforms
- **Real-time Sync**: Live updates across all connected clients
- **Reduced Complexity**: One backend to maintain and deploy
- **Cost Efficiency**: Single infrastructure for multiple apps

### Project Structure
```
emedicard_project/
├── apps/
│   ├── mobile/           # React Native + Expo app
│   └── webadmin/         # Next.js admin dashboard
├── backend/              # Consolidated Convex backend
│   └── convex/          # Shared backend functions and schema
└── AGENTS.md           # This file
```

### Backend Domain Organization
The consolidated backend (`backend/convex/`) is organized by domain:
- `applications/` - Health card application management
- `users/` - User management and authentication
- `healthCards/` - Digital health card issuance
- `jobCategories/` - Job category definitions and requirements
- `requirements/` - Document requirements and validation
- `payments/` - Payment processing and validation
- `documentUploads/` - File upload and document management
- `storage/` - File storage utilities
- `notifications/` - User notification system
- `verification/` - QR code verification and logging
- `admin/` - Administrative functions for web admin
- `orientations/` - Orientation scheduling and management
- `dashboard/` - Dashboard data aggregation

### Technology Stack Details

#### Core Technologies
| Layer | Technology | Version | Purpose |
|-------|------------|---------|----------|
| **Mobile** | React Native | 0.76.6 | Cross-platform mobile framework |
| | Expo SDK | 52.0.28 | Development platform and libraries |
| | Expo Router | 4.0.18 | File-based navigation |
| | TypeScript | 5.3.3 | Type safety |
| **Web Admin** | Next.js | 15.1.6 | React framework with SSR/SSG |
| | React | 19.0.0 | UI library |
| | Tailwind CSS | 4.0.0-beta.4 | Utility-first CSS |
| | TypeScript | 5.7.3 | Type safety |
| **Backend** | Convex | 1.17.7 | Serverless backend platform |
| | Node.js | 18+ | Runtime environment |
| **Authentication** | Clerk | 2.14.1 | User management and auth |
| **Payments** | Maya SDK | Custom | Payment processing |
| **Infrastructure** | Turbo | 2.3.3 | Monorepo build system |
| | pnpm | 9.15.2 | Package manager |
| | Vercel | - | Web hosting |
| | EAS | - | Mobile builds |

## Important Import Patterns

### Mobile App (`apps/mobile/`)
Backend imports use relative paths due to Metro bundler:
- From `src/hooks/`: `import { api } from '../../../backend/convex/_generated/api'`
- From `src/components/*/`: `import { api } from '../../../../backend/convex/_generated/api'`
- From `app/(tabs)/`: `import { Id } from '../../../../backend/convex/_generated/dataModel'`

### Web Admin (`apps/webadmin/`)
Backend imports use TypeScript path aliases:
- **Preferred**: `import { api } from '@/convex/_generated/api'`
- **Data models**: `import { Id, Doc } from '@/convex/_generated/dataModel'`
- Path alias `@/convex/*` maps to `../backend/convex/*`

## Development Workflow

### Feature Development Process

#### 1. Planning Phase
- Identify affected applications (mobile, web, or both)
- Define data models and API requirements
- Plan UI/UX across platforms
- Document acceptance criteria

#### 2. Backend Implementation
```bash
# Start backend development server
cd backend && npx convex dev
```
- Create/update schema in `schema.ts`
- Implement functions in appropriate domain folder
- Add proper TypeScript types
- Test with Convex dashboard

#### 3. Frontend Implementation

**Mobile App:**
```bash
# Start mobile development
pnpm run dev --filter=mobile
```
- Follow Feature-Slice Design architecture
- Create features in `src/features/`
- Add screens in `app/` directory
- Use responsive utilities for styling

**Web Admin:**
```bash
# Start web development
pnpm run dev --filter=webadmin
```
- Create pages in `app/` directory
- Implement server/client components
- Use Tailwind CSS for styling
- Add to navigation as needed

#### 4. Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Cross-platform testing

#### 5. Quality Assurance
```bash
# Run all quality checks
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run format
```

### Working with Authentication
- Clerk provides authentication for both mobile and web admin
- User profiles stored in Convex with role-based access (applicant, inspector, admin)
- Use `useStoreUser` hook to sync authenticated users with Convex
- Admin privileges checked via backend functions

### Code Quality Standards
- **Linting**: ESLint configured for each application
- **Type checking**: Strict TypeScript configuration
- **Testing**: Tests should be added for new features
- **Formatting**: Use project's existing formatting standards

## Common Implementation Patterns

### Data Fetching Strategy

#### Mobile App Pattern
```typescript
// Custom hook with consistent interface
import { useApplications } from '@shared/hooks/useApplications';

const MyComponent = () => {
  const { data, isLoading, error, mutations } = useApplications();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ApplicationList data={data} />;
};
```

#### Web Admin Pattern
```typescript
// Direct Convex hooks usage
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

const AdminComponent = () => {
  const applications = useQuery(api.applications.list);
  const updateStatus = useMutation(api.applications.updateStatus);

  return <ApplicationTable data={applications} onUpdate={updateStatus} />;
};
```

### Error Handling Patterns

#### Mobile Error Handling
```typescript
try {
  await performOperation();
  FeedbackSystem.showSuccess('Operation completed');
} catch (error) {
  console.error('Operation failed:', error);
  FeedbackSystem.showError(getErrorMessage(error));
  // Log to monitoring service
  logError(error, { context: 'operation_name' });
}
```

#### Web Admin Error Handling
```typescript
// Error boundary component
<ErrorBoundary fallback={<ErrorFallback />}>
  <AdminContent />
</ErrorBoundary>

// Toast notifications
try {
  await updateApplication(data);
  toast.success('Application updated successfully');
} catch (error) {
  toast.error('Failed to update application');
}
```

#### Backend Error Handling
```typescript
// Convex function with validation
export const updateApplication = mutation({
  args: { id: v.id('applications'), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // Validate and process
    // Convex handles error propagation to client
  },
});
```

### File Upload Implementation

#### Mobile Upload Pattern
```typescript
import { useDocumentUpload } from '@shared/hooks/useDocumentUpload';

const DocumentUploader = () => {
  const { uploadDocument, progress, isUploading } = useDocumentUpload();

  const handleUpload = async (file) => {
    const result = await uploadDocument({
      file,
      category: 'medical_certificate',
      applicationId: currentApplication.id,
    });

    if (result.success) {
      FeedbackSystem.showSuccess('Document uploaded');
    }
  };

  return (
    <UploadButton
      onPress={handleUpload}
      progress={progress}
      isLoading={isUploading}
    />
  );
};
```

#### Web Admin Upload Pattern
```typescript
const generateUploadUrl = useMutation(api.files.generateUploadUrl);

const handleFileUpload = async (file: File) => {
  const uploadUrl = await generateUploadUrl();

  const result = await fetch(uploadUrl, {
    method: 'POST',
    body: file,
  });

  if (result.ok) {
    const { storageId } = await result.json();
    // Save storageId to document record
  }
};
```

## Application-Specific Guidance

### Mobile App (`apps/mobile/`)
- Follows file-based routing with Expo Router
- Uses custom design system components
- Implements multi-step form patterns
- QR code generation and scanning capabilities
- See `apps/mobile/AGENTS.md` for detailed mobile-specific guidance

### Web Admin (`apps/webadmin/`)
- Next.js App Router architecture
- Dashboard-focused interface for application management
- Document verification workflows
- Payment validation processes
- Orientation scheduling system
- See `apps/webadmin/AGENTS.md` for detailed admin-specific guidance

## Database Schema Key Concepts

Consolidated schema defined in `backend/convex/schema.ts`:
- **users** - User profiles with role-based access
- **applications** - Health card applications with status tracking
- **healthCards** - Issued digital health cards with QR codes
- **jobCategories** - Job categories with document requirements
- **payments** - Payment tracking and validation
- **notifications** - User notification system
- **orientations** - Scheduled orientation sessions
- **documents** - Document uploads with verification status

## Best Practices & Guidelines

### Code Quality Standards

#### TypeScript Configuration
- Strict mode enabled across all applications
- Exact optional property types enforced
- No implicit any allowed
- Consistent type imports

#### Code Style
- ESLint configuration shared across monorepo
- Prettier for consistent formatting
- Component files follow naming conventions
- Comprehensive JSDoc comments for public APIs

#### Testing Requirements
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for critical UI
- E2E tests for user journeys

### Documentation Standards

#### Code Documentation
```typescript
/**
 * Process health card application
 *
 * @param applicationId - The application to process
 * @param status - New status to set
 * @returns Updated application object
 * @throws {Error} If application not found or invalid status
 */
export async function processApplication(
  applicationId: Id<'applications'>,
  status: ApplicationStatus
): Promise<Doc<'applications'>> {
  // Implementation
}
```

#### Project Documentation
- Place all documentation in `docs/` folder
- Include implementation details and examples
- Document API responses and error codes
- Provide troubleshooting guides
- Keep README files updated

### Performance Optimization

#### Mobile Performance
- Use `FlashList` for large lists instead of `FlatList`
- Implement image caching with `expo-image`
- Memoize expensive computations with `useMemo`
- Optimize re-renders with `React.memo`
- Monitor bundle size with Metro bundler analytics

#### Web Performance
- Implement proper Next.js caching strategies
- Use dynamic imports for code splitting
- Optimize images with Next.js Image component
- Enable React Server Components where appropriate
- Monitor Core Web Vitals

#### Backend Performance
- Design efficient Convex queries with proper indexes
- Batch operations when possible
- Use Convex's built-in caching
- Monitor function execution times
- Implement proper pagination

### Security Best Practices

#### Authentication & Authorization
- Implement role-based access control (RBAC) consistently
- Validate user permissions in backend functions
- Use Clerk's security best practices
- Implement session management properly
- Enable MFA for admin accounts

#### Data Security
- Never store sensitive data in client storage
- Use environment variables for secrets
- Implement proper input validation
- Sanitize user inputs to prevent XSS
- Use HTTPS for all communications

#### API Security
- Validate all inputs on the backend
- Implement rate limiting
- Use webhook signature verification
- Monitor for suspicious activity
- Log security events

```typescript
// Example: Secure backend function
export const sensitiveOperation = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // 2. Authorize
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
      .unique();

    if (user?.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    // 3. Validate input
    const sanitized = sanitizeInput(args.data);

    // 4. Perform operation
    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'sensitive_operation',
      timestamp: Date.now(),
    });
  },
});
```

## Project Status & Roadmap

### ✅ Completed Milestones

#### Q3 2025
- **Backend Consolidation**: Unified backend serving all apps
- **Maya Payment Integration**: Complete payment flow with webhooks
- **Feature-Slice Design**: 8-layer architecture for mobile app
- **Monorepo Migration**: Turbo + pnpm workspace setup

#### Q4 2025 (Current)
- **UI Standardization**: Component architecture with responsive design
- **PersonalDetailsStep**: Complete redesign matching master project
- **Documentation**: Comprehensive AGENTS.md files

### 🚧 In Progress

#### Mobile App
- [ ] Update remaining application step components
- [ ] Complete Expo Router migration
- [ ] Implement offline support
- [ ] Add push notifications

#### Web Admin
- [ ] Dashboard analytics improvements
- [ ] Batch operations support
- [ ] Enhanced reporting features
- [ ] Mobile-responsive design

### 📅 Upcoming (Q1 2026)

- **Testing Infrastructure**: Comprehensive test coverage
- **Performance Monitoring**: Sentry integration
- **CI/CD Pipeline**: Automated deployments
- **Internationalization**: Multi-language support
- **Advanced Analytics**: Business intelligence dashboard

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Import Path Errors
```bash
# Problem: Module not found errors
# Solution: Check path aliases in tsconfig.json
# Mobile: Use @features/*, @shared/*, etc.
# Web: Use @/app/*, @/components/*, etc.
```

#### 2. Backend Connection Issues
```bash
# Problem: Convex connection failed
# Solutions:
cd backend && npx convex dev  # Start backend
npx convex deploy  # Deploy if needed
# Check NEXT_PUBLIC_CONVEX_URL in .env.local
```

#### 3. Authentication Problems
```bash
# Problem: Clerk authentication errors
# Solutions:
# 1. Verify CLERK_PUBLISHABLE_KEY in .env.local
# 2. Check Clerk dashboard for domain configuration
# 3. Ensure redirect URLs are whitelisted
# 4. Clear browser cookies and try again
```

#### 4. Type Errors
```bash
# Problem: TypeScript compilation errors
# Solutions:
pnpm run typecheck  # Identify all type errors
cd backend && npx convex dev  # Regenerate Convex types
pnpm install  # Ensure all dependencies are installed
```

#### 5. Build Failures
```bash
# Problem: Build process fails
# Solutions:
pnpm run clean  # Clear all build artifacts
rm -rf node_modules && pnpm install  # Reinstall dependencies
npx expo prebuild --clean  # For mobile
```

#### 6. Payment Integration Issues
```bash
# Problem: Maya payment not working
# Solutions:
# 1. Verify Maya API keys in .env.local
# 2. Check webhook URL is accessible
# 3. Use sandbox mode for testing
# 4. Monitor Maya dashboard logs
```

## Environment Setup Guide

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm 9.15.2+ (`npm install -g pnpm`)
- Git
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense (for web admin)
  - React Native Tools (for mobile)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/emedicard-project.git
cd emedicard-project

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/mobile/.env.example apps/mobile/.env.local
cp apps/webadmin/.env.example apps/webadmin/.env.local
cp backend/.env.example backend/.env.local

# 4. Configure services
# - Set up Clerk account and add keys
# - Set up Convex project and add deployment URL
# - Set up Maya sandbox account (for payments)

# 5. Start development servers
pnpm run dev  # Starts all applications

# Or start individually:
cd backend && npx convex dev  # Backend first
pnpm run dev --filter=mobile  # Mobile app
pnpm run dev --filter=webadmin  # Web admin
```

### Platform-Specific Setup

#### Mobile Development
```bash
# iOS (macOS only)
cd apps/mobile/ios && pod install
npx expo run:ios

# Android
# Ensure Android Studio and emulator are installed
npx expo run:android

# Using Expo Go (quick testing)
npx expo start
# Scan QR code with Expo Go app
```

#### Web Admin Development
```bash
cd apps/webadmin
pnpm dev
# Open http://localhost:3000
```

### Deployment

#### Mobile Deployment
```bash
# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

#### Web Deployment
```bash
# Deploy to Vercel
vercel --prod
```

#### Backend Deployment
```bash
cd backend
npx convex deploy --prod
```

## Important Notes & Conventions

### ⚠️ Critical Rules

1. **Never use backward compatibility imports** - Always use current import patterns
2. **Always use responsive utilities** in mobile app (scale, moderateScale, verticalScale)
3. **Documentation goes in docs/ folder** for all projects
4. **Use consolidated backend** at `backend/convex/` - DO NOT use archived folders
5. **Follow payment flow** - Submit-first-pay-later pattern with Maya

### 📁 Directory Guidelines

- **DO USE**:
  - `backend/convex/` for all backend functions
  - `apps/mobile/app/` for new mobile screens
  - `apps/webadmin/app/` for new web pages

- **DO NOT USE**:
  - `convex_archived/` (reference only)
  - `apps/mobile/src/screens/` for new screens (legacy)

### 🎨 Design System

- **Mobile**: Custom component library in `src/shared/ui/`
- **Web**: Tailwind CSS 4 with custom configuration
- **Colors**: Consistent palette across platforms
- **Typography**: Standardized scale and fonts
- **Spacing**: 4px base unit system

## Support & Resources

### Documentation
- Mobile: See `apps/mobile/AGENTS.md` for detailed mobile documentation
- Web Admin: See `apps/webadmin/AGENTS.md` for admin documentation
- Backend: See `backend/README.md` for backend details

### Getting Help
1. Review this documentation thoroughly
2. Check application-specific AGENTS.md files
3. Search existing GitHub issues
4. Contact the development team
5. Refer to official documentation:
   - [React Native](https://reactnative.dev)
   - [Expo](https://docs.expo.dev)
   - [Next.js](https://nextjs.org/docs)
   - [Convex](https://docs.convex.dev)
   - [Clerk](https://clerk.dev/docs)

---

**Project Version**: 2.0.0
**Last Updated**: October 2025
**Maintained by**: eMediCard Development Team

This consolidated monorepo approach ensures consistent development experience across the entire eMediCard ecosystem while maintaining the flexibility to work on individual applications as needed.
