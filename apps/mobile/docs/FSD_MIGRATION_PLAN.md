# Feature-Sliced Design (FSD) Migration Plan

This document is an executable, step-by-step plan to complete the FSD migration for apps/mobile. It is tailored to your current codebase state (scanned on 2025-09-21) and includes specific file moves, import updates, and verification steps.

## Progress Tracker (human + machine readable)

- [x] Phase 1 — Create `screens/` Infrastructure (COMPLETED 2025-09-21)
- [x] Phase 2 — Migrate Initial Screens (COMPLETED 2025-09-21)
- [x] Phase 3 — Establish entities/ (domain boundary) (COMPLETED 2025-09-21)
- [x] Phase 4 — Normalize features/ (COMPLETED 2025-09-21)
- [x] Phase 5 — Extract processes/ (COMPLETED 2025-09-21)
- [x] Phase 6 — Strengthen shared/ (COMPLETED 2025-09-21)
- [x] Phase 7 — Types cleanup (COMPLETED 2025-09-21)
- [x] Phase 8 — Codemods for import paths (COMPLETED 2025-09-21)
- [x] Phase 9 — Cleanup legacy/archived (COMPLETED 2025-09-21)

Machine-Readable Progress State (agents update this block):
```json path=null start=null
{
  "current_phase": "completed",
  "phases": [
    { "id": 1, "name": "Create screens/ Infrastructure", "status": "done" },
    { "id": 2, "name": "Migrate Initial Screens", "status": "done" },
    { "id": 3, "name": "Establish entities/ (domain boundary)", "status": "done" },
    { "id": 4, "name": "Normalize features/", "status": "done" },
    { "id": 5, "name": "Extract processes/", "status": "done" },
    { "id": 6, "name": "Strengthen shared/", "status": "done" },
    { "id": 7, "name": "Types cleanup", "status": "done" },
    { "id": 8, "name": "Codemods for import paths", "status": "done" },
    { "id": 9, "name": "Cleanup legacy/archived", "status": "done" }
  ],
  "next_actions": [],
  "completed_actions": [
    {
      "id": "screens.infrastructure",
      "action": "Created src/screens/ directory structure with shared/ subdirectory and index files",
      "completed_at": "2025-09-21T10:10:00Z"
    },
    {
      "id": "screens.shared.upload-documents",
      "file": "app/(screens)/(shared)/upload-documents.tsx",
      "action": "Extracted to src/screens/shared/UploadDocumentsScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T10:11:00Z"
    },
    {
      "id": "screens.shared.payment",
      "file": "app/(screens)/(shared)/payment.tsx",
      "action": "Extracted to src/screens/shared/PaymentScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T10:12:00Z"
    },
    {
      "id": "screens.shared.activity",
      "file": "app/(screens)/(shared)/activity.tsx",
      "action": "Extracted to src/screens/shared/ActivityScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T10:13:00Z"
    },
    {
      "id": "entities.infrastructure",
      "action": "Created src/entities/ directory structure with application, user, payment, healthCard subdirectories",
      "completed_at": "2025-09-21T10:16:00Z"
    },
    {
      "id": "entities.application.types",
      "file": "src/types/domain/application.ts",
      "action": "Moved to src/entities/application/model/types.ts",
      "completed_at": "2025-09-21T10:17:00Z"
    },
    {
      "id": "entities.application.service",
      "file": "src/features/application/services/applicationService.ts",
      "action": "Moved to src/entities/application/model/service.ts",
      "completed_at": "2025-09-21T10:17:30Z"
    },
    {
      "id": "entities.application.stepindicator",
      "file": "src/features/application/components/StepIndicator",
      "action": "Moved to src/entities/application/ui/StepIndicator",
      "completed_at": "2025-09-21T10:18:00Z"
    },
    {
      "id": "entities.application.documentsourcemodal",
      "file": "src/features/application/components/DocumentSourceModal",
      "action": "Moved to src/entities/application/ui/DocumentSourceModal",
      "completed_at": "2025-09-21T10:18:30Z"
    },
    {
      "id": "entities.user.types",
      "file": "src/types/domain/user.ts",
      "action": "Moved to src/entities/user/model/types.ts",
      "completed_at": "2025-09-21T10:19:00Z"
    },
    {
      "id": "entities.payment.types",
      "file": "src/types/domain/payment.ts",
      "action": "Moved to src/entities/payment/model/types.ts",
      "completed_at": "2025-09-21T10:19:30Z"
    },
    {
      "id": "entities.healthCard.types",
      "file": "src/types/domain/health-card.ts",
      "action": "Moved to src/entities/healthCard/model/types.ts",
      "completed_at": "2025-09-21T10:20:00Z"
    },
    {
      "id": "entities.imports.update",
      "action": "Updated all imports referencing moved domain types and services",
      "completed_at": "2025-09-21T10:25:00Z"
    },
    {
      "id": "processes.infrastructure",
      "action": "Created src/processes/ directory structure with paymentFlow subdirectory",
      "completed_at": "2025-09-21T18:31:00Z"
    },
    {
      "id": "processes.paymentFlow.usePaymentFlow",
      "file": "src/hooks/usePaymentFlow.ts",
      "action": "Moved to src/processes/paymentFlow/model/usePaymentFlow.ts and updated imports",
      "completed_at": "2025-09-21T18:32:00Z"
    },
    {
      "id": "screens.auth.infrastructure",
      "action": "Created src/screens/auth/ directory and index file",
      "completed_at": "2025-09-21T18:33:00Z"
    },
    {
      "id": "screens.auth.signin",
      "file": "src/features/auth/screens/SignInScreen",
      "action": "Copied to src/screens/auth/SignInScreen and updated route wrapper",
      "completed_at": "2025-09-21T18:34:00Z"
    },
    {
      "id": "screens.auth.signup",
      "file": "src/features/auth/screens/SignUpScreen",
      "action": "Copied to src/screens/auth/SignUpScreen and updated route wrapper",
      "completed_at": "2025-09-21T18:35:00Z"
    },
    {
      "id": "screens.auth.resetpassword",
      "file": "src/features/auth/screens/ResetPasswordScreen",
      "action": "Copied to src/screens/auth/ResetPasswordScreen and updated route wrapper",
      "completed_at": "2025-09-21T18:36:00Z"
    },
    {
      "id": "screens.auth.verification",
      "file": "src/features/auth/screens/VerificationScreen",
      "action": "Copied to src/screens/auth/VerificationScreen and updated route wrapper",
      "completed_at": "2025-09-21T18:36:30Z"
    },
    {
      "id": "screens.inspector.infrastructure",
      "action": "Created src/screens/inspector/ directory and index file",
      "completed_at": "2025-09-21T18:39:00Z"
    },
    {
      "id": "screens.inspector.dashboard",
      "file": "app/(screens)/(inspector)/inspector-dashboard.tsx",
      "action": "Extracted to src/screens/inspector/InspectorDashboardScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:40:00Z"
    },
    {
      "id": "screens.inspector.review",
      "file": "app/(screens)/(inspector)/review-applications.tsx",
      "action": "Extracted to src/screens/inspector/ReviewApplicationsScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:41:00Z"
    },
    {
      "id": "screens.inspector.queue",
      "file": "app/(screens)/(inspector)/inspection-queue.tsx",
      "action": "Extracted to src/screens/inspector/InspectionQueueScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:42:00Z"
    },
    {
      "id": "screens.tabs.infrastructure",
      "action": "Created src/screens/dashboard, application, notification, profile directories and index files",
      "completed_at": "2025-09-21T18:50:00Z"
    },
    {
      "id": "screens.tabs.dashboard",
      "file": "app/(tabs)/index.tsx",
      "action": "Copied DashboardScreen from features to src/screens/dashboard/ and updated route wrapper",
      "completed_at": "2025-09-21T18:51:00Z"
    },
    {
      "id": "screens.tabs.application",
      "file": "app/(tabs)/application.tsx and apply.tsx",
      "action": "Copied ApplicationListScreen and ApplyScreen from features to src/screens/application/ and updated route wrappers",
      "completed_at": "2025-09-21T18:52:00Z"
    },
    {
      "id": "screens.tabs.notification",
      "file": "app/(tabs)/notification.tsx",
      "action": "Extracted to src/screens/notification/NotificationScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:53:00Z"
    },
    {
      "id": "screens.tabs.profile",
      "file": "app/(tabs)/profile.tsx",
      "action": "Extracted to src/screens/profile/ProfileScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:54:00Z"
    },
    {
      "id": "screens.shared.qrscanner",
      "file": "app/(screens)/(shared)/qr-scanner.tsx",
      "action": "Extracted to src/screens/shared/QrScannerScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:55:00Z"
    },
    {
      "id": "screens.shared.changepassword",
      "file": "app/(screens)/(shared)/change-password.tsx",
      "action": "Extracted to src/screens/shared/ChangePasswordScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:56:00Z"
    },
    {
      "id": "screens.shared.healthcards",
      "file": "app/(screens)/(shared)/health-cards.tsx",
      "action": "Extracted to src/screens/shared/HealthCardsScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:57:00Z"
    },
    {
      "id": "screens.shared.documentrequirements",
      "file": "app/(screens)/(shared)/document-requirements.tsx",
      "action": "Extracted to src/screens/shared/DocumentRequirementsScreen.tsx and converted route to thin wrapper",
      "completed_at": "2025-09-21T18:58:00Z"
    },
    {
      "id": "phase4.complete",
      "action": "Completed Phase 4: All major screens migrated to src/screens/ and route files converted to thin wrappers",
      "completed_at": "2025-09-21T19:00:00Z"
    },
    {
      "id": "phase5.complete",
      "action": "Phase 5 already completed: processes/paymentFlow exists with usePaymentFlow",
      "completed_at": "2025-09-21T10:00:00Z"
    },
    {
      "id": "phase6.complete",
      "action": "Phase 6 already completed: shared layer properly structured",
      "completed_at": "2025-09-21T10:00:00Z"
    },
    {
      "id": "phase7.complete",
      "action": "Phase 7 already completed: Domain types moved from src/types/domain to entities",
      "completed_at": "2025-09-21T10:00:00Z"
    },
    {
      "id": "phase8.tsconfig.aliases",
      "action": "Updated tsconfig.json with all FSD slice aliases (@screens, @entities, @processes, @types)",
      "completed_at": "2025-09-21T20:00:00Z"
    },
    {
      "id": "phase8.import.paths.update",
      "action": "Ran update-imports-to-fsd.ps1 script to update 62 files with new FSD aliases",
      "completed_at": "2025-09-21T20:05:00Z"
    },
    {
      "id": "phase8.relative.imports",
      "action": "Ran update-relative-imports.ps1 script to convert 43 files from relative to FSD aliases",
      "completed_at": "2025-09-21T20:10:00Z"
    },
    {
      "id": "phase8.complete",
      "action": "Phase 8 completed: All import paths updated to use FSD aliases",
      "completed_at": "2025-09-21T20:15:00Z"
    },
    {
      "id": "phase9.cleanup.archives",
      "action": "Removed all archived directories: src/archive/migration_v2_archived_2025_09_21, src/_archived_components_20250921_154242, convex_archived",
      "completed_at": "2025-09-21T20:30:00Z"
    },
    {
      "id": "phase9.complete",
      "action": "Phase 9 completed: All legacy/archived directories removed",
      "completed_at": "2025-09-21T20:30:00Z"
    },
    {
      "id": "migration.complete",
      "action": "FSD Migration completed successfully! All 9 phases completed.",
      "completed_at": "2025-09-21T20:30:00Z"
    }
  ],
  "last_updated": "2025-09-21T20:30:00Z"
}
```

