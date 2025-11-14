# Health Card Renewal Implementation Plan

## 📋 Overview

This document outlines the complete implementation plan for the **Health Card Renewal** feature in the eMediCard mobile application. The renewal system will allow users with existing (active, expired, or expiring) health cards to renew their health cards with a streamlined process.

**Documentation Reference:** `eMediCard Project 1.2.1 Main.txt`  
**Status:** Not Yet Implemented  
**Target Platform:** Mobile (Android), WebAdmin  
**Backend:** Convex

---

## 🎯 Objectives

Based on the project documentation:

> "To develop a renewal module that manages the reapplication process for existing health card holders. This module enables users to renew their health cards by updating required documents, verifying eligibility, and ensuring continuity of classification and validity."

### Key Features

1. **Eligibility Verification**: Check if user has a previous health card before allowing renewal
2. **Data Pre-population**: Auto-fill user information from previous application
3. **Classification Continuity**: Maintain the same health card type (Yellow/Green/Pink)
4. **Expiry Management**: Track card expiry and prompt users for renewal
5. **Document Updates**: Allow users to upload updated medical documents
6. **History Linking**: Link renewal applications to previous health cards for audit trail

---

## 🏗️ Current System State

### ✅ Already Implemented

1. **ApplicationType Enum**: `'New' | 'Renew'` exists in types
2. **ApplicationTypeStep Component**: Users can select between New and Renew
3. **Backend Schema**: `applications.applicationType` supports both types
4. **Health Card Expiry**: Cards have `expiryDate` field and status tracking
5. **Dashboard Expiry Display**: Shows days until expiry with visual indicators

### ❌ Missing Functionality

1. **No renewal eligibility check**: Users can select "Renew" even without a previous card
2. **No data pre-population**: Renewal doesn't auto-fill previous application data
3. **No card linking**: Renewal applications don't reference previous health cards
4. **No renewal restrictions**: System doesn't prevent duplicate renewals
5. **No renewal-specific workflow**: Same process as new applications
6. **No previous card history**: Admins can't see renewal history

---

## 📐 Implementation Architecture

### System Flow

```
User Opens App
    ↓
Has Health Card? → NO → Show "Apply for New Health Card"
    ↓ YES
    ↓
Check Card Status
    ↓
├─→ Expired (< 0 days) → Show "RENEW NOW" (Red Badge)
├─→ Expiring Soon (< 30 days) → Show "Renew Soon" (Orange Badge)
└─→ Valid (> 30 days) → Show "View Health Card"
    ↓
User Clicks Renew
    ↓
Navigate to Card Selection Screen
    ↓
Display All Health Cards
    - Show urgency badges
    - Display expiry info
    - Allow selection
    ↓
User Selects Specific Card
    ↓
Check Eligibility for Selected Card
    ↓
├─→ Has Pending Renewal? → Block + Show Error
├─→ Has Active New App? → Block + Show Error
└─→ Eligible → Continue
    ↓
Navigate to Application Form
    - Pass healthCardId as parameter
    - Link to previous card
    - Pre-populate user data
    - Set applicationType = 'Renew'
    ↓
Application Flow (Same as New)
    - Job Category Selection (pre-selected, can change)
    - Personal Details (pre-filled, can edit)
    - Upload Documents (fresh uploads required)
    - Payment
    - Orientation (if Yellow card)
    ↓
Admin Reviews → Approval
    ↓
Issue New Health Card
    - New expiry date (+1 year)
    - New registration number
    - Mark old card as 'expired'
```

---

## 🔧 Detailed Implementation Plan

## Phase 1: Backend - Renewal Eligibility & Validation

### 1.1 Create Renewal Eligibility Query

**File:** `backend/convex/applications/checkRenewalEligibility.ts`

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

### 1.2 Create Renewal Application Mutation

