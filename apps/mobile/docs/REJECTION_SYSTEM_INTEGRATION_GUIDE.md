# Document Rejection System - Integration Guide

## 📚 Overview

This guide explains what each component does and where they should be integrated in the app.

---

## 🗂️ Component Architecture

### 1. **Entities** (`src/entities/document/`)
**Purpose**: Define the data models and types

**Files**:
- `model/rejection-types.ts` - Type definitions
- `model/rejection-constants.ts` - Constants like category labels

**What they contain**:
- `EnrichedRejection` - The rejection data with enriched info (document names, admin names, etc.)
- `RejectionCategory` - Enum for rejection categories (quality_issue, wrong_document, etc.)
- `RejectionHistory` - Raw rejection history from database

**Used by**: Everything else imports these types

---

### 2. **Features** (`src/features/`)

#### A. `document-rejection/` 
**Purpose**: Features for VIEWING rejection information

**What it does**:
- Shows rejection details to the user
- Displays rejection history
- Shows why a document was rejected

**Components**:
- `RejectionBanner/` - Small banner showing "Document Rejected"
- `RejectionDetails/` - Full modal with rejection details (reason, issues, date)

**Hooks**:
- `useRejectionHistory()` - Fetches rejection history for an application
- `useRejectedDocumentsCount()` - Gets count of rejected documents
- `useDocumentRejectionDetails()` - Gets detailed rejection info

**Where to integrate**:
1. **ViewDocumentsScreen** - Show rejection banner on rejected documents
2. **ApplicationDetailWidget** - Show if application has rejected documents
3. **NotificationScreen** - Show rejection notifications

---

#### B. `document-resubmit/`
**Purpose**: Features for RESUBMITTING rejected documents

**What it does**:
- Allows users to upload a new document to replace a rejected one
- Tracks the resubmission in rejection history
- Links the new document to the rejection record

**Components**:
- `ResubmitModal/` - Modal that lets user upload a new document

**Hooks**:
- `useResubmitDocument()` - Handles the resubmission logic

**Where to integrate**:
1. **ViewDocumentsScreen** - "Resubmit" button for rejected documents
2. **DocumentRejectionWidget** - "Resubmit" action button
3. **ApplicationDetailWidget** - Quick resubmit action

---

### 3. **Widgets** (`src/widgets/`)

#### A. `document-rejection/`
**Purpose**: Complete UI widget showing rejection details with actions

**What it does**:
- Shows rejection reason, category, and specific issues
- Displays attempt number
- Provides "Resubmit" and "View Details" buttons

**Component**:
- `DocumentRejectionWidget.tsx` - The main widget

**Where to integrate**:
1. **ViewDocumentsScreen** - Show this widget for each rejected document
2. **DocumentRejectionHistoryScreen** - Shows list of these widgets

---

#### B. `document-rejection-history/`
**Purpose**: Complete widget showing timeline of ALL rejections

**What it does**:
- Shows all rejected documents grouped by date
- Allows filtering by rejection category
- Shows attempt numbers for each rejection

**Component**:
- `DocumentRejectionHistoryWidget.tsx` - The history list widget

**Where to integrate**:
1. **DocumentRejectionHistoryScreen** - Primary use (already done!)
2. **ApplicationDetailWidget** - Could show as a section

---

### 4. **Screens** (`src/screens/`)

#### `DocumentRejectionHistoryScreen/`
**Purpose**: Full screen showing rejection history

**What it shows**:
- Timeline of all rejections for an application
- Filter by category
- Each rejection with full details

**When to navigate here**:
- From ApplicationDetailWidget - "View Rejection History" button
- From ViewDocumentsScreen - "See All Rejected Documents"
- From notification - Deep link to rejection history

---

## 🔄 Complete User Flow

### Scenario: User's document gets rejected

```
1. ADMIN REJECTS DOCUMENT (in admin panel)
   ↓
2. Backend creates rejection history record
   ↓
3. USER GETS NOTIFICATION
   "Your Valid ID has been rejected"
   ↓
4. USER TAPS NOTIFICATION
   → Opens ApplicationDetailWidget
   ↓
5. APPLICATION DETAIL shows "Documents Need Revision" status
   → Shows banner: "You have 2 rejected documents"
   → Shows "View Documents" button
   ↓
6. USER TAPS "View Documents"
   → Opens ViewDocumentsScreen
   ↓
7. VIEW DOCUMENTS SCREEN shows:
   - Summary: "2 Rejected"
   - List of documents with rejection indicators
   - Each rejected doc shows DocumentRejectionWidget
   ↓
8. USER TAPS "Resubmit" on a rejected document
   → Opens ResubmitModal (from document-resubmit feature)
   ↓
9. USER UPLOADS NEW DOCUMENT
   → Modal closes
   → Document status changes to "Pending"
   → Rejection history updated with replacement info
   ↓
10. USER TAPS "View Details" to see why it was rejected
    → Opens RejectionDetails modal
    → Shows: reason, category, specific issues, date
```

---

## 📍 Integration Points

### Priority 1: ViewDocumentsScreen (MOST IMPORTANT)
**Why**: This is where users see their uploaded documents after submission

**What to add**:
```typescript
// For each rejected document in the list
{doc.reviewStatus === 'Rejected' && (
  <DocumentRejectionWidget
    rejection={rejectionData}
    documentName={doc.requirement?.name}
    onResubmit={() => handleResubmit(doc)}
    onViewDetails={() => handleViewDetails(doc)}
  />
)}
```

**Hooks needed**:
- `useRejectionHistory(applicationId)` - to get rejection data
- `useResubmitDocument()` - for resubmit action

---

### Priority 2: ApplicationDetailWidget
**Why**: This is where users see their application overview