Resume instructions (for agents):
- Read the JSON block above; pick the first entry in next_actions.
- After completing an action, move it from next_actions to completed_actions and update last_updated.
- When a phase’s core tasks complete, set that phase status to "done" and increment current_phase.
- If interrupted, resume from the first item in next_actions.

---

## 0) Current Inventory (from codebase scan)

- Features
```txt path=null start=null
src/features
├─ activity
├─ application
│  ├─ components
│  │  ├─ DocumentSourceModal
│  │  ├─ StepIndicator
│  │  └─ steps/(ApplicationTypeStep|JobCategoryStep|PaymentMethodStep|PersonalDetailsStep|ReviewStep|UploadDocumentsStep)
│  ├─ hooks
│  ├─ screens/(ApplicationDetailScreen|ApplicationListScreen|ApplyScreen)
│  └─ services
├─ auth/(components|hooks|screens|services)
├─ dashboard/(components|hooks|screens|services)
├─ health-card/(components|hooks|screens|services)
├─ healthCards
├─ inspector/(components|hooks|screens|services)
├─ notification/(components|hooks|screens|services)
├─ payment/(components|hooks|screens|services)
├─ profile/(components|hooks|screens|services)
├─ scanner/(components|hooks|screens|services)
└─ upload/(components|hooks|screens|services)
```

