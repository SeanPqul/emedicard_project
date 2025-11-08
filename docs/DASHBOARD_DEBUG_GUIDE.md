# Dashboard Flow - Debug & Architecture Guide

## 📊 Architecture Overview

### Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Convex)                        │
│  getDashboardDataQuery - Aggregates all dashboard data     │
│  - User profile                                             │
│  - Applications (with job categories)                       │
│  - Health cards                                             │
│  - Payments                                                 │
│  - Notifications                                            │
│  - Pre-calculated stats                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND - DATA LAYER                          │
│  useOptimizedDashboard                                      │
│  - Network-aware fetching                                   │
│  - MMKV caching (job categories)                           │
│  - Cached dashboard data for offline                        │
│  - Data transformation                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                           │
│  useDashboardData                                           │
│  - Computes currentApplication (priority-based)             │
│  - Determines isNewUser                                     │
│  - Provides safe defaults                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                             │
│  DashboardScreen → DashboardWidgetEnhanced                  │
│  - Loading states                                           │
│  - Error handling                                           │
│  - Component rendering                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Recent Improvements & Bug Fixes

### 1. Backend Query Optimizations
**File:** `backend/convex/dashboard/getDashboardData.ts`

#### Fixed Issues:
- ✅ **Optimized health card filtering** - Use Set lookup instead of repeated array iterations
- ✅ **Better type safety** - Proper TypeScript type guards for payment filtering
- ✅ **Error handling** - Try-catch wrapper with logging
- ✅ **Reduced N+1 queries** - Batch operations where possible

```typescript
// Before (inefficient)
const healthCards = allHealthCards.filter(card => {
  return applications.some(app => app._id === card.applicationId);
});

// After (optimized with Set)
const applicationIds = new Set(applications.map(app => app._id));
const healthCards = allHealthCards.filter(card => 
  applicationIds.has(card.applicationId)
);
```

### 2. Frontend Hook Improvements
**Files:** 
- `apps/mobile/src/features/dashboard/hooks/useOptimizedDashboard.ts`
- `apps/mobile/src/features/dashboard/hooks/useDashboardData.ts`

#### Fixed Issues:
- ✅ **Currency symbol bug** - Fixed `?` showing instead of `₱` in payment descriptions
- ✅ **Loading state optimization** - Only show loading on initial mount without cache
- ✅ **Early returns** - Added early return for no-user state with safe defaults
- ✅ **Single application optimization** - Skip reduce when only 1 application
- ✅ **Memoization improvements** - Better dependencies in useMemo hooks

```typescript
// Fixed currency symbol
description: `₱${payment.netAmount.toFixed(2)} payment via ${payment.paymentMethod}`

// Optimized loading state
const isLoading = !!user && !dashboardData && !cachedDashboardData;
```

### 3. Component Optimizations
**File:** `apps/mobile/src/widgets/dashboard/DashboardWidget.enhanced.tsx`

#### Improvements:
- ✅ **React.memo wrapper** - Prevents unnecessary re-renders
- ✅ **useMemo for mock data** - Prevents recreation of health card object
- ✅ **Better imports** - Added useCallback and useMemo imports

```typescript
export const DashboardWidgetEnhanced = React.memo(function DashboardWidgetEnhanced({ ... }) {
  // Memoized mock health card
  const mockHealthCard = useMemo(() => { ... }, [healthCard, dashboardStats?.validHealthCards]);
});
```

### 4. Error Handling & Loading States
**File:** `apps/mobile/src/screens/tabs/DashboardScreen.tsx`

#### Improvements:
- ✅ **Smarter loading check** - Only show loading without cached data
- ✅ **Auth state handling** - Show message when user not authenticated
- ✅ **Error state styles** - Proper error container styling

### 5. Type Safety
**File:** `apps/mobile/src/features/dashboard/types.ts`

#### Improvements:
- ✅ **Type guards** - Added `isDashboardApplication()` type guard
- ✅ **Missing fields** - Added `documentsVerified` and `orientationCompleted` to DashboardApplication
- ✅ **Better type exports** - Consistent type re-exports

### 6. Comprehensive Logging
**Files:** Multiple hooks

#### Added Debug Logging:
- ✅ **Data fetch logging** - Track when fresh data arrives
- ✅ **Refresh action logging** - Monitor refresh triggers and completion
- ✅ **Loading state logging** - Track loading state changes
- ✅ **Computed value logging** - Monitor currentApplication, isNewUser calculations
- ✅ **Environment-aware** - Only logs in development mode

```typescript
if (__DEV__) {
  console.log('[Dashboard] Fresh data received:', {
    hasUser: !!dashboardData.user,
    applicationCount: dashboardData.applications?.length || 0,
    stats: dashboardData.stats,
  });
}
```

## 🐛 Common Issues & Solutions

### Issue 1: Dashboard shows loading forever
**Symptoms:**
- Loading spinner never disappears
- No data shown even when logged in

**Debug Steps:**
1. Check browser console for `[Dashboard]` logs
2. Verify user authentication: `dashboardData.user`
3. Check backend query response
4. Verify network connectivity

