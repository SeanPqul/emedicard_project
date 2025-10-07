import React from 'react';
import { View, Modal, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useRejectionHistory } from '@features/document-rejection/hooks';
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
import { Id } from '@backend/convex/_generated/dataModel';
import { BaseScreenLayout } from '@shared/components/layout/BaseScreenLayout';

export function DocumentRejectionHistoryScreen() {
  const { formId } = useLocalSearchParams<{ formId: string }>();
  const applicationId = formId; // Use formId as applicationId for compatibility
  const [selectedFilter, setSelectedFilter] = React.useState<RejectionCategory | 'all'>('all');
  const [selectedRejection, setSelectedRejection] = React.useState<EnrichedRejection | null>(null);
  const [showResubmitModal, setShowResubmitModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  const {
    rejections,
    isLoading,
  } = useRejectionHistory(applicationId as Id<"applications">);
  
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { documentTypes } = useDocumentTypes();
  
  // Helper to get field identifier from document type
  const getFieldIdentifier = (documentTypeId: Id<"documentTypes">): string => {
    const docType = documentTypes?.find((type: any) => type._id === documentTypeId);
    return docType?.fieldIdentifier || documentTypeId; // Fallback to ID if not found
  };

  const handleResubmit = (rejection: EnrichedRejection) => {
    setSelectedRejection(rejection);
    setShowResubmitModal(true);
  };

  const handleViewDetails = (rejection: EnrichedRejection) => {
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
                const rejectionObj = {
                  _id: selectedRejection._id,
                  applicationId: selectedRejection.applicationId,
                  documentTypeId: selectedRejection.documentTypeId,
                  documentUploadId: '' as Id<"documentUploads">,
                  rejectedFileId: '' as Id<"_storage">,
                  originalFileName: selectedRejection.replacementInfo?.fileName || '',
                  fileSize: 0,
                  fileType: '',
                  rejectionCategory: selectedRejection.rejectionCategory,
                  rejectionReason: selectedRejection.rejectionReason,
                  specificIssues: selectedRejection.specificIssues,
                  rejectedBy: '' as Id<"users">,
                  rejectedAt: selectedRejection.rejectedAt,
                  wasReplaced: selectedRejection.wasReplaced,
                  replacementUploadId: selectedRejection.replacementInfo?.uploadId,
                  replacedAt: selectedRejection.replacedAt,
                  attemptNumber: selectedRejection.attemptNumber,
                  documentTypeName: selectedRejection.documentTypeName,
                  rejectedByName: selectedRejection.rejectedByName,
                  rejectedByRole: 'Admin',
                  rejectionCategoryLabel: RejectionCategoryLabels[selectedRejection.rejectionCategory],
                  formattedRejectedAt: new Date(selectedRejection.rejectedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                  formattedReplacedAt: selectedRejection.replacedAt
                    ? new Date(selectedRejection.replacedAt).toLocaleDateString('en-US', {
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