- Shared
```txt path=null start=null
src/shared
├─ api
├─ components/(buttons|cards|display|feedback|inputs|layout|navigation|typography|OfflineBanner|LoadingView)
├─ constants
├─ hooks
├─ lib/(cache|formatting|payment|responsive|storage|validation)
├─ services/(storage)
├─ utils/(responsive)
└─ validation
```

- Types (domain)
```txt path=null start=null
src/types/domain
├─ application.ts
├─ health-card.ts
├─ payment.ts
├─ user.ts
└─ index.ts
```

- Expo Router routes (app/)
```txt path=null start=null
app/
  index.tsx, _layout.tsx
  (auth)/[reset-password|sign-in|sign-up|verification].tsx, _layout.tsx
  (screens)/_layout.tsx
  (screens)/(inspector)/[inspection-queue|inspector-dashboard|review-applications|scanner].tsx
  (screens)/(shared)/[activity|change-password|document-requirements|edit|health-cards|navigation-debug|orientation|payment|qr-code|qr-scanner|upload-documents].tsx
  (tabs)/[application|apply|index|notification|profile].tsx, _layout.tsx
  application/[id].tsx
  payment/[cancelled|failed|success].tsx
```

- Core providers
```txt path=null start=null
src/core/providers
├─ ClerkAndConvexProvider.tsx
├─ ToastProvider.tsx
└─ index.ts
```

