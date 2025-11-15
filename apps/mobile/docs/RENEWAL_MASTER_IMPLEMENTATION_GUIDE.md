# Health Card Renewal - Master Implementation Guide

## 📋 Purpose
This is a **complete, self-contained implementation guide** for the Health Card Renewal feature. Follow this document step-by-step to implement renewal functionality without needing external references.

**For the Agent/Developer**: Everything you need is in this document. Read through completely before starting.

---

## 🎯 What We're Building

A renewal system that allows users to:
1. View their existing health cards
2. Select which card to renew (even if they only have one)
3. Have their data pre-filled from previous application
4. Complete the same application process with updated documents
5. Receive a new health card with updated expiry date

---

## 📊 Implementation Phases (Total: ~5.5 hours)

1. **Backend Schema** (5 min)
2. **Backend Eligibility Query** (20 min)
3. **Backend Renewal Mutation** (25 min)
4. **Backend Previous Data Query** (15 min)
5. **Mobile: Card Selection Screen** (45 min)
6. **Mobile: Renewal Hook** (10 min)
7. **Mobile: Dashboard Updates** (10 min)
8. **Mobile: Health Cards Screen** (5 min)
9. **Mobile: Application Form** (25 min)
10. **Mobile: Restrictions** (15 min)
11. **WebAdmin Updates** (30 min)
12. **Testing** (90 min)

---

## ⚠️ CRITICAL RULES

Before you start, understand these rules:

1. **Always check eligibility backend-side** - Frontend checks are for UX only
2. **Link renewal to previous card** - Use `previousHealthCardId` field
3. **Verify card ownership** - Previous card must belong to user
4. **Mark old card expired** - Only when new card is issued
5. **Generate new registration number** - Each card gets unique number
6. **Card selection is mandatory** - Even if user has only one card

---

# PHASE 1: BACKEND SCHEMA UPDATE

## Step 1.1: Update Schema (5 min)

**File:** `C:\Em\backend\convex\schema.ts`

**Location:** Find the `applications` table definition (around line 31-73)

**Add these fields** to the applications table definition:

```typescript
applications: defineTable({
  // ... existing fields (adminRemarks, applicationStatus, etc.) ...
  
  // ADD THESE THREE NEW FIELDS:
  previousHealthCardId: v.optional(v.id("healthCards")),
  isRenewal: v.optional(v.boolean()),
  renewalCount: v.optional(v.float64()),
  
  // ... rest of existing fields ...
})
  .index("by_user", ["userId"])
  .index("by_previous_card", ["previousHealthCardId"]), // ADD THIS NEW INDEX
```

**Complete updated section should look like:**

```typescript
applications: defineTable({
  adminRemarks: v.optional(v.string()),
  applicationStatus: v.string(),
  applicationType: v.union(
    v.literal("New"),
    v.literal("Renew")
  ),
  approvedAt: v.optional(v.float64()),
  civilStatus: v.string(),
  firstName: v.optional(v.string()),
  middleName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  suffix: v.optional(v.string()),
  age: v.optional(v.float64()),
  nationality: v.optional(v.string()),
  gender: v.optional(v.union(
    v.literal("Male"),
    v.literal("Female"),
    v.literal("Other")
  )),
  jobCategoryId: v.id("jobCategories"),
  organization: v.string(),
  paymentDeadline: v.optional(v.float64()),
  position: v.string(),
  updatedAt: v.optional(v.float64()),
  userId: v.id("users"),
  lastUpdatedBy: v.optional(v.id("users")),
  orientationCompleted: v.optional(v.boolean()),
  healthCardId: v.optional(v.id("healthCards")),
  healthCardRegistrationNumber: v.optional(v.string()),
  healthCardIssuedAt: v.optional(v.float64()),
  deletedAt: v.optional(v.float64()),
  // NEW FIELDS FOR RENEWAL:
  previousHealthCardId: v.optional(v.id("healthCards")),
  isRenewal: v.optional(v.boolean()),
  renewalCount: v.optional(v.float64()),
})
  .index("by_user", ["userId"])
  .index("by_previous_card", ["previousHealthCardId"]), // NEW INDEX
```

