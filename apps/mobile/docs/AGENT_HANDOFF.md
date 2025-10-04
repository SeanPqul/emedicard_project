# Agent Handoff: Import Error Fixes and Next Steps

Context: This project (working repo) is a refactor of the master project into an FSD monorepo layout. We are fixing import-related issues to get the app to start. UI and type-level issues will be handled later. Always double-check in BOTH codebases before creating anything new to avoid duplication:
- Working repo: C:\Em (default to current app: C:\Em\apps\mobile)
- Master reference: C:\Users\User\Desktop\emedicard_project


1) Completed fixes (imports only)
- Health Cards utilities (FSD-compliant)
  - Created: C:\Em\apps\mobile\src\features\healthCards\lib\health-card-display-utils.ts
    - getCardColor, getCardStatus, getStatusColor, generateVerificationUrl, formatDate, generateCardHtml, getHealthCardTypeName, getPaymentMethods
    - generateCardHtml updated to tolerate missing jobCategory on backend records
  - Created: C:\Em\apps\mobile\src\features\healthCards\lib\index.ts
  - Updated: C:\Em\apps\mobile\src\features\healthCards\index.ts to export * from './lib'

- Upload feature index cleanup
  - Updated: C:\Em\apps\mobile\src\features\upload\index.ts
    - Removed export * from './lib' (folder doesn’t exist)

- Orientation feature exports
  - Updated: C:\Em\apps\mobile\src\features\orientation\index.ts
    - export * from './model' (no lib folder)

- Notification feature exports
  - Updated: C:\Em\apps\mobile\src\features\notification\index.ts
    - Commented out export * from './components' (no components yet)

- Application validation (FSD-compliant)
  - Created: C:\Em\apps\mobile\src\features\application\lib\validation.ts
  - Created: C:\Em\apps\mobile\src\features\application\lib\index.ts
  - Note: validateApplicationStep and related types now resolve from @features/application/lib/validation

- Form storage (import fixes and in-file utilities)
  - Updated: C:\Em\apps\mobile\src\features\application\services\formStorage.ts
    - Switched storage import to existing helper: import { storage as cacheStorage, setObject, getObject, removeItem } from '@shared/services/storage/storage'
    - Added missing in-file definitions:
      - StorageKeys (TEMP_FORM_DATA, TEMP_UPLOAD_QUEUE)
      - storageUtils (safeSet, safeGet, removeKey)

- Requirements mapping (entities layer)
  - Created: C:\Em\apps\mobile\src\entities\application\lib\requirementsMapper.ts
  - Created: C:\Em\apps\mobile\src\entities\application\lib\index.ts
  - Used by ApplyScreen: import { transformRequirements } from '@entities/application/lib/requirementsMapper'

- Network hook (remove dependency on non-existent lib)
  - Updated: C:\Em\apps\mobile\src\shared\hooks\useNetwork.ts
    - Rewrote to use @react-native-community/netinfo directly (no '@shared/lib/network')


2) Verification steps used before creating anything
Always apply this workflow to avoid duplication and misplacement:
- Search in the working repo first:
  - grep for symbol or file candidates across C:\Em
- If missing, search in master reference:
  - grep across C:\Users\User\Desktop\emedicard_project
- Only create new files after confirming non-existence in both
- Place new files according to FSD layer rules (see section 4)

We followed this for:
- Health card utilities (found in master under src/utils/health-card-display-utils.ts, migrated to features/healthCards/lib)
- Application validation (port into features/application/lib)
- Requirements mapper (found in master under src/utils/application/requirementsMapper.ts, migrated to entities/application/lib)
- Network utilities (no shared lib in either project; switched hook to NetInfo, aligning with master’s approach of a self-contained hook)


3) Additional fixes completed
- Mobile cache manager wrapper (FSD-compliant)
  - Created: C:\Em\apps\mobile\src\shared\lib\cache\mobileCacheManager.ts
    - Wrapper around existing cacheUtils to provide expected interface
    - Compatible with useOptimizedDashboard hook requirements
  - Created: C:\Em\apps\mobile\src\shared\lib\index.ts (barrel export)

