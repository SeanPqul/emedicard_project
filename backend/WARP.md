# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**eMediCard Backend** - Unified Convex backend for health card application processing system serving both mobile app and webadmin dashboard.

This is a consolidated, optimized backend (reduced from 88 to ~68 functions) that handles:
- Health card applications with document uploads and review workflows
- Multi-method payment processing (Gcash, Maya API, cash payments)
- Orientation booking and attendance tracking
- Document verification with OCR text extraction
- QR-based health card verification
- Admin workflow with role-based access control

## Development Commands

### Core Development
```bash
# Start Convex development server (watches for changes, auto-deploys)
npm run dev

# Type checking
npm run typecheck

# Deploy to production
npm run deploy

# Generate Convex types
convex codegen

# Clean build artifacts
npm run clean
```

### OCR Service (Port 5001)
```bash
# Start OCR service for document text extraction
npm run tunnel        # Start with ngrok tunnel (for webhooks)
cd ocr-service && npm start   # Start OCR service standalone
```

**Note:** The OCR service must be running for document upload/classification features. It uses Tesseract.js for text extraction from images and PDFs.

## Architecture Overview

### Backend Framework: Convex
- **Real-time serverless backend** with automatic type generation
- **File-based routing**: Each file exports mutations/queries/actions
- **Auto-generated API**: TypeScript definitions in `convex/_generated/`
- **No build step for functions**: Convex deploys directly from TypeScript

### Key Architectural Patterns

#### 1. **Unified Backend for Two Clients**
Both mobile and webadmin consume the same backend but use different function subsets:
- **Mobile**: Creates applications in "Draft" status, submits with documents
- **Webadmin**: Uses admin functions for review, approval, and management
- **Authentication**: Supports both Clerk JWT issuers via unified auth.config.ts

#### 2. **Application Lifecycle State Machine**
```
Draft → Submitted → For Payment Validation → 
  → For Orientation (Yellow Card only) / For Document Verification →
  → Referred for Medical Management (medical findings) / Documents Need Revision (doc issues) →
  → Approved (health card issued)
```

**Critical Status Distinctions:**
- **"Rejected"**: Reserved for PERMANENT rejection only (fraud, max attempts exceeded)
- **"Referred for Medical Management"**: Medical findings requiring doctor consultation
- **"Documents Need Revision"**: Non-medical document issues requiring resubmission

#### 3. **Document Review Workflow**
Documents have independent review status:
- **"Pending"**: Awaiting admin review
- **"Approved"**: Document verified
- **"Referred"**: Medical findings, needs doctor consultation
- **"NeedsRevision"**: Non-medical issue, needs resubmission

**Important**: Use `documentReferralHistory` table (not rejection) for tracking document issues. Preserve original files in `referredFileId` for audit trail.

#### 4. **Payment System with Resubmission**
- **Multiple payment methods**: Gcash, Maya (API integrated), BaranggayHall, CityHall
- **Rejection with resubmission**: When payment rejected, user can resubmit
  - Old payment deleted, new created
  - Rejection history preserved in `paymentRejectionHistory`
  - Admins filtered by `managedCategories` for notifications
- **Maya integration**: Automatic webhook updates via `/maya-webhook` HTTP endpoint
- See `PAYMENT_SYSTEM_GUIDE.md` for detailed workflow

#### 5. **Orientation System (Recently Migrated)**
**Unified Table**: `orientationBookings` (merged from old `orientations` + `orientationSessions`)
- Status flow: `scheduled → checked-in → completed`
- Attendance tracking via check-in/check-out with inspector IDs
- Only Yellow Card (Food Handler) requires orientation
- See `MIGRATION_QUICK_REFERENCE.md` for migration details

#### 6. **Job Category-Based Requirements**
- Requirements defined via `jobCategoryDocuments` junction table
- Admins can have `managedCategories` to filter their dashboard
- Notifications sent only to admins managing relevant job categories

## Directory Structure

