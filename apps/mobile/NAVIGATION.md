# Navigation Documentation

## Overview

This document describes the navigation structure and patterns used in the E-Medicard mobile application with a feature-first, tabs-centric architecture.

## Folder Structure

```
app/
├── _layout.tsx                    # Root layout with providers
├── index.tsx                      # Initial routing & auth check
│
├── (auth)/                        # Public authentication routes
│   ├── _layout.tsx               # Auth layout (no auth required)
│   ├── sign-in.tsx               # Sign in screen
│   ├── sign-up.tsx               # Sign up screen
│   ├── reset-password.tsx        # Password reset
│   └── verification.tsx          # OTP/Email verification
│
├── (tabs)/                        # Main tab navigation (protected)
│   ├── _layout.tsx               # Tab layout with auth check
│   ├── index.tsx                 # Dashboard/Home
│   ├── apply.tsx                 # New application
│   ├── applications.tsx          # Applications list  
│   ├── notifications.tsx         # Notifications
│   └── profile.tsx               # Profile tab
│
└── (screens)/                     # All detail screens (protected)
    ├── _layout.tsx               # Auth check for all screens
    │
    ├── (shared)/                 # Screens accessible by all roles
    │   ├── application/          # Application feature
    │   │   └── [id].tsx          # Application detail
    │   │
    │   ├── payment/              # Payment feature
    │   │   ├── index.tsx         # Payment screen
    │   │   ├── success.tsx       # Payment success
    │   │   ├── failed.tsx        # Payment failed
    │   │   └── cancelled.tsx     # Payment cancelled
    │   │
    │   ├── documents/            # Document management
    │   │   ├── upload.tsx        # Upload documents
    │   │   └── requirements.tsx  # Document requirements
    │   │
    │   ├── profile/              # Profile management
    │   │   ├── edit.tsx          # Edit profile
    │   │   └── change-password.tsx # Change password
    │   │
    │   ├── health-cards.tsx      # Health cards (single screen)
    │   ├── qr-code.tsx           # QR code display
    │   ├── qr-scanner.tsx        # QR scanner
    │   ├── activity.tsx          # Activity log
    │   ├── orientation.tsx       # Orientation screen
    │   └── navigation-debug.tsx  # Debug screen
    │
    └── (inspector)/              # Inspector-only screens
        ├── _layout.tsx           # Role check for inspector
        ├── dashboard.tsx         # Inspector dashboard
        ├── inspection-queue.tsx  # Queue management
        ├── review-applications.tsx # Application review
        └── scanner.tsx           # Inspector scanner
```

## Authentication Flow

### 1. Initial Load (`app/index.tsx`)
- Checks if user is authenticated via Clerk
- If not authenticated → redirect to `/(auth)/sign-in`
- If authenticated → check user role:
  - Applicants → `/(tabs)`
  - Inspectors → `/(screens)/(inspector)/dashboard`

### 2. Tab Layout (`app/(tabs)/_layout.tsx`)
- Protected by auth check
- Redirects to sign-in if not authenticated
- Renders tab navigation for authenticated users

### 3. Screens Layout (`app/(screens)/_layout.tsx`)
- Protected by auth check
- Wraps all detail screens with stack navigation

### 4. Inspector Layout (`app/(screens)/(inspector)/_layout.tsx`)
- Additional role check for inspector-only screens
- Redirects non-inspectors to tabs

## Navigation Patterns

### Tab Navigation
Primary navigation using bottom tabs:
```typescript
// Navigate to tabs
router.push('/(tabs)')              // Dashboard
router.push('/(tabs)/apply')        // New application
router.push('/(tabs)/applications') // Applications list
router.push('/(tabs)/profile')      // Profile
```

### Screen Navigation

#### Application Features
```typescript
// View application detail
router.push(`/(screens)/(shared)/application/${applicationId}`)

// Payment flow
router.push('/(screens)/(shared)/payment')
router.push('/(screens)/(shared)/payment/success')
router.push('/(screens)/(shared)/payment/failed')
```

