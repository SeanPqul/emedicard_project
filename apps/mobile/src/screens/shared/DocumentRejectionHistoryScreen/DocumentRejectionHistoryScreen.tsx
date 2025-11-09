import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRejectionHistory, useReferralHistory } from '@features/document-rejection/hooks';
import { useDocumentTypes } from '@shared/hooks/useDocumentTypes';
import { DocumentRejectionHistoryWidget } from '@widgets/document-rejection-history';
import { ResubmitModal } from '@features/document-resubmit/components/ResubmitModal';
import { 
  EnrichedRejection, 
  RejectionCategory
} from '@entities/document/model/rejection-types';
import {
  EnrichedReferral
} from '@entities/document/model/referral-types';
import { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreenLayout } from '@shared/components/layout/BaseScreenLayout';

export function DocumentRejectionHistoryScreen() {
  const router = useRouter();
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const applicationId = formId; // Use formId as applicationId for compatibility
  const [selectedFilter, setSelectedFilter] = React.useState<RejectionCategory | 'all'>('all');
  const [selectedRejection, setSelectedRejection] = React.useState<EnrichedRejection | EnrichedReferral | null>(null);
  const [showResubmitModal, setShowResubmitModal] = React.useState(false);

  // Fetch rejection history
  const {
    rejections: documentRejections,
    isLoading: isLoadingRejections,
  } = useRejectionHistory(applicationId as Id<"applications">);

  // Fetch referral history (medical referrals + document issues)
  const {
    referrals: documentReferrals,
    isLoading: isLoadingReferrals,
  } = useReferralHistory(applicationId as Id<"applications">);

  // Combine both rejection and referral history
  const isLoading = isLoadingRejections || isLoadingReferrals;
  const rejections = React.useMemo(() => {
    const combined: (EnrichedRejection | EnrichedReferral)[] = [];
    
    // Add rejection history
    if (documentRejections) {
      combined.push(...documentRejections);
    }
    
    // Add referral history
    if (documentReferrals) {
      combined.push(...documentReferrals);
    }
    
    // Sort by date (most recent first)
    return combined.sort((a, b) => {
      const dateA = 'rejectedAt' in a ? a.rejectedAt : a.referredAt;
      const dateB = 'rejectedAt' in b ? b.rejectedAt : b.referredAt;
      return dateB - dateA;
    });
  }, [documentRejections, documentReferrals]);
  
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { documentTypes } = useDocumentTypes();
  
  // Helper to get field identifier from document type
  const getFieldIdentifier = (documentTypeId: Id<"documentTypes">): string => {
    const docType = documentTypes?.find((type: any) => type._id === documentTypeId);
    return docType?.fieldIdentifier || documentTypeId; // Fallback to ID if not found
  };

  const handleResubmit = (rejection: EnrichedRejection | EnrichedReferral) => {
    setSelectedRejection(rejection);
    setShowResubmitModal(true);
  };

  const handleViewDetails = (rejection: EnrichedRejection | EnrichedReferral) => {
    // Details are now shown in the card itself via "More Info" button
    // This function can be used for navigation to a dedicated details screen if needed
    setSelectedRejection(rejection);
  };
  
  const handleBack = () => {
    router.back();
  };

  const handleResubmitSuccess = () => {
    setShowResubmitModal(false);
    setSelectedRejection(null);
    // Trigger refresh of data
    handleRefresh();
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Wait a bit to simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Convert document types to record
  const documentTypeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    documentTypes?.forEach((type: any) => {
      map[type._id] = type.name;
    });
    return map;
  }, [documentTypes]);

  return (
    <BaseScreenLayout>
      <DocumentRejectionHistoryWidget
        rejections={rejections || []}
        documentTypes={documentTypeMap}
        selectedFilter={selectedFilter}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onFilterChange={setSelectedFilter}
        onRefresh={handleRefresh}
        onResubmit={handleResubmit}
        onViewDetails={handleViewDetails}
        onBack={handleBack}
      />

      {/* Resubmit Modal */}
      {selectedRejection && (
        <ResubmitModal
          visible={showResubmitModal}
          onClose={() => {
            setShowResubmitModal(false);
            setSelectedRejection(null);
          }}
          applicationId={applicationId as Id<"applications">}
          documentTypeId={selectedRejection.documentTypeId}
          fieldIdentifier={getFieldIdentifier(selectedRejection.documentTypeId)}
          documentName={selectedRejection.documentTypeName || 'Unknown Document'}
          onSuccess={handleResubmitSuccess}
        />
      )}
    </BaseScreenLayout>
  );
}