**What to add**:
```typescript
// Show rejection status banner
{application.applicationStatus === 'Documents Need Revision' && (
  <View style={styles.rejectionBanner}>
    <Text>⚠️ {rejectedCount} document(s) need revision</Text>
    <Button onPress={navigateToViewDocuments}>View & Fix</Button>
  </View>
)}
```

**Hooks needed**:
- `useRejectedDocumentsCount(userId)` - to get count

---

### Priority 3: Notification Integration
**Why**: Users need to be notified when documents are rejected

**What to add**:
- Add "DOCUMENT_REJECTED" notification type
- Deep link to ViewDocumentsScreen or DocumentRejectionHistoryScreen

---

## 🎯 Summary: What Goes Where

| Component | Purpose | Integrated In | Status |
|-----------|---------|---------------|--------|
| **RejectionBanner** | Small rejection alert | ViewDocumentsScreen | ❌ Not yet |
| **RejectionDetails** | Full rejection info | Modal from anywhere | ✅ Ready |
| **ResubmitModal** | Upload replacement | ViewDocumentsScreen | ✅ Ready |
| **DocumentRejectionWidget** | Full rejection card | ViewDocumentsScreen | ✅ Ready |
| **DocumentRejectionHistoryWidget** | Timeline of rejections | DocumentRejectionHistoryScreen | ✅ Done |
| **DocumentRejectionHistoryScreen** | Full history screen | Navigate from detail | ✅ Done |

---

## 🚀 Next Steps for Integration

### Step 1: Update ViewDocumentsScreen
This is the MAIN integration point. Users who have rejected documents will see them here.

**Changes needed**:
1. Fetch rejection history for the application
2. For each rejected document, show DocumentRejectionWidget
3. Add ResubmitModal integration
4. Add navigation to DocumentRejectionHistoryScreen

### Step 2: Update ApplicationDetailWidget
Show rejection status and count in the application overview.

**Changes needed**:
1. Check if application status is "Documents Need Revision"
2. Show banner with count of rejected documents
3. Add button to navigate to ViewDocumentsScreen

### Step 3: Add Notifications
Notify users when documents are rejected.

**Changes needed**:
1. Add "DOCUMENT_REJECTED" notification type
2. Handle notification tap → navigate to ViewDocumentsScreen
3. Add notification template

---

## 📝 Example Code Snippets

### Integrating in ViewDocumentsScreen

```typescript
import { useRejectionHistory } from '@features/document-rejection/hooks';
import { DocumentRejectionWidget } from '@widgets/document-rejection';
import { ResubmitModal } from '@features/document-resubmit/components';

export function ViewDocumentsScreen() {
  const { formId } = useLocalSearchParams();
  const { rejections } = useRejectionHistory(formId);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Find rejection for a document
  const getRejectionForDocument = (documentTypeId) => {
    return rejections.find(r => r.documentTypeId === documentTypeId && !r.wasReplaced);
  };

  // Render document list
  return (
    <ScrollView>
      {uploadedDocuments.map(doc => {
        const rejection = getRejectionForDocument(doc.documentTypeId);
        
        return (
          <View key={doc._id}>
            {/* Regular document info */}
            <Text>{doc.requirement?.name}</Text>
            <Text>Status: {doc.reviewStatus}</Text>
            
            {/* Show rejection widget if rejected */}
            {rejection && (
              <DocumentRejectionWidget
                rejection={rejection}
                documentName={doc.requirement?.name}
                onResubmit={() => {
                  setSelectedDoc(doc);
                  setShowResubmitModal(true);
                }}
                onViewDetails={() => handleViewDetails(rejection)}
              />
            )}
          </View>
        );
      })}
      
      {/* Resubmit Modal */}
      {selectedDoc && (
        <ResubmitModal
          visible={showResubmitModal}
          onClose={() => setShowResubmitModal(false)}
          applicationId={formId}
          documentTypeId={selectedDoc.documentTypeId}
          documentName={selectedDoc.requirement?.name}
          onSuccess={() => {
            setShowResubmitModal(false);
            // Refresh data
          }}
        />
      )}
    </ScrollView>
  );
}
```

---

## 🤔 Common Questions

### Q: When should I use RejectionBanner vs DocumentRejectionWidget?
**A**: 
- `RejectionBanner` = Small, compact alert (not implemented yet, may not be needed)
- `DocumentRejectionWidget` = Full card with details and actions (use this!)

### Q: Where does resubmission happen?
**A**: In `ViewDocumentsScreen` when user clicks "Resubmit" on a rejected document

### Q: Do I need to integrate in UploadDocumentsStep?
**A**: **NO!** That's for NEW applications. Rejection is for EXISTING applications.

### Q: What's the difference between ViewDocumentsScreen and DocumentRejectionHistoryScreen?
**A**: 
- `ViewDocumentsScreen` = Shows ALL documents (approved, pending, rejected)
- `DocumentRejectionHistoryScreen` = Shows ONLY rejection history timeline

### Q: Where should notifications navigate to?
**A**: Either `ViewDocumentsScreen` (to see and fix documents) or `DocumentRejectionHistoryScreen` (to see full history)

---

## ✅ Integration Checklist

Before you start integrating, make sure:
- [x] Phase 1 (Backend) is complete
- [x] Phase 2 (Types) is complete
- [x] Phase 3 (Features) is complete
- [x] Phase 4 (Widgets & Screens) is complete
- [ ] You understand the difference between document-rejection and document-resubmit
- [ ] You know where ViewDocumentsScreen is
- [ ] You have tested the rejection mutation in Convex dashboard

---

**Last Updated**: October 4, 2025  
**Author**: eMediCard Development Team

