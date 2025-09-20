# Submit First, Pay Later Implementation Guide

## Overview
This guide outlines the changes needed to implement a "Submit First, Pay Later" flow for the eMedicard application process.

## Current Flow vs New Flow

### Current Flow:
1. User fills application form
2. User selects payment method
3. User pays (Maya/GCash/etc)
4. Application is submitted with payment

### New Flow:
1. User fills application form
2. User submits application (no payment)
3. Application status: "Pending Payment"
4. User goes to dashboard/applications list
5. User sees "Pay Now" button on pending applications
6. User pays when ready
7. Application status: "For Payment Validation"

## Required Changes

### 1. Backend Changes

#### Update Application Submission
```typescript
// convex/applications/submitApplication.ts
export const submitApplication = mutation({
  args: {
    // ... existing args
    // Remove payment-related args
  },
  handler: async (ctx, args) => {
    // Create application with "Pending Payment" status
    const applicationId = await ctx.db.insert("applications", {
      ...applicationData,
      applicationStatus: "Pending Payment", // New initial status
      paymentDeadline: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days to pay
    });
    
    // Don't create payment record here
    return applicationId;
  }
});
```

#### Add Payment Deadline Check
```typescript
// convex/crons/checkPaymentDeadlines.ts
export const checkPaymentDeadlines = internalMutation({
  handler: async (ctx) => {
    const pendingApps = await ctx.db
      .query("applications")
      .withIndex("by_status", q => q.eq("applicationStatus", "Pending Payment"))
      .filter(q => q.lt(q.field("paymentDeadline"), Date.now()))
      .collect();
    
    // Mark overdue applications
    for (const app of pendingApps) {
      await ctx.db.patch(app._id, {
        applicationStatus: "Payment Overdue"
      });
    }
  }
});
```

### 2. Mobile App Changes

#### Update Submission Flow
```typescript
// src/hooks/useSubmission.ts
const handleSubmit = async () => {
  try {
    // Submit application without payment
    const applicationId = await submitApplication({
      personalInfo,
      documents,
      // No payment info
    });
    
    // Navigate to success screen
    router.push({
      pathname: '/submission-success',
      params: { 
        applicationId,
        showPaymentReminder: true 
      }
    });
  } catch (error) {
    // Handle error
  }
};
```

#### Add Payment from Dashboard
```typescript
// src/screens/ApplicationDetails.tsx
export function ApplicationDetails({ application }) {
  const { initiateMayaPayment } = usePaymentMaya();
  
  const handlePayNow = async () => {
    if (application.applicationStatus === "Pending Payment") {
      // Initiate payment for existing application
      await initiateMayaPayment({
        applicationId: application._id,
        amount: 50,
        serviceFee: 10,
      });
    }
  };
  
  return (
    <View>
      {/* Application details */}
      
      {application.applicationStatus === "Pending Payment" && (
        <Card style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Payment Required</Text>
          <Text style={styles.paymentDeadline}>
            Pay by: {formatDate(application.paymentDeadline)}
          </Text>
          <Button
            title="Pay Now (₱60)"
            onPress={handlePayNow}
            variant="primary"
          />
        </Card>
      )}
    </View>
  );
}
```

#### Update Applications List
```typescript
// src/screens/ApplicationsList.tsx
export function ApplicationsList() {
  const applications = useQuery(api.applications.getUserApplications);
  
  const renderApplication = (app) => {
    const isPendingPayment = app.applicationStatus === "Pending Payment";
    
    return (
      <Card key={app._id}>
        <View style={styles.row}>
          <View style={styles.details}>
            <Text>{app.jobCategory}</Text>
            <Text>{app.applicationStatus}</Text>
          </View>
          
          {isPendingPayment && (
            <Button
              title="Pay Now"
              onPress={() => navigateToPayment(app._id)}
              size="small"
              variant="primary"
            />
          )}
        </View>
      </Card>
    );
  };
}
```

### 3. New Status Flow

```
Pending Payment → Payment Processing → For Payment Validation → For Orientation → ...
       ↓
Payment Overdue (if not paid within deadline)
```

### 4. Benefits Implementation

