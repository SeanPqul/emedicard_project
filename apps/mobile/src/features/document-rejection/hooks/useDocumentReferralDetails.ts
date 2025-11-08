import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import type { IssueType } from '@entities/document/model/referral-types';

/**
 * Hook to get detailed referral/issue information for a document
 * Uses new backend query with dual-read pattern
 */
export function useDocumentReferralDetails(
  applicationId: Id<"applications"> | undefined,
  documentTypeId: Id<"documentTypes"> | undefined
) {
  const data = useQuery(
    api.documents.referralQueries.getDocumentReferralDetails,
    applicationId && documentTypeId ? { applicationId, documentTypeId } : 'skip'
  );

  const isMedical = data?.issueType === 'medical_referral';
  const isDocumentIssue = data?.issueType === 'document_issue';

  return {
    referral: data,
    isMedical,
    isDocumentIssue,
    issueType: data?.issueType as IssueType | undefined,
    doctorName: data?.referral?.doctorName,
    clinicAddress: data?.referral?.clinicAddress,
    isLoading: data === undefined,
    error: null,
  };
}
