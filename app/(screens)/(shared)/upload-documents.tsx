import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { BaseScreenLayout } from '../../../src/layouts/BaseScreenLayout';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CustomButton } from '../../../src/components';
import { getColor, getTypography, getSpacing, getBorderRadius, getShadow } from '../../../src/styles/theme';

const { width } = Dimensions.get('window');

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  formats: string[];
  uploaded?: boolean;
  fileUrl?: string;
}

interface UploadProgress {
  documentId: string;
  progress: number;
  uploading: boolean;
}

export default function UploadDocumentsScreen() {
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, any>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  // Convex queries
  const userApplications = useQuery(api.forms.getUserApplications);
  const uploadDocument = useMutation(api.forms.uploadDocument);

  // Document requirements based on eMediCard documentation
  // Reference: eMediCard project documentation - Document submission requirements
  const documentRequirements: DocumentRequirement[] = [
    {
      id: 'chest_xray',
      name: 'Chest X-ray',
      description: 'Latest chest X-ray from DOH-accredited clinic',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'cbc',
      name: 'Complete Blood Count (CBC)',
      description: 'CBC laboratory results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'urinalysis',
      name: 'Urinalysis',
      description: 'Urinalysis laboratory results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'fecalysis',
      name: 'Fecalysis',
      description: 'Fecal examination results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'drug_test',
      name: 'Drug Test',
      description: 'Drug screening test results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'neuropsychiatric_test',
      name: 'Neuropsychiatric Test',
      description: 'Neuropsychiatric evaluation results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'hepatitis_b_test',
      name: 'Hepatitis B Antibody Test',
      description: 'Hepatitis B antibody test results',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'valid_id',
      name: 'Valid ID',
      description: 'Any valid identification card (front and back)',
      required: true,
      formats: ['jpg', 'jpeg', 'png'],
    },
    {
      id: 'ctc',
      name: 'Community Tax Certificate',
      description: 'Current Community Tax Certificate (Cedula)',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'health_card_receipt',
      name: 'Health Card Receipt (OR)',
      description: 'Official Receipt for health card payment',
      required: true,
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
    {
      id: 'passport_photo',
      name: '1x1 Picture',
      description: '1x1 colored photo with white background',
      required: true,
      formats: ['jpg', 'jpeg', 'png'],
    },
  ];

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
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
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
    setSelectedDocuments(prev => ({
      ...prev,
      [documentId]: file,
    }));

    // Start upload
    setUploadProgress(prev => ({
      ...prev,
      [documentId]: { documentId, progress: 0, uploading: true },
    }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentId];
          if (current && current.progress < 90) {
            return {
              ...prev,
              [documentId]: { ...current, progress: current.progress + 10 },
            };
          }
          return prev;
        });
      }, 200);

      // Upload to Convex (placeholder - implement actual upload logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      
      setUploadProgress(prev => ({
        ...prev,
        [documentId]: { documentId, progress: 100, uploading: false },
      }));

      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({
        ...prev,
        [documentId]: { documentId, progress: 0, uploading: false },
      }));
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setSelectedDocuments(prev => {
              const newDocs = { ...prev };
              delete newDocs[documentId];
              return newDocs;
            });
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[documentId];
              return newProgress;
            });
          }
        },
      ]
    );
  };

  const handleSubmitDocuments = async () => {
    const requiredDocs = documentRequirements.filter(doc => doc.required);
    const uploadedRequiredDocs = requiredDocs.filter(doc => selectedDocuments[doc.id]);

    if (uploadedRequiredDocs.length < requiredDocs.length) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }

    try {
      // Submit documents to Convex
      Alert.alert('Success', 'Documents submitted successfully!', [
        { text: 'OK', onPress: () => router.back() }
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={getColor('textPrimary')} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Documents</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={24} color={getColor('interactive')} />
          <View style={styles.instructionsText}>
            <Text style={styles.instructionsTitle}>Document Requirements</Text>
            <Text style={styles.instructionsSubtitle}>
              Please upload clear and readable copies of all required medical documents
              to ensure proper processing of your registration or renewal.
            </Text>
            <Text style={styles.instructionsNote}>
              ⚠️ Note: Documents must be from accredited clinics and laboratories. 
              Accepted formats: JPG, PNG, PDF
            </Text>
          </View>
        </View>

        {/* Document List */}
        <View style={styles.documentsContainer}>
          {documentRequirements.map((document) => (
            <View key={document.id} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName}>
                    {document.name}
                    {document.required && <Text style={styles.requiredMark}> *</Text>}
                  </Text>
                  <Text style={styles.documentDescription}>{document.description}</Text>
                  <Text style={styles.documentFormats}>
                    Formats: {document.formats.join(', ').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.documentStatus}>
                  {selectedDocuments[document.id] ? (
                    <Ionicons name="checkmark-circle" size={24} color={getColor('success')} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={getColor('textSecondary')} />
                  )}
                </View>
              </View>

              {/* Upload Progress */}
              {uploadProgress[document.id]?.uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${uploadProgress[document.id].progress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {uploadProgress[document.id].progress}%
                  </Text>
                </View>
              )}

              {/* Document Preview */}
              {selectedDocuments[document.id] && !uploadProgress[document.id]?.uploading && (
                <View style={styles.documentPreview}>
                  <Image
                    source={{ uri: selectedDocuments[document.id].uri }}
                    style={styles.previewImage}
                  />
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveDocument(document.id)}
                  >
                    <Ionicons name="close-circle" size={20} color={getColor('error')} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.documentActions}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleDocumentPicker(document.id)}
                  disabled={uploadProgress[document.id]?.uploading}
                >
                  <Ionicons 
                    name={selectedDocuments[document.id] ? "refresh" : "cloud-upload-outline"} 
                    size={20} 
                    color={getColor('interactive')} 
                  />
                  <Text style={styles.uploadButtonText}>
                    {selectedDocuments[document.id] ? 'Replace' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <CustomButton
            title="Submit Documents"
            onPress={handleSubmitDocuments}
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
              <Ionicons name="camera" size={24} color={getColor('interactive')} />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickFromGallery}>
              <Ionicons name="images" size={24} color={getColor('interactive')} />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickDocument}>
              <Ionicons name="document" size={24} color={getColor('interactive')} />
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
    backgroundColor: getColor('backgroundSecondary'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('backgroundPrimary'),
    borderBottomWidth: 1,
    borderBottomColor: getColor('borderDefault'),
  },
  headerTitle: {
    ...getTypography('headingSmall'),
    color: getColor('textPrimary'),
  },
  scrollView: {
    flex: 1,
  },
  instructionsContainer: {
    flexDirection: 'row',
    padding: getSpacing('lg'),
    backgroundColor: getColor('backgroundInfo'),
    marginHorizontal: getSpacing('lg'),
    marginTop: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
  },
  instructionsText: {
    flex: 1,
    marginLeft: getSpacing('sm'),
  },
  instructionsTitle: {
    ...getTypography('bodyLarge'),
    fontWeight: '600',
    color: getColor('interactive'),
    marginBottom: getSpacing('xs'),
  },
  instructionsSubtitle: {
    ...getTypography('bodyMedium'),
    color: getColor('interactive'),
    lineHeight: 20,
  },
  instructionsNote: {
    ...getTypography('bodySmall'),
    color: getColor('interactive'),
    lineHeight: 16,
    marginTop: getSpacing('sm'),
    fontStyle: 'italic',
  },
  documentsContainer: {
    paddingHorizontal: getSpacing('lg'),
    paddingTop: getSpacing('lg'),
  },
  documentCard: {
    backgroundColor: getColor('backgroundPrimary'),
    borderRadius: getBorderRadius('lg'),
    padding: getSpacing('md'),
    marginBottom: getSpacing('md'),
    ...getShadow('card'),
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
    ...getTypography('bodyLarge'),
    fontWeight: '600',
    color: getColor('textPrimary'),
    marginBottom: getSpacing('xs'),
  },
  requiredMark: {
    color: getColor('error'),
  },
  documentDescription: {
    ...getTypography('bodyMedium'),
    color: getColor('textSecondary'),
    marginBottom: getSpacing('xs'),
  },
  documentFormats: {
    ...getTypography('bodySmall'),
    color: getColor('textSecondary'),
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
    backgroundColor: getColor('borderDefault'),
    borderRadius: getBorderRadius('xs'),
    marginRight: getSpacing('sm'),
  },
  progressFill: {
    height: '100%',
    backgroundColor: getColor('interactive'),
    borderRadius: getBorderRadius('xs'),
  },
  progressText: {
    ...getTypography('bodySmall'),
    color: getColor('textSecondary'),
    minWidth: 35,
  },
  documentPreview: {
    position: 'relative',
    marginBottom: getSpacing('sm'),
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: getBorderRadius('sm'),
    backgroundColor: getColor('backgroundSecondary'),
  },
  removeButton: {
    position: 'absolute',
    top: getSpacing('sm'),
    right: getSpacing('sm'),
    backgroundColor: getColor('backgroundPrimary'),
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
    borderColor: getColor('interactive'),
    backgroundColor: getColor('backgroundPrimary'),
  },
  uploadButtonText: {
    ...getTypography('bodyMedium'),
    color: getColor('interactive'),
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
    backgroundColor: getColor('backgroundPrimary'),
    borderTopLeftRadius: getBorderRadius('xl'),
    borderTopRightRadius: getBorderRadius('xl'),
    padding: getSpacing('lg'),
  },
  modalTitle: {
    ...getTypography('headingSmall'),
    color: getColor('textPrimary'),
    textAlign: 'center',
    marginBottom: getSpacing('lg'),
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing('md'),
    paddingHorizontal: getSpacing('lg'),
    borderRadius: getBorderRadius('lg'),
    backgroundColor: getColor('backgroundSecondary'),
    marginBottom: getSpacing('sm'),
  },
  modalOptionText: {
    ...getTypography('bodyLarge'),
    color: getColor('textPrimary'),
    marginLeft: getSpacing('md'),
  },
  modalCancelButton: {
    paddingVertical: getSpacing('md'),
    alignItems: 'center',
  },
  modalCancelText: {
    ...getTypography('bodyLarge'),
    color: getColor('error'),
    fontWeight: '600',
  },
});