#### Document Management
```typescript
// Upload documents
router.push('/(screens)/(shared)/documents/upload')

// View requirements
router.push('/(screens)/(shared)/documents/requirements')
```

#### Profile Management
```typescript
// Edit profile
router.push('/(screens)/(shared)/profile/edit')

// Change password
router.push('/(screens)/(shared)/profile/change-password')
```

#### Other Features
```typescript
// Health cards
router.push('/(screens)/(shared)/health-cards')

// QR features
router.push('/(screens)/(shared)/qr-code')
router.push('/(screens)/(shared)/qr-scanner')

// Activity & debug
router.push('/(screens)/(shared)/activity')
router.push('/(screens)/(shared)/orientation')
```

### Inspector Navigation
```typescript
// Inspector screens
router.push('/(screens)/(inspector)/dashboard')
router.push('/(screens)/(inspector)/inspection-queue')
router.push('/(screens)/(inspector)/review-applications')
router.push('/(screens)/(inspector)/scanner')
```

## Deep Linking

The app supports deep linking with the following patterns:

### Application Links
- `emedicard://application/{id}` → `/(screens)/(shared)/application/[id]`
- `emedicard://payment/success` → `/(screens)/(shared)/payment/success`
- `emedicard://upload-documents` → `/(screens)/(shared)/documents/upload`

### Inspector Links
- `emedicard://inspector/dashboard` → `/(screens)/(inspector)/dashboard`
- `emedicard://inspector/queue` → `/(screens)/(inspector)/inspection-queue`

### Profile Links
- `emedicard://profile/edit` → `/(screens)/(shared)/profile/edit`
- `emedicard://activity` → `/(screens)/(shared)/activity`

## Adding New Screens

### Tab Screens
Add to `app/(tabs)/` for new tab items
- Update tab configuration in `RoleBasedTabLayout`

### Feature Screens

#### Multi-Screen Features
Create a folder in `app/(screens)/(shared)/`:
```
(screens)/(shared)/
  └── feature-name/
      ├── index.tsx
      ├── detail.tsx
      └── settings.tsx
```

#### Single Screens
Add flat file to `app/(screens)/(shared)/`:
```
(screens)/(shared)/
  └── feature-screen.tsx
```

### Inspector-Only Features
Add to `app/(screens)/(inspector)/`
- Protected by role check in layout

## Common Patterns

### Conditional Navigation
```typescript
// Based on user role
if (user.role === 'applicant') {
  router.push('/(tabs)')
} else if (user.role === 'inspector') {
  router.push('/(screens)/(inspector)/dashboard')
}
```

### Back Navigation
```typescript
// Go back in stack
router.back()

// Go to tabs
router.replace('/(tabs)')
```

### Navigation with Parameters
```typescript
// With route params
router.push({
  pathname: '/(screens)/(shared)/application/[id]',
  params: { id: applicationId }
})

// With query params
router.push({
  pathname: '/(screens)/(shared)/payment',
  query: { amount: '1000', type: 'renewal' }
})
```

## Migration Summary

### Structure Changes
- Moved from role-based to feature-first organization
- `(tabs)` is now the main entry point for applicants
- All detail screens organized under `(screens)`
- Cleaner separation between navigation types

### Path Updates
From → To:
- `/(protected)/(applicant)/(tabs)/*` → `/(tabs)/*`
- `/(protected)/(applicant)/(stack)/*` → `/(screens)/(shared)/*`
- `/(protected)/(inspector)/(stack)/*` → `/(screens)/(inspector)/*`
- `/(protected)/(shared)/*` → `/(screens)/(shared)/*`

### Key Improvements
1. **Simpler paths**: `/payment` instead of `/protected/applicant/stack/payment`
2. **Feature grouping**: Related screens stay together
3. **Cleaner URLs**: Better for deep linking and navigation
4. **Tab-first approach**: Aligns with common mobile patterns

## Best Practices

1. **Always use typed routes** when available
2. **Check authentication** before navigating to protected routes
3. **Use role-based redirects** in layouts, not individual screens
4. **Prefer replace over push** when navigating after auth state changes
5. **Handle loading states** during auth and role checks
6. **Test deep links** after any navigation changes
