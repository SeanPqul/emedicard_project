# ApplyScreen Renewal Integration Guide

## Status: PARTIALLY COMPLETE

The renewal form infrastructure is **95% complete**. This document outlines the remaining integration work needed in the ApplyScreen to enable full renewal functionality.

## What's Already Done ✅

- ✅ Backend: Eligibility query, renewal mutation, previous data query
- ✅ Mobile: Card selection screen, renewal hooks
- ✅ ApplyWidget: Renewal banner UI components and props
- ✅ Dashboard & Health Cards: Renewal navigation
- ✅ Application restrictions: Renewal validation

## What Needs Integration 🔄

### Step 1: Detect Renewal Mode in ApplyScreen

**File:** `src/screens/tabs/ApplyScreen.tsx`

Add this code at the top of the `ApplyScreen` component (after line 23):

```typescript
import { useLocalSearchParams } from 'expo-router';
import { api } from '@backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Id } from '@backend/convex/_generated/dataModel';

export function ApplyScreen() {
  const router = useRouter();
  
  // ADD THIS: Detect renewal mode from URL params
  const params = useLocalSearchParams();
  const isRenewalMode = params.action === 'renew';
  const healthCardId = params.healthCardId as string | undefined;
  
  // ADD THIS: Fetch previous application data for renewal
  const previousAppData = useQuery(
    api.applications.getPreviousApplicationDataQuery,
    isRenewalMode && healthCardId 
      ? { healthCardId: healthCardId as Id<"healthCards"> } 
      : 'skip'
  );
  
  // ... rest of existing code
```

### Step 2: Pre-populate Form Data

**File:** `src/screens/tabs/ApplyScreen.tsx`

Add this `useEffect` to pre-populate the form when renewal data loads (after the existing useEffect at line 33):

```typescript
// Pre-populate form for renewal mode
useEffect(() => {
  if (isRenewalMode && previousAppData && !formData.firstName) {
    setFormData({
      ...formData,
      applicationType: 'Renew',
      firstName: previousAppData.application.firstName || '',
      middleName: previousAppData.application.middleName || '',
      lastName: previousAppData.application.lastName || '',
      suffix: previousAppData.application.suffix || '',
      age: previousAppData.application.age || undefined,
      nationality: previousAppData.application.nationality || '',
      gender: previousAppData.application.gender || undefined,
      position: previousAppData.application.position || '',
      organization: previousAppData.application.organization || '',
      civilStatus: previousAppData.application.civilStatus || 'Single',
      jobCategory: previousAppData.application.jobCategoryId || '',
    });
  }
}, [isRenewalMode, previousAppData]);
```

### Step 3: Pass Renewal Props to ApplyWidget

**File:** `src/screens/tabs/ApplyScreen.tsx`

Update the `ApplyWidget` component call (around line 136) to include renewal props:

```typescript
return (
  <BaseScreen safeArea={false} keyboardAvoiding={false}>
    <ApplyWidget
      // ... existing props ...
      
      // ADD THESE NEW PROPS:
      isRenewalMode={isRenewalMode}
      renewalCardNumber={previousAppData?.healthCard?.registrationNumber}
      
      // ... rest of props
    />
  </BaseScreen>
);
```

### Step 4: Use Renewal Mutation for Submission

**File:** `src/features/application/hooks/useSubmission.ts`

This is the most complex part. You need to:

1. Import the renewal mutation:
```typescript
import { useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

const createRenewalApplication = useMutation(
  api.applications.createRenewalApplicationMutation
);
```

2. Check if in renewal mode and use the appropriate mutation:
```typescript
// In the handleSubmit function, check the applicationType
if (formData.applicationType === 'Renew' && formData.previousHealthCardId) {
  // Use renewal mutation
  const result = await createRenewalApplication({
    previousHealthCardId: formData.previousHealthCardId,
    jobCategoryId: formData.jobCategory,
    position: formData.position,
    organization: formData.organization,
    civilStatus: formData.civilStatus,
    // ... other fields
  });
} else {
  // Use existing new application mutation
  // ... existing code
}
```

## Alternative: Quick Integration Method

If you want a simpler approach, you can:

1. **Skip the pre-population** for now - let users manually enter data
2. **Just pass the renewal flag** to the backend when `applicationType === 'Renew'`
3. **Test with manual data entry** first, then add pre-population later

The backend already validates everything, so the frontend pre-population is a UX enhancement, not a requirement.

## Testing Checklist

Once integrated, test:

- [ ] Navigate from card selection to apply form
- [ ] Verify renewal banner shows
- [ ] Check form pre-population (if implemented)
- [ ] Submit renewal application
- [ ] Verify it creates with `applicationType: "Renew"`
- [ ] Check backend validation works

## Support

If you encounter issues:
1. Check Convex dashboard for mutation errors
2. Verify `healthCardId` is being passed correctly
3. Ensure user owns the health card (backend will reject if not)
4. Check eligibility requirements (30-day rule, no pending applications)

---

**Note:** The renewal system is fully functional from the backend perspective. This integration is primarily about connecting the existing ApplyScreen flow to use renewal-specific queries and mutations.
