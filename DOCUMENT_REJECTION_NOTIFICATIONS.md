# Document Rejection Notifications & Activity Logs

## Overview
When an admin rejects a document, the system now sends notifications to other admins managing the same health card category (job category) and creates activity logs that are role-based filtered.

## Features Implemented

### 1. **Role-Based Admin Notifications**
When a document is rejected:
- **Other admins** managing the same health card category receive notifications
- **Super Admins** (admins with no managed categories) see ALL notifications
- **Category-specific Admins** only see notifications for their assigned categories
- The **rejecting admin** does NOT receive a notification (no self-notification)

### 2. **Notification Content**
Each notification includes:
- **Admin Name**: Full name of the admin who rejected the document
- **Applicant Name**: Name of the applicant whose document was rejected
- **Document Type**: Which document was rejected (e.g., "Valid Government ID", "2×2 ID Picture")
- **Rejection Reason**: The reason provided by the admin
- **Action URL**: Direct link to the document verification page

**Example Notification:**
```
Title: "Document Rejected"
Message: "John Admin has rejected Valid Government ID for Maria Cruz's application. Reason: ID is blurry"
Action: Link to /dashboard/[applicationId]/doc_verif
```

### 3. **Activity Logs**
Activity logs are created with:
- `jobCategoryId` field for filtering by health card color/category
- Details of the rejection (document type, reason)
- Timestamp and admin who performed the action

### 4. **Role-Based Filtering Logic**

#### For Notifications (`getAdminNotifications` query):
```typescript
// Super Admin (no managedCategories or empty array)
if (!admin.managedCategories || admin.managedCategories.length === 0) {
  // Shows ALL notifications
}

// Category-specific Admin
if (admin.managedCategories.includes(notification.jobCategoryId)) {
  // Shows only notifications for their managed categories
}
```

#### For Activity Logs (`getRecentAdminActivities` query):
```typescript
// Super Admin
if (!user.managedCategories || user.managedCategories.length === 0) {
  // Shows ALL activity logs
}

// Category-specific Admin
managedCategoryIds.forEach(categoryId => {
  // Fetch activities for each managed category
  // Sort and combine
});
```

## Database Schema

### Notifications Table
```typescript
notifications: {
  userId: Id<"users">,                    // Admin who receives notification
  notificationType: string,                // "document_rejection"
  title: string,                          // "Document Rejected"
  message: string,                        // Full message with admin name
  actionUrl: string,                      // Link to document verification
  applicationId: Id<"applications">,      // Reference to application
  jobCategoryId: Id<"jobCategories">,    // Health card category (for filtering)
  isRead: boolean,                        // Read status
  _creationTime: number                   // Auto-generated timestamp
}
```

### Admin Activity Logs Table
```typescript
adminActivityLogs: {
  adminId: Id<"users">,                   // Admin who performed action
  activityType: string,                    // "document_rejection"
  details: string,                        // Detailed description
  applicationId: Id<"applications">,      // Reference to application
  jobCategoryId: Id<"jobCategories">,    // Health card category (for filtering)
  timestamp: number                       // When action occurred
}
```

## Health Card Categories (Job Categories)

The system supports multiple health card types, each with a color code:
- **Yellow Card**: Food Handler
- **Pink Card**: Other categories
- **Green Card**: Other categories

### Admin Access Control
```typescript
user.managedCategories: Id<"jobCategories">[]

// Examples:
// Super Admin: [] or undefined → sees everything
// Food Handler Admin: [yellowCardCategoryId] → sees only yellow card
// Multi-category Admin: [yellowCardId, pinkCardId] → sees both
```

## Flow Diagram

```
Admin Rejects Document
        ↓
1. Update document status to "Rejected"
        ↓
2. Create rejection history record
        ↓
3. Get application's jobCategoryId
        ↓
4. Find all admins who manage this category
   (excluding the current admin)
        ↓
5. Send notification to each relevant admin
   - Include admin fullname
   - Include applicant name
   - Include rejection reason
   - Include jobCategoryId for filtering
        ↓
6. Create activity log with jobCategoryId
        ↓
7. Return success response
```

## Testing Scenarios

### Scenario 1: Yellow Card Admin Rejects Document
- **Setup**: Admin A manages Yellow Card (Food Handler)
- **Action**: Admin A rejects a document for a Yellow Card applicant
- **Expected**:
  - Admin B (also manages Yellow Card) receives notification
  - Super Admin receives notification
  - Pink Card Admin does NOT receive notification
  - Admin A does NOT receive notification (no self-notification)

### Scenario 2: Super Admin Views Notifications
- **Setup**: Super Admin (no managed categories)
- **Action**: Super Admin opens notifications
- **Expected**:
  - Sees ALL rejection notifications from all categories
  - Sees Yellow Card rejections
  - Sees Pink Card rejections
  - Sees Green Card rejections

### Scenario 3: Activity Logs
- **Setup**: Yellow Card Admin logs in
- **Action**: Views activity log
- **Expected**:
  - Sees only activities related to Yellow Card applications
  - Does NOT see Pink/Green card activities
  - Super Admin sees ALL activities

## Implementation Files

### Backend
- `/backend/convex/admin/documents/rejectDocument.ts` - Rejection logic with notifications
- `/backend/convex/notifications/getAdminNotifications.ts` - Role-based notification query
- `/backend/convex/admin/activityLogs.ts` - Role-based activity log queries
- `/backend/convex/schema.ts` - Database schema

### Frontend
- `/apps/webadmin/src/app/dashboard/[id]/doc_verif/page.tsx` - Document verification UI
- Notification components use existing notification system

## Future Enhancements

1. **Real-time Updates**: Use Convex subscriptions for instant notifications
2. **Notification Preferences**: Allow admins to customize notification types
3. **Batch Notifications**: Group multiple rejections into one notification
4. **Email Notifications**: Send email alerts for critical rejections
5. **Notification History**: Archive and search past notifications

## Notes

- Notifications are created immediately when a document is rejected
- Activity logs are always created regardless of notification success
- The system handles missing admin names gracefully (falls back to email)
- jobCategoryId ensures proper filtering for multi-category systems
- Super Admins always have full visibility across all categories
