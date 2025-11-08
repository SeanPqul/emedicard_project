import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import type { EnrichedReferral } from '@entities/document/model/referral-types';

/**
 * Hook to fetch referral/issue history for an application
 * Uses new backend query with dual-read pattern
 */
export function useReferralHistory(applicationId: Id<"applications"> | undefined) {
  const data = useQuery(
    api.documents.referralQueries.getReferralHistory,
    applicationId ? { applicationId } : 'skip'
  );

  // Separate medical referrals from document issues
  const medicalReferrals = (data || []).filter(item => item.issueType === 'medical_referral');
  const documentIssues = (data || []).filter(item => item.issueType === 'document_issue');

  return {
    referrals: (data || []) as EnrichedReferral[],
    medicalReferrals: medicalReferrals as EnrichedReferral[],
    documentIssues: documentIssues as EnrichedReferral[],
    totalCount: data?.length || 0,
    medicalCount: medicalReferrals.length,
    documentIssueCount: documentIssues.length,
    isLoading: data === undefined,
    error: null,
  };
}
