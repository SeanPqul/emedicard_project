import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library'; // Still needed for permissions
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

/**
 * Extracts filename from file picker results according to Expo documentation.
 * 
 * Reference: https://docs.expo.dev/versions/latest/sdk/imagepicker/
 * - ImagePicker returns `fileName` (UUIDs on Android, actual names on iOS)
 * - DocumentPicker returns `name` for documents
 * 
 * @param file - The file object from ImagePicker or DocumentPicker
 * @param documentType - Optional document type for fallback naming
 * @returns The filename to use for upload
 */
const getFileName = (file: any, documentType?: string): string => {
  // 1. DocumentPicker provides `name` - always use it
  if (file.name) {
    return file.name;
  }

  // 2. ImagePicker provides `fileName` - use it directly (includes Android UUIDs)
  if (file.fileName) {
    return file.fileName;
  }

  // 3. Extract from URI as fallback
  if (file.uri) {
    const uriParts = file.uri.split('/');
    const lastPart = decodeURIComponent(uriParts[uriParts.length - 1] || '');
    if (lastPart && lastPart.includes('.')) {
      // Remove query parameters if present
      const cleanName = lastPart.split('?')[0];
      if (cleanName) {
        return cleanName;
      }
    }
  }

  // 4. Final fallback: generate descriptive filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const extension = file.type?.split('/')[1] || file.mimeType?.split('/')[1] || 'jpg';
  const prefix = documentType?.replace(/[^a-zA-Z0-9]/g, '_') || 'Document';
  
  return `${prefix}_${timestamp}.${extension}`;
};

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

  const handleDocumentSelected = useCallback(async (file: any, documentId: string) => {
    if (!file?.uri) {
      Alert.alert('Error', 'Invalid file selected. Please try again.');
      return;
    }

    try {
      // Detect type
      let fileType = file.type || file.mimeType;
      if (!fileType || fileType === 'image' || !fileType.includes('/')) {
        if (file.uri.toLowerCase().includes('.png')) fileType = 'image/png';
        else if (file.uri.toLowerCase().includes('.pdf')) fileType = 'application/pdf';
        else fileType = 'image/jpeg';
      }

      // Get filename from picker result
      const fileName = getFileName(file, documentId);

      // Validate file size
      const fileSize = file.fileSize || file.size || 0;
      const maxSize = 10 * 1024 * 1024;
      if (fileSize > maxSize) {
        Alert.alert(
          'File Too Large',
          `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds the 10MB limit.`
        );
        return;
      }

      // Validate type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(fileType)) {
        Alert.alert(
          'Invalid File Format',
          'Only JPG, PNG, and PDF files are allowed.'
        );
        return;
      }

      // Build document object
      const documentFile: DocumentFile = {
        uri: file.uri,
        name: fileName,
        type: fileType,
        size: fileSize,
      };

      // Add to storage
      const success = formStorage.addDocumentToQueue(documentId, documentFile);
      if (!success) {
        Alert.alert('Error', 'Failed to add document to upload queue.');
        return;
      }

      // Update state - only store necessary properties
      const documentData = {
        uri: file.uri,
        name: fileName,
        fileName: fileName,
        type: fileType,
        size: fileSize,
        mimeType: fileType,
        width: file.width,
        height: file.height,
      };

      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: documentData,
      }));

      formStorage.saveTempApplication(formData, {
        ...selectedDocuments,
        [documentId]: documentData,
      }, currentStep);

      showSuccess('Document Queued', 'Your document has been queued for upload.');
    } catch (error) {
      showError('Selection Failed', error instanceof Error ? error.message : 'Failed to select document.');
    }
  }, [selectedDocuments, setSelectedDocuments, formData, currentStep, showSuccess, showError]);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,  // Enable crop for better document framing
      quality: 0.95,        // 95% quality - readable text with reasonable file size
      exif: true,
      aspect: [4, 3],       // Guide users to document-friendly aspect ratio
    });

    if (!result.canceled && result.assets.length > 0 && selectedDocumentId) {
      const pickedAsset = result.assets[0];
      const fileName = getFileName(pickedAsset, selectedDocumentId);
      (pickedAsset as any).fileName = fileName;
      handleDocumentSelected(pickedAsset, selectedDocumentId);
    }
    setShowImagePicker(false);
  }, [selectedDocumentId, handleDocumentSelected]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery permission is required to select photos');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,   // Enable crop for better document framing
        allowsMultipleSelection: false,
        quality: 0.95,         // 95% quality - readable text with reasonable file size
        exif: true,
      });

      if (!result.canceled && result.assets.length > 0 && selectedDocumentId) {
        const pickedAsset = result.assets[0];
        const fileName = getFileName(pickedAsset, selectedDocumentId);
        (pickedAsset as any).fileName = fileName;
        handleDocumentSelected(pickedAsset, selectedDocumentId);
      }
      setShowImagePicker(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setShowImagePicker(false);
    }
  }, [selectedDocumentId, handleDocumentSelected]);

  const pickDocFile = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
      const pickedFile = result.assets[0];
      const fileName = getFileName(pickedFile, selectedDocumentId);
      (pickedFile as any).fileName = fileName;
      handleDocumentSelected(pickedFile, selectedDocumentId);
    }
    setShowImagePicker(false);
  }, [selectedDocumentId, handleDocumentSelected]);

  const handleRemoveDocument = useCallback(async (documentId: string) => {
    const operations = formStorage.getUploadOperations();
    const operation = operations[documentId];

    if (operation?.status === 'uploading') {
      Alert.alert('Cannot Remove', 'This document is currently being uploaded.');
      return;
    }

    Alert.alert('Remove Document', 'Are you sure you want to remove this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          try {
            const success = formStorage.removeDocumentFromQueue(documentId);
            if (!success) {
              showError('Remove Failed', 'Failed to remove document from queue.');
              return;
            }

            const updatedDocuments = { ...selectedDocuments };
            delete updatedDocuments[documentId];
            setSelectedDocuments(updatedDocuments);

            formStorage.saveTempApplication(formData, updatedDocuments, currentStep);
            showSuccess('Document Removed', 'Document removed successfully.');
          } catch (error) {
            showError('Remove Failed', 'Failed to remove document.');
          }
        },
      },
    ]);
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