**Save the file.** Convex will auto-deploy the schema changes.

---

# PHASE 2: BACKEND ELIGIBILITY QUERY

## Step 2.1: Create Eligibility Query (20 min)

**File:** `C:\Em\backend\convex\applications\checkRenewalEligibility.ts` (NEW FILE)

**Create this file with the following content:**

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Check if user is eligible for health card renewal
 * 
 * Eligibility Criteria:
 * - User must have at least one approved application
 * - User must have an issued health card
 * - User cannot have a pending renewal application
 * - User cannot have an active new application in progress
 */
export const checkRenewalEligibilityQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isEligible: false,
        reason: "Not authenticated",
        previousCard: null,
        previousApplication: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        isEligible: false,
        reason: "User not found",
        previousCard: null,
        previousApplication: null,
      };
    }

    // Get all user applications
    const userApplications = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Check for pending applications
    const pendingApplications = userApplications.filter(
      (app) =>
        app.applicationStatus !== "Approved" &&
        app.applicationStatus !== "Payment Rejected" &&
        app.applicationStatus !== "Referred for Medical Management"
    );

    if (pendingApplications.length > 0) {
      return {
        isEligible: false,
        reason: "You have an application in progress. Please complete or cancel it before renewing.",
        previousCard: null,
        previousApplication: null,
      };
    }

    // Check for existing renewal in progress
    const existingRenewal = userApplications.find(
      (app) =>
        app.applicationType === "Renew" &&
        app.applicationStatus !== "Approved" &&
        app.applicationStatus !== "Payment Rejected" &&
        app.applicationStatus !== "Referred for Medical Management"
    );

    if (existingRenewal) {
      return {
        isEligible: false,
        reason: "You already have a renewal application in progress.",
        previousCard: null,
        previousApplication: null,
      };
    }

    // Find most recent approved application with health card
    const approvedApplications = userApplications
      .filter((app) => app.applicationStatus === "Approved")
      .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));

    if (approvedApplications.length === 0) {
      return {
        isEligible: false,
        reason: "No approved application found. Please apply for a new health card first.",
        previousCard: null,
        previousApplication: null,
      };
    }

    const previousApplication = approvedApplications[0];

    // Get health card for the approved application
    const healthCard = await ctx.db
      .query("healthCards")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", previousApplication._id)
      )
      .first();

    if (!healthCard) {
      return {
        isEligible: false,
        reason: "No health card found. Please contact support.",
        previousCard: null,
        previousApplication,
      };
    }

    // Get job category for continuity
    const jobCategory = await ctx.db.get(previousApplication.jobCategoryId);

    return {
      isEligible: true,
      reason: "Eligible for renewal",
      previousCard: {
        ...healthCard,
        jobCategory,
        isExpired: healthCard.expiryDate < Date.now(),
        isExpiringSoon: healthCard.expiryDate < Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        daysUntilExpiry: Math.ceil(
          (healthCard.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      },
      previousApplication: {
        ...previousApplication,
        jobCategory,
      },
    };
  },
});
```

**Save the file.**

### Step 2.2: Make Eligibility Logic Reusable & Authoritative (Recommended)

To keep the backend as the single source of truth for renewal rules, plan a follow-up refactor where the eligibility logic is shared between the query and the renewal mutation.

- **New File (planned):** `C:\Em\backend\convex\applications\lib\renewalEligibility.ts`
- **Responsibility:** Centralize all renewal eligibility checks so they cannot be bypassed by a custom client.
- The helper should:
  - Accept the user's applications and the relevant health card as inputs.
  - Block renewal when **any** application (new or renew) is in a pending/unresolved state.
  - Enforce the **30‑day rule**: only allow renewal when the card is **expired** or **within 30 days of expiry**.
  - Return a structured result, e.g. `{ isEligible, reason, eligibleApplication, eligibleCard }`.
- **Usage plan:**
  - Update `checkRenewalEligibilityQuery` (Step 2.1) to call this helper instead of duplicating the rules.
  - Update `createRenewalApplicationMutation` (Phase 3) to call the same helper and **throw** when `isEligible` is `false`, so invalid renewals cannot be created even if the frontend is bypassed.

You can implement Phase 2 and Phase 3 as written for an initial version, then apply this refactor to keep all future rules (e.g. new statuses or additional checks) in one place.

---

# PHASE 3: BACKEND RENEWAL MUTATION

## Step 3.1: Create Renewal Application Mutation (25 min)

**File:** `C:\Em\backend\convex\applications\createRenewalApplication.ts` (NEW FILE)

**Create this file:**

```typescript
import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a renewal application
 * - Links to previous health card
 * - Pre-populates data from previous application
 * - Enforces eligibility checks
 */