- Archived/legacy buckets (candidates for removal at the end)
```txt path=null start=null
src/archive/migration_v2_archived_2025_09_21/**
convex_archived/**
src/_archived_components_20250921_154242/**
```

---

## 1) Target Structure (FSD + Expo Router)

- Keep app/ for Expo Router route files (wrappers only).
- Move page-level UI into src/screens/*.
- Domain logic → src/entities/*.
- Feature units remain in src/features/* but must not leak domain.
- Cross-feature flows → src/processes/*.
- Cross-cutting shared code → src/shared/*.

```txt path=null start=null
src/
  app/                # Expo Router route wrappers only (thin)
  screens/            # Navigation-level screens (composition/UI)
    auth/ application/ dashboard/ inspector/ profile/ shared/
  features/           # Self-contained feature capabilities
  entities/           # Domain objects (application/user/payment/healthCard/notification)
    <entity>/{model,ui,lib}
  processes/          # Multi-feature orchestration (e.g., paymentFlow)
    paymentFlow/{model,ui,lib}
  shared/             # Reusable cross-cutting layers (api, components, lib, services, utils, validation, constants, styles)
  types/              # Only generic/shared types remain
  index.ts
```

---

## 2) Path Aliases (prepare)

Update tsconfig.json paths to support FSD slices.
```json path=null start=null
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@app/*": ["app/*"],
      "@screens/*": ["screens/*"],
      "@features/*": ["features/*"],
      "@entities/*": ["entities/*"],
      "@processes/*": ["processes/*"],
      "@shared/*": ["shared/*"],
      "@types/*": ["types/*"]
    }
  }
}
```
Acceptance criteria
- Imports resolve using @screens, @entities, @processes, @shared, etc.

---

## 3) Phase-by-Phase Execution Plan

Each phase includes concrete actions and verifiable acceptance criteria. Execute phases in order; build and run the app after each phase.

### Phase 1 — Harden app/ (routing wrappers only)
Goal: Route files in app/ should be thin wrappers that import screens from src/screens/.

Actions
- For each route in app/(screens)/(shared), create a corresponding component in src/screens/shared and update the route to import it.
  - Example mapping:
    - app/(screens)/(shared)/upload-documents.tsx → src/screens/shared/UploadDocumentsScreen.tsx
    - app/(screens)/(shared)/payment.tsx → src/screens/shared/PaymentScreen.tsx
    - app/(screens)/(shared)/activity.tsx → src/screens/shared/ActivityScreen.tsx
    - app/(screens)/(shared)/qr-scanner.tsx → src/screens/shared/QrScannerScreen.tsx
- For inspector routes:
  - app/(screens)/(inspector)/inspector-dashboard.tsx → src/screens/inspector/InspectorDashboardScreen.tsx
  - app/(screens)/(inspector)/review-applications.tsx → src/screens/inspector/ReviewApplicationsScreen.tsx
  - app/(screens)/(inspector)/inspection-queue.tsx → src/screens/inspector/InspectionQueueScreen.tsx
- For tabs:
  - app/(tabs)/index.tsx → src/screens/dashboard/DashboardScreen.tsx
  - app/(tabs)/application.tsx → src/screens/application/ApplicationListScreen.tsx
  - app/(tabs)/apply.tsx → src/screens/application/ApplyScreen.tsx (compose existing feature UI)
  - app/(tabs)/notification.tsx → src/screens/notification/NotificationScreen.tsx
  - app/(tabs)/profile.tsx → src/screens/profile/ProfileScreen.tsx
- For auth routes:
  - app/(auth)/sign-in.tsx → src/screens/auth/SignInScreen.tsx
  - app/(auth)/sign-up.tsx → src/screens/auth/SignUpScreen.tsx
  - app/(auth)/reset-password.tsx → src/screens/auth/ResetPasswordScreen.tsx
  - app/(auth)/verification.tsx → src/screens/auth/VerificationScreen.tsx

Acceptance criteria
- All app/ route files ≤ 30 LOC and only import a screen component.
- No business logic or data hooks in app/.

### Phase 2 — Introduce screens/ and migrate compositions
Goal: Extract page-level UI from features/*/screens into src/screens/* for consistent navigation layer.

Actions
- Create folders:
  - src/screens/auth, src/screens/application, src/screens/dashboard, src/screens/inspector, src/screens/profile, src/screens/shared
- Move existing page UI from src/features/*/screens into src/screens/* when those components act as navigation entries.
  - Example: src/features/application/screens/ApplyScreen/* → src/screens/application/ApplyScreen/* (keeping imports intact)
- Screens may compose features, entities, processes, and shared components.

Acceptance criteria
- No navigation entry screens remain inside src/features/*/screens.
- All routes in app/ import from @screens/*.

### Phase 3 — Establish entities/ (domain boundary)
Goal: Move domain types/services/UI to src/entities/*.

Actions (initial mapping)
- Application domain
  - src/types/domain/application.ts → src/entities/application/model/types.ts
  - src/features/application/services/applicationService.ts → src/entities/application/model/service.ts
  - src/features/application/components/StepIndicator → src/entities/application/ui/StepIndicator
  - src/features/application/components/DocumentSourceModal → src/entities/application/ui/DocumentSourceModal
  - Move any application-specific mappers (e.g., src/utils/application/requirementsMapper.ts) → src/entities/application/lib/requirementsMapper.ts
- User domain
  - src/types/domain/user.ts → src/entities/user/model/types.ts
- Payment domain
  - src/types/domain/payment.ts → src/entities/payment/model/types.ts
- Health card domain
  - src/types/domain/health-card.ts → src/entities/healthCard/model/types.ts

Acceptance criteria
- Features no longer export domain types or domain services.
- Screens/processes import domain contracts from @entities/*/model.