**File:** `backend/convex/applications/createRenewalApplication.ts`

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
    jobCategoryId: v.id("jobCategories"), // Allow category change
    position: v.string(),
    organization: v.string(),
    civilStatus: v.string(),
    // Optional fields for updates
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
      // Link to previous health card for audit trail
      // Note: This requires adding a new field to schema
      // previousHealthCardId: args.previousHealthCardId,
    });

    return renewalApplicationId;
  },
});
```

### 1.3 Update Schema

**File:** `backend/convex/schema.ts`

Add these fields to the `applications` table:

```typescript
// Add to applications table definition
previousHealthCardId: v.optional(v.id("healthCards")), // For renewal applications
isRenewal: v.optional(v.boolean()), // Quick check if application is renewal
renewalCount: v.optional(v.float64()), // Track how many times card has been renewed
```

---

## Phase 2: Backend - Enhanced Queries

### 2.1 Get Previous Application Data Query

**File:** `backend/convex/applications/getPreviousApplicationData.ts`

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
    const healthCard = await ctx.db.get(args.healthCardId);
    if (!healthCard) {
      throw new Error("Health card not found");
    }

    const application = await ctx.db.get(healthCard.applicationId);
    if (!application) {
      throw new Error("Application not found");
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
        registrationNumber: healthCard.registrationNumber,
        issuedDate: healthCard.issuedDate,
        expiryDate: healthCard.expiryDate,
        status: healthCard.status,
      },
    };
  },
});
```

---

## Phase 3: Mobile - Renewal Entry Points

### 3.1 Create Card Selection Screen (NEW)

**File:** `app/(screens)/(shared)/renewal/select-card.tsx` (NEW FILE)

This screen allows users to select which health card they want to renew, even if they only have one card. This makes the flow dynamic and scalable.

**Key Features:**
- Display all user health cards with details
- Show urgency badges (EXPIRED, URGENT, RENEW SOON)
- Confirmation prompt for non-urgent renewals (>30 days)
- Empty state if no health cards exist
- Direct navigation to renewal form with selected card

#### 3.1.1 Full Card Selection Screen Implementation

```typescript
// app/(screens)/(shared)/renewal/select-card.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
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

  if (healthCards === undefined) {
    return <LoadingSpinner />;
  }

  if (!healthCards || healthCards.length === 0) {
    return (
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
    if (colorCode.toLowerCase().includes('yellow')) return theme.colors.yellow[500];
    if (colorCode.toLowerCase().includes('green')) return theme.colors.green[500];
    if (colorCode.toLowerCase().includes('pink')) return theme.colors.pink[500];
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
          const urgency = getUrgencyInfo(card.expiryDate);
          const daysUntilExpiry = Math.ceil((card.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));

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
                <Text style={styles.cardSubtitle}>Registration: {card.registrationNumber}</Text>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>Issued: {format(new Date(card.issuedDate), 'MMM dd, yyyy')}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={moderateScale(14)} color={theme.colors.gray[500]} />
                    <Text style={styles.metaText}>
                      {daysUntilExpiry < 0 ? `Expired ${Math.abs(daysUntilExpiry)} days ago` : `Expires in ${daysUntilExpiry} days`}
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
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1, borderBottomColor: theme.colors.gray[200],
  },
  backButton: { padding: moderateScale(8), marginRight: moderateScale(8) },
  headerTitle: { fontSize: moderateScale(20), fontWeight: '600', color: theme.colors.text.primary },
  scrollView: { flex: 1 },
  scrollContent: { padding: moderateScale(16) },
  subtitle: { fontSize: moderateScale(16), color: theme.colors.text.secondary, marginBottom: verticalScale(16) },
  cardItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.white, borderRadius: moderateScale(12),
    padding: moderateScale(16), marginBottom: verticalScale(12),
    borderWidth: 1, borderColor: theme.colors.gray[200],
  },
  cardItemUrgent: { borderColor: theme.colors.orange[300], borderWidth: 2 },
  urgencyBadge: {
    position: 'absolute', top: moderateScale(8), right: moderateScale(8),
    paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
  },
  urgencyText: { fontSize: moderateScale(10), fontWeight: '700' },
  cardIcon: {
    width: moderateScale(56), height: moderateScale(56),
    borderRadius: moderateScale(28), alignItems: 'center', justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: moderateScale(16), fontWeight: '600', color: theme.colors.text.primary, marginBottom: verticalScale(4) },
  cardSubtitle: { fontSize: moderateScale(13), color: theme.colors.text.secondary, marginBottom: verticalScale(8) },
  cardMeta: { gap: verticalScale(4) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(4) },
  metaText: { fontSize: moderateScale(12), color: theme.colors.text.tertiary },
  infoBox: {
    flexDirection: 'row', backgroundColor: theme.colors.blue[50],
    padding: moderateScale(12), borderRadius: moderateScale(8),
    marginTop: verticalScale(16), gap: moderateScale(8),
  },
  infoText: { flex: 1, fontSize: moderateScale(13), color: theme.colors.blue[700], lineHeight: moderateScale(18) },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: moderateScale(32) },
  emptyTitle: { fontSize: moderateScale(18), fontWeight: '600', color: theme.colors.text.primary, marginTop: verticalScale(16), marginBottom: verticalScale(8) },
  emptyText: { fontSize: moderateScale(14), color: theme.colors.text.secondary, textAlign: 'center', marginBottom: verticalScale(24) },
  applyButton: { backgroundColor: theme.colors.primary[600], paddingHorizontal: moderateScale(24), paddingVertical: verticalScale(12), borderRadius: moderateScale(8) },
  applyButtonText: { fontSize: moderateScale(14), fontWeight: '600', color: theme.colors.white },
});
```

