import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { CustomButton } from '../../../src/components';
import { DragDropUpload } from '../../../src/components/DragDropUpload';
import { getColor, getTypography, getSpacing, getBorderRadius, getShadow } from '../../../src/styles/theme';
import { useDocumentUpload } from '../../../src/hooks/useDocumentUpload';
import { cacheDocument, removeCachedDocument, clearFormCache } from '../../../src/utils/documentCache';

const { width } = Dimensions.get('window');

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  formats: string[];
  uploaded?: boolean;
  fileUrl?: string;
  fieldName: string;
}

interface UploadProgress {
  documentId: string;
  progress: number;
  uploading: boolean;
}

export default function UploadDocumentsScreen() {
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Id<'_storage'>>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [canSkip, setCanSkip] = useState(false);

  const params = useLocalSearchParams();
  const formId = params.formId as string;
  const applicationType = params.applicationType as string;
  const jobCategory = params.jobCategory as string;
  const position = params.position as string;
  const organization = params.organization as string;

  const formData = useQuery(api.forms.getFormById, formId ? { formId: formId as any } : 'skip');
  const requirementsByJobCategory = useQuery(api.documentRequirements.getRequirementsByJobCategory, 
    formData?.jobCategory ? { jobCategoryId: formData.jobCategory as any } : 'skip'
  );

  const {
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
    cacheFileForUpload,
    batchUploadCachedDocuments,
  } = useDocumentUpload(formId as Id<'forms'>);

  useEffect(() => {
    if (applicationType === 'New' || applicationType === 'Renew') {
      setCanSkip(false);
    }
  }, [applicationType]);

  const documentRequirements = requirementsByJobCategory?.requirements || [];

  const cacheDocumentBeforeUpload = async (file: any, documentId: string) => {
    try {
      await cacheFileForUpload(file, documentId);
      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: file,
      }));
      Alert.alert('Success', 'Document cached successfully!');
    } catch (error) {
      console.error('Cache error:', error);
      Alert.alert('Error', 'Failed to cache document. Please try again.');
    }
  };

  const handleDocumentPicker = async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowImagePicker(true);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && selectedDocumentId) {
      cacheDocumentBeforeUpload(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

  const handleFileSelection = (files: any[]) => {
    if (!selectedDocumentId || files.length === 0) return;
    handleDocumentSelected(files[0], selectedDocumentId);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  };

  const handleDocumentSelected = async (file: any, documentId: string) => {
    try {
      await cacheDocumentBeforeUpload(file, documentId);
    } catch (error) {
      console.error('Document selection error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to process document. Please try again.');
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const storageId = uploadedFiles[documentId];
    if (!storageId) {
      setSelectedDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        return newDocs;
      });
      return;
    }

    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFile(documentId, storageId);
              setSelectedDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[documentId];
                return newDocs;
              });
              setUploadedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
              });
              Alert.alert('Success', 'Document removed successfully!');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove document. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleSubmitDocuments = async () => {
    const requiredDocs = documentRequirements.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => selectedDocuments[doc.fieldName]);

    if (uploadedRequiredDocs.length < requiredDocs.length) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    const uploadingDocs = documentRequirements.filter(doc => getUploadState(doc.fieldName)?.uploading);
    if (uploadingDocs.length > 0) {
      Alert.alert('Upload in Progress', 'Please wait for all document uploads to complete before submitting.');
      return;
    }

    const errorDocs = documentRequirements.filter(doc => { 
      const state = getUploadState(doc.fieldName);
      return state.error || (state.progress < 100 && !state.uploading);
    });
    
    if (errorDocs.length > 0) {
      Alert.alert('Upload Errors', 'Please fix upload errors before submitting. Use the retry button to try again.');
      return;
    }

    try {
      const { successful, failed } = await batchUploadCachedDocuments();

      if (failed.length > 0) {
        Alert.alert('Submission Error', `Failed to upload ${failed.length} documents. Please try again.`);
        return;
      }
      
      clearFormCache(formId);

      Alert.alert('Success', 'Documents submitted successfully! Your application is now under review.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/application') }
      ]);
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit documents. Please try again.');
    }
  };

  return (
    <BaseScreenLayout>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => canSkip ? router.back() : Alert.alert(
            'Document Upload Required',
            'Please upload all required documents to complete your application.',
            [{ text: 'OK' }]
          )}
        >
          <Ionicons name="arrow-back" size={24} color={getColor('text.primary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Application Context */}
        {(applicationType && position && organization) && (
          <View style={styles.contextContainer}>
            <Text style={styles.contextTitle}>Application Details</Text>
            <View style={styles.contextDetails}>
              <Text style={styles.contextLabel}>Type: <Text style={styles.contextValue}>{applicationType} Application</Text></Text>
              <Text style={styles.contextLabel}>Position: <Text style={styles.contextValue}>{position}</Text></Text>
              <Text style={styles.contextLabel}>Organization: <Text style={styles.contextValue}>{organization}</Text></Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={24} color={getColor('primary.500')} />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Document Requirements</Text>
            <Text style={styles.instructionsSubtitle}>
              Please upload clear and readable copies of all required medical documents
              to ensure proper processing of your {applicationType?.toLowerCase()} application.
            </Text>
            <Text style={styles.instructionsNote}>
              ⚠️ Note: Documents must be from accredited clinics and laboratories. 
              Accepted formats: JPG, PNG, PDF
            </Text>
          </View>
        </View>

        <View style={styles.documentUploader}>
          <DragDropUpload
            onFilesSelected={handleFileSelection}
            title="Drag files here or tap to upload"
            subtitle="Supports JPG, PNG, and PDF"
            acceptedFormats={['jpg', 'png', 'pdf']}
            maxFiles={1}
            disabled={!selectedDocumentId}
            loading={selectedDocumentId ? getUploadState(selectedDocumentId)?.uploading : false}
          />
        </View>

        {/* Document List */}
        <View style={styles.documentsContainer}>
          {documentRequirements.map((doc) => (
            <View key={doc.fieldName} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {doc.name}
                    {doc.required && <Text style={styles.requiredMark}> *</Text>}
                  </Text>
                  <Text style={styles.documentDescription}>{doc.description}</Text>
                  <Text style={styles.documentFormats}>
                    Accepted formats: JPG, PNG, PDF
                  </Text>
                </View>
              </View>

              {/* Document Actions */}
              <View style={styles.documentActions}>
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPicker(doc.fieldName)}
                >
                  <Ionicons name="cloud-upload" size={20} color={getColor('primary.500')} />
                  <Text style={styles.uploadButtonText}>
                    {selectedDocuments[doc.fieldName] ? 'Replace Document' : 'Upload Document'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Show selected document preview */}
              {selectedDocuments[doc.fieldName] && (
                <View style={styles.documentPreview}>
                  <Text style={styles.documentName}>Selected: {selectedDocuments[doc.fieldName].name}</Text>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveDocument(doc.fieldName)}
                  >
                    <Ionicons name="trash" size={16} color={getColor('semantic.error')} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <CustomButton
            title="Submit Documents"
            onPress={() => batchUploadCachedDocuments().then(handleSubmitDocuments).catch(error => {
              console.error('Batch upload error:', error);
              Alert.alert('Error', 'Batch upload failed. Please try again.');
            })}
            disabled={Object.keys(selectedDocuments).length === 0}
          />
        </View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Document Source</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickFromCamera}>
              <Ionicons name="camera" size={24} color={getColor('primary.500')} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickFromGallery}>
              <Ionicons name="images" size={24} color={getColor('primary.500')} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickDocument}>
              <Ionicons name="document" size={24} color={getColor('primary.500')} />
              <Text style={styles.modalOptionText}>Select File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </BaseScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColor('background.secondary'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.primary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('border.light'),
  },
  headerTitle: {
    ...getTypography('h2'),
    color: getColor('text.primary'),
  },
  scrollView: {
    flex: 1,
  },
  contextContainer: {
    backgroundColor: getColor('background.primary'),
    marginHorizontal: getSpacing('lg'),
    marginTop: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('lg'),
    ...getShadow('medium'),
  },
  contextTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('md'),
  },
  contextDetails: {
    gap: getSpacing('sm'),
  },
  contextLabel: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
  },
  contextValue: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  instructionsContainer: {
    flexDirection: 'row',
    padding: getSpacing('lg'),
    backgroundColor: getColor('semanticUI.infoCard'),
    marginHorizontal: getSpacing('lg'),
    marginTop: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
  },
  instructionsText: {
    flex: 1,
    marginLeft: getSpacing('sm'),
  },
  instructionsTitle: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('primary.500'),
    marginBottom: getSpacing('xs'),
  },
  instructionsSubtitle: {
    ...getTypography('body'),
    color: getColor('primary.500'),
    lineHeight: 20,
  },
  instructionsNote: {
    ...getTypography('bodySmall'),
    color: getColor('primary.500'),
    lineHeight: 16,
    marginTop: getSpacing('sm'),
    fontStyle: 'italic',
  },
  documentUploader: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
  },
  documentsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
  },
  documentCard: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    ...getShadow('medium'),
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getSpacing('sm'),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...getTypography('body'),
    fontWeight: '600',
    color: getColor('text.primary'),
    marginBottom: getSpacing('xs'),
  },
  requiredMark: {
    color: getColor('semantic.error'),
  },
  documentDescription: {
    ...getTypography('body'),
    color: getColor('text.secondary'),
    marginBottom: getSpacing('xs'),
  },
  documentFormats: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontStyle: 'italic',
  },
  documentStatus: {
    marginLeft: getSpacing('sm'),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing('sm'),
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: getColor('border.light'),
    borderRadius: getBorderRadius('xs'),
    marginRight: getSpacing('sm'),
  },
  progressFill: {
    height: '100%',
    backgroundColor: getColor('primary.500'),
    borderRadius: getBorderRadius('xs'),
  },
  progressText: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    minWidth: 35,
  },
  documentPreview: {
    position: 'relative',
    marginBottom: getSpacing('sm'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getSpacing('sm'),
    backgroundColor: getColor('background.secondary'),
    borderRadius: getBorderRadius('sm'),
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('background.secondary'),
  },
  removeButton: {
    backgroundColor: getColor('background.primary'),
    borderRadius: getBorderRadius('sm'),
    padding: getSpacing('xs'),
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    borderWidth: 1,
    borderColor: getColor('primary.500'),
    backgroundColor: getColor('background.primary'),
  },
  uploadButtonText: {
    ...getTypography('body'),
    color: getColor('primary.500'),
    fontWeight: '600',
    marginLeft: getSpacing('sm'),
  },
  submitContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('lg'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: getColor('background.primary'),
    borderTopLeftRadius: getBorderRadius('xl'),
    borderTopRightRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
  },
  modalTitle: {
    ...getTypography('h3'),
    color: getColor('text.primary'),
    textAlign: 'center',
    marginBottom: getSpacing('lg'),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    backgroundColor: getColor('background.secondary'),
    marginBottom: getSpacing('sm'),
  },
  modalOptionText: {
    ...getTypography('body'),
    color: getColor('text.primary'),
    marginLeft: getSpacing('md'),
  },
  modalCancelButton: {
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
  },
  modalCancelText: {
    ...getTypography('body'),
    color: getColor('semantic.error'),
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: getColor('semanticUI.dangerCard'),
    padding: getSpacing('sm'),
    borderRadius: getBorderRadius('sm'),
    marginBottom: getSpacing('sm'),
  },
  errorText: {
    ...getTypography('bodySmall'),
    color: getColor('semantic.error'),
    flex: 1,
    marginLeft: getSpacing('xs'),
  },
  retryButton: {
    paddingHorizontal: getSpacing('sm'),
    paddingVertical: getSpacing('xs'),
    borderRadius: getBorderRadius('xs'),
    backgroundColor: getColor('semantic.error'),
    marginLeft: getSpacing('sm'),
  },
  retryButtonText: {
    ...getTypography('bodySmall'),
    color: getColor('background.primary'),
    fontWeight: '600',
  },
});
