import React from 'react';
import { View, Modal, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRejectionHistory, useReferralHistory } from '@features/document-rejection/hooks';
import { useDocumentTypes } from '@shared/hooks/useDocumentTypes';
import { DocumentRejectionHistoryWidget } from '@widgets/document-rejection-history';
import { ResubmitModal } from '@features/document-resubmit/components/ResubmitModal';
import { RejectionDetails } from '@features/document-rejection/components/RejectionDetails';
import { theme } from '@shared/styles/theme';
import { scale } from '@shared/utils/responsive';
import { 
  EnrichedRejection, 
  RejectionCategory,  
  RejectionCategoryLabels 
} from '@entities/document/model/rejection-types';
import {
  EnrichedReferral,
  IssueType,
  MedicalReferralCategory,
  DocumentIssueCategory,
  getCategoryLabel
} from '@entities/document/model/referral-types';
import { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreenLayout } from '@shared/components/layout/BaseScreenLayout';

export function DocumentRejectionHistoryScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const applicationId = formId; // Use formId as applicationId for compatibility
  const [selectedFilter, setSelectedFilter] = React.useState<RejectionCategory | 'all'>('all');
  const [selectedRejection, setSelectedRejection] = React.useState<EnrichedRejection | EnrichedReferral | null>(null);
  const [showResubmitModal, setShowResubmitModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  // Phase 4 Migration: Fetch both old rejections and new referrals
  const {
    rejections: oldRejections,
    isLoading: isLoadingRejections,
  } = useRejectionHistory(applicationId as Id<"applications">);

  const {
    referrals: newReferrals,
    isLoading: isLoadingReferrals,
  } = useReferralHistory(applicationId as Id<"applications">);

  // Combine and normalize both data sources
  const isLoading = isLoadingRejections || isLoadingReferrals;
  const rejections = React.useMemo(() => {
    const combined: (EnrichedRejection | EnrichedReferral)[] = [];
    
    // Add old rejections (backward compatibility)
    if (oldRejections) {
      combined.push(...oldRejections);
    }
    
    // Add new referrals
    if (newReferrals) {
      combined.push(...newReferrals);
    }
    
    // Sort by date (most recent first)
    return combined.sort((a, b) => {
      const dateA = 'rejectedAt' in a ? a.rejectedAt : a.referredAt;
      const dateB = 'rejectedAt' in b ? b.rejectedAt : b.referredAt;
      return dateB - dateA;
    });
  }, [oldRejections, newReferrals]);
  
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
    setSelectedRejection(rejection);
    setShowDetailsModal(true);
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

      {/* Details Modal Wrapper */}
      <Modal
        visible={showDetailsModal && !!selectedRejection}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowDetailsModal(false);
          setSelectedRejection(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRejection && (() => {
                // Phase 4 Migration: Handle both old rejection and new referral types
                const isReferralType = 'issueType' in selectedRejection;
                
                if (isReferralType) {
                  // New referral type
                  const referral = selectedRejection as EnrichedReferral;
                  const rejectionObj = {
                    _id: referral._id as any, // Phase 4: Type cast needed for compatibility
                    applicationId: referral.applicationId,
                    documentTypeId: referral.documentTypeId,
                    documentUploadId: '' as Id<"documentUploads">,
                    rejectedFileId: '' as Id<"_storage">,
                    originalFileName: referral.replacementInfo?.fileName || '',
                    fileSize: 0,
                    fileType: '',
                    rejectionCategory: 'other' as RejectionCategory, // Map to closest old category
                    rejectionReason: referral.reason,
                    specificIssues: referral.specificIssues,
                    rejectedBy: '' as Id<"users">,
                    rejectedAt: referral.referredAt,
                    wasReplaced: referral.wasReplaced,
                    replacementUploadId: referral.replacementInfo?.uploadId,
                    replacedAt: referral.replacedAt,
                    attemptNumber: referral.attemptNumber,
                    documentTypeName: referral.documentTypeName,
                    rejectedByName: referral.referredByName,
                    rejectedByRole: 'Admin',
                    rejectionCategoryLabel: getCategoryLabel(referral.issueType, referral.category),
                    formattedRejectedAt: new Date(referral.referredAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                    formattedReplacedAt: referral.replacedAt
                      ? new Date(referral.replacedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : undefined,
                  };
                  return (
                    <RejectionDetails
                      rejection={rejectionObj}
                      onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedRejection(null);
                      }}
                      onResubmit={() => {
                        setShowDetailsModal(false);
                        setShowResubmitModal(true);
                      }}
                    />
                  );
                } else {
                  // Old rejection type (backward compatibility)
                  const rejection = selectedRejection as EnrichedRejection;
                  const rejectionObj = {
                    _id: rejection._id,
                    applicationId: rejection.applicationId,
                    documentTypeId: rejection.documentTypeId,
                    documentUploadId: '' as Id<"documentUploads">,
                    rejectedFileId: '' as Id<"_storage">,
                    originalFileName: rejection.replacementInfo?.fileName || '',
                    fileSize: 0,
                    fileType: '',
                    rejectionCategory: rejection.rejectionCategory,
                    rejectionReason: rejection.rejectionReason,
                    specificIssues: rejection.specificIssues,
                    rejectedBy: '' as Id<"users">,
                    rejectedAt: rejection.rejectedAt,
                    wasReplaced: rejection.wasReplaced,
                    replacementUploadId: rejection.replacementInfo?.uploadId,
                    replacedAt: rejection.replacedAt,
                    attemptNumber: rejection.attemptNumber,
                    documentTypeName: rejection.documentTypeName,
                    rejectedByName: rejection.rejectedByName,
                    rejectedByRole: 'Admin',
                    rejectionCategoryLabel: RejectionCategoryLabels[rejection.rejectionCategory],
                    formattedRejectedAt: new Date(rejection.rejectedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                    formattedReplacedAt: rejection.replacedAt
                      ? new Date(rejection.replacedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : undefined,
                  };
                  return (
                    <RejectionDetails
                      rejection={rejectionObj}
                      onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedRejection(null);
                      }}
                      onResubmit={() => {
                        setShowDetailsModal(false);
                        setShowResubmitModal(true);
                      }}
                    />
                  );
                }
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </BaseScreenLayout>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    maxHeight: '90%',
    width: '90%',
    maxWidth: 500,
    padding: scale(20),
    overflow: 'hidden', // Clip content to border radius
    ...theme.shadows.large,
  },
});