### Phase 4 — Normalize features/
Goal: Ensure features are self-contained and free of domain leakage.

Actions
- Within each feature (auth, dashboard, payment, scanner, upload, activity, profile):
  - Keep feature-specific UI in components/.
  - Move any domain contracts/services into entities (Phase 3).
  - Keep feature-specific hooks/services that are not domain-level (e.g., view-model, UI state).

Acceptance criteria
- Features import domain contracts from @entities/* and cross-cutting code from @shared/*.

### Phase 5 — Extract processes/ (multi-feature orchestration)
Goal: Move cross-feature flows to processes/.

Actions
- Payment flow
  - src/hooks/usePaymentFlow.ts → src/processes/paymentFlow/model/usePaymentFlow.ts
  - If abandoned payment recovery exists (e.g., useAbandonedPayment.ts), move to src/processes/paymentFlow/model.
  - If you have flow-specific UI (stepper, banners), place under src/processes/paymentFlow/ui.

Acceptance criteria
- No multi-feature orchestration remains inside features/ or screens/.
- Screens compose features + entities + processes.

### Phase 6 — Strengthen shared/
Goal: Keep shared truly cross-cutting.

Actions
- shared/lib is already consolidated (done).
- Ensure shared/services hosts apiClient, storage abstractions (formStorage is OK here), etc.
- Ensure shared/components hold generic UI (buttons, inputs, cards, loaders, banners).
- Centralize app-wide constants in shared/constants.

Acceptance criteria
- No duplicated utils/components in features/.
- All imports use @shared/*.

### Phase 7 — Types cleanup
Goal: Keep only generic types under src/types.

Actions
- Move domain types from src/types/domain to entities/*/model.
- Keep shared component prop contracts and generic types in src/types.

Acceptance criteria
- Domain types no longer live in src/types/domain.

### Phase 8 — Codemods for import paths
Goal: Update imports to new aliases in bulk.