### 3.2 Update Dashboard Widget

**File:** `src/widgets/dashboard/DashboardWidget.enhanced.tsx`

Add renewal CTA that navigates to card selection screen:

```typescript
// Inside Health Card stat card logic
if (daysUntilExpiry < 0) {
  // Expired - URGENT RENEWAL
  statusValue = 'Expired';
  statusText = 'Renew now'; // Change from 'Renew required'
  statusBadge = { text: 'RENEW NOW', color: theme.colors.red[700] };
  cardGradient = [theme.colors.red[500], theme.colors.red[600]];
} else if (daysUntilExpiry <= 7) {
  // Expiring soon (< 7 days) - URGENT
  statusValue = `${daysUntilExpiry}d`;
  statusText = `Renew now (${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} left)`;
  statusBadge = { text: 'URGENT', color: theme.colors.red[700] };
  cardGradient = [theme.colors.orange[500], theme.colors.orange[600]];
} else if (daysUntilExpiry <= 30) {
  // Expires soon (7-30 days)
  statusValue = `${daysUntilExpiry}d`;
  statusText = `Renew soon (${daysUntilExpiry} days left)`;
  statusBadge = { text: 'Renew Soon', color: theme.colors.orange[700] };
  cardGradient = [theme.colors.orange[400], theme.colors.orange[500]];
}

// Update onPress to navigate to card selection screen
onPress={() => {
  if (daysUntilExpiry <= 30) {
    // Navigate to card selection for renewal
    router.push('/(screens)/(shared)/renewal/select-card');
  } else {
    router.push('/(screens)/(shared)/health-cards');
  }
}}
```

### 3.3 Update Health Cards Screen

**File:** `src/screens/shared/HealthCardsScreen/HealthCardsScreen.tsx`

Add renewal button that navigates to card selection screen:

```typescript
// Around line 235-243 where renewal is mentioned
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

---

## Phase 4: Mobile - Renewal Application Flow

### 4.1 Create Renewal Hook

**File:** `src/features/application/hooks/useRenewalEligibility.ts`

```typescript
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';

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

### 4.2 Update Application Form Screen

**File:** `app/(tabs)/apply.tsx`

Detect renewal mode and pre-populate data:

