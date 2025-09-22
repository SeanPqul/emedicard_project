# Feature-First App Structure Proposal

## Overview
A clean, feature-first organization where:
- `(tabs)` contains only the main navigation screens
- `(screens)` contains all detailed screens organized by feature
- Flat structure for single screens, folders for related screens

## Detailed Structure

```
app/
├── _layout.tsx                           # Root layout with providers
├── index.tsx                             # Initial routing & auth check
│
├── (auth)/                               # Public authentication routes
│   ├── _layout.tsx                       # Auth layout (no auth required)
│   ├── sign-in.tsx                       # Sign in screen
│   ├── sign-up.tsx                       # Sign up screen
│   ├── reset-password.tsx                # Password reset
│   └── verification.tsx                  # OTP/Email verification
│
├── (tabs)/                               # Main tab navigation (protected)
│   ├── _layout.tsx                       # Tab layout with auth check
│   ├── index.tsx                         # Dashboard/Home
│   ├── apply.tsx                         # New application
│   ├── applications.tsx                  # Applications list
│   ├── notifications.tsx                 # Notifications
│   └── profile.tsx                       # Profile tab
│
└── (screens)/                            # All detail screens (protected)
    ├── _layout.tsx                       # Auth check for all screens
    │
    ├── (shared)/                         # Screens accessible by all roles
    │   ├── application/                  # Application feature
    │   │   ├── [id].tsx                  # Application detail
    │   │   └── _layout.tsx               # Optional layout
    │   │
    │   ├── payment/                      # Payment feature
    │   │   ├── index.tsx                 # Payment screen
    │   │   ├── success.tsx               # Payment success
    │   │   ├── failed.tsx                # Payment failed
    │   │   └── cancelled.tsx             # Payment cancelled
    │   │
    │   ├── documents/                    # Document management
    │   │   ├── upload.tsx                # Upload documents
    │   │   └── requirements.tsx          # Document requirements
    │   │
    │   ├── profile/                      # Profile management
    │   │   ├── index.tsx                 # Profile view (if needed)
    │   │   ├── edit.tsx                  # Edit profile
    │   │   └── change-password.tsx       # Change password
    │   │
    │   ├── health-cards.tsx              # Health cards (single screen)
    │   ├── qr-code.tsx                   # QR code display
    │   ├── qr-scanner.tsx                # QR scanner
    │   ├── activity.tsx                  # Activity log
    │   ├── orientation.tsx               # Orientation screen
    │   └── navigation-debug.tsx          # Debug screen
    │
    └── (inspector)/                      # Inspector-only screens
        ├── _layout.tsx                   # Role check for inspector
        ├── dashboard.tsx                 # Inspector dashboard
        ├── inspection-queue.tsx          # Queue management
        ├── review-applications.tsx       # Application review
        └── scanner.tsx                   # Inspector scanner

```

## Key Design Decisions

### 1. **Tab Screens** (`(tabs)/`)
- Contains ONLY the 5 main navigation screens
- Each is a simple, flat file
- Protected by auth check in `_layout.tsx`
- Clean and minimal

### 2. **Shared Screens** (`(screens)/(shared)/`)
- **Folders for related features:**
  - `application/` - Contains list view and detail view
  - `payment/` - Complete payment flow
  - `documents/` - Document upload and requirements
  - `profile/` - All profile-related screens
- **Flat files for standalone screens:**
  - `health-cards.tsx`
  - `qr-code.tsx`
  - `activity.tsx`
  - etc.

### 3. **Inspector Screens** (`(screens)/(inspector)/`)
- All inspector-specific screens
- Flat structure since they're all independent
- Role check in `_layout.tsx`

## Navigation Examples

```typescript
// Tab navigation
router.push('/(tabs)')                    // Dashboard
router.push('/(tabs)/applications')       // Applications list

// Application screens
router.push('/(screens)/(shared)/application/123')  // View application
router.push('/(screens)/(shared)/payment')         // Make payment
router.push('/(screens)/(shared)/documents/upload') // Upload docs

// Profile screens
router.push('/(screens)/(shared)/profile/edit')           // Edit profile
router.push('/(screens)/(shared)/profile/change-password') // Change password

// Inspector screens
router.push('/(screens)/(inspector)/dashboard')            // Inspector dash
router.push('/(screens)/(inspector)/review-applications')  // Review apps
```

## Benefits of This Structure

1. **Clear Separation of Concerns**
   - Tabs = Primary navigation
   - Screens = All detail views

2. **Feature-First Organization**
   - Related screens grouped together
   - Easy to find and maintain features

3. **Flexible Depth**
   - Folders for multi-screen features
   - Flat files for single screens

4. **Role-Based Access**
   - Shared screens available to all
   - Inspector screens protected by role

5. **Clean URLs**
   - `/(screens)/(shared)/payment/success`
   - `/(screens)/(inspector)/dashboard`

## Migration Path

1. Move all tab screens to `(tabs)/` - keep them simple
2. Create `(screens)/(shared)/` structure
3. Move related screens into feature folders
4. Move single screens as flat files
5. Move inspector screens to `(screens)/(inspector)/`
6. Update all navigation references
7. Test auth and role checks

## Additional Considerations

### Protected Routes
- `(tabs)/_layout.tsx` - Auth check for tabs
- `(screens)/_layout.tsx` - Auth check for all screens
- `(screens)/(inspector)/_layout.tsx` - Additional role check

### Future Features
Easy to add new features:
- New tab? Add to `(tabs)/`
- New feature? Create folder in `(screens)/(shared)/`
- New inspector feature? Add to `(screens)/(inspector)/`

This structure provides a clean, scalable, and intuitive organization for your app!