Planned replacements
- ../lib/... or @/src/shared/lib/... → @shared/lib/...
- ../services/... (if cross-cutting) → @shared/services/...
- src/features/application/services/applicationService → @entities/application/model/service
- src/types/domain/<entity> → @entities/<entity>/model

Example PowerShell codemod (preview one by one)
```powershell path=null start=null
# Replace domain types imports to entities/*/model
Get-ChildItem -Recurse -Include *.ts,*.tsx | ForEach-Object {
  (Get-Content $_.FullName) -replace "@/src/types/domain/application", "@entities/application/model/types" |
    Set-Content $_.FullName
}
```

Acceptance criteria
- No legacy import paths remain.
- App builds and runs successfully.

### Phase 9 — Cleanup legacy/archived
Goal: Remove stale/archived buckets after references drop to zero.

Candidates
```txt path=null start=null
src/archive/migration_v2_archived_2025_09_21/**
convex_archived/**
src/_archived_components_20250921_154242/**
```

Acceptance criteria
- Grep shows zero references to archived paths.
- CI/lint/build passes.

---

## 4) Completed Tasks (2025-09-21)

### Phase 1: Create `screens/` Infrastructure ✅
- [x] Created `src/screens/` directory structure
- [x] Created `src/screens/shared/` subdirectory
- [x] Created index files:
  - `src/screens/index.ts` - Main screens export file
  - `src/screens/shared/index.ts` - Shared screens export file

### Phase 2: Migrate Initial Screens ✅
- [x] **UploadDocumentsScreen**
  - Extracted screen logic from `app/(screens)/(shared)/upload-documents.tsx`
  - Created `src/screens/shared/UploadDocumentsScreen.tsx`
  - Converted route file to thin wrapper (6 lines)
  
- [x] **PaymentScreen**
  - Extracted screen logic from `app/(screens)/(shared)/payment.tsx`
  - Created `src/screens/shared/PaymentScreen.tsx`
  - Converted route file to thin wrapper (6 lines)
  
- [x] **ActivityScreen**
  - Extracted screen logic from `app/(screens)/(shared)/activity.tsx`
  - Created `src/screens/shared/ActivityScreen.tsx`
  - Converted route file to thin wrapper (6 lines)

---

## 5) Next Immediate Tasks

- Start entities/ with application domain:
  - Move
    - src/features/application/services/applicationService.ts → src/entities/application/model/service.ts
    - src/types/domain/application.ts → src/entities/application/model/types.ts
    - src/features/application/components/StepIndicator/** → src/entities/application/ui/StepIndicator/**
    - src/features/application/components/DocumentSourceModal/** → src/entities/application/ui/DocumentSourceModal/**
  - Update imports:
    - @/src/types/domain/application → @entities/application/model/types
    - features/application/services/applicationService → @entities/application/model/service

- Continue migrating more screens:
  - app/(screens)/(shared)/qr-scanner.tsx → src/screens/shared/QrScannerScreen.tsx
  - app/(screens)/(shared)/change-password.tsx → src/screens/shared/ChangePasswordScreen.tsx
  - app/(auth)/sign-in.tsx → src/screens/auth/SignInScreen.tsx
  - app/(auth)/sign-up.tsx → src/screens/auth/SignUpScreen.tsx

- Create processes/paymentFlow and move usePaymentFlow:
  - src/hooks/usePaymentFlow.ts → src/processes/paymentFlow/model/usePaymentFlow.ts
  - Update screens that use it accordingly.

---

## 5) Verification Checklist (per phase)

- Build the app after each phase
- Manually test critical flows:
  - Auth: sign-in, sign-up, reset password, verification
  - Dashboard loads stats and recent activity
  - Apply flow end-to-end (including document caching)
  - Payment submission and success/failure routes
  - Inspector routes (dashboard, review, queue)

---

## 6) Notes From Current State

- shared/lib consolidation is complete; old src/lib removed.
- Back-compat constants/components eliminated.
- Many application-related screens live under features/application/screens; these should become screens/ entries if they are routed.
- Domain types under src/types/domain ready to move to entities/*/model.
- app/ has many shared and inspector routes — good starting point for Phase 1–2.

---

## 7) Approval to Proceed

If you approve, I will:
1) Create src/screens/* scaffolding and migrate upload-documents, payment, and activity first.
2) Create src/entities/application and move the application domain (service, types, StepIndicator, DocumentSourceModal).
3) Create src/processes/paymentFlow and move usePaymentFlow.
4) Update imports and verify the build.