```typescript
// At the top of the component
const params = useLocalSearchParams();
const isRenewalMode = params.action === 'renew';
const healthCardId = params.healthCardId as string | undefined;

// Get renewal data if in renewal mode
const previousAppData = useQuery(
  api.applications.getPreviousApplicationDataQuery,
  isRenewalMode && healthCardId ? { healthCardId } : 'skip'
);

// Pre-populate formData when renewal data loads
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

// Add renewal banner
{isRenewalMode && (
  <View style={styles.renewalBanner}>
    <Ionicons name="refresh-circle" size={moderateScale(24)} color={theme.colors.primary[600]} />
    <Text style={styles.renewalBannerText}>
      Renewal Application - Your information has been pre-filled from your previous application
    </Text>
  </View>
)}
```

### 4.3 Update ApplicationTypeStep

**File:** `src/features/application/components/steps/ApplicationTypeStep/ApplicationTypeStep.tsx`

Show renewal eligibility message:

```typescript
// Add eligibility check
const { isEligible, reason } = useRenewalEligibility();

// Update the Renew option
{type === 'Renew' && !isEligible && (
  <View style={styles.ineligibleBadge}>
    <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.red[600]} />
    <Text style={styles.ineligibleText}>{reason}</Text>
  </View>
)}
```

---

## Phase 5: Mobile - Renewal Restrictions

### 5.1 Update Application Restrictions

**File:** `src/features/application/lib/applicationRestrictions.ts`

Add renewal-specific logic:

```typescript
/**
 * Checks if user can create a renewal application
 */
export function canCreateRenewal(applications: any[]): {
  canRenew: boolean;
  message: string;
} {
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

---

## Phase 6: WebAdmin - Renewal Support

### 6.1 Display Renewal Badge

**File:** `apps/webadmin/src/app/dashboard/page.tsx`

Show renewal indicator in application list:

```typescript
{application.applicationType === 'Renew' && (
  <Badge variant="blue">Renewal</Badge>
)}
```

### 6.2 Show Previous Card History

**File:** `apps/webadmin/src/app/dashboard/[id]/page.tsx`

Add previous health card section for renewals:

```typescript
{application.applicationType === 'Renew' && application.previousHealthCardId && (
  <Card>
    <CardHeader>
      <CardTitle>Previous Health Card</CardTitle>
      <CardDescription>Original card information</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Display previous card details */}
      <div>
        <Label>Registration Number</Label>
        <p>{previousCard.registrationNumber}</p>
      </div>
      <div>
        <Label>Issued Date</Label>
        <p>{formatDate(previousCard.issuedDate)}</p>
      </div>
      <div>
        <Label>Expiry Date</Label>
        <p>{formatDate(previousCard.expiryDate)}</p>
      </div>
    </CardContent>
  </Card>
)}
```

---

## Phase 7: Testing & Documentation

### 7.1 Test Scenarios

**Eligibility Tests:**
- [ ] User without previous card cannot renew
- [ ] User with expired card can renew
- [ ] User with active card can renew (within 30 days of expiry)
- [ ] User with pending renewal cannot create another renewal
- [ ] User with pending new application cannot renew

**Data Pre-population Tests:**
- [ ] Renewal form pre-fills personal details
- [ ] User can edit pre-filled data
- [ ] Job category can be changed in renewal

**Workflow Tests:**
- [ ] Renewal follows same document upload flow
- [ ] Renewal follows same payment flow
- [ ] Yellow card renewal requires orientation
- [ ] Renewal approval issues new health card

**Card Management Tests:**
- [ ] Old card is marked as expired when new card is issued
- [ ] New card has new expiry date (+1 year)
- [ ] New card has new registration number
- [ ] Renewal history is maintained

### 7.2 Update Documentation

- [ ] Update `CLAUDE.md` with renewal feature details
- [ ] Update `WARP.md` with renewal implementation notes
- [ ] Create user guide for renewal process
- [ ] Update API documentation

---

## 📊 Database Schema Changes

### Required Schema Updates

```typescript
// backend/convex/schema.ts

