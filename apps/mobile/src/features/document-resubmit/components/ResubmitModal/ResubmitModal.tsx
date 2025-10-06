import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ResubmitModalProps } from './ResubmitModal.types';
import { styles } from './ResubmitModal.styles';
import { moderateScale } from '@shared/utils/responsive';
import { useResubmitDocument } from '../../hooks';
import { useDocumentUpload } from '@features/upload/hooks/useDocumentUpload';

export const ResubmitModal: React.FC<ResubmitModalProps> = ({
  visible,
  onClose,
  applicationId,
  documentTypeId,
  fieldIdentifier,
  documentName,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { resubmitDocument } = useResubmitDocument();
  const { uploadFile } = useDocumentUpload(applicationId);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0] || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a document to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert expo-document-picker file format to match uploadFile expectations
      // Ensure we have a proper mime type for both images and PDFs
      const mimeType = selectedFile.mimeType || 
        (selectedFile.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      
      const fileToUpload = {
        ...selectedFile,
        type: mimeType, // Map mimeType to type for validation
        uri: selectedFile.uri,
      };
      
      // Upload file to storage
      const uploadResult = await uploadFile(
        fileToUpload,
        fieldIdentifier // Use fieldIdentifier as the fieldName for backend lookup
      );
      const { storageId } = uploadResult;

      // Submit document resubmission
      const result = await resubmitDocument({
        applicationId,
        documentTypeId,
        storageId,
        fileName: selectedFile.name || 'document',
        fileType: mimeType,
        fileSize: selectedFile.size || 0,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Document resubmitted successfully. It will be reviewed shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                handleClose();
                onSuccess?.();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to resubmit document');
      }
    } catch (error) {
      console.error('Error resubmitting document:', error);
      Alert.alert('Error', 'Failed to resubmit document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resubmit Document</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isUploading}
            >
              <Ionicons
                name="close"
                size={moderateScale(24)}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {!isUploading ? (
            <>
              <View style={styles.documentInfo}>
                <Text style={styles.documentLabel}>Document Type</Text>
                <Text style={styles.documentName}>{documentName}</Text>
              </View>

              <Text style={styles.instructionText}>
                Please upload a clear, readable copy of your document. Make sure all
                text is visible and the document is properly oriented.
              </Text>

              <View style={styles.uploadSection}>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    selectedFile && styles.uploadButtonActive,
                  ]}
                  onPress={handleSelectFile}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={moderateScale(32)}
                    color="#3B82F6"
                    style={styles.uploadIcon}
                  />
                  <Text style={styles.uploadButtonText}>
                    {selectedFile ? 'Change File' : 'Select File to Upload'}
                  </Text>
                </TouchableOpacity>

                {selectedFile && (
                  <View style={styles.selectedFile}>
                    <Ionicons
                      name="document"
                      size={moderateScale(24)}
                      color="#10B981"
                    />
                    <Text style={styles.selectedFileText} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={handleRemoveFile}
                    >
                      <Ionicons
                        name="close-circle"
                        size={moderateScale(24)}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    !selectedFile && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!selectedFile}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>Resubmit</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Uploading document...</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.loadingText}>{Math.round(uploadProgress)}%</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
