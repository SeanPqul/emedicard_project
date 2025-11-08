# Payment Rejection & Resubmission Integration Guide

## Overview
This guide documents the complete integration of payment rejection/resubmission flow for **manual payments only** (BaranggayHall & CityHall). Maya/GCash payments are third-party automated and don't need rejection handling.

---

## ✅ COMPLETED STEPS

###  1. Backend Query Created
**File:** `backend/convex/payments/getRejectionHistory.ts`
- Queries `paymentRejectionHistory` table
- Returns enriched data with admin names
- Filters by applicationId

### 2. Mobile Hook Created
**File:** `src/features/payment/hooks/usePaymentRejectionHistory.ts`
- Wraps Convex query
- Provides `latestRejection`, `rejectionHistory`, `rejectionCount`
- Checks if max attempts reached

### 3. Styles Added
**File:** `src/widgets/application-detail/ApplicationDetailWidget.styles.ts`
- Added `paymentRejectionBanner` and 30+ rejection-related styles
- Styles for banner, category tags, issues list, view history button
- Warning banner styles for resubmit flow

### 4. Hook Export Added
**File:** `src/features/payment/hooks/index.ts`
```typescript
export * from "./usePaymentRejectionHistory";
```

---

## 🚧 REMAINING IMPLEMENTATION

### Step 1: Update ApplicationDetailWidget.tsx - Add Imports

**Location:** Top of file after existing imports

```typescript
import { usePaymentRejectionHistory } from '@features/payment';
import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
```

### Step 2: Add "Payment Rejected" Status Color

**Location:** STATUS_COLORS constant (line 20)

```typescript
const STATUS_COLORS = {
  'Pending Payment': '#FFA500',
  'Payment Rejected': '#DC2626',  // ADD THIS LINE
  'For Payment Validation': '#F5A623',
  'For Orientation': theme.colors.accent.warningOrange,
  'Submitted': '#2E86AB',
  'Under Review': '#F18F01',
  'Approved': '#28A745',
  'Rejected': '#DC3545',
} as const;
```

### Step 3: Update ApplicationDetailWidget Props

**Location:** ApplicationDetailWidgetProps interface (line 30)

```typescript
interface ApplicationDetailWidgetProps {
  application: ApplicationDetails;
  refreshing: boolean;
  onRefresh: () => void;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  isPaymentProcessing: boolean;
  isPaymentStatusProcessing: boolean;
  getStatusIcon: (status: string) => string;
  getUrgencyColor: (daysLeft: number | null) => string;
  rejectedDocumentsCount?: number;
  applicationId: string;  // ADD THIS LINE - needed for rejection history
}
```

### Step 4: Add Rejection History Hook to Widget

**Location:** Inside ApplicationDetailWidget function, after useState declarations (line 53)

```typescript
export function ApplicationDetailWidget({
  application,
  refreshing,
  onRefresh,
  onPaymentMethodSelect,
  isPaymentProcessing,
  isPaymentStatusProcessing,
  getStatusIcon,
  getUrgencyColor,
  rejectedDocumentsCount = 0,
  applicationId,  // ADD THIS
}: ApplicationDetailWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejectionHistoryModalOpen, setIsRejectionHistoryModalOpen] = useState(false);  // ADD THIS

  // ADD THIS HOOK
  const {
    latestRejection,
    rejectionHistory,
    rejectionCount,
    hasRejections,
    isLoading: isLoadingRejections,
  } = usePaymentRejectionHistory(applicationId);

  // Determine if current payment is manual
  const isManualPayment = application.payment?.method === 'BaranggayHall' ||
                          application.payment?.method === 'CityHall';

  // ... rest of component
```

### Step 5: Add Payment Rejection Banner

**Location:** After the Status Card section, before Documents Section (around line 148)

