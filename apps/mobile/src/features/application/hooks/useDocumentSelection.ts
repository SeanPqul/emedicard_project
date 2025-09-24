import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentFile, SelectedDocuments } from '@shared/types';
import { formStorage } from '../services/formStorage';

interface UseDocumentSelectionProps {
  selectedDocuments: SelectedDocuments;
  setSelectedDocuments: Dispatch<SetStateAction<SelectedDocuments>>;
  formData: any;
  currentStep: number;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message?: string) => void;
}

export const useDocumentSelection = ({
  selectedDocuments,
  setSelectedDocuments,
  formData,
  currentStep,
  showSuccess,
  showError,
}: UseDocumentSelectionProps) => {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleDocumentPicker = useCallback(async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowImagePicker(true);
  }, []);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  }, [selectedDocumentId]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  }, [selectedDocumentId]);

  // Renamed from pickDocument to pickDocFile to fix naming conflict
  const pickDocFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && selectedDocumentId) {
      handleDocumentSelected(result.assets[0], selectedDocumentId);
    }
    setShowImagePicker(false);
  }, [selectedDocumentId]);

  const handleDocumentSelected = useCallback(async (file: any, documentId: string) => {
    if (!file || !file.uri) {
      console.error('Invalid file object:', file);
      Alert.alert('Error', 'Invalid file selected. Please try again.');
      return;
    }

    try {
      // Fix file type detection
      let fileType = file.type || file.mimeType;
      
      // Handle cases where type is just 'image' without subtype
      if (!fileType || fileType === 'image' || !fileType.includes('/')) {
        // Try to infer from file extension or URI
        const uri = file.uri || '';
        if (uri.toLowerCase().includes('.png')) {
          fileType = 'image/png';
        } else if (uri.toLowerCase().includes('.pdf')) {
          fileType = 'application/pdf';
        } else {
          // Default to JPEG for images
          fileType = 'image/jpeg';
        }
      }
      
      const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || 
                           fileType.split('/')[1] || 'jpg';
      
      const fileName = file.fileName || file.name || `document_${documentId}.${fileExtension}`;
      
      // Validate file size (max 10MB)
      const fileSize = file.fileSize || file.size || 0;
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        Alert.alert(
          'File Too Large',
          `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit. Please choose a smaller file.`
        );
        return;
      }
      
      // Validate file format
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(fileType)) {
        Alert.alert(
          'Invalid File Format',
          'Only JPG, PNG, and PDF files are allowed. Please select a different file.'
        );
        return;
      }
      
      // Create document file for deferred queue
      const documentFile: DocumentFile = {
        uri: file.uri,
        name: fileName,
        type: fileType,
        size: fileSize,
      };

      // Add to deferred operation queue (NOT uploaded immediately)
      const success = formStorage.addDocumentToQueue(documentId, documentFile);
      if (!success) {
        Alert.alert('Error', 'Failed to add document to upload queue. Please try again.');
        return;
      }

      // Update selected documents for UI
      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: file,
      }));

      // Save current form state with updated documents
      formStorage.saveTempApplication(formData, {
        ...selectedDocuments,
        [documentId]: file,
      }, currentStep);

      // Show success feedback
      showSuccess(
        'Document Queued',
        `${fileName} has been queued for upload when you submit the application.`
      );
      
    } catch (error) {
      console.error('Document selection error:', error);
      showError('Selection Failed', error instanceof Error ? error.message : 'Failed to select document. Please try again.');
    }
  }, [selectedDocuments, setSelectedDocuments, formData, currentStep, showSuccess, showError]);

  const handleRemoveDocument = useCallback(async (documentId: string) => {
    // Check if document is currently being uploaded
    const operations = formStorage.getUploadOperations();
    const operation = operations[documentId];
    
    if (operation && operation.status === 'uploading') {
      Alert.alert(
        'Cannot Remove',
        'This document is currently being uploaded. Please wait for the upload to complete before removing it.'
      );
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
          onPress: () => {
            try {
              // Remove from deferred operation queue
              const success = formStorage.removeDocumentFromQueue(documentId);
              if (!success) {
                showError('Remove Failed', 'Failed to remove document from upload queue.');
                return;
              }
              
              // Remove from local state
              const updatedDocuments = { ...selectedDocuments };
              delete updatedDocuments[documentId];
              setSelectedDocuments(updatedDocuments);
              
              // Update form state
              formStorage.saveTempApplication(formData, updatedDocuments, currentStep);
              
              // Show success feedback
              showSuccess('Document Removed', 'Document has been removed from the upload queue.');
              
            } catch (error) {
              console.error('Remove error:', error);
              showError('Remove Failed', 'Failed to remove document. Please try again.');
            }
          }
        },
      ]
    );
  }, [selectedDocuments, setSelectedDocuments, formData, currentStep, showSuccess, showError]);

  return {
    showImagePicker,
    setShowImagePicker,
    selectedDocumentId,
    handleDocumentPicker,
    pickFromCamera,
    pickFromGallery,
    pickDocFile,
    handleRemoveDocument,
  };
};
