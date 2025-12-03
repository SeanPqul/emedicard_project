import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UploadDocumentsStepProps } from './UploadDocumentsStep.types';
import styles from './UploadDocumentsStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';
import { getDocumentStatusInfo, formatFileSize } from '@shared/utils/documentStatus';

export const UploadDocumentsStep: React.FC<UploadDocumentsStepProps> = ({
  formData,
  requirementsByJobCategory,
  selectedDocuments,
  isLoading,
  getUploadState,
  onDocumentPicker,
  onRemoveDocument,
  requirements,
}) => {
  // Show loading if requirements are being fetched
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.title}>Loading Document Requirements...</Text>
        <Text style={styles.subtitle}>Please wait while we fetch the required documents for your job category.</Text>
      </View>
    );
  }
  
  // Show message if no requirements found
  if (!isLoading && requirementsByJobCategory.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Upload Documents</Text>
        <Text style={styles.subtitle}>No document requirements found for the selected job category. Please contact support.</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>
        Please upload clear and readable copies of all required medical documents
        to ensure proper processing of your {formData.applicationType?.toLowerCase() || 'health card'} application.
      </Text>
      
      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={moderateScale(24)} color="#2E86AB" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Document Requirements</Text>
          <Text style={styles.infoText}>⚠️ Note: Documents must be from accredited clinics and laboratories. Accepted formats: JPG, PNG, PDF</Text>
        </View>
      </View>
      
      {/* Document List */}
      <View style={styles.documentsContainer}>
        {requirementsByJobCategory.map((document, index) => (
          <View key={document.fieldName || `doc-${index}`} style={styles.documentCard}>
            <View style={styles.documentHeader}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>
                  {document.name || 'Document'}
                  <Text style={styles.requiredAsterisk}> *</Text>
                </Text>
                <Text style={styles.documentDescription}>{document.description || 'Please upload this document'}</Text>
                <Text style={styles.documentFormats}>
                  {`Formats: ${(document as any).formats ? (document as any).formats.join(', ').toUpperCase() : 'JPG, PNG, PDF'}`}
                </Text>
              </View>
              <View style={styles.documentStatus}>
                {selectedDocuments[document.fieldName] ? (
                  <Ionicons name="checkmark-circle" size={moderateScale(24)} color={theme.colors.semantic.success} />
                ) : (
                  <Ionicons name="add-circle-outline" size={moderateScale(24)} color={theme.colors.text.secondary} />
                )}
              </View>
            </View>

            {/* Auto-filled Badge */}
            {selectedDocuments[document.fieldName]?.isAutoFilled && (
              <View style={styles.autoFilledBadge}>
                <Ionicons name="shield-checkmark" size={moderateScale(16)} color="#059669" />
                <Text style={styles.autoFilledText}>
                  Using your registration ID • Use "Replace" button below to upload a different ID
                </Text>
              </View>
            )}

            {/* Upload Progress */}
            {getUploadState(document.fieldName)?.uploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${getUploadState(document.fieldName).progress}%` }
                  ]} />
                </View>
                <Text style={styles.progressText}>
                  {getUploadState(document.fieldName).progress}%
                </Text>
              </View>
            )}

            {/* Error State */}
            {getUploadState(document.fieldName)?.error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
                <Text style={styles.errorMessage}>
                  {getUploadState(document.fieldName).error}
                </Text>
              </View>
            )}

            {/* Document Preview */}
            {selectedDocuments[document.fieldName] && !getUploadState(document.fieldName)?.uploading && (
              <View style={styles.documentPreview}>
                <TouchableOpacity
                  style={styles.documentPreviewContent}
                  activeOpacity={0.9}
                  onPress={() => {
                    // TODO: Add modal to view full image
                  }}
                >
                  <Image
                    source={{ uri: selectedDocuments[document.fieldName]?.uri }}
                    style={styles.documentImage}
                    resizeMode="contain"
                  />
                  {/* Hide remove button for auto-filled documents - user must use Replace button */}
                  {!selectedDocuments[document.fieldName]?.isAutoFilled && (
                    <TouchableOpacity
                      style={styles.removeDocumentButton}
                      onPress={() => onRemoveDocument(document.fieldName)}
                    >
                      <Ionicons name="close-circle" size={moderateScale(20)} color={theme.colors.semantic.error} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Status Information */}
                <View style={styles.statusContainer}>
                  {(() => {
                    const statusInfo = getDocumentStatusInfo(
                      getUploadState(document.fieldName),
                      new Date() // selectedAt timestamp - using current time as fallback
                    );

                    const docSize = selectedDocuments[document.fieldName]?.size;

                    return (
                      <>
                        <View style={styles.statusRow}>
                          <Ionicons
                            name={(statusInfo?.icon || 'checkmark-circle') as any}
                            size={moderateScale(16)}
                            color={statusInfo?.color || '#10B981'}
                          />
                          <Text style={[styles.statusLabel, { color: statusInfo?.color || '#10B981' }]}>
                            {statusInfo?.label || 'Ready'}
                          </Text>
                        </View>
                        {docSize && docSize > 0 && (
                          <Text style={styles.fileSize}>
                            {formatFileSize(docSize)}
                          </Text>
                        )}
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* Upload Button */}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => onDocumentPicker(document.fieldName)}
              disabled={getUploadState(document.fieldName)?.uploading}
            >
              <Ionicons 
                name={selectedDocuments[document.fieldName] ? "refresh" : "cloud-upload-outline"} 
                size={moderateScale(20)} 
                color="#2E86AB" 
              />
              <Text style={styles.uploadButtonText}>
                {selectedDocuments[document.fieldName] ? 'Replace' : 'Upload'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};