```typescript
      </View>

      {/* Payment Rejection Banner - ONLY for manual payments */}
      {application.status === 'Payment Rejected' && isManualPayment && latestRejection && (
        <View style={styles.paymentRejectionBanner}>
          <View style={styles.rejectionBannerHeader}>
            <View style={styles.rejectionIconContainer}>
              <Ionicons name="alert-circle" size={moderateScale(24)} color="#FFFFFF" />
            </View>
            <View style={styles.rejectionHeaderContent}>
              <Text style={styles.rejectionTitle}>Payment Rejected</Text>
              <View style={styles.rejectionAttemptBadge}>
                <Text style={styles.rejectionAttemptText}>
                  Attempt {latestRejection.attemptNumber} of 3
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rejectionCategoryTag}>
            <Text style={styles.rejectionCategoryText}>
              {latestRejection.rejectionCategory.replace(/_/g, ' ')}
            </Text>
          </View>

          <View style={styles.rejectionReasonContainer}>
            <Text style={styles.rejectionReasonLabel}>Reason:</Text>
            <Text style={styles.rejectionReasonText}>{latestRejection.rejectionReason}</Text>
          </View>

          {latestRejection.specificIssues && latestRejection.specificIssues.length > 0 && (
            <View style={styles.rejectionIssuesList}>
              {latestRejection.specificIssues.map((issue, index) => (
                <View key={index} style={styles.rejectionIssueItem}>
                  <View style={styles.rejectionIssueBullet} />
                  <Text style={styles.rejectionIssueText}>{issue}</Text>
                </View>
              ))}
            </View>
          )}

          {rejectionCount > 1 && (
            <TouchableOpacity
              style={styles.viewHistoryButton}
              onPress={() => setIsRejectionHistoryModalOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={moderateScale(16)} color="#DC2626" />
              <Text style={styles.viewHistoryButtonText}>
                View History ({rejectionCount} attempts)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Documents Section */}
      <View style={styles.documentsCard}>
```

### Step 6: Update Payment Section Condition

**Location:** Payment Section (currently line 292)

**REPLACE THIS:**
```typescript
      {/* Payment Section - Only show if pending payment */}
      {application.status === 'Pending Payment' && (
```

**WITH THIS:**
```typescript
      {/* Payment Section - Show for pending payment OR rejected manual payments */}
      {(application.status === 'Pending Payment' ||
       (application.status === 'Payment Rejected' && isManualPayment)) && (
        <View style={styles.paymentCard}>
          {/* Resubmit Warning for Payment Rejected status */}
          {application.status === 'Payment Rejected' && (
            <View style={styles.resubmitWarningBanner}>
              <Text style={styles.resubmitWarningText}>
                ⚠️ Your previous payment was rejected. Please correct the issues above and resubmit with a clearer receipt.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>
            {application.status === 'Payment Rejected' ? 'Resubmit Payment' : 'Payment Required'}
          </Text>
```

### Step 7: Add Rejection History Modal

**Location:** At the end of the component, before the closing `</View>` tags (around line 440)

```typescript
        )}
      </ScrollView>

      {/* Payment Rejection History Modal */}
      <Modal
        visible={isRejectionHistoryModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRejectionHistoryModalOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setIsRejectionHistoryModalOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.background.primary,
              borderTopLeftRadius: moderateScale(20),
              borderTopRightRadius: moderateScale(20),
              paddingTop: verticalScale(20),
              maxHeight: '80%',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: scale(20),
              paddingBottom: verticalScale(16),
              borderBottomWidth: 1,
              borderBottomColor: '#E5E5E5',
            }}>
              <Text style={{
                fontSize: moderateScale(18),
                fontWeight: '600',
                color: theme.colors.text.primary,
              }}>
                Rejection History
              </Text>
              <TouchableOpacity onPress={() => setIsRejectionHistoryModalOpen(false)}>
                <Ionicons name="close" size={moderateScale(24)} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: '80%' }}>
              {rejectionHistory.map((rejection, index) => (
                <View
                  key={rejection._id}
                  style={{
                    padding: moderateScale(16),
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F0F0',
                    backgroundColor: rejection.wasReplaced ? '#F0FDF4' : '#FEF2F2',
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) }}>
                    <View style={{
                      backgroundColor: '#DC2626',
                      paddingHorizontal: scale(10),
                      paddingVertical: verticalScale(4),
                      borderRadius: theme.borderRadius.full,
                    }}>
                      <Text style={{
                        fontSize: moderateScale(11),
                        fontWeight: '600',
                        color: '#FFFFFF',
                      }}>
                        Attempt #{rejection.attemptNumber}
                      </Text>
                    </View>
                    {rejection.wasReplaced && (
                      <View style={{
                        backgroundColor: '#10B981',
                        paddingHorizontal: scale(10),
                        paddingVertical: verticalScale(4),
                        borderRadius: theme.borderRadius.full,
                      }}>
                        <Text style={{
                          fontSize: moderateScale(11),
                          fontWeight: '600',
                          color: '#FFFFFF',
                        }}>
                          ✓ Replaced
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={{
                    fontSize: moderateScale(12),
                    color: theme.colors.text.secondary,
                    marginBottom: verticalScale(8),
                  }}>
                    {new Date(rejection.rejectedAt).toLocaleString()}
                  </Text>

                  <Text style={{
                    fontSize: moderateScale(13),
                    fontWeight: '600',
                    color: theme.colors.text.primary,
                    marginBottom: verticalScale(4),
                  }}>
                    {rejection.rejectionCategory.replace(/_/g, ' ').toUpperCase()}
                  </Text>

                  <Text style={{
                    fontSize: moderateScale(14),
                    color: theme.colors.text.primary,
                    marginBottom: verticalScale(8),
                  }}>
                    {rejection.rejectionReason}
                  </Text>

                  {rejection.specificIssues && rejection.specificIssues.length > 0 && (
                    <View>
                      {rejection.specificIssues.map((issue, i) => (
                        <Text
                          key={i}
                          style={{
                            fontSize: moderateScale(13),
                            color: theme.colors.text.secondary,
                            marginLeft: scale(8),
                          }}
                        >
                          • {issue}
                        </Text>
                      ))}
                    </View>
                  )}

                  <Text style={{
                    fontSize: moderateScale(12),
                    color: theme.colors.text.secondary,
                    marginTop: verticalScale(8),
                  }}>
                    Rejected by: {rejection.rejectedByName}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
```