#### Payment Reminders
```typescript
// convex/notifications/sendPaymentReminders.ts
export const sendPaymentReminders = internalAction({
  handler: async (ctx) => {
    // Send push notifications for applications pending payment
    const pendingApps = await ctx.runQuery(
      internal.applications.getPendingPaymentApplications
    );
    
    for (const app of pendingApps) {
      const daysTillDeadline = getDaysUntilDeadline(app.paymentDeadline);
      
      if ([3, 1].includes(daysTillDeadline)) {
        await sendPushNotification({
          userId: app.userId,
          title: "Payment Reminder",
          body: `${daysTillDeadline} days left to pay for your application`
        });
      }
    }
  }
});
```

#### Analytics Dashboard
```typescript
// Track conversion metrics
interface ApplicationMetrics {
  totalSubmitted: number;
  pendingPayment: number;
  paid: number;
  paymentOverdue: number;
  conversionRate: number; // paid / totalSubmitted
  avgTimeToPay: number; // hours from submission to payment
}
```

## Migration Strategy

### For Existing Users:
1. Keep current flow working during transition
2. Add feature flag to enable new flow
3. Gradually roll out to users
4. Migrate existing "Submitted" applications to handle both flows

### Database Migration:
```typescript
// Add new fields to applications table
interface Application {
  // ... existing fields
  paymentDeadline?: number; // Unix timestamp
  submittedWithoutPayment?: boolean; // Track which flow was used
}
```

## UI/UX Considerations

### 1. Clear Communication
- Show payment deadline prominently
- Explain why payment is separate
- Provide easy access to pay

### 2. Visual Indicators
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending Payment":
      return "#FFA500"; // Orange - action needed
    case "Payment Overdue":
      return "#FF0000"; // Red - urgent
    case "For Payment Validation":
      return "#0066CC"; // Blue - processing
    default:
      return "#00AA00"; // Green - good
  }
};
```

### 3. Payment CTA Design
```typescript
const PaymentCallToAction = ({ application }) => {
  const daysLeft = getDaysUntilDeadline(application.paymentDeadline);
  
  return (
    <View style={styles.ctaContainer}>
      <View style={styles.urgencyBadge}>
        <Text style={styles.urgencyText}>
          {daysLeft <= 1 ? "Pay Today!" : `${daysLeft} days left`}
        </Text>
      </View>
      <Button
        title="Pay ₱60 Now"
        onPress={handlePayment}
        style={styles.payButton}
      />
    </View>
  );
};
```

## Implementation Status

### Completed Components ✅

1. **Frontend Components**
   - `ApplicationsList.tsx` - Displays all user applications with payment status badges
   - `ApplicationDetails.tsx` - Shows detailed application info with payment card
   - `PaymentDeadlineCountdown.tsx` - Real-time countdown timer component
   - `PaymentStatusBadge.tsx` - Color-coded status indicators
   - `PaymentReminderCard.tsx` - Reusable payment reminder UI
   - `PendingPaymentsSection.tsx` - Dashboard section for pending payments
   - `SubmissionSuccessScreen.tsx` - Success screen with pay now/later options

2. **Hooks and Logic**
   - `useSubmissionV2.ts` - Updated submission hook for submit-first-pay-later flow
   - Modified `usePaymentMaya.ts` to work with existing applications

3. **Routes**
   - `/forms/applications/list` - Applications list screen
   - `/forms/applications/[id]` - Application details screen
   - `/forms/applications/payment` - Payment processing screen
   - `/forms/submission-success` - Submission success screen

4. **UI/UX Updates**
   - Removed payment step from application flow
   - Color-coded urgency indicators (red < 24h, orange < 72h, yellow < 7 days)
   - Dashboard integration with pending payments section
   - Success screen with clear payment options

### Backend Integration ✅
   - Using existing `submitApplicationMutation` that sets "Pending Payment" status
   - Integrated with Maya payment API via `initiateMayaPayment`
   - Payment deadline automatically set to 7 days

### Testing Checklist

- [ ] Application submits without payment
- [ ] Payment deadline is set correctly (7 days)
- [ ] "Pay Now" button appears for pending applications
- [ ] Payment flow works from dashboard
- [ ] Status updates correctly after payment
- [ ] Reminders are sent on schedule (backend cron job needed)
- [ ] Overdue applications are marked correctly (backend cron job needed)
- [ ] Analytics track conversion properly (backend implementation needed)
