import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { getColor } from '../../../styles/theme';
import { DocumentRequirement } from '../../../types/domain/application';
import { SelectedDocuments } from '../../../types';
import { retryFailedUploads, hasFailedUploads } from '../../../utils/uploadRetry';

type ApplicationType = 'New' | 'Renew';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  queued: boolean;
}

interface UploadDocumentsStepProps {
  formData: ApplicationFormData;
  requirementsByJobCategory: DocumentRequirement[];
  selectedDocuments: SelectedDocuments;
  isLoading: boolean;
  getUploadState: (documentId: string) => UploadState;
  onDocumentPicker: (documentId: string) => void;
  onRemoveDocument: (documentId: string) => void;
  requirements?: any;
}

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
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!requirements) {
      Alert.alert('Error', 'Requirements not available for retry. Please refresh the page.');
      return;
    }

    setIsRetrying(true);
    try {
      const result = await retryFailedUploads(requirements);
      if (result.success) {
        Alert.alert('Success', 'All failed uploads have been retried successfully!');
      } else {
        Alert.alert('Partial Success', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to retry uploads. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };
  // Show loading if requirements are being fetched
  if (isLoading) {
    return (
      <View style={[styles.stepContent, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.stepHeading}>Loading Document Requirements...</Text>
        <Text style={styles.stepDescription}>Please wait while we fetch the required documents for your job category.</Text>
      </View>
    );
  }
  
  // Show message if no requirements found
  if (!isLoading && requirementsByJobCategory.length === 0) {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Upload Documents</Text>
        <Text style={styles.stepDescription}>No document requirements found for the selected job category. Please contact support.</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.stepContent}>
      <Text style={styles.stepHeading}>Upload Documents</Text>
      <Text style={styles.stepDescription}>
        Please upload clear and readable copies of all required medical documents
        to ensure proper processing of your {formData.applicationType?.toLowerCase() || 'health card'} application.
      </Text>
      
      {/* Retry Section */}
      {hasFailedUploads() && (
        <View style={styles.retrySection}>
          <Text style={styles.retryText}>Some documents failed to upload</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            disabled={isRetrying}
          >
            <Text style={styles.retryButtonText}>
              {isRetrying ? 'Retrying...' : 'Retry Failed Uploads'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Instructions */}
      <View style={styles.formGroup}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={getColor('primary.500')} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Document Requirements</Text>
            <Text style={styles.infoText}>⚠️ Note: Documents must be from accredited clinics and laboratories. Accepted formats: JPG, PNG, PDF</Text>
          </View>
        </View>
      </View>
      
      {/* Document List */}
      <View style={styles.formGroupWithMargin}>
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
                  <Ionicons name="checkmark-circle" size={24} color={getColor('semantic.success')} />
                ) : (
                  <Ionicons name="add-circle-outline" size={24} color={getColor('text.secondary')} />
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
                <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
                <Text style={styles.errorMessage}>
                  {getUploadState(document.fieldName).error}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => onDocumentPicker(document.fieldName)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Document Preview */}
            {selectedDocuments[document.fieldName] && !getUploadState(document.fieldName)?.uploading && (
              <View style={styles.documentPreview}>
                <Image
                  source={{ uri: selectedDocuments[document.fieldName]?.uri }}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeDocumentButton}
                  onPress={() => onRemoveDocument(document.fieldName)}
                >
                  <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                </TouchableOpacity>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.uploadButtonContainer}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => onDocumentPicker(document.fieldName)}
                disabled={getUploadState(document.fieldName)?.uploading}
              >
                <Ionicons 
                  name={selectedDocuments[document.fieldName] ? "refresh" : "cloud-upload-outline"} 
                  size={20} 
                  color={getColor('primary.500')} 
                />
                <Text style={styles.uploadButtonText}>
                  {selectedDocuments[document.fieldName] ? 'Replace' : 'Upload'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};