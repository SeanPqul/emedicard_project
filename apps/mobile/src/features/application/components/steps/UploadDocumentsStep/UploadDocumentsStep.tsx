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
                  {document.name}
                  {document.required && <Text style={styles.requiredAsterisk}> *</Text>}
                </Text>
                <Text style={styles.documentDescription}>{document.description}</Text>
                <Text style={styles.documentFormats}>
                  Formats: {(document as any).formats ? (document as any).formats.join(', ').toUpperCase() : 'JPG, PNG, PDF'}
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
                <View style={styles.documentPreviewContent}>
                  <Image
                    source={{ uri: selectedDocuments[document.fieldName]?.uri }}
                    style={styles.documentImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeDocumentButton}
                    onPress={() => onRemoveDocument(document.fieldName)}
                  >
                    <Ionicons name="close-circle" size={moderateScale(20)} color={theme.colors.semantic.error} />
                  </TouchableOpacity>
                </View>

                {/* Status Information */}
                <View style={styles.statusContainer}>
                  {(() => {
                    const statusInfo = getDocumentStatusInfo(
                      getUploadState(document.fieldName),
                      new Date() // selectedAt timestamp - using current time as fallback
                    );

                    const docSize = selectedDocuments[document.fieldName]?.size;
                    console.log('📊 Display check:', {
                      fieldName: document.fieldName,
                      hasDoc: !!selectedDocuments[document.fieldName],
                      size: docSize,
                      fullDoc: selectedDocuments[document.fieldName]
                    });

                    return (
                      <>
                        <View style={styles.statusRow}>
                          <Ionicons
                            name={statusInfo.icon as any}
                            size={moderateScale(16)}
                            color={statusInfo.color}
                          />
                          <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                            {statusInfo.label}
                          </Text>
                        </View>
                        {docSize && (
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