```
convex/
├── schema.ts                    # Database schema (single source of truth)
├── auth.config.ts              # Unified auth for mobile + webadmin
├── http.ts                     # HTTP routes (webhooks, secure document access)
├── crons.ts                    # Scheduled jobs
│
├── applications/               # Application lifecycle
│   ├── createApplication.ts    # Mobile: Draft creation
│   ├── submitApplication.ts    # Mobile: Submit with documents
│   ├── createForm.ts          # Webadmin: Direct submission
│   ├── getUserApplications.ts # User's applications
│   └── list.ts                # Admin: All applications
│
├── users/                     # User management
│   ├── createUser.ts          # User creation (via webhook)
│   ├── getCurrentUser.ts      # Get authenticated user
│   ├── updateRole.ts          # Admin role management
│   └── roles.ts               # Role definitions
│
├── admin/                     # Admin functions
│   ├── validatePayment.ts     # Payment approval workflow
│   ├── finalizeApplication.ts # Approve application → issue health card
│   ├── reviewDocument.ts      # Document review
│   ├── documents/             # Document management actions
│   │   ├── referDocument.ts   # Medical referral workflow
│   │   ├── rejectDocument.ts  # Document issue workflow
│   │   └── sendReferralNotifications.ts
│   └── payments/
│       └── rejectPayment.ts   # Payment rejection with history
│
├── documents/                 # Document handling
│   ├── generateSecureUrl.ts  # HMAC-signed URLs for secure access
│   ├── documentAccessLogs.ts # Audit logging for document access
│   └── hmacUtils.ts          # HMAC signature verification
│
├── payments/                  # Payment processing
│   ├── createPayment.ts       # Payment creation with resubmission detection
│   ├── maya/                  # Maya API integration
│   │   ├── checkout.ts        # Create Maya checkout sessions
│   │   ├── webhook.ts         # Handle Maya webhooks
│   │   └── statusUpdates.ts   # Payment status updates
│   └── getPaymentByFormId.ts
│
├── healthCards/               # Health card issuance
│   ├── issueHealthCard.ts     # Generate health card with QR
│   └── getUserCards.ts        # User's health cards
│
├── orientations/              # Orientation management (MIGRATED SCHEMA)
│   └── attendance.ts          # Check-in/out, attendance tracking
│
├── orientationSchedules/      # Schedule management
│   ├── bookOrientationSlot.ts # Book orientation
│   └── getUserOrientationSession.ts
│
├── verification/              # QR verification
│   ├── logQRScan.ts           # Log QR scans
│   └── getVerificationStats.ts
│
├── ocr/                       # OCR integration
│   └── extractDocumentText.ts # Call OCR service for text extraction
│
├── lib/                       # Shared utilities
│   └── roles.ts               # Role checking helpers
│
└── _generated/                # Auto-generated by Convex (DO NOT EDIT)
```

## Key Implementation Details

### Authentication & Authorization

**Clerk Integration**: Unified config supports both mobile and webadmin
```typescript
// convex/auth.config.ts uses environment variables
CLERK_JWT_ISSUER_DOMAIN       // Webadmin
EXPO_CLERK_FRONTEND_API_URL   // Mobile
```

**Role-Based Access Control**:
```typescript
import { AdminRole, InspectorRole } from "./lib/roles";

// In mutation/query handler:
await AdminRole(ctx);  // Throws if not admin
await InspectorRole(ctx);  // Throws if not inspector/admin
```

**Managed Categories**: Admins can be assigned specific job categories via `managedCategories` array. Filter queries/notifications accordingly.

### Database Patterns

**Timestamps**: Always use `v.float64()` for timestamps (more precise than `v.number()`)
```typescript
uploadedAt: v.float64()
updatedAt: v.optional(v.float64())
```

**Indexes**: Schema includes indexes for common queries. Use them:
```typescript
// Good - uses index
.withIndex("by_application", (q) => q.eq("applicationId", appId))

// Bad - full table scan
.filter((q) => q.eq(q.field("applicationId"), appId))
```

**Soft Deletes**: Never delete documents/payments. Mark as inactive or preserve in history tables (`paymentRejectionHistory`, `documentReferralHistory`).

### HTTP Endpoints (convex/http.ts)

1. **`/clerk-webhook`** (POST): User creation webhook from Clerk
2. **`/maya-webhook`** (POST): Payment status updates from Maya
3. **`/payment-redirect`** (GET): Maya payment redirect handler (returns HTML with deep link)
4. **`/secure-document`** (GET): HMAC-signed secure document access
   - Query params: `signature`, `documentId`, `expiresAt`
   - Verifies signature against authorized users
   - Logs all access attempts to `documentAccessLogs`

### Secure Document Access

Documents use HMAC signatures for secure access:
```typescript
// Generate signed URL (in backend)
const url = await generateSecureDocumentUrl(documentId, userId, expiresAt);

// URL format: /secure-document?documentId=...&signature=...&expiresAt=...
// Signature verified against DOCUMENT_SIGNING_SECRET
```

**Access logging**: Every document access attempt logged with status, IP, user agent for security audit.

### Notification System

When creating notifications for admins, filter by managed categories:
```typescript
const relevantAdmins = allAdmins.filter(admin => 
  !admin.managedCategories || 
  admin.managedCategories.length === 0 || 
  admin.managedCategories.includes(application.jobCategoryId)
);
```

### OCR Service Integration