### Step 8: Pass applicationId from useApplicationDetail

**File:** `src/features/application/hooks/useApplicationDetail.ts`

**UPDATE:** The hook needs to pass applicationId to the widget. Check the file where you call `<ApplicationDetailWidget />` and ensure you pass:

```typescript
<ApplicationDetailWidget
  application={application}
  // ... other props
  applicationId={applicationId as string}
/>
```

---

## 🔍 TESTING CHECKLIST

### Manual Payment Rejection Flow
1. [ ] Admin rejects manual payment (BaranggayHall/CityHall) in webadmin
2. [ ] Mobile app shows "Payment Rejected" status with correct color
3. [ ] Rejection banner appears with reason, category, and issues
4. [ ] Attempt badge shows "Attempt X of 3"
5. [ ] "View History" button appears if multiple rejections
6. [ ] Clicking "View History" opens modal with all past rejections
7. [ ] Payment methods section reappears for resubmission
8. [ ] Resubmit warning banner displays
9. [ ] User can upload new receipt via Barangay/City Hall options
10. [ ] After resubmission, old rejection marked as "Replaced" in history

### Maya/GCash Flow (Should NOT Show Rejection UI)
11. [ ] Maya payments that fail technically don't show rejection banner
12. [ ] Only "Pending Payment" status remains for Maya failures
13. [ ] No resubmit flow for third-party payments

### Edge Cases
14. [ ] Max attempts (3) reached shows appropriate message
15. [ ] No crashes if rejection history is empty
16. [ ] Loading states handled gracefully
17. [ ] Modal closes properly on background press
18. [ ] Navigation works correctly after resubmission

---

## 🎯 KEY DIFFERENCES FROM WEBADMIN

| Feature | Webadmin | Mobile App |
|---------|----------|------------|
| **Rejection UI** | Full-featured modal with all fields | Compact banner + modal |
| **Rejection History** | Table view with filters | Simple list in modal |
| **Resubmission** | Same payment validation page | Navigate back to manual upload screen |
| **Payment Methods** | Only sees manual payments (BaranggayHall/CityHall) | Shows all methods, rejection only for manual |

---

## 📝 IMPORTANT NOTES

1. **Maya/GCash are EXCLUDED**: Rejection UI only shows for `BaranggayHall` or `CityHall` payment methods
2. **Backend is READY**: `createPayment.ts` already handles resubmission correctly
3. **No Breaking Changes**: Existing payment flows remain untouched
4. **Backward Compatible**: Works with applications that have no rejection history

---

## 🚀 DEPLOYMENT NOTES

1. Deploy backend query first: `backend/convex/payments/getRejectionHistory.ts`
2. Test in development with sample rejected payments
3. Deploy mobile app updates
4. Monitor error logs for any issues
5. Verify with real users in staging before production

---

**Implementation Date:** 2025-01-05
**Status:** 90% Complete - Remaining: Widget updates
**Priority:** HIGH - Users currently cannot resubmit rejected manual payments
