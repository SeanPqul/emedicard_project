# Health Card Renewal - Quick Start Guide

## 🎯 What We're Building

A complete health card renewal system that allows users with existing health cards to renew before/after expiration with pre-filled data.

## 📋 Implementation Order

### Phase 1: Backend Foundation (Start Here)
1. Update `backend/convex/schema.ts` - Add renewal fields
2. Create `backend/convex/applications/checkRenewalEligibility.ts`
3. Create `backend/convex/applications/createRenewalApplication.ts`
4. Create `backend/convex/applications/getPreviousApplicationData.ts`

### Phase 2: Mobile Hooks
5. Create `src/features/application/hooks/useRenewalEligibility.ts`
6. Update `src/features/application/hooks/useApplications.ts` (if needed)

### Phase 3: Mobile UI - Card Selection & Entry Points
7. Create `app/(screens)/(shared)/renewal/select-card.tsx` (NEW FILE)
8. Update `src/widgets/dashboard/DashboardWidget.enhanced.tsx` (navigate to card selection)
9. Update `src/screens/shared/HealthCardsScreen/HealthCardsScreen.tsx` (navigate to card selection)

### Phase 4: Mobile UI - Application Flow
10. Update `app/(tabs)/apply.tsx` (detect renewal mode, pre-populate data)
11. Update `src/features/application/components/steps/ApplicationTypeStep/ApplicationTypeStep.tsx`
12. Update `src/features/application/lib/applicationRestrictions.ts`

### Phase 5: WebAdmin Support
13. Update `apps/webadmin/src/app/dashboard/page.tsx` (renewal badge)
14. Update `apps/webadmin/src/app/dashboard/[id]/page.tsx` (previous card history)

### Phase 6: Testing
15. Test all eligibility scenarios
16. Test card selection screen
17. Test renewal flow end-to-end
18. Test admin review

## 🔧 Key Files to Modify

### Backend (`C:\Em\backend\convex`)
```
schema.ts                                    # Add renewal fields
applications/checkRenewalEligibility.ts      # NEW FILE
applications/createRenewalApplication.ts     # NEW FILE
applications/getPreviousApplicationData.ts   # NEW FILE
healthCards/issueHealthCard.ts              # Update to mark old card expired
```

### Mobile (`C:\Em\apps\mobile`)
```
app/(screens)/(shared)/renewal/select-card.tsx                 # NEW FILE (Card Selection)
src/features/application/hooks/useRenewalEligibility.ts        # NEW FILE
src/features/application/lib/applicationRestrictions.ts        # UPDATE
src/widgets/dashboard/DashboardWidget.enhanced.tsx             # UPDATE
src/screens/shared/HealthCardsScreen/HealthCardsScreen.tsx     # UPDATE
app/(tabs)/apply.tsx                                           # UPDATE
```

### WebAdmin (`C:\Em\apps\webadmin`)
```
src/app/dashboard/page.tsx         # UPDATE
src/app/dashboard/[id]/page.tsx    # UPDATE
```

## 🚀 Quick Implementation Steps

### Step 1: Schema (5 min)
```typescript
// backend/convex/schema.ts - Add to applications table
previousHealthCardId: v.optional(v.id("healthCards")),
isRenewal: v.optional(v.boolean()),
renewalCount: v.optional(v.float64()),

// Add new index
.index("by_previous_card", ["previousHealthCardId"])
```

### Step 2: Backend Queries (30 min)
Copy the implementations from `HEALTH_CARD_RENEWAL_IMPLEMENTATION_PLAN.md`:
- Section 1.1: `checkRenewalEligibilityQuery`
- Section 1.2: `createRenewalApplicationMutation`  
- Section 2.1: `getPreviousApplicationDataQuery`

