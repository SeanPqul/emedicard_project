# Health Card Application System - Sequence Diagrams (Capstone Documentation)

> **Documentation Purpose:** This document provides comprehensive sequence diagrams for all major workflows in the Health Card Application System, including the new renewal feature.

---

## 📋 Table of Contents

1. [New Application Flow](#1-new-application-flow)
2. [Renewal Application Flow](#2-renewal-application-flow-new)
3. [Document Review Process](#3-document-review-process)
4. [Payment Processing](#4-payment-processing)
5. [Orientation Booking](#5-orientation-booking)
6. [Health Card Issuance](#6-health-card-issuance)
7. [Renewal Eligibility Check](#7-renewal-eligibility-check-new)

---

## 1. New Application Flow

### Complete New Application Process

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    participant Storage as Convex Storage
    participant Admin as WebAdmin
    
    Note over User,Admin: Phase 1: Application Submission
    
    User->>Mobile: Opens "Apply" screen
    Mobile->>Convex: Query jobCategories
    Convex-->>Mobile: Return available categories
    Mobile-->>User: Display job categories
    
    User->>Mobile: Selects category & fills form
    Note over User,Mobile: Personal details, position, organization
    
    User->>Mobile: Clicks "Next" (Review)
    Mobile->>Mobile: Validates form data
    
    User->>Mobile: Clicks "Submit Application"
    Mobile->>Convex: createApplication mutation
    Note over Convex: Creates application with status "Draft"
    Convex-->>Mobile: Return applicationId
    Mobile-->>User: Show "Application Created"
    
    Note over User,Admin: Phase 2: Document Upload
    
    User->>Mobile: Opens Document Upload
    Mobile->>Convex: Query required documents for category
    Convex-->>Mobile: Return document types
    
    loop For each required document
        User->>Mobile: Selects file from device
        Mobile->>Storage: Upload file
        Storage-->>Mobile: Return storageFileId
        Mobile->>Convex: createDocumentUpload mutation
        Note over Convex: Creates upload with status "Pending"
        Convex-->>Mobile: Confirm upload saved
    end
    
    User->>Mobile: Clicks "Submit for Review"
    Mobile->>Convex: updateApplicationStatus mutation
    Note over Convex: Status: "Draft" → "Submitted"
    Convex->>Convex: Create notification for admin
    Convex-->>Mobile: Confirm submission
    Mobile-->>User: Show "Application Submitted"
    
    Note over User,Admin: Phase 3: Admin Document Review
    
    Admin->>Convex: Query pending applications
    Convex-->>Admin: Return applications with "Submitted" status
    
    Admin->>Admin: Reviews application details
    Admin->>Convex: Query document uploads
    Convex-->>Admin: Return uploaded documents
    
    alt Documents Approved
        Admin->>Convex: approveDocuments mutation
        Note over Convex: Updates reviewStatus: "Pending" → "Approved"
        Convex->>Convex: Update application status
        Note over Convex: Status: "Submitted" → "For Payment Validation"
        Convex->>Convex: Create notification for user
        Convex-->>Admin: Confirm approval
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Documents approved, proceed to payment"
        
    else Documents Need Revision
        Admin->>Convex: rejectDocument mutation
        Note over Convex: Creates documentReferralHistory record
        Note over Convex: issueType: "document_issue"
        Convex->>Convex: Update application status
        Note over Convex: Status: "Submitted" → "Documents Need Revision"
        Convex->>Convex: Create notification for user
        Convex-->>Admin: Confirm rejection
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Document needs revision"
        User->>Mobile: Re-uploads corrected document
        Mobile->>Convex: createDocumentUpload mutation
        Note over Convex: Links to previous via replacementUploadId
        
    else Medical Referral Required
        Admin->>Convex: referDocument mutation
        Note over Convex: Creates documentReferralHistory record
        Note over Convex: issueType: "medical_referral"
        Convex->>Convex: Update application status
        Note over Convex: Status: "Submitted" → "Referred for Medical Management"
        Convex->>Convex: Create notification for user
        Convex-->>Admin: Confirm referral
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Medical consultation required"
    end
    
    Note over User,Admin: Phase 4: Payment
    
    User->>Mobile: Opens Payment screen
    Mobile->>Convex: Query payment details
    Convex-->>Mobile: Return amount (₱60)
    Mobile-->>User: Display payment options
    alt Online Payment (Maya)
        User->>Mobile: Selects "Pay with Maya"
        Mobile->>Convex: createPayment mutation
        Note over Convex: Creates payment with status "Pending"
        Convex->>Maya: Create checkout session
        Maya-->>Convex: Return checkout URL
        Convex-->>Mobile: Return checkout URL
        Mobile->>Maya: Opens Maya checkout
        User->>Maya: Completes payment
        Maya->>Convex: Webhook: payment_success
        Note over Convex: Updates payment status to "Complete"
        Convex->>Convex: Create paymentLog
        Convex->>Convex: Create notification for user
        Convex->>Mobile: Push notification
        Mobile-->>User: "Payment successful"
        
    else Manual Payment (Barangay/City Hall)
        User->>Mobile: Selects "Pay at Barangay Hall"
        Mobile-->>User: Show payment instructions
        User->>User: Makes payment at hall
        User->>Mobile: Uploads receipt
        Mobile->>Storage: Upload receipt
        Storage-->>Mobile: Return storageFileId
        Mobile->>Convex: createManualPayment mutation
        Note over Convex: Creates payment with status "Pending"
        Convex->>Convex: Create notification for admin
        Convex-->>Mobile: Confirm submission
        Mobile-->>User: "Receipt submitted for validation"
    end
    
    Note over User,Admin: Phase 5: Payment Validation (Manual Only)
    
    Admin->>Convex: Query pending payments
    Convex-->>Admin: Return payments with "Pending" status
    
    alt Payment Approved
        Admin->>Convex: approvePayment mutation
        Note over Convex: Status: "Pending" → "Complete"
        Convex->>Convex: Update application status
        Note over Convex: Status: "For Payment Validation" → next phase
        Convex->>Convex: Create notification for user
        Convex-->>Admin: Confirm approval
        
    else Payment Rejected
        Admin->>Convex: rejectPayment mutation
        Note over Convex: Creates paymentRejectionHistory record
        Note over Convex: Payment status: "Pending" → "Failed"
        Convex->>Convex: Create notification for user
        Convex-->>Admin: Confirm rejection
    end
    
    Note over User,Admin: Phase 6: Orientation (if required)
    
    alt Job Category Requires Orientation
        Convex->>Convex: Check jobCategory.requireOrientation
        Convex->>Convex: Update application status
        Note over Convex: Status → "For Orientation"
        Convex->>Mobile: Push notification
        Mobile-->>User: "Book orientation session"
        
        User->>Mobile: Opens Orientation Booking
        Mobile->>Convex: Query available schedules
        Convex-->>Mobile: Return orientationSchedules
        Mobile-->>User: Display available dates/times
        
        User->>Mobile: Selects schedule
        Mobile->>Convex: createOrientationBooking mutation
        Note over Convex: Creates booking with status "scheduled"
        Note over Convex: Decrements availableSlots
        Convex->>Convex: Generate QR code
        Convex-->>Mobile: Return booking + QR code
        Mobile-->>User: Show booking confirmation + QR
        
        User->>User: Attends orientation session
        User->>Mobile: Shows QR code to inspector
        
        Admin->>Mobile: Scans QR code (Inspector app)
        Mobile->>Convex: checkInUser mutation
        Note over Convex: Status: "scheduled" → "checked-in"
        Note over Convex: Records checkInTime
        Convex-->>Mobile: Confirm check-in
        
        Note over User: Attends orientation (2 hours)
        
        Admin->>Mobile: Scans QR code again
        Mobile->>Convex: checkOutUser mutation
        Note over Convex: Status: "checked-in" → "completed"
        Note over Convex: Records checkOutTime
        Convex->>Convex: Update application.orientationCompleted = true
        Convex-->>Mobile: Confirm check-out
        
    else No Orientation Required
        Note over Convex: Skip orientation phase
    end
    
    Note over User,Admin: Phase 7: Final Approval & Health Card Issuance
    
    Admin->>Convex: Query ready-to-approve applications
    Convex-->>Admin: Return applications (all requirements met)
    
    Admin->>Admin: Final review
    Admin->>Convex: approveApplication mutation
    Note over Convex: Generate unique registration number
    Note over Convex: Generate health card HTML
    Convex->>Convex: Create healthCard record
    Note over Convex: Status: "active"
    Note over Convex: Set issuedDate, expiryDate (1 year)
    Convex->>Convex: Update application status
    Note over Convex: Status → "Approved"
    Note over Convex: Link healthCardId to application
    Convex->>Convex: Create notification for user
    Convex-->>Admin: Confirm approval
    
    Convex->>Mobile: Push notification
    Mobile-->>User: "Health card issued!"
    
    User->>Mobile: Opens "My Health Cards"
    Mobile->>Convex: Query user's health cards
    Convex-->>Mobile: Return health cards
    Mobile-->>User: Display health card with QR code
```

---

## 2. Renewal Application Flow (NEW)

### Complete Renewal Process

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    participant Storage as Convex Storage
    participant Admin as WebAdmin
    
    Note over User,Admin: Phase 1: Renewal Eligibility Check
    
    User->>Mobile: Opens Dashboard
    Mobile->>Convex: Query user's health cards
    Convex-->>Mobile: Return health cards with expiry dates
    Mobile->>Mobile: Calculate days until expiry
    
    alt Card Expiring Soon (<30 days)
        Mobile-->>User: Show "RENEW SOON" badge
    else Card Expired
        Mobile-->>User: Show "EXPIRED" badge
    end
    
    User->>Mobile: Clicks "Renew Health Card"
    Mobile->>Convex: checkRenewalEligibilityQuery
    
    Convex->>Convex: Check eligibility criteria
    Note over Convex: - Has approved application with card
    Note over Convex: - No pending applications
    Note over Convex: - No existing renewal in progress
    
    alt Eligible for Renewal
        Convex->>Convex: Get previous application data
        Convex->>Convex: Get health card details
        Convex-->>Mobile: Return eligibility + previous data
        Mobile->>Mobile: Navigate to card selection screen
        
    else Not Eligible
        Convex-->>Mobile: Return ineligible + reason
        Mobile-->>User: Show error message
        Note over User: e.g., "Pending application exists"
    end
    
    Note over User,Admin: Phase 2: Card Selection
    
    Mobile->>Convex: getUserCardsQuery
    Convex-->>Mobile: Return all user's health cards
    Mobile-->>User: Display card selection list
    Note over User,Mobile: Shows registration #, issue/expiry dates
    Note over User,Mobile: Urgency badges (EXPIRED, URGENT, RENEW SOON)
    
    User->>Mobile: Selects card to renew
    
    alt Card Valid >30 days
        Mobile-->>User: Show confirmation dialog
        Note over User: "Card valid for X days. Renew now?"
        User->>Mobile: Confirms renewal
    else Card Expiring Soon or Expired
        Note over Mobile: Skip confirmation
    end
    
    Mobile->>Mobile: Navigate to application form
    Note over Mobile: Pass healthCardId as param
    
    Note over User,Admin: Phase 3: Pre-fill Application Data
    
    Mobile->>Convex: getPreviousApplicationDataQuery
    Note over Mobile,Convex: Pass healthCardId
    
    Convex->>Convex: Get health card
    Convex->>Convex: Get linked application
    Convex->>Convex: Verify ownership (security check)
    Convex->>Convex: Get job category details
    Convex-->>Mobile: Return previous application data
    
    Mobile->>Mobile: Pre-fill form fields
    Note over Mobile: - Personal details (name, age, etc.)
    Note over Mobile: - Job category (pre-selected)
    Note over Mobile: - Position, organization
    Note over Mobile: - Civil status
    
    Mobile-->>User: Show pre-filled renewal form
    Note over User,Mobile: Display "Renewal Application" banner
    
    User->>Mobile: Reviews & updates data (if needed)
    Note over User: Can change job category, position, etc.
    
    User->>Mobile: Clicks "Next"
    
    Note over User,Admin: Phase 4: Create Renewal Application
    
    Mobile->>Convex: createRenewalApplicationMutation
    Note over Mobile,Convex: Pass form data + previousHealthCardId
    
    Convex->>Convex: Validate health card ownership
    Convex->>Convex: Check no pending renewal exists
    Convex->>Convex: Calculate renewal count
    Note over Convex: Count previous "Renew" applications
    
    Convex->>Convex: Create application record
    Note over Convex: applicationType: "Renew"
    Note over Convex: previousHealthCardId: <selected card>
    Note over Convex: isRenewal: true
    Note over Convex: renewalCount: <calculated>
    Note over Convex: applicationStatus: "Draft"
    
    Convex-->>Mobile: Return renewalApplicationId
    Mobile-->>User: Show "Renewal Application Created"
    
    Note over User,Admin: Phase 5: Document Upload (Fresh Documents Required)
    
    Mobile-->>User: "Upload fresh documents"
    Note over User: Cannot reuse old documents
    Note over User: All documents must be current
    
    User->>Mobile: Opens Document Upload
    Mobile->>Convex: Query required documents
    Note over Convex: Based on selected job category
    Convex-->>Mobile: Return document types
    
    loop For each required document
        User->>Mobile: Selects NEW file
        Mobile->>Storage: Upload file
        Storage-->>Mobile: Return storageFileId
        Mobile->>Convex: createDocumentUpload mutation
        Note over Convex: Links to renewal application
        Convex-->>Mobile: Confirm upload
    end
    
    User->>Mobile: Clicks "Submit for Review"
    Mobile->>Convex: updateApplicationStatus mutation
    Note over Convex: Status: "Draft" → "Submitted"
    Convex->>Convex: Create notification for admin
    Convex-->>Mobile: Confirm submission
    Mobile-->>User: Show "Renewal Submitted"
    
    Note over User,Admin: Phase 6-9: Same as New Application
    Note over User,Admin: - Admin reviews documents
    Note over User,Admin: - User makes payment (₱60)
    Note over User,Admin: - Admin validates payment
    Note over User,Admin: - Orientation (if category changed)
    Note over User,Admin: - Admin approves application
    
    Note over User,Admin: Phase 10: New Health Card Issuance
    
    Admin->>Convex: approveApplication mutation
    Note over Admin: For renewal application
    
    Convex->>Convex: Generate NEW registration number
    Note over Convex: Each renewal gets unique number
    Convex->>Convex: Create NEW health card
    Note over Convex: Status: "active"
    Note over Convex: issuedDate: now
    Note over Convex: expiryDate: +1 year
    
    Convex->>Convex: Update OLD health card
    Note over Convex: Status: "active" → "expired"
    Note over Convex: Old card invalidated
    
    Convex->>Convex: Update renewal application
    Note over Convex: Status → "Approved"
    Note over Convex: Link to new healthCardId
    
    Convex->>Convex: Create notification for user
    Convex-->>Admin: Confirm approval
    
    Convex->>Mobile: Push notification
    Mobile-->>User: "Health card renewed!"
    
    User->>Mobile: Opens "My Health Cards"
    Mobile->>Convex: Query health cards
    Convex-->>Mobile: Return cards (new active, old expired)
    Mobile-->>User: Display NEW health card
    Note over User: Old card shows as "Expired"
    Note over User: New card shows as "Active"
```

---

## 3. Document Review Process

### Detailed Document Verification Flow

```mermaid
sequenceDiagram
    actor Admin
    participant WebAdmin
    participant Convex as Convex Backend
    participant Mobile as Mobile App
    actor User
    
    Admin->>WebAdmin: Opens "Document Verification" dashboard
    WebAdmin->>Convex: Query applications needing review
    Note over WebAdmin,Convex: Filter: status = "Submitted"
    Convex-->>WebAdmin: Return pending applications
    
    Admin->>WebAdmin: Selects application to review
    WebAdmin->>Convex: Query application details
    Convex-->>WebAdmin: Return application data
    WebAdmin->>Convex: Query document uploads
    Convex-->>WebAdmin: Return uploaded documents
    
    WebAdmin-->>Admin: Display documents for review
    
    loop For each document
        Admin->>WebAdmin: Clicks document to view
        WebAdmin->>Convex: getDocumentAccessUrl query
        Note over Convex: Generate HMAC-signed URL
        Convex-->>WebAdmin: Return signed URL
        WebAdmin->>Admin: Display document in viewer
        
        alt Document Approved
            Admin->>WebAdmin: Clicks "Approve"
            WebAdmin->>Convex: approveDocument mutation
            Note over Convex: reviewStatus: "Pending" → "Approved"
            Note over Convex: Set reviewedBy, reviewedAt
            Convex->>Convex: Create adminActivityLog
            Convex-->>WebAdmin: Confirm approval
            
        else Non-Medical Issue (Needs Revision)
            Admin->>WebAdmin: Clicks "Mark for Revision"
            Admin->>WebAdmin: Selects issue category
            Note over Admin: e.g., "blurry_photo", "expired_document"
            Admin->>WebAdmin: Enters detailed reason
            Admin->>WebAdmin: Lists specific issues
            
            WebAdmin->>Convex: createDocumentReferral mutation
            Note over Convex: issueType: "document_issue"
            Note over Convex: documentIssueCategory: <selected>
            Convex->>Convex: Create documentReferralHistory record
            Convex->>Convex: Preserve original file (audit)
            Convex->>Convex: Update reviewStatus: "NeedsRevision"
            Convex->>Convex: Create adminActivityLog
            Convex->>Convex: Create notification for user
            Convex-->>WebAdmin: Confirm referral
            
            Convex->>Mobile: Push notification
            Mobile-->>User: "Document needs revision"
            
            User->>Mobile: Views rejection details
            Mobile->>Convex: Query documentReferralHistory
            Convex-->>Mobile: Return reason + specific issues
            Mobile-->>User: Display detailed feedback
            
            User->>Mobile: Re-uploads corrected document
            Mobile->>Convex: createDocumentUpload mutation
            Note over Convex: Link via replacementUploadId
            Note over Convex: Increment attemptNumber
            Convex->>Convex: Update referralHistory.wasReplaced = true
            Convex-->>Mobile: Confirm upload
            
        else Medical Finding (Referral)
            Admin->>WebAdmin: Clicks "Refer for Medical Management"
            Admin->>WebAdmin: Selects medical category
            Note over Admin: e.g., "abnormal_xray", "positive_drug_test"
            Admin->>WebAdmin: Enters clinical findings
            Admin->>WebAdmin: Enters doctor info (optional)
            
            WebAdmin->>Convex: createMedicalReferral mutation
            Note over Convex: issueType: "medical_referral"
            Note over Convex: medicalReferralCategory: <selected>
            Convex->>Convex: Create documentReferralHistory record
            Convex->>Convex: Update reviewStatus: "Referred"
            Convex->>Convex: Update application status
            Note over Convex: Status → "Referred for Medical Management"
            Convex->>Convex: Create adminActivityLog
            Convex->>Convex: Create notification for user
            Convex-->>WebAdmin: Confirm referral
            
            Convex->>Mobile: Push notification
            Mobile-->>User: "Medical consultation required"
            
            User->>Mobile: Views referral details
            Mobile->>Convex: Query documentReferralHistory
            Convex-->>Mobile: Return medical findings + doctor info
            Mobile-->>User: Display referral information
            Note over User: User seeks medical consultation
            Note over User: Gets treatment/clearance
        end
    end
    
    Admin->>WebAdmin: Reviews all documents
    
    alt All Documents Approved
        WebAdmin->>Convex: Check document approval status
        Convex->>Convex: Update application status
        Note over Convex: Status: "Submitted" → "For Payment Validation"
        Convex->>Convex: Set paymentDeadline (7 days)
        Convex->>Convex: Create notification for user
        Convex-->>WebAdmin: Confirm status update
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Documents approved! Proceed to payment"
        
    else Some Documents Need Revision
        Convex->>Convex: Keep status "Documents Need Revision"
        Convex->>Convex: Wait for user resubmission
        
    else Medical Referral Required
        Convex->>Convex: Keep status "Referred for Medical Management"
        Convex->>Convex: Application on hold until clearance
    end
```

---

## 4. Payment Processing

### Online Payment (Maya) Flow

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    participant Maya as Maya Payment API
    
    User->>Mobile: Opens Payment screen
    Mobile->>Convex: Query payment requirements
    Note over Mobile,Convex: Pass applicationId
    Convex->>Convex: Calculate fees
    Note over Convex: Total: ₱60
    Convex-->>Mobile: Return amount details
    Mobile-->>User: Display payment options
    
    User->>Mobile: Selects "Pay with Maya"
    Mobile->>Convex: createMayaCheckout mutation
    
    Convex->>Convex: Create payment record
    Note over Convex: paymentStatus: "Pending"
    Note over Convex: paymentMethod: "Maya"
    Note over Convex: paymentProvider: "maya_api"
    
    Convex->>Maya: POST /checkout
    Note over Convex,Maya: Pass amount, redirectUrl, webhookUrl
    
    alt Maya API Success
        Maya-->>Convex: Return checkoutId + checkoutUrl
        Convex->>Convex: Update payment.mayaCheckoutId
        Convex->>Convex: Update payment.checkoutUrl
        Convex->>Convex: Create paymentLog (checkout_created)
        Convex-->>Mobile: Return checkoutUrl
        
        Mobile->>Maya: Opens Maya checkout page
        Mobile-->>User: Display Maya payment form
        
        User->>Maya: Enters payment details
        User->>Maya: Confirms payment
        
        Maya->>Maya: Process payment
        
        alt Payment Successful
            Maya->>Convex: Webhook: payment.success
            Note over Maya,Convex: POST /api/webhooks/maya
            
            Convex->>Convex: Verify webhook signature
            Convex->>Convex: Update payment status
            Note over Convex: paymentStatus: "Pending" → "Complete"
            Convex->>Convex: Set settlementDate
            Convex->>Convex: Create paymentLog (payment_success)
            Convex->>Convex: Update application status
            Note over Convex: Check if orientation required
            Convex->>Convex: Create notification for user
            Convex->>Convex: Create adminActivityLog
            Convex-->>Maya: Return 200 OK
            
            Maya->>Mobile: Redirect to successUrl
            Mobile->>Convex: Query payment status
            Convex-->>Mobile: Return "Complete"
            Mobile-->>User: Show "Payment Successful!"
            
        else Payment Failed
            Maya->>Convex: Webhook: payment.failed
            Convex->>Convex: Update payment status
            Note over Convex: paymentStatus: "Pending" → "Failed"
            Convex->>Convex: Store failureReason
            Convex->>Convex: Create paymentLog (payment_failed)
            Convex-->>Maya: Return 200 OK
            
            Maya->>Mobile: Redirect to failureUrl
            Mobile-->>User: Show "Payment Failed"
            Mobile-->>User: Option to retry
            
        else Payment Expired
            Maya->>Convex: Webhook: payment.expired
            Convex->>Convex: Update payment status
            Note over Convex: paymentStatus: "Pending" → "Expired"
            Convex->>Convex: Create paymentLog (payment_expired)
            Convex-->>Maya: Return 200 OK
        end
        
    else Maya API Error
        Maya-->>Convex: Return error
        Convex->>Convex: Create paymentLog (checkout_failed)
        Convex-->>Mobile: Return error
        Mobile-->>User: Show error message
    end
```

### Manual Payment Flow

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    participant Storage as Convex Storage
    participant Admin as WebAdmin
    
    User->>Mobile: Selects "Pay at Barangay Hall"
    Mobile->>Convex: getManualPaymentInstructions query
    Convex-->>Mobile: Return payment details + locations
    Mobile-->>User: Display payment instructions
    Note over User: Amount: ₱60
    Note over User: Account details, reference format
    
    User->>User: Goes to Barangay/City Hall
    User->>User: Makes cash payment
    User->>User: Receives official receipt
    
    User->>Mobile: Opens "Upload Receipt" screen
    User->>Mobile: Takes photo / selects receipt image
    Mobile->>Storage: Upload receipt image
    Storage-->>Mobile: Return storageFileId
    
    Mobile->>Convex: createManualPayment mutation
    Note over Mobile,Convex: Pass receipt info + storageFileId
    
    Convex->>Convex: Create payment record
    Note over Convex: paymentStatus: "Pending"
    Note over Convex: paymentMethod: "BaranggayHall" or "CityHall"
    Note over Convex: paymentProvider: "manual"
    Note over Convex: receiptStorageId: <storageFileId>
    
    Convex->>Convex: Create notification for admin
    Note over Convex: "New manual payment for validation"
    Convex->>Convex: Create paymentLog
    Convex-->>Mobile: Confirm submission
    Mobile-->>User: Show "Receipt submitted for validation"
    
    Admin->>WebAdmin: Opens "Payment Validation" dashboard
    WebAdmin->>Convex: Query pending manual payments
    Convex-->>WebAdmin: Return payments with "Pending" status
    
    Admin->>WebAdmin: Selects payment to review
    WebAdmin->>Convex: Query payment details
    Convex-->>WebAdmin: Return payment + receipt
    WebAdmin->>Convex: Get receipt access URL
    Convex-->>WebAdmin: Return signed URL
    WebAdmin-->>Admin: Display receipt image
    
    alt Receipt Valid
        Admin->>WebAdmin: Clicks "Approve Payment"
        Admin->>WebAdmin: Enters validation notes (optional)
        
        WebAdmin->>Convex: approveManualPayment mutation
        Convex->>Convex: Update payment status
        Note over Convex: paymentStatus: "Pending" → "Complete"
        Convex->>Convex: Set settlementDate
        Convex->>Convex: Create paymentLog (payment_success)
        Convex->>Convex: Update application status
        Note over Convex: Proceed to next phase
        Convex->>Convex: Create notification for user
        Convex->>Convex: Create adminActivityLog
        Convex-->>WebAdmin: Confirm approval
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Payment approved!"
        
    else Receipt Invalid
        Admin->>WebAdmin: Clicks "Reject Payment"
        Admin->>WebAdmin: Selects rejection category
        Note over Admin: e.g., "invalid_receipt", "wrong_amount"
        Admin->>WebAdmin: Enters rejection reason
        Admin->>WebAdmin: Lists specific issues
        
        WebAdmin->>Convex: rejectManualPayment mutation
        Convex->>Convex: Create paymentRejectionHistory record
        Convex->>Convex: Preserve receipt (audit)
        Convex->>Convex: Update payment status
        Note over Convex: paymentStatus: "Pending" → "Failed"
        Convex->>Convex: Create paymentLog (payment_failed)
        Convex->>Convex: Create notification for user
        Convex->>Convex: Create adminActivityLog
        Convex-->>WebAdmin: Confirm rejection
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Payment rejected"
        
        User->>Mobile: Views rejection details
        Mobile->>Convex: Query paymentRejectionHistory
        Convex-->>Mobile: Return reason + specific issues
        Mobile-->>User: Display detailed feedback
        
        User->>Mobile: Re-submits payment with new receipt
        Note over User: Repeat manual payment flow
    end
```

---

## 5. Orientation Booking

### Complete Orientation Flow

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    participant Inspector as Inspector App
    actor Admin
    
    Note over User,Admin: Phase 1: Schedule Creation (Admin)
    
    Admin->>Inspector: Opens "Orientation Schedules"
    Admin->>Inspector: Clicks "Create Schedule"
    Admin->>Inspector: Fills schedule details
    Note over Admin: Date, time, venue, capacity, instructor
    
    Inspector->>Convex: createOrientationSchedule mutation
    Convex->>Convex: Create schedule record
    Note over Convex: availableSlots = totalSlots
    Note over Convex: isAvailable = true
    Convex-->>Inspector: Confirm creation
    Inspector-->>Admin: Show "Schedule created"
    
    Note over User,Admin: Phase 2: Booking (User)
    
    Mobile->>Convex: Check application requirements
    Convex-->>Mobile: Orientation required (Yellow Card)
    Mobile-->>User: Show "Book Orientation" prompt
    
    User->>Mobile: Opens Orientation Booking screen
    Mobile->>Convex: Query available schedules
    Note over Mobile,Convex: Filter: isAvailable = true, date >= today
    Convex-->>Mobile: Return available schedules
    
    Mobile-->>User: Display schedule options
    Note over User: Shows date, time, venue, available slots
    
    User->>Mobile: Selects preferred schedule
    User->>Mobile: Clicks "Confirm Booking"
    
    Mobile->>Convex: createOrientationBooking mutation
    Note over Mobile,Convex: Pass scheduleId + applicationId
    
    Convex->>Convex: Verify availability
    alt Slots Available
        Convex->>Convex: Create booking record
        Note over Convex: status: "scheduled"
        Note over Convex: Denormalize schedule details
        Convex->>Convex: Generate QR code
        Note over Convex: QR contains: bookingId, userId, scheduleId
        Convex->>Convex: Decrement schedule.availableSlots
        Convex->>Convex: Create notification for user
        Convex-->>Mobile: Return booking + QR code
        
        Mobile-->>User: Show booking confirmation
        Mobile-->>User: Display QR code
        Note over User: "Show this QR at orientation"
        
    else Fully Booked
        Convex-->>Mobile: Return error "Schedule full"
        Mobile-->>User: Show "Fully booked, choose another"
    end
    
    Note over User,Admin: Phase 3: Check-in
    
    User->>User: Arrives at orientation venue
    User->>Mobile: Opens booking details
    Mobile-->>User: Display QR code
    
    Admin->>Inspector: Opens "Orientation Check-in"
    Admin->>Inspector: Selects today's schedule
    Admin->>Inspector: Scans user's QR code
    
    Inspector->>Convex: checkInUser mutation
    Note over Inspector,Convex: Pass bookingId from QR
    
    Convex->>Convex: Verify booking exists
    Convex->>Convex: Verify schedule date is today
    Convex->>Convex: Update booking status
    Note over Convex: status: "scheduled" → "checked-in"
    Note over Convex: checkInTime: now
    Note over Convex: checkedInBy: <inspector ID>
    Convex->>Convex: Create adminActivityLog
    Convex-->>Inspector: Confirm check-in
    
    Inspector-->>Admin: Show "Check-in successful"
    
    Convex->>Mobile: Push notification
    Mobile-->>User: "Checked in successfully"
    
    Note over User,Admin: Phase 4: Orientation Session
    
    Note over User: Attends 2-hour orientation
    Note over User: Learns food safety, hygiene practices
    
    Note over User,Admin: Phase 5: Check-out
    
    Admin->>Inspector: Scans user's QR code again
    Inspector->>Convex: checkOutUser mutation
    Note over Inspector,Convex: Pass bookingId
    
    Convex->>Convex: Verify user is checked-in
    Convex->>Convex: Calculate attendance duration
    Note over Convex: duration = checkOutTime - checkInTime
    
    alt Attended Minimum Duration (e.g., 1.5 hours)
        Convex->>Convex: Update booking status
        Note over Convex: status: "checked-in" → "completed"
        Note over Convex: checkOutTime: now
        Note over Convex: checkedOutBy: <inspector ID>
        Note over Convex: completedAt: now
        
        Convex->>Convex: Update application
        Note over Convex: orientationCompleted: true
        Convex->>Convex: Update application status
        Note over Convex: Ready for final approval
        
        Convex->>Convex: Create adminActivityLog
        Convex-->>Inspector: Confirm check-out
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Orientation completed!"
        
    else Left Early
        Convex->>Convex: Update status: "missed"
        Convex->>Convex: Add inspectorNotes: "Left early"
        Convex-->>Inspector: Show "Incomplete attendance"
        
        Convex->>Mobile: Push notification
        Mobile-->>User: "Please attend full session"
    end
    
    Note over User,Admin: Phase 6: Finalization (Admin)
    
    Admin->>Inspector: Reviews attendance for session
    Admin->>Inspector: Clicks "Finalize Session"
    
    Inspector->>Convex: finalizeOrientationSession mutation
    Convex->>Convex: Update schedule
    Note over Convex: isFinalized: true
    Note over Convex: finalizedAt: now
    Note over Convex: finalizedBy: <admin ID>
    
    Convex->>Convex: Process no-shows
    Note over Convex: Update bookings with status "scheduled" → "no-show"
    Convex-->>Inspector: Confirm finalization
```

---

## 6. Health Card Issuance

### Final Approval & Card Generation

```mermaid
sequenceDiagram
    actor Admin
    participant WebAdmin
    participant Convex as Convex Backend
    participant Mobile as Mobile App
    actor User
    
    Note over Admin,User: Prerequisites Check
    
    Admin->>WebAdmin: Opens "Ready for Approval" dashboard
    WebAdmin->>Convex: Query applications ready for approval
    Note over WebAdmin,Convex: Filter applications where:
    Note over WebAdmin,Convex: - All documents approved
    Note over WebAdmin,Convex: - Payment complete
    Note over WebAdmin,Convex: - Orientation done (if required)
    
    Convex-->>WebAdmin: Return eligible applications
    WebAdmin-->>Admin: Display applications list
    
    Admin->>WebAdmin: Selects application to approve
    WebAdmin->>Convex: Query full application details
    Convex-->>WebAdmin: Return application, documents, payment
    
    Admin->>Admin: Final review of all details
    Admin->>WebAdmin: Clicks "Approve & Issue Health Card"
    
    Note over Admin,User: Health Card Generation
    
    WebAdmin->>Convex: approveApplicationAndIssueCard mutation
    
    Convex->>Convex: Generate unique registration number
    Note over Convex: Format: CHO-YYYY-XXXXXX
    Note over Convex: e.g., CHO-2025-001234
    
    Convex->>Convex: Get applicant details
    Note over Convex: Name, photo, job category, etc.
    
    Convex->>Convex: Generate health card HTML
    Note over Convex: Template includes:
    Note over Convex: - Registration number
    Note over Convex: - Applicant photo
    Note over Convex: - Personal details
    Note over Convex: - Job category color
    Note over Convex: - Issue/expiry dates
    Note over Convex: - QR code for verification
    
    Convex->>Convex: Create healthCard record
    Note over Convex: status: "active"
    Note over Convex: issuedDate: now
    Note over Convex: expiryDate: +1 year from now
    Note over Convex: htmlContent: <generated HTML>
    
    Convex->>Convex: Update application
    Note over Convex: applicationStatus → "Approved"
    Note over Convex: approvedAt: now
    Note over Convex: healthCardId: <new card ID>
    Note over Convex: healthCardRegistrationNumber: <number>
    Note over Convex: healthCardIssuedAt: now
    
    Convex->>Convex: Create notification for user
    Note over Convex: "Your health card has been issued!"
    
    Convex->>Convex: Create adminActivityLog
    Note over Convex: action: "health_card_issued"
    
    Convex-->>WebAdmin: Confirm issuance
    WebAdmin-->>Admin: Show "Health card issued"
    
    Convex->>Mobile: Push notification
    Mobile-->>User: "Health card issued! 🎉"
    
    Note over Admin,User: User Views Health Card
    
    User->>Mobile: Opens "My Health Cards" screen
    Mobile->>Convex: getUserHealthCards query
    Note over Mobile,Convex: Pass userId
    
    Convex->>Convex: Get user's applications
    Convex->>Convex: Get linked health cards
    Convex->>Convex: Join with job categories
    Convex-->>Mobile: Return health cards with details
    
    Mobile-->>User: Display health card(s)
    Note over User: Shows:
    Note over User: - Registration number
    Note over User: - Photo
    Note over User: - Job category badge
    Note over User: - Issue/expiry dates
    Note over User: - Status (Active/Expired)
    Note over User: - QR code
    
    User->>Mobile: Clicks "View Full Card"
    Mobile->>Convex: getHealthCardHTML query
    Convex-->>Mobile: Return card HTML content
    Mobile-->>User: Display rendered health card
    
    User->>Mobile: Clicks "Download Card"
    Mobile->>Mobile: Generate PDF from HTML
    Mobile->>Mobile: Save to device
    Mobile-->>User: "Health card saved"
    
    User->>Mobile: Clicks "Share Card"
    Mobile->>Mobile: Generate shareable image
    Mobile-->>User: Show share options
```

---

## 7. Renewal Eligibility Check (NEW)

### Detailed Eligibility Verification

```mermaid
sequenceDiagram
    actor User
    participant Mobile as Mobile App
    participant Convex as Convex Backend
    
    User->>Mobile: Opens Dashboard
    Mobile->>Convex: getCurrentUserQuery
    Convex-->>Mobile: Return user details
    
    Mobile->>Convex: checkRenewalEligibilityQuery
    
    Convex->>Convex: Authenticate user
    Note over Convex: Get identity from auth context
    
    alt Not Authenticated
        Convex-->>Mobile: Return { isEligible: false, reason: "Not authenticated" }
        Mobile-->>User: Redirect to login
    end
    
    Convex->>Convex: Get user by clerkId
    
    alt User Not Found
        Convex-->>Mobile: Return { isEligible: false, reason: "User not found" }
        Mobile-->>User: Show error
    end
    
    Convex->>Convex: Query user's applications
    Note over Convex: Filter: userId = user._id, deletedAt = undefined
    
    Convex->>Convex: Check for pending applications
    Note over Convex: Check statuses:
    Note over Convex: - Not "Approved"
    Note over Convex: - Not "Payment Rejected"
    Note over Convex: - Not "Referred for Medical Management"
    
    alt Has Pending Applications
        Convex-->>Mobile: Return { isEligible: false, reason: "Application in progress" }
        Mobile-->>User: Show "Complete current application first"
    end
    
    Convex->>Convex: Check for pending renewal
    Note over Convex: Filter: applicationType = "Renew", status != approved/rejected
    
    alt Has Pending Renewal
        Convex-->>Mobile: Return { isEligible: false, reason: "Renewal in progress" }
        Mobile-->>User: Show "Renewal already submitted"
    end
    
    Convex->>Convex: Find approved applications
    Note over Convex: Filter: status = "Approved"
    Convex->>Convex: Sort by approvedAt (descending)
    
    alt No Approved Applications
        Convex-->>Mobile: Return { isEligible: false, reason: "No approved application" }
        Mobile-->>User: Show "Apply for health card first"
    end
    
    Convex->>Convex: Get most recent approved application
    Convex->>Convex: Query health card for application
    Note over Convex: Use by_application index
    
    alt No Health Card Found
        Convex-->>Mobile: Return { isEligible: false, reason: "No health card found" }
        Mobile-->>User: Show "Contact support"
    end
    
    Convex->>Convex: Get job category for card
    
    Convex->>Convex: Calculate card status
    Note over Convex: isExpired = expiryDate < now
    Note over Convex: isExpiringSoon = expiryDate < (now + 30 days)
    Note over Convex: daysUntilExpiry = (expiryDate - now) / 86400000
    
    Convex->>Convex: Prepare eligibility response
    
    Convex-->>Mobile: Return {
    Note over Convex,Mobile: isEligible: true,
    Note over Convex,Mobile: reason: "Eligible for renewal",
    Note over Convex,Mobile: previousCard: { ...cardData, jobCategory, status },
    Note over Convex,Mobile: previousApplication: { ...appData, jobCategory }
    Note over Convex,Mobile: }
    
    Mobile->>Mobile: Process eligibility data
    
    alt Card Expired
        Mobile-->>User: Show "EXPIRED - Renew Now" badge
        Mobile-->>User: Enable renewal button (urgent)
        
    else Card Expiring Soon (<30 days)
        Mobile-->>User: Show "RENEW SOON" badge
        Mobile-->>User: Enable renewal button
        
    else Card Still Valid (>30 days)
        Mobile-->>User: Show expiry date
        Mobile-->>User: Enable renewal button (with confirmation)
    end
    
    User->>Mobile: Clicks "Renew Health Card"
    Mobile->>Mobile: Navigate to card selection screen
    Note over Mobile: Pass eligibility data as context
```

---

## 📊 System Integration Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Mobile[Mobile App<br/>React Native + Expo]
        WebAdmin[WebAdmin<br/>Next.js]
        Inspector[Inspector App<br/>Mobile]
    end
    
    subgraph "Backend Layer"
        Convex[Convex Backend<br/>Queries + Mutations]
        Storage[Convex Storage<br/>File Storage]
        Auth[Clerk Auth<br/>Authentication]
    end
    
    subgraph "External Services"
        Maya[Maya API<br/>Payment Gateway]
        SMS[SMS Provider<br/>Notifications]
        Email[Email Service<br/>Notifications]
    end
    
    Mobile -->|GraphQL-like API| Convex
    WebAdmin -->|GraphQL-like API| Convex
    Inspector -->|GraphQL-like API| Convex
    
    Mobile -->|OAuth| Auth
    WebAdmin -->|OAuth| Auth
    
    Convex -->|File Upload/Download| Storage
    Convex -->|Payment Processing| Maya
    Convex -->|Send Notifications| SMS
    Convex -->|Send Emails| Email
    
    Maya -->|Webhooks| Convex
    
    style Mobile fill:#4CAF50
    style WebAdmin fill:#2196F3
    style Inspector fill:#FF9800
    style Convex fill:#9C27B0
    style Maya fill:#00BCD4
```

---

## 📝 Sequence Diagram Notation Guide

### Actors & Participants
- **Actor** (User, Admin): Human users of the system
- **Participant** (Mobile, Convex): System components

### Arrow Types
- `->`: Synchronous call
- `-->`: Response/return
- `->>`: Asynchronous message
- `-->>`: Asynchronous response

### Boxes
- **Note**: Additional context or explanation
- **Alt**: Alternative paths (if/else)
- **Loop**: Repeated actions
- **Opt**: Optional actions

---

## 🔗 Related Documentation

- **Domain Diagram**: `CAPSTONE_DOMAIN_DIAGRAM.md` - Database schema and relationships
- **Renewal Implementation Guide**: `RENEWAL_MASTER_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
- **Convex Schema**: `C:\Em\backend\convex\schema.ts` - Actual schema definition

---

## 📅 Document Information

- **Version**: 1.0
- **Last Updated**: 2025-11-15
- **Created For**: Capstone Project Documentation
- **Covers**: Complete application flow + Renewal feature (NEW)

---

**End of Sequence Diagrams**