export const createRenewalApplicationMutation = mutation({
  args: {
    previousHealthCardId: v.id("healthCards"),
    jobCategoryId: v.id("jobCategories"),
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    suffix: v.optional(v.string()),
    age: v.optional(v.number()),
    nationality: v.optional(v.string()),
    gender: v.optional(
      v.union(v.literal("Male"), v.literal("Female"), v.literal("Other"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the health card belongs to this user
    const previousCard = await ctx.db.get(args.previousHealthCardId);
    if (!previousCard) {
      throw new Error("Previous health card not found");
    }

    const previousApplication = await ctx.db.get(previousCard.applicationId);
    if (!previousApplication || previousApplication.userId !== user._id) {
      throw new Error("Previous health card does not belong to this user");
    }

    // Check eligibility (redundant but safe)
    const eligibilityCheck = await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const hasPendingRenewal = eligibilityCheck.some(
      (app) =>
        app.applicationType === "Renew" &&
        app.applicationStatus !== "Approved" &&
        app.applicationStatus !== "Payment Rejected"
    );

    if (hasPendingRenewal) {
      throw new Error("You already have a renewal application in progress");
    }

    // Calculate renewal count
    const previousRenewals = eligibilityCheck.filter(
      (app) => app.applicationType === "Renew" && app.applicationStatus === "Approved"
    );

    // Create renewal application
    const renewalApplicationId = await ctx.db.insert("applications", {
      userId: user._id,
      applicationType: "Renew",
      jobCategoryId: args.jobCategoryId,
      position: args.position,
      organization: args.organization,
      civilStatus: args.civilStatus,
      firstName: args.firstName || previousApplication.firstName,
      middleName: args.middleName || previousApplication.middleName,
      lastName: args.lastName || previousApplication.lastName,
      suffix: args.suffix || previousApplication.suffix,
      age: args.age || previousApplication.age,
      nationality: args.nationality || previousApplication.nationality,
      gender: args.gender || previousApplication.gender,
      applicationStatus: "Draft",
      previousHealthCardId: args.previousHealthCardId,
      isRenewal: true,
      renewalCount: previousRenewals.length + 1,
    });

    return renewalApplicationId;
  },
});
```

**Save the file.**

---

# PHASE 4: BACKEND PREVIOUS DATA QUERY

## Step 4.1: Get Previous Application Data (15 min)

**File:** `C:\Em\backend\convex\applications\getPreviousApplicationData.ts` (NEW FILE)

**Create this file:**

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get previous application data for pre-population
 */
export const getPreviousApplicationDataQuery = query({
  args: {
    healthCardId: v.id("healthCards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const healthCard = await ctx.db.get(args.healthCardId);
    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const application = await ctx.db.get(healthCard.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify ownership
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || application.userId !== user._id) {
      throw new Error("Unauthorized access to health card data");
    }

    const jobCategory = await ctx.db.get(application.jobCategoryId);

    return {
      application: {
        firstName: application.firstName,
        middleName: application.middleName,
        lastName: application.lastName,
        suffix: application.suffix,
        age: application.age,
        nationality: application.nationality,
        gender: application.gender,
        position: application.position,
        organization: application.organization,
        civilStatus: application.civilStatus,
        jobCategoryId: application.jobCategoryId,
      },
      jobCategory,
      healthCard: {
        _id: healthCard._id,
        registrationNumber: healthCard.registrationNumber,
        issuedDate: healthCard.issuedDate,
        expiryDate: healthCard.expiryDate,
        status: healthCard.status,
      },
    };
  },
});
```

**Save the file.**

---

# PHASE 5: MOBILE - CARD SELECTION SCREEN

## Step 5.1: Create Card Selection Screen (45 min)

**File:** `C:\Em\apps\mobile\app\(screens)\(shared)\renewal\select-card.tsx` (NEW FILE)

**Create the directory structure first:**
```
C:\Em\apps\mobile\app\(screens)\(shared)\renewal\
```

**Then create the file with this complete implementation:**

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale, verticalScale } from '@shared/utils/responsive';
import { theme } from '@shared/styles/theme';
import { format } from 'date-fns';

export default function SelectCardForRenewalScreen() {
  const healthCards = useQuery(api.healthCards.getUserCardsQuery);
  const eligibility = useQuery(api.applications.checkRenewalEligibilityQuery);

  if (healthCards === undefined || eligibility === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[600]} />
        <Text style={styles.loadingText}>Loading health cards...</Text>
      </View>
    );
  }

  if (!healthCards || healthCards.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Card to Renew</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="card-outline" size={moderateScale(64)} color={theme.colors.gray[400]} />
          <Text style={styles.emptyTitle}>No Health Cards Found</Text>
          <Text style={styles.emptyText}>
            You need an existing health card before you can renew.
          </Text>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/(tabs)/apply')}
          >
            <Text style={styles.applyButtonText}>Apply for New Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!eligibility?.isEligible) {
    Alert.alert(
      'Cannot Renew',
      eligibility?.reason || 'You are not eligible for renewal at this time.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
    return null;
  }

  const handleSelectCard = (healthCardId: string, cardDetails: any) => {
    const daysUntilExpiry = Math.ceil(
      (cardDetails.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry > 30) {
      Alert.alert(
        'Confirm Renewal',
        `This card is still valid for ${daysUntilExpiry} days. Are you sure you want to renew now?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => navigateToRenewalForm(healthCardId) },
        ]
      );
    } else {
      navigateToRenewalForm(healthCardId);
    }
  };

  const navigateToRenewalForm = (healthCardId: string) => {
    router.push({
      pathname: '/(tabs)/apply',
      params: { action: 'renew', healthCardId },
    });
  };

  const getCardColor = (colorCode: string) => {
    const color = colorCode?.toLowerCase() || '';
    if (color.includes('yellow')) return theme.colors.yellow[500];
    if (color.includes('green')) return theme.colors.green[500];
    if (color.includes('pink')) return theme.colors.pink[500];
    return theme.colors.blue[500];
  };

  const getUrgencyInfo = (expiryDate: number) => {
    const daysUntilExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
      return { label: 'EXPIRED', color: theme.colors.red[600], bgColor: theme.colors.red[50], urgent: true };
    } else if (daysUntilExpiry <= 7) {
      return { label: 'URGENT', color: theme.colors.orange[700], bgColor: theme.colors.orange[50], urgent: true };
    } else if (daysUntilExpiry <= 30) {
      return { label: 'RENEW SOON', color: theme.colors.orange[600], bgColor: theme.colors.orange[50], urgent: true };
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Card to Renew</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subtitle}>Choose which health card you want to renew:</Text>

        {healthCards.map((card) => {
          const urgency = getUrgencyInfo(card.expiryDate || card.expiresAt);
          const daysUntilExpiry = Math.ceil(((card.expiryDate || card.expiresAt) - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <TouchableOpacity
              key={card._id}
              style={[styles.cardItem, urgency?.urgent && styles.cardItemUrgent]}
              onPress={() => handleSelectCard(card._id, card)}
              activeOpacity={0.7}
            >
              {urgency && (
                <View style={[styles.urgencyBadge, { backgroundColor: urgency.bgColor }]}>
                  <Text style={[styles.urgencyText, { color: urgency.color }]}>{urgency.label}</Text>
                </View>
              )}

              <View style={[styles.cardIcon, { backgroundColor: getCardColor(card.jobCategory?.colorCode || '') }]}>
                <Ionicons name="card" size={moderateScale(32)} color={theme.colors.white} />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.jobCategory?.name || 'Health Card'}</Text>
                <Text style={styles.cardSubtitle}>
                  Registration: {card.registrationNumber || 'N/A'}
                </Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>
                      Issued: {format(new Date(card.issuedDate || card.issuedAt), 'MMM dd, yyyy')}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>
                      {daysUntilExpiry < 0 
                        ? `Expired ${Math.abs(daysUntilExpiry)} days ago` 
                        : `Expires in ${daysUntilExpiry} days`}
                    </Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={moderateScale(24)} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          );
        })}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={moderateScale(20)} color={theme.colors.blue[600]} />
          <Text style={styles.infoText}>
            Renewal requires updated medical documents and payment. Your personal information will be pre-filled.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background.primary 
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: verticalScale(16),
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: moderateScale(16), 
    paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: { 
    padding: moderateScale(8), 
    marginRight: moderateScale(8) 
  },
  headerTitle: { 
    fontSize: moderateScale(20), 
    fontWeight: '600', 
    color: theme.colors.text.primary 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    padding: moderateScale(16) 
  },
  subtitle: { 
    fontSize: moderateScale(16), 
    color: theme.colors.text.secondary, 
    marginBottom: verticalScale(16) 
  },
  cardItem: {
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: theme.colors.white, 
    borderRadius: moderateScale(12),
    padding: moderateScale(16), 
    marginBottom: verticalScale(12),
    borderWidth: 1, 
    borderColor: theme.colors.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardItemUrgent: { 
    borderColor: theme.colors.orange[300], 
    borderWidth: 2 
  },
  urgencyBadge: {
    position: 'absolute', 
    top: moderateScale(8), 
    right: moderateScale(8),
    paddingHorizontal: moderateScale(8), 
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  urgencyText: { 
    fontSize: moderateScale(10), 
    fontWeight: '700' 
  },
  cardIcon: {
    width: moderateScale(56), 
    height: moderateScale(56),
    borderRadius: moderateScale(28), 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  cardContent: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: moderateScale(16), 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginBottom: verticalScale(4) 
  },
  cardSubtitle: { 
    fontSize: moderateScale(13), 
    color: theme.colors.text.secondary, 
    marginBottom: verticalScale(8) 
  },
  cardMeta: { 
    gap: verticalScale(4) 
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: moderateScale(4) 
  },
  metaText: { 
    fontSize: moderateScale(12), 
    color: theme.colors.text.tertiary 
  },
  infoBox: {
    flexDirection: 'row', 
    backgroundColor: theme.colors.blue[50],
    padding: moderateScale(12), 
    borderRadius: moderateScale(8),
    marginTop: verticalScale(16), 
    gap: moderateScale(8),
  },
  infoText: { 
    flex: 1, 
    fontSize: moderateScale(13), 
    color: theme.colors.blue[700], 
    lineHeight: moderateScale(18) 
  },
  emptyContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: moderateScale(32) 
  },
  emptyTitle: { 
    fontSize: moderateScale(18), 
    fontWeight: '600', 
    color: theme.colors.text.primary, 
    marginTop: verticalScale(16), 
    marginBottom: verticalScale(8) 
  },
  emptyText: { 
    fontSize: moderateScale(14), 
    color: theme.colors.text.secondary, 
    textAlign: 'center', 
    marginBottom: verticalScale(24) 
  },
  applyButton: { 
    backgroundColor: theme.colors.primary[600], 
    paddingHorizontal: moderateScale(24), 
    paddingVertical: verticalScale(12), 
    borderRadius: moderateScale(8) 
  },
  applyButtonText: { 
    fontSize: moderateScale(14), 
    fontWeight: '600', 
    color: theme.colors.white 
  },
});
```

**Save the file.**

---

# PHASE 6: MOBILE - RENEWAL HOOK

## Step 6.1: Create Renewal Eligibility Hook (10 min)

**File:** `C:\Em\apps\mobile\src\features\application\hooks\useRenewalEligibility.ts` (NEW FILE)

```typescript
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

/**
 * Hook to check if user is eligible for renewal
 * Returns eligibility status and previous card/application data
 */
export function useRenewalEligibility() {
  const eligibilityData = useQuery(
    api.applications.checkRenewalEligibilityQuery
  );

  return {
    isEligible: eligibilityData?.isEligible ?? false,
    reason: eligibilityData?.reason ?? '',
    previousCard: eligibilityData?.previousCard ?? null,
    previousApplication: eligibilityData?.previousApplication ?? null,
    isLoading: eligibilityData === undefined,
  };
}
```

**Save the file.**

---

# PHASE 7: MOBILE - DASHBOARD UPDATES

## Step 7.1: Update Dashboard Widget (10 min)

**File:** `C:\Em\apps\mobile\src\widgets\dashboard\DashboardWidget.enhanced.tsx`

**Find line ~295-328** (Health Card stat card section)

**Look for this code:**
```typescript
if (daysUntilExpiry < 0) {
  // Expired
  statusValue = 'Expired';
  statusText = 'Renew required';
```

**Change to:**
```typescript
if (daysUntilExpiry < 0) {
  // Expired - URGENT RENEWAL
  statusValue = 'Expired';
  statusText = 'Renew now';
  statusBadge = { text: 'RENEW NOW', color: theme.colors.red[700] };
  cardGradient = [theme.colors.red[500], theme.colors.red[600]];
```

**Find the onPress handler** (around line 323):
```typescript
onPress={() => router.push('/(screens)/(shared)/health-cards')}
```

**Change to:**
```typescript
onPress={() => {
  if (daysUntilExpiry <= 30) {
    // Navigate to card selection for renewal
    router.push('/(screens)/(shared)/renewal/select-card');
  } else {
    router.push('/(screens)/(shared)/health-cards');
  }
}}
```

**Save the file.**

---

# PHASE 8: MOBILE - HEALTH CARDS SCREEN

## Step 8.1: Update Health Cards Screen (5 min)

**File:** `C:\Em\apps\mobile\src\screens\shared\HealthCardsScreen\HealthCardsScreen.tsx`

**Find line ~235-243** (where renewal is mentioned)

**Find this code:**
```typescript
{healthCard.isExpired && (
  <TouchableOpacity
    style={styles.renewButton}
    onPress={handleRenewal}
  >
```

**Replace with:**
```typescript
{(healthCard.isExpired || healthCard.daysUntilExpiry <= 30) && (
  <TouchableOpacity
    style={styles.renewButton}
    onPress={() => router.push('/(screens)/(shared)/renewal/select-card')}
  >
    <Ionicons name="refresh" size={moderateScale(20)} color={theme.colors.white} />
    <Text style={styles.renewButtonText}>Renew Health Card</Text>
  </TouchableOpacity>
)}
```

**Save the file.**

---

# PHASE 9: MOBILE - APPLICATION FORM UPDATES

## Step 9.1: Update Application Form for Renewal (25 min)

**File:** `C:\Em\apps\mobile\app\(tabs)\apply.tsx`

**At the top of the component** (after imports, before the main function):

**Add these imports if missing:**
```typescript
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { useEffect } from 'react';
```

**Inside the component function, add at the top:**
```typescript
// Detect renewal mode
const params = useLocalSearchParams();
const isRenewalMode = params.action === 'renew';
const healthCardId = params.healthCardId as string | undefined;

// Get previous data if in renewal mode
const previousAppData = useQuery(
  api.applications.getPreviousApplicationDataQuery,
  isRenewalMode && healthCardId ? { healthCardId } : 'skip'
);

// Pre-populate form when renewal data loads
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

**In the render section, before the step content, add:**
```typescript
{isRenewalMode && (
  <View style={styles.renewalBanner}>
    <Ionicons name="refresh-circle" size={moderateScale(24)} color={theme.colors.primary[600]} />
    <View style={styles.renewalBannerContent}>
      <Text style={styles.renewalBannerTitle}>Renewal Application</Text>
      <Text style={styles.renewalBannerText}>
        Your information has been pre-filled from your previous application
      </Text>
    </View>
  </View>
)}
```

**Add these styles to the StyleSheet:**
```typescript
renewalBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.primary[50],
  padding: moderateScale(12),
  marginHorizontal: moderateScale(16),
  marginBottom: verticalScale(16),
  borderRadius: moderateScale(8),
  borderLeftWidth: 4,
  borderLeftColor: theme.colors.primary[600],
},
renewalBannerContent: {
  flex: 1,
  marginLeft: moderateScale(12),
},
renewalBannerTitle: {
  fontSize: moderateScale(14),
  fontWeight: '600',
  color: theme.colors.primary[700],
  marginBottom: verticalScale(2),
},
renewalBannerText: {
  fontSize: moderateScale(12),
  color: theme.colors.primary[600],
},
```

**Save the file.**

---

# PHASE 10: MOBILE - UPDATE RESTRICTIONS

## Step 10.1: Update Application Restrictions (15 min)

**File:** `C:\Em\apps\mobile\src\features\application\lib\applicationRestrictions.ts`

**Add this function at the end of the file:**

```typescript
/**
 * Checks if user can create a renewal application
 * @param applications - Array of user applications
 * @returns Object with canRenew flag and message
 */
export function canCreateRenewal(applications: any[]): {
  canRenew: boolean;
  message: string;
} {
  if (!applications || applications.length === 0) {
    return {
      canRenew: false,
      message: 'You must have an approved health card before you can renew.',
    };
  }

  // Check for pending renewal
  const pendingRenewal = applications.find(
    app => app.applicationType === 'Renew' && isUnresolvedStatus(app.status)
  );

  if (pendingRenewal) {
    return {
      canRenew: false,
      message: 'You already have a renewal application in progress.',
    };
  }

  // Check for approved applications with health cards
  const hasApprovedApp = applications.some(
    app => app.status === 'Approved'
  );

  if (!hasApprovedApp) {
    return {
      canRenew: false,
      message: 'You must have an approved health card before you can renew.',
    };
  }

  return {
    canRenew: true,
    message: '',
  };
}
```

**Save the file.**

---

# PHASE 11: WEBADMIN UPDATES

## Step 11.1: Update WebAdmin Dashboard (15 min)

**File:** `C:\Em\apps\webadmin\src\app\dashboard\page.tsx`

**Find where applications are displayed in the list**

**Add renewal badge:**
```typescript
{application.applicationType === 'Renew' && (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
    <RefreshCw className="w-3 h-3 mr-1" />
    Renewal
  </span>
)}
```

**Save the file.**

## Step 11.2: Update Application Detail View (15 min)

**File:** `C:\Em\apps\webadmin\src\app\dashboard\[id]\page.tsx`

**Add previous card section for renewals (find appropriate location):**

```typescript
{application.applicationType === 'Renew' && application.previousHealthCardId && (
  <div className="bg-white shadow rounded-lg p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">Previous Health Card</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm text-gray-500">Registration Number</label>
        <p className="font-medium">{previousCard?.registrationNumber}</p>
      </div>
      <div>
        <label className="text-sm text-gray-500">Issued Date</label>
        <p className="font-medium">
          {previousCard?.issuedDate && format(new Date(previousCard.issuedDate), 'MMM dd, yyyy')}
        </p>
      </div>
      <div>
        <label className="text-sm text-gray-500">Expiry Date</label>
        <p className="font-medium">
          {previousCard?.expiryDate && format(new Date(previousCard.expiryDate), 'MMM dd, yyyy')}
        </p>
      </div>
      <div>
        <label className="text-sm text-gray-500">Status</label>
        <p className="font-medium capitalize">{previousCard?.status}</p>
      </div>
    </div>
  </div>
)}
```

**Save the file.**

---

# PHASE 12: TESTING

## Test Checklist

Run through these tests in order:

### Backend Tests (use Convex Dashboard)
- [ ] Call `checkRenewalEligibilityQuery` with user who has no card → Returns not eligible
- [ ] Call `checkRenewalEligibilityQuery` with user who has expired card → Returns eligible
- [ ] Call `checkRenewalEligibilityQuery` with user who has pending renewal → Returns not eligible
- [ ] Call `getPreviousApplicationDataQuery` with valid healthCardId → Returns previous data
- [ ] Call `createRenewalApplicationMutation` with valid data → Creates renewal application

### Mobile Tests
- [ ] User with no health card sees "Apply for New Card" in card selection
- [ ] User with expired card sees "EXPIRED" badge in card selection
- [ ] User with card expiring in 15 days sees "RENEW SOON" badge
- [ ] Clicking card with >30 days shows confirmation prompt
- [ ] Clicking card with <30 days goes directly to form
- [ ] Application form shows renewal banner
- [ ] Personal details are pre-filled correctly
- [ ] User can edit pre-filled data
- [ ] Job category is pre-selected but can be changed
- [ ] Document upload requires fresh uploads (not carried over)
- [ ] Submission creates application with applicationType = 'Renew'

### WebAdmin Tests
- [ ] Renewal application shows "Renewal" badge in list
- [ ] Application detail shows previous card information
- [ ] Admin can review and approve renewal application
- [ ] Approved renewal issues new health card
- [ ] Old health card is marked as expired

### Edge Cases
- [ ] User tries to renew while having pending new application → Blocked
- [ ] User tries to renew twice → Blocked
- [ ] User without authenticated session → Redirected to login
- [ ] Health card that doesn't belong to user → Access denied

---

# TROUBLESHOOTING

## Issue: Convex schema not updating
**Fix:** Run `npx convex dev` in backend directory to trigger deployment

## Issue: Card selection screen shows empty
**Fix:** Check if `getUserCardsQuery` is returning data. Verify user has approved applications.

## Issue: Form doesn't pre-populate
**Fix:** Check browser/app console for errors. Verify `healthCardId` param is passed correctly.

## Issue: "Skip" error in useQuery
**Fix:** Ensure conditional is correct: `isRenewalMode && healthCardId ? { healthCardId } : 'skip'`

## Issue: Navigation not working
**Fix:** Verify Expo Router file structure matches exactly: `app/(screens)/(shared)/renewal/select-card.tsx`

---

# COMPLETION CHECKLIST

After implementing all phases, verify:

- [ ] Schema includes `previousHealthCardId`, `isRenewal`, `renewalCount` fields
- [ ] Backend has 3 new files: checkRenewalEligibility.ts, createRenewalApplication.ts, getPreviousApplicationData.ts
- [ ] Mobile has card selection screen at correct path
- [ ] Mobile has renewal eligibility hook
- [ ] Dashboard navigates to card selection
- [ ] Health Cards screen navigates to card selection
- [ ] Application form detects renewal mode and pre-fills data
- [ ] Renewal banner shows in application form
- [ ] WebAdmin shows renewal badge
- [ ] WebAdmin shows previous card history
- [ ] All tests pass

---

# FINAL NOTES

- Users can renew 30 days before expiry or anytime after
- Users CAN change job category during renewal
- All documents must be re-uploaded (fresh, current documents)
- Orientation required if new category is Yellow Card
- Same payment fees apply (₱250 + ₱35 service fee)
- Old card marked expired ONLY when new card is issued
- Each renewal gets a NEW registration number

---

**Document Version:** 1.0 (Master)  
**Created:** 2025-11-14  
**Complete:** Ready for implementation  
**Estimated Time:** 5.5 hours total
