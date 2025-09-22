# Tabs-First Migration: File Mapping

## File Movement Map

### 1. Auth Routes (No structural changes)
- `app/(auth)/_layout.tsx` → `app/(auth)/_layout.tsx` ✓
- `app/(auth)/sign-in.tsx` → `app/(auth)/sign-in.tsx` ✓
- `app/(auth)/sign-up.tsx` → `app/(auth)/sign-up.tsx` ✓
- `app/(auth)/reset-password.tsx` → `app/(auth)/reset-password.tsx` ✓
- `app/(auth)/verification.tsx` → `app/(auth)/verification.tsx` ✓

### 2. Tab Routes
- `app/(protected)/(applicant)/dashboard.tsx` → `app/(tabs)/index.tsx`
- `app/(protected)/(applicant)/apply-membership.tsx` → `app/(tabs)/apply.tsx`
- `app/(protected)/(applicant)/applications.tsx` → `app/(tabs)/applications.tsx`
- `app/(protected)/(applicant)/notifications.tsx` → `app/(tabs)/notifications.tsx`
- `app/(protected)/(applicant)/profile/index.tsx` → `app/(tabs)/profile.tsx`

### 3. Application Routes
- `app/(protected)/(applicant)/application/[id].tsx` → `app/application/[id].tsx`

### 4. Payment Routes
- `app/(protected)/(applicant)/payment/index.tsx` → `app/payment/index.tsx`
- `app/(protected)/(applicant)/payment/success.tsx` → `app/payment/success.tsx`
- `app/(protected)/(applicant)/payment/failed.tsx` → `app/payment/failed.tsx`
- `app/(protected)/(applicant)/payment/cancelled.tsx` → `app/payment/cancelled.tsx`

### 5. Document Routes
- `app/(protected)/(applicant)/upload-documents.tsx` → `app/documents/upload.tsx`
- `app/(protected)/(applicant)/document-requirements.tsx` → `app/documents/requirements.tsx`

### 6. Health Card Routes
- `app/(protected)/(applicant)/health-cards.tsx` → `app/health-cards/index.tsx`

### 7. Scanner Routes
- `app/(protected)/(applicant)/qr-code.tsx` → `app/scanner/qr-code.tsx`
- `app/(protected)/(applicant)/qr-scanner.tsx` → `app/scanner/qr-scanner.tsx`

### 8. Inspector Routes
- `app/(protected)/(inspector)/_layout.tsx` → `app/inspector/_layout.tsx`
- `app/(protected)/(inspector)/dashboard.tsx` → `app/inspector/dashboard.tsx`
- `app/(protected)/(inspector)/inspection-queue.tsx` → `app/inspector/queue.tsx`
- `app/(protected)/(inspector)/review-applications.tsx` → `app/inspector/review.tsx`
- `app/(protected)/(inspector)/scanner.tsx` → `app/inspector/scanner.tsx`

### 9. Settings/Profile Routes
- `app/(protected)/(applicant)/profile/edit.tsx` → `app/settings/edit.tsx`
- `app/(protected)/(applicant)/profile/change-password.tsx` → `app/settings/change-password.tsx`
- `app/(protected)/(shared)/activity.tsx` → `app/settings/activity.tsx`
- `app/(protected)/(shared)/navigation-debug.tsx` → `app/settings/debug.tsx`

### 10. Layout Files to Update/Create
- **Create**: `app/(tabs)/_layout.tsx` (new tab navigation layout)
- **Update**: `app/index.tsx` (update initial routing logic)
- **Delete**: `app/(protected)/_layout.tsx`
- **Delete**: `app/(protected)/(applicant)/_layout.tsx`
- **Delete**: `app/(protected)/(shared)/_layout.tsx`

## Components That Need Path Updates

### 1. Navigation Components
- `src/widgets/navigation/TabBar.tsx` - Update tab navigation paths
- `src/shared/components/navigation/` - Any navigation components

### 2. Auth Flow Components
- `src/features/auth/components/` - Update redirect paths after login
- `src/processes/auth/` - Update role-based redirects

### 3. Screen Components Using Navigation
- All screens using `router.push()` or `<Link>` components
- Components with hardcoded paths

## Search Patterns for Updates

### Find Navigation Usage:
```bash
# Find router.push calls
grep -r "router.push" src/

# Find Link components
grep -r "<Link" src/

# Find href props
grep -r "href=" src/

# Find specific protected paths
grep -r "/(protected)/" src/
```

### Common Path Updates:
```typescript
// Before
router.push('/(protected)/(applicant)/dashboard');
router.push('/(protected)/(applicant)/applications');
router.push('/(protected)/(applicant)/application/123');

// After
router.push('/(tabs)/');
router.push('/(tabs)/applications');
router.push('/application/123');
```

## New Layout Implementations

### 1. (tabs)/_layout.tsx Structure
```typescript
// Key features to implement:
- Tab navigation using Expo Router Tabs
- Authentication check (redirect to sign-in if not authenticated)
- Role-based tab visibility
- Custom tab bar component integration
```

### 2. inspector/_layout.tsx Structure
```typescript
// Key features to implement:
- Role check (only inspectors can access)
- Redirect non-inspectors to appropriate route
- Stack navigation for inspector screens
```

## Migration Scripts Needed

1. **Backup Script**: Archive current app folder structure
2. **File Movement Script**: Automate file movements
3. **Path Update Script**: Search and replace navigation paths
4. **Validation Script**: Check all routes are accessible

## Testing Plan

### Phase 1: Structure Testing
- Verify all files moved correctly
- Check folder structure matches plan
- Ensure no files lost

### Phase 2: Navigation Testing
- Test each tab navigation
- Test deep linking to each route
- Test back navigation
- Test role-based access

### Phase 3: Integration Testing
- Test auth flow with new structure
- Test payment flows
- Test document upload flows
- Test inspector workflows

### Phase 4: Edge Cases
- Test invalid routes (404 handling)
- Test unauthorized access attempts
- Test navigation state persistence
- Test app resumption
