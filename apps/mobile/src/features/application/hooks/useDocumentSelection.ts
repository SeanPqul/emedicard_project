import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
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

// ✅ Centralized helper for extracting the best filename
const getFileName = async (file: any, documentType?: string): Promise<string> => {
  try {
    console.log('Debug - File object:', JSON.stringify({
      fileName: file.fileName,
      name: file.name,
      assetId: file.assetId,
      uri: file.uri,
      exif: file.exif ? 'Present' : 'Not present',
    }, null, 2));
    
    // 1. Check if fileName looks like a generated ID
    // - Numeric IDs (e.g., "1000007151.jpg") - typically 8-12 digit numbers
    // - UUID format (e.g., "ea574eaa-f332-44a7-85b7-99704c22b402.jpeg") - Android Expo returns these
    const isGeneratedFileName = file.fileName && (
      /^\d{8,12}\.(jpg|jpeg|png)$/i.test(file.fileName) ||                     // Numeric IDs
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png)$/i.test(file.fileName)  // UUIDs
    );
    
    if (isGeneratedFileName) {
      console.log('Detected generated fileName, will try to find real filename:', file.fileName);
    }
    
    // 2. Only use fileName if it's NOT a generated ID
    if (file.fileName && !isGeneratedFileName && file.fileName !== file.assetId) {
      console.log('Using provided fileName:', file.fileName);
      return file.fileName;
    }

    // 3. DocumentPicker provides a name property
    if (file.name && file.name !== file.assetId && !(/^\d{8,12}\.(jpg|jpeg|png)$/i.test(file.name))) {
      console.log('Using provided name:', file.name);
      return file.name;
    }

    // 4. If we have an assetId, try to get the actual filename from MediaLibrary
    if (file.assetId) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(file.assetId);
        console.log('MediaLibrary info:', JSON.stringify(info, null, 2));
        
        // Check if the filename from MediaLibrary is valid and not just the assetId
        if (info?.filename && info.filename !== file.assetId && info.filename.includes('.')) {
          console.log('Using MediaLibrary filename:', info.filename);
          return info.filename;
        }
      } catch (err) {
        console.warn('MediaLibrary.getAssetInfoAsync failed:', err);
      }
    }
    
    // 5. Try to get filename from EXIF data if available
    if (file.exif) {
      // Check ImageDescription first
      if (file.exif.ImageDescription && file.exif.ImageDescription.trim()) {
        console.log('Found filename in EXIF ImageDescription:', file.exif.ImageDescription);
        return file.exif.ImageDescription;
      }

      // Use DateTimeOriginal to create a meaningful filename
      if (file.exif.DateTimeOriginal) {
        try {
          // DateTimeOriginal format: "2025:10:03 05:45:06"
          const datetime = file.exif.DateTimeOriginal;
          const [datePart, timePart] = datetime.split(' ');
          const [year, month, day] = datePart.split(':');
          const [hour, minute, second] = timePart.split(':');

          // Include subsecond precision if available (e.g., "503" milliseconds)
          let subsec = '';
          if (file.exif.SubSecTimeOriginal && file.exif.SubSecTimeOriginal.trim()) {
            subsec = `_${file.exif.SubSecTimeOriginal}`;
          }

          // Get file extension from mimeType
          const extension = file.mimeType?.split('/')[1] || file.type?.split('/')[1] || 'jpg';

          const exifFilename = `IMG_${year}${month}${day}_${hour}${minute}${second}${subsec}.${extension}`;
          console.log('Created filename from EXIF datetime with subseconds:', exifFilename);
          return exifFilename;
        } catch (err) {
          console.warn('Failed to parse EXIF datetime:', err);
        }
      }
    }

    // 6. Try extracting from URI
    if (file.uri) {
      const uriParts = file.uri.split('/');
      const lastPart = decodeURIComponent(uriParts[uriParts.length - 1] || '');
      
      // Don't use cache-generated UUIDs as filenames
      const isUUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png)$/i.test(lastPart);
      
      if (!isUUID && lastPart && lastPart.includes('.') && !lastPart.includes('?')) {
        console.log('Using filename from URI:', lastPart);
        return lastPart;
      }
    }
    
    // 7. Don't use generated filenames as fallback
    // Generated UUIDs and numeric IDs are not user-friendly
    // Will generate a meaningful name in step 8
  } catch (err) {
    console.warn('Filename resolution error:', err);
  }

  // 8. Final fallback with timestamp - make it more descriptive
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;

  // Determine file extension from mimeType or default to jpg
  const extension = file.type?.split('/')[1] || file.mimeType?.split('/')[1] || 'jpg';

  // Include document type for better admin verification
  const prefix = documentType ? documentType.replace(/[^a-zA-Z0-9]/g, '_') : 'Document';
  const fallbackName = `${prefix}_${dateStr}_${timeStr}.${extension}`;
  console.log('Using fallback filename:', fallbackName);
  return fallbackName;
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
      console.error('Invalid file object:', file);
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

      // ✅ Get best filename with document type for admin verification
      const fileName = await getFileName(file, documentId);
      console.log('📝 Final filename:', fileName);

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

      // Update state
      const documentData = { ...file, name: fileName, fileName, size: fileSize };
      console.log('📦 Storing document with size:', {
        documentId,
        fileName,
        size: fileSize,
        formattedSize: `${(fileSize / 1024).toFixed(1)} KB`
      });

      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: documentData,
      }));

      formStorage.saveTempApplication(formData, {
        ...selectedDocuments,
        [documentId]: documentData,
      }, currentStep);

      showSuccess('Document Queued', `${fileName} has been queued for upload.`);
    } catch (error) {
      console.error('Document selection error:', error);
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
      allowsEditing: false,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled && result.assets.length > 0 && selectedDocumentId) {
      const pickedAsset = result.assets[0];
      // Generate descriptive filename with document type
      const generatedFilename = await getFileName(pickedAsset, selectedDocumentId);
      (pickedAsset as any).fileName = generatedFilename;
      console.log('Camera filename:', generatedFilename);
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
        allowsEditing: false,
        allowsMultipleSelection: false,
        quality: 0.8,
        exif: true, // Request EXIF data which might contain original filename
      });

      if (!result.canceled && result.assets.length > 0 && selectedDocumentId) {
        const pickedAsset = result.assets[0];
        console.log('Picked asset from gallery:', JSON.stringify(pickedAsset, null, 2));
        
        // Generate a meaningful filename from available metadata
        // Note: On Android, ImagePicker returns UUID filenames (not original gallery names)
        // We create descriptive names instead of searching MediaLibrary (slow & unreliable)
        if (pickedAsset && selectedDocumentId) {
          const generatedFilename = await getFileName(pickedAsset, selectedDocumentId);
          (pickedAsset as any).fileName = generatedFilename;
          console.log('Generated descriptive filename:', generatedFilename);
        }
        
        handleDocumentSelected(pickedAsset, selectedDocumentId);
      }
      setShowImagePicker(false);
    } catch (error) {
      console.error('Gallery picker error:', error);
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
      const generatedFilename = await getFileName(pickedFile, selectedDocumentId);
      (pickedFile as any).fileName = generatedFilename;
      console.log('Document filename:', generatedFilename);
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
            console.error('Remove error:', error);
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