**Solution:**
```typescript
// Check if user is authenticated
if (!dashboardData.user && !dashboardData.isLoading) {
  // Show proper auth error state
}
```

### Issue 2: Stale data after refresh
**Symptoms:**
- Pull-to-refresh doesn't update data
- New applications don't appear

**Debug Steps:**
1. Check `[Dashboard] Refresh triggered` log
2. Verify cache invalidation on WiFi
3. Check if Convex query is re-running

**Solution:**
- Ensure WiFi detection works: `networkState.type === 'wifi'`
- Clear cache manually if needed: `mobileCacheManager.invalidateAllCaches()`

### Issue 3: Wrong application shown as "current"
**Symptoms:**
- Older application shown instead of more important one
- Priority logic seems incorrect

**Debug Steps:**
1. Check `[useDashboardData] Computed values` log
2. Review status priority map
3. Verify `_creationTime` values

**Solution:**
```typescript
// Status priority (lower number = higher priority)
const statusPriority: Record<string, number> = {
  'Under Review': 1,        // Highest
  'For Orientation': 2,
  'For Payment Validation': 3,
  'Submitted': 4,
  'Approved': 5,
  'Pending Payment': 6,
  'Rejected': 7,            // Lowest
};
```

### Issue 4: Currency symbol displays as "?"
**Status:** ✅ FIXED
**Was showing:** `?60.00`
**Now shows:** `₱60.00`

**Solution:**
- Updated payment description to use proper Unicode character: `\u20b1`

### Issue 5: Performance issues / slow rendering
**Symptoms:**
- Dashboard lags when scrolling
- Slow to respond to interactions

**Debug Steps:**
1. Check React DevTools Profiler
2. Look for components re-rendering unnecessarily
3. Verify useMemo/useCallback usage

**Solution:**
- Wrapped DashboardWidget in React.memo
- Memoized expensive computations
- Optimized dependency arrays

## 📝 Debugging Checklist

### When Dashboard Doesn't Load:
- [ ] Check user authentication status
- [ ] Verify backend query returns data
- [ ] Check network connectivity
- [ ] Review browser console for errors
- [ ] Check if cached data exists
- [ ] Verify Convex connection

### When Data Seems Incorrect:
- [ ] Check backend query response shape
- [ ] Verify data transformations in hooks
- [ ] Review application priority logic
- [ ] Check timestamp values
- [ ] Verify job category data

### When Performance is Poor:
- [ ] Profile component renders
- [ ] Check for missing memoization
- [ ] Verify dependency arrays
- [ ] Look for unnecessary re-renders
- [ ] Check query efficiency

## 🔧 Development Tools

### Enable Debug Logging
All logging is automatic in development mode (`NODE_ENV === 'development'`).

### Key Log Prefixes:
- `[Dashboard]` - Main dashboard hook logs
- `[useDashboardData]` - Business logic layer logs
- Backend logs appear in Convex dashboard

### Useful Console Filters:
```
[Dashboard]          # All dashboard logs
[Dashboard] Fresh    # Data fetch logs
[Dashboard] Refresh  # Refresh action logs
[useDashboardData]   # Computed values
```

## 📊 Performance Metrics

### Target Metrics:
- **Initial Load:** < 2 seconds
- **Refresh:** < 1 second
- **Component Re-renders:** Minimal (use React DevTools)
- **Cache Hit Rate:** > 80% for job categories

### Backend Query Metrics:
- **Database Queries:** ~10-15 per dashboard load
- **Payload Size:** ~50-100KB (varies with data)
- **Query Time:** < 500ms (typical)

## 🚀 Next Steps & Recommendations

### Performance Optimizations:
1. Consider implementing pagination for activities
2. Add virtual scrolling for large lists
3. Implement incremental data loading
4. Add service worker for better offline support

### Feature Enhancements:
1. Add real-time updates using Convex subscriptions
2. Implement dashboard customization
3. Add data export functionality
4. Create dashboard analytics

### Code Quality:
1. Add unit tests for hooks
2. Add integration tests for data flow
3. Document edge cases
4. Add Storybook stories for components

## 📚 Related Files

### Backend:
- `backend/convex/dashboard/getDashboardData.ts` - Main query

### Hooks:
- `apps/mobile/src/features/dashboard/hooks/useOptimizedDashboard.ts` - Data fetching
- `apps/mobile/src/features/dashboard/hooks/useDashboardData.ts` - Business logic

### Components:
- `apps/mobile/src/screens/tabs/DashboardScreen.tsx` - Main screen
- `apps/mobile/src/widgets/dashboard/DashboardWidget.enhanced.tsx` - Main widget

### Types:
- `apps/mobile/src/features/dashboard/types.ts` - TypeScript definitions

## 🆘 Getting Help

### Debug Workflow:
1. Enable development mode logs
2. Reproduce the issue
3. Check console logs with filters
4. Review relevant hook/component code
5. Use React DevTools to inspect state
6. Check Convex dashboard for backend logs

### Contact Points:
- Backend issues: Check Convex dashboard
- Frontend issues: Use React DevTools
- Network issues: Use Network tab in DevTools
- Cache issues: Clear MMKV storage

---

**Last Updated:** 2025-01-08
**Version:** 1.0.0
