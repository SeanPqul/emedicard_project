# Changes Summary - Rejection History Refactor

**Author**: Sean  
**Branch**: master  
**Date**: November 8, 2025  
**Status**: Ready for review

---

## Overview

This changeset refactors the admin rejection history system to support a new "referral" workflow alongside the existing "rejection" workflow. The primary change involves migrating from a single `documentRejectionHistory` table to a dual-table system that includes the new `documentReferralHistory` table.

---

## Recent Commit

**c0fbdc7** - `refactor(doc_verif): Rename 'Rejected' status to 'Referred' for medical cases`

---

## Modified Files

### `backend/convex/admin/rejectionHistory.ts`

**Key Changes:**

#### 1. **Performance Optimization**
- Refactored filtering logic to compute `managedApplicationIds` once and reuse across all queries
- This eliminates redundant filtering operations and improves query efficiency

#### 2. **New Table Support: `documentReferralHistory`**
- Added support for the new referral tracking table
- Fetches, filters, and enriches referral records with the following fields:
  - `issueType` - Type of issue identified
  - `medicalReferralCategory` - Category for medical referrals
  - `documentIssueCategory` - Category for document issues
  - `referralReason` - Reason for the referral
  - `referredAt` - Timestamp of referral
  - `wasReplaced` - Whether the document was replaced
  - `status` - Current status of the referral

#### 3. **Unified Data Handling**
- Combines both old rejection records and new referral records into a single `allRejections` list
- Maintains backward compatibility with existing rejection data
- Enriches referral data alongside existing payment, orientation, and application rejections

#### 4. **Updated `getRejectionStats` Function**
- Now fetches from both `documentRejectionHistory` and `documentReferralHistory`
- Combines data from both tables for comprehensive statistics
- Updated filtering to include referrals when filtering by managed categories
- Enhanced category derivation logic:
  - **Old schema**: Uses `rejectionCategory`
  - **New schema**: Uses `issueType` with `medicalReferralCategory` or `documentIssueCategory`
- Updated reason counting:
  - **Old schema**: Uses `rejectionReason`
  - **New schema**: Uses `referralReason`

#### 5. **Code Documentation**
- Added clear comments distinguishing between OLD rejections and NEW referrals
- Improved code readability for future maintenance

---

## Technical Impact

### Database Schema
- Introduces dependency on new `documentReferralHistory` table
- Maintains full backward compatibility with `documentRejectionHistory`

### Performance
- Optimized query patterns reduce redundant filtering
- Single computation of managed application IDs improves efficiency

### Data Integrity
- Dual-table approach allows for more granular tracking
- Separation between rejections and referrals provides clearer audit trail

---

## Testing Recommendations

1. **Verify backward compatibility**: Ensure existing rejection data displays correctly
2. **Test referral workflow**: Validate new referral records are properly captured and displayed
3. **Check statistics accuracy**: Confirm `getRejectionStats` accurately combines both data sources
4. **Performance testing**: Measure query performance with optimized filtering
5. **Edge cases**: Test behavior when:
   - Only old rejection data exists
   - Only new referral data exists
   - Mixed data from both tables

---

## Migration Notes

- No database migration required for existing data
- New referral workflow can be adopted gradually
- Old rejection workflow remains fully functional

---

## Questions or Concerns?

Please reach out to Sean for clarification on any of these changes.