### Step 3: Mobile Hook (10 min)
```typescript
// src/features/application/hooks/useRenewalEligibility.ts
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

export function useRenewalEligibility() {
  const data = useQuery(api.applications.checkRenewalEligibilityQuery);
  return {
    isEligible: data?.isEligible ?? false,
    reason: data?.reason ?? '',
    previousCard: data?.previousCard ?? null,
    previousApplication: data?.previousApplication ?? null,
    isLoading: data === undefined,
  };
}
```

### Step 4: Card Selection Screen (45 min)
Create `app/(screens)/(shared)/renewal/select-card.tsx`:
- Copy full implementation from `HEALTH_CARD_RENEWAL_IMPLEMENTATION_PLAN.md` Section 3.1.1
- Displays all user health cards with urgency badges
- Handles card selection and navigation to form
- Shows confirmation for non-urgent renewals

### Step 5: Dashboard CTA (10 min)
Update `DashboardWidget.enhanced.tsx` around line 298:
- Change "Renew required" to "Renew now"
- Update onPress to: `router.push('/(screens)/(shared)/renewal/select-card')`
- Show urgent badges for expired/expiring cards

### Step 6: Health Cards Screen (5 min)
Update renewal button in `HealthCardsScreen.tsx`:
```typescript
{(healthCard.isExpired || healthCard.daysUntilExpiry <= 30) && (
  <TouchableOpacity 
    style={styles.renewButton} 
    onPress={() => router.push('/(screens)/(shared)/renewal/select-card')}
  >
    <Text>Renew Health Card</Text>
  </TouchableOpacity>
)}
```

### Step 7: Application Form (25 min)
Update `app/(tabs)/apply.tsx`:
- Detect `?action=renew&healthCardId=xxx` params
- Call `getPreviousApplicationDataQuery`
- Pre-populate form fields
- Show renewal banner

### Step 8: Test (30 min)
1. Create test user with approved card
2. Navigate to Health Cards screen
3. Click renewal button
4. Verify data pre-population
5. Complete renewal flow
6. Verify new card issued

## ✅ Testing Checklist

### Eligibility
- [ ] User without card → blocked
- [ ] User with expired card → allowed
- [ ] User with expiring card (< 30 days) → allowed
- [ ] User with pending renewal → blocked

### Data Flow
- [ ] Personal details pre-fill correctly
- [ ] User can edit pre-filled data
- [ ] Job category can be changed
- [ ] Documents are required (fresh upload)

### Card Management
- [ ] New card gets new registration number
- [ ] New card expires 1 year from issuance
- [ ] Old card marked as expired
- [ ] Audit trail maintained (previousHealthCardId)

## 🐛 Common Issues

### Issue: "User not eligible" but has approved card
**Fix:** Check if health card exists in `healthCards` table for the approved application

### Issue: Form doesn't pre-populate
**Fix:** Ensure `healthCardId` param is passed correctly and query is not skipped

### Issue: Duplicate renewals allowed
**Fix:** Backend eligibility check should block pending renewals

## 📊 Database Queries for Testing

```sql
-- Check user's applications
SELECT * FROM applications WHERE userId = '...' ORDER BY _creationTime DESC;

-- Check user's health cards
SELECT * FROM healthCards WHERE applicationId IN (...);

-- Check renewal applications
SELECT * FROM applications WHERE applicationType = 'Renew';
```

## 🎯 Success Indicators

You'll know it's working when:
1. ✅ Expired card shows "RENEW NOW" button in dashboard
2. ✅ Clicking renewal opens card selection screen
3. ✅ User can select which card to renew (even if only one)
4. ✅ Selection navigates to form with pre-filled data
5. ✅ Submission creates application with `applicationType = 'Renew'`
6. ✅ Admin sees renewal badge
7. ✅ Approved renewal issues new card and marks old as expired

## 📚 Full Details

See `HEALTH_CARD_RENEWAL_IMPLEMENTATION_PLAN.md` for:
- Complete code implementations
- Detailed architecture diagrams
- Full testing scenarios
- Security considerations
- Business logic rules

---

**Quick Start Version**: 1.0  
**Last Updated**: 2025-11-14