- Error handling utilities (FSD-compliant)
  - Created: C:\Em\apps\mobile\src\shared\lib\errors\AppError.ts
    - AppError class with AppErrorType enum
    - Required by payment flow hooks
  - Created: C:\Em\apps\mobile\src\shared\lib\errors\index.ts
  - Updated: C:\Em\apps\mobile\src\shared\lib\index.ts to export errors

- Payment flow utilities (FSD-compliant)
  - Created: C:\Em\apps\mobile\src\features\payment\lib\paymentFlow.ts
    - submitPayment, submitPaymentWithoutReceipt functions
    - PaymentMethod, PaymentSubmissionData, PaymentFlowResult, PaymentServices types
  - Created: C:\Em\apps\mobile\src\features\payment\lib\index.ts
  - Updated: C:\Em\apps\mobile\src\features\payment\index.ts to export lib

4) Current status
- All import errors have been resolved
- App bundles successfully (2710ms, 2518 modules)
- Runtime errors present:
  - "ExceptionsManager should be set up after React DevTools"
  - "TypeError: property is not writable" (Hermes engine)
  - "TypeError: Cannot read property 'default' of undefined"
- These are runtime issues, not import issues

### Analysis of mobileCacheManager issue:
- The master project has `mobileCacheManager` in `src/utils/mobileCacheManager.ts`
- The working directory already has cache utilities in `src/shared/services/storage/storage.ts`:
  - `cacheUtils.setWithExpiry()` - Set values with expiration
  - `cacheUtils.getWithExpiry()` - Get values if not expired
  - `cacheUtils.clearExpired()` - Clean expired items
  - `cacheUtils.clearAllCache()` - Clear all cache

### Options to fix:
1. Create a wrapper around existing `cacheUtils` to provide the expected `mobileCacheManager` interface
   - Create: `src/shared/lib/cache/mobileCacheManager.ts`
   - Wrap existing cacheUtils with methods like `cacheJobCategories()`, `getCachedJobCategories()`, etc.
2. Update `useOptimizedDashboard.ts` to use `cacheUtils` directly instead of `mobileCacheManager`
3. Copy the implementation from master and adapt to use existing storage service

**Note**: The `shared/lib` directory doesn't exist yet, would need to be created.

## Completed Maya Payment Flow Refactoring (FSD Architecture)
The Maya payment flow has been successfully refactored following Feature-Sliced Design principles:

### Created files:
- C:\Em\apps\mobile\src\processes\mayaPaymentFlow\lib\utils.ts
  - formatCurrency() - Formats amounts in Philippine peso
  - calculateTotalAmount() - Adds amount + service fee
  - getPaymentStatusMessage() - Maps status to user messages
  - generatePaymentReference() - Creates unique payment refs
  - validatePaymentAmount() - Validates payment amounts
  - logPaymentEvent() - Dev mode logging

- C:\Em\apps\mobile\src\processes\mayaPaymentFlow\lib\maya-app-integration.ts
  - openMayaCheckout() - Opens Maya checkout URL via Linking API

- C:\Em\apps\mobile\src\processes\mayaPaymentFlow\lib\deep-link-handler.ts  
  - setupDeepLinkListeners() - Handles Maya payment return deep links
  - trackDeepLinkEvent() - Tracks deep link events

- C:\Em\apps\mobile\src\processes\mayaPaymentFlow\lib\index.ts
  - Barrel exports for all lib utilities

### Architecture notes:
- This is a refactored version of the master's usePaymentMaya hook
- Split into modular components following FSD principles
- All imports have been updated to use the new structure
- No duplication - the implementations are architecturally different

## Completed Responsive Layout Refactoring (FSD Architecture)
The Layout component and navigation structure have been successfully refactored with responsive design improvements:

### Updated files:
- C:\Em\apps\mobile\src\app\layout.tsx
  - Added responsive design with useWindowDimensions hook
  - Implemented dynamic sidebar visibility (auto-hide on mobile)
  - Added collapsible sidebar with toggle button
  - Enhanced responsive breakpoints (mobile: <768px, tablet: 768-1024px, desktop: >1024px)
  - Improved safe area handling and scroll behavior
  - Added smooth transitions and animations
  - Implemented responsive padding and spacing
  - Fixed navigation structure with proper segment handling
  - Added authentication state management integration

### Key improvements:
- **Responsive Breakpoints**: Proper mobile/tablet/desktop handling
- **Mobile Optimization**: Auto-hide sidebar, full-width content, hamburger menu
- **Tablet Support**: Collapsible sidebar, optimized spacing
- **Desktop Enhancement**: Wide sidebar, better content distribution
- **Navigation Fix**: Proper root segment detection and active state handling
- **Performance**: Memoized handlers, optimized re-renders
- **Accessibility**: Touch targets, focus states, ARIA labels

### Architecture notes:
- Follows FSD app layer conventions
- Uses existing shared hooks (useWindowDimensions, useAuth)
- Maintains backward compatibility with existing navigation structure
- Implements responsive design patterns consistently
- Proper TypeScript typing throughout

Other potential import fixes after maya utils (based on earlier typecheck snapshot):
- @shared/lib/cache/mobileCacheManager — check existence; if missing, either remove usage or create minimal cache wrapper in shared/lib/cache with actual implementation based on shared/services/storage
- @shared/lib/errors — create shared error types/utils if referenced, or temporarily replace with lightweight types in the call sites
- @features/payment/lib — if referenced, add minimal lib under features/payment/lib matching imports


4) Placement rules (FSD alignment)
- entities/*: Domain-level types and mappers (e.g., requirementsMapper)
- features/*/lib: Feature-specific pure utilities (e.g., healthCards display utils, application validation)
- processes/*/lib: Cross-feature process utilities (e.g., mayaPaymentFlow utils, deep link handlers)
- shared/*: Cross-cutting tooling (network, storage), but prefer reusing existing shared/services/storage/* where possible


5) Path alias references (from mobile CLAUDE.md)
- "@features/*": "./src/features/*"
- "@entities/*": "./src/entities/*"
- "@processes/*": "./src/processes/*"
- "@shared/*": "./src/shared/*"
- "@types/*": "./src/types/*"
- "@screens/*": "./src/screens/*"
- "@backend/*": "../../backend/*"

Use these aliases when updating imports. For backend types, prefer '@backend/convex/_generated/*' where applicable.


6) How to proceed (next agent checklist)
- Step 1: Fix mobileCacheManager import error
  - Check if cache manager exists elsewhere: grep for "mobileCacheManager" or "CacheManager"
  - If missing, either:
    a) Remove usage from useOptimizedDashboard.ts if not critical
    b) Create minimal cache wrapper in shared/lib/cache/mobileCacheManager.ts
    c) Update import to use existing shared/services/storage
  - Re-run: npm start
- Step 2: Continue fixing any remaining import errors
  - Follow the double-check policy (section 8)
  - Place files in correct FSD layers (section 4)
- Step 3: Re-run and iterate on remaining import issues only (defer UI and type strictness for later)
  - npm start (bundle)
  - npm run typecheck (optional; expect UI/type issues for later)


7) Commands
- Bundle to see import errors:
```bash path=null start=null
npm start
```
- Typecheck (optional now; will surface many UI/type issues to handle later):
```bash path=null start=null
npm run typecheck
```


8) Double-check policy (must follow)
Before creating any file or function:
- Search for it in the working repo (C:\Em) and the master reference (C:\Users\User\Desktop\emedicard_project)
- Only create if confirmed missing in both
- Place the implementation in the correct FSD layer
- Prefer reusing existing shared/services/storage instead of inventing new storage libs


9) Notes
- We intentionally focused on import errors to allow the app to start. UI and stricter TS issues remain and should be addressed later.
- The useNetwork hook now mirrors a self-contained approach aligned with master (NetInfo-based). If a future shared network lib is required, add it under shared/lib/network only after confirming it doesn’t already exist in either codebase.


— End of handoff —

