import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export interface PaymentRejection {
  _id: string;
  rejectionCategory: string;
  rejectionReason: string;
  specificIssues: string[];
  rejectedAt: number;
  rejectedBy: string;
  rejectedByName: string;
  rejectedByEmail: string;
  attemptNumber: number;
  wasReplaced: boolean;
  replacedAt?: number;
  replacementPaymentId?: string;
  status: 'pending' | 'resubmitted' | 'rejected' | 'approved';
  paymentMethod: string;
  referenceNumber: string;
  amount: number;
}

export function usePaymentRejectionHistory(applicationId: string | undefined) {
  const rejectionHistory = useQuery(
    api.payments.getRejectionHistory.getRejectionHistory,
    applicationId ? { applicationId: applicationId as Id<'applications'> } : 'skip'
  ) as PaymentRejection[] | undefined;

  // Get the latest rejection that hasn't been replaced
  const latestRejection = rejectionHistory?.find(r => !r.wasReplaced);

  // Count total rejections
  const rejectionCount = rejectionHistory?.length || 0;

  // Check if max attempts reached (assuming 3 max attempts)
  const maxAttemptsReached = latestRejection && latestRejection.attemptNumber >= 3;

  return {
    rejectionHistory: rejectionHistory || [],
    latestRejection,
    rejectionCount,
    maxAttemptsReached,
    hasRejections: rejectionCount > 0,
    isLoading: rejectionHistory === undefined,
  };
}