The OCR service runs separately on port 5001:
```typescript
// From Convex action
const response = await fetch("http://localhost:5001/ocr", {
  method: "POST",
  body: formData
});
const { text } = await response.json();
```

**When to extract text:**
- Document uploads (store in `documentUploads.extractedText`)
- Document classification
- Search functionality (future enhancement)

## Common Development Tasks

### Adding a New Application Status

1. Update schema: `convex/schema.ts` → `applications.applicationStatus`
2. Update state machine logic in relevant functions:
   - `applications/submitApplication.ts`
   - `admin/finalizeApplication.ts`
   - `payments/handleRedirectSuccess.ts`
3. Add notification templates
4. Update mobile/webadmin UI to display new status

### Adding a New Payment Method

1. Add to schema: `payments.paymentMethod` union
2. Update `payments/createPayment.ts` validation
3. Add payment provider logic if API-based (like Maya)
4. Update admin validation workflow
5. Add to `PAYMENT_SYSTEM_GUIDE.md`

### Adding a New Document Type

1. Seed `documentTypes` table via admin
2. Link to job categories via `jobCategoryDocuments` junction table
3. Update mobile upload flow
4. Add OCR classification rules if needed
5. Update admin review interface

### Debugging Payment Issues

1. Check `paymentLogs` table for event history
2. Verify webhook signature in `/maya-webhook`
3. Check `paymentRejectionHistory` for rejection tracking
4. Ensure admin has correct `managedCategories`
5. See `PAYMENT_SYSTEM_GUIDE.md` for detailed troubleshooting

### Testing Orientation Workflow

1. Verify `orientationSchedules` has available slots
2. Book slot via `orientationSchedules/bookOrientationSlot`
3. Check-in via `orientations/attendance.checkIn` (inspector only)
4. Check-out via `orientations/attendance.checkOut`
5. Verify status updates: `scheduled → checked-in → completed`

## Environment Variables

```bash
# Clerk Authentication
CLERK_WEBHOOK_SECRET=whsec_...           # For webhook verification
CLERK_JWT_ISSUER_DOMAIN=https://...     # Webadmin auth
EXPO_CLERK_FRONTEND_API_URL=https://... # Mobile auth

# Maya Payment Gateway (Sandbox)
MAYA_PUBLIC_KEY=pk-...
MAYA_SECRET_KEY=sk-...
MAYA_API_URL=https://pg-sandbox.paymaya.com
MAYA_WEBHOOK_SECRET=whsec_...

# Application URLs
APP_URL=http://localhost:3000           # Webadmin
MOBILE_APP_URL=exp://localhost:8081     # Mobile deep link

# Document Security
DOCUMENT_SIGNING_SECRET=...             # HMAC secret for signed URLs

# Convex
CONVEX_DEPLOYMENT=...                   # Auto-set by Convex
```

## Testing Strategy

### Local Development
1. Run `npm run dev` to start Convex dev server
2. Use Convex dashboard to test mutations/queries directly
3. Check function logs in real-time via dashboard
4. Use `console.log` liberally - Convex streams logs instantly

### Testing Payments
- Use Maya sandbox credentials
- Test webhook locally with ngrok: `npm run tunnel`
- Webhook URL format: `https://<ngrok-url>/maya-webhook`

### Testing Document Access
- Generate signed URLs via `documents/generateSecureUrl`
- Test expiration by manipulating `expiresAt` timestamp
- Verify access logs in `documentAccessLogs` table

## Important Notes

- **Never delete documents or payments** - preserve for audit trail
- **Use proper medical terminology**: "Referred for Medical Management" not "Rejected"
- **Filter admin notifications** by managed categories to avoid spam
- **Yellow Card orientation requirement**: Check `jobCategory.requireOrientation`
- **Payment resubmission**: Old payment deleted, new created, history preserved
- **Orientation schema migrated**: Use `orientationBookings` not old tables
- **OCR service required**: Must be running for document upload features
- **HMAC signatures expire**: Default 1 hour for document access URLs

## Migration Notes

The orientation system was recently migrated from dual tables to unified `orientationBookings`. If you need to:
- **Run migration**: See `MIGRATION_QUICK_REFERENCE.md`
- **Rollback**: Use `migrations:rollbackMigration` with batch UUID
- **Verify**: Use `migrations:verifyMigration` for data integrity checks

## Resources

- **Convex Docs**: https://docs.convex.dev
- **Payment System Guide**: See `PAYMENT_SYSTEM_GUIDE.md`
- **Orientation Migration**: See `MIGRATION_QUICK_REFERENCE.md`
- **Convex Dashboard**: https://dashboard.convex.dev
- **Maya API Docs**: https://developers.paymaya.com