applications: defineTable({
  // ... existing fields ...
  
  // NEW FIELDS for renewal support
  previousHealthCardId: v.optional(v.id("healthCards")),
  isRenewal: v.optional(v.boolean()),
  renewalCount: v.optional(v.float64()),
})
  .index("by_user", ["userId"])
  .index("by_previous_card", ["previousHealthCardId"]), // NEW INDEX
```

---

## 🚨 Important Implementation Notes

### Critical Rules

1. **Eligibility Enforcement**: ALWAYS check eligibility backend-side, not just frontend
2. **Card Linking**: ALWAYS link renewal to previous health card for audit trail
3. **Data Integrity**: Previous health card must belong to the user
4. **Status Transitions**: Mark old card as 'expired' only when new card is issued
5. **Registration Numbers**: Generate NEW registration number for renewal card
6. **Expiry Calculation**: New card expires 1 year from issuance date

### Business Logic

- **Renewal Window**: Users can renew 30 days before expiry or anytime after expiry
- **Job Category Change**: Users CAN change job category during renewal (e.g., Food Handler → Non-Food)
- **Document Requirements**: Same requirements as new application (all documents must be current)
- **Orientation**: Required if new category is Yellow Card, even if previous was not
- **Payment**: Same fees apply (₱250 + ₱35 service fee)

### Security Considerations

- Verify user owns the health card before allowing renewal
- Prevent duplicate renewals (only one pending renewal at a time)
- Validate previous card exists and is legitimate
- Maintain audit trail with previousHealthCardId link

---

## 📝 Implementation Checklist

### Backend Tasks
- [ ] Create `checkRenewalEligibilityQuery`
- [ ] Create `createRenewalApplicationMutation`
- [ ] Create `getPreviousApplicationDataQuery`
- [ ] Update schema with renewal fields
- [ ] Add index for `previousHealthCardId`
- [ ] Update `issueHealthCard` to mark old card as expired
- [ ] Test all backend queries/mutations

### Mobile Tasks
- [ ] Create Card Selection Screen (`app/(screens)/(shared)/renewal/select-card.tsx`)
- [ ] Create `useRenewalEligibility` hook
- [ ] Update Dashboard widget to navigate to card selection
- [ ] Update Health Cards screen to navigate to card selection
- [ ] Add renewal mode detection in apply screen
- [ ] Pre-populate form data for renewals
- [ ] Update ApplicationTypeStep with eligibility check
- [ ] Update application restrictions for renewals
- [ ] Add renewal banner/messaging in apply screen
- [ ] Test mobile renewal flow end-to-end

### WebAdmin Tasks
- [ ] Add renewal badge to application list
- [ ] Show previous card history for renewals
- [ ] Update application detail view
- [ ] Test admin review of renewal applications

### Testing Tasks
- [ ] Unit tests for backend functions
- [ ] Integration tests for renewal flow
- [ ] E2E tests for mobile renewal
- [ ] Admin review testing
- [ ] Edge case testing (duplicate renewals, etc.)

### Documentation Tasks
- [ ] Update CLAUDE.md
- [ ] Update WARP.md
- [ ] Create user guide
- [ ] Update API documentation
- [ ] Add code comments

---

## 🎯 Success Criteria

The renewal feature will be considered complete when:

1. ✅ Users with expired/expiring cards see clear renewal CTAs
2. ✅ Eligibility is properly enforced (backend validation)
3. ✅ Personal data pre-populates from previous application
4. ✅ Renewal applications link to previous health cards
5. ✅ Old cards are marked expired when new card is issued
6. ✅ Admins can see renewal history
7. ✅ All tests pass
8. ✅ Documentation is updated

---

## 📚 References

- **Project Documentation**: `docs/eMediCard Project 1.2.1 Main.txt`
- **Mobile CLAUDE.md**: `apps/mobile/CLAUDE.md`
- **Backend WARP.md**: `backend/WARP.md`
- **Application Types**: `src/entities/application/model/types.ts`
- **Health Card Types**: `src/entities/healthCard/model/types.ts`

---

**Document Version**: 1.0  
**Created**: 2025-11-14  
**Last Updated**: 2025-11-14  
**Status**: Planning Phase
