import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { CustomButton } from '@shared/components';
import { useStorage } from '@shared/hooks/useStorage';
import { useUsers } from '@features/profile/hooks/useUsers';
import { styles } from './UploadDocumentsScreen.styles';

// File validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
};

export function UploadDocumentsScreen() {
  const router = useRouter();
  const { mutations: { generateUploadUrl } } = useStorage();
  const { data: { currentUser }, mutations: { updateUser } } = useUsers();

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  const isRejected = currentUser?.registrationStatus === 'rejected';

  /**
   * Validates the selected file
   * @returns Object with isValid boolean and errorMessage string
   */
  const validateFile = (pickedFile: DocumentPicker.DocumentPickerAsset): { isValid: boolean; errorMessage: string | null } => {
    // 1. Check if file exists
    if (!pickedFile) {
      return { isValid: false, errorMessage: 'No file selected' };
    }

    // 2. Validate file size
    if (pickedFile.size && pickedFile.size > MAX_FILE_SIZE) {
      const fileSizeMB = (pickedFile.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        errorMessage: `File size (${fileSizeMB}MB) exceeds the 5MB limit. Please choose a smaller file.`
      };
    }

    // 3. Validate file type
    const mimeType = pickedFile.mimeType || '';
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(mimeType)) {
      return {
        isValid: false,
        errorMessage: `Invalid file type. Please upload PDF, JPG, or PNG files only.`
      };
    }

    // 4. Additional validation: Check file name extension as backup
    const fileName = pickedFile.name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];

    if (fileExtension && !validExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        errorMessage: `File extension .${fileExtension} is not supported. Please use PDF, JPG, or PNG.`
      };
    }

    // 5. Warn if file is very small (might be corrupted or invalid)
    if (pickedFile.size && pickedFile.size < 10 * 1024) { // Less than 10KB
      setValidationWarning('⚠️ File seems very small. Please ensure it\'s a clear, readable document.');
    }

    return { isValid: true, errorMessage: null };
  };

  const handlePickDocument = async () => {
    try {
      setError(null);
      setValidationWarning(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];

        if (pickedFile) {
          // Validate the file
          const validation = validateFile(pickedFile);

          if (!validation.isValid) {
            setError(validation.errorMessage);
            setFile(null);
            Alert.alert(
              "Invalid File",
              validation.errorMessage || "Please select a valid document.",
              [{ text: "OK" }]
            );
            return;
          }

          // File is valid, set it
          setFile(pickedFile);
          setError(null);
        }
      }
    } catch (err: unknown) {
      console.error('Document picker error:', err);
      setError('Failed to pick document. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Double-check validation before upload
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.errorMessage);
      Alert.alert(
        "Invalid File",
        validation.errorMessage || "Please select a valid document.",
        [{ text: "OK" }]
      );
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Generate upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload file to Convex storage
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.mimeType || "application/octet-stream" },
        body: await fetch(file.uri).then((r) => r.blob()),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await response.json();

      // 3. Update user profile with document ID and set status to pending
      await updateUser({
        registrationDocumentId: storageId,
        registrationDocumentType: documentType,
        registrationStatus: 'pending',
        registrationSubmittedAt: new Date().toISOString(),
      });

      // 4. Navigate to Pending Approval screen
      router.replace('/(auth)/pending-approval');

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document. Please try again.');
      Alert.alert("Error", "Failed to upload document. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <BaseScreen scrollable>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Verification</Text>
          <Text style={styles.subtitle}>
            Please upload a valid ID or supporting document to complete your registration.
          </Text>

          {/* File Requirements Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#0284C7" />
              <Text style={styles.infoTitle}>File Requirements:</Text>
            </View>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Accepted formats: PDF, JPG, PNG</Text>
              <Text style={styles.infoItem}>• Maximum size: 5MB</Text>
              <Text style={styles.infoItem}>• Ensure document is clear and readable</Text>
              <Text style={styles.infoItem}>• Valid government-issued ID preferred</Text>
            </View>
          </View>
        </View>

        {/* Document Type Selection */}
        <View style={styles.documentTypeSection}>
          <Text style={styles.selectorTitle}>What type of document are you uploading?</Text>

          {/* Government ID Option */}
          <TouchableOpacity
            style={[
              styles.radioOption,
              documentType === 'government_id' && styles.radioOptionSelected,
              file && styles.radioOptionDisabled
            ]}
            onPress={() => !file && setDocumentType('government_id')}
            disabled={!!file}
          >
            <View style={[styles.radioCircle, documentType === 'government_id' && styles.radioCircleSelected]}>
              {documentType === 'government_id' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radioLabel}>Government-Issued ID</Text>
              <Text style={styles.radioDescription}>Driver's License, Passport, National ID, etc.</Text>
            </View>
          </TouchableOpacity>

          {/* Previous Health Card Option */}
          <TouchableOpacity
            style={[
              styles.radioOption,
              documentType === 'previous_health_card' && styles.radioOptionSelected,
              file && styles.radioOptionDisabled
            ]}
            onPress={() => !file && setDocumentType('previous_health_card')}
            disabled={!!file}
          >
            <View style={[styles.radioCircle, documentType === 'previous_health_card' && styles.radioCircleSelected]}>
              {documentType === 'previous_health_card' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radioLabel}>Previous Health Card</Text>
              <Text style={styles.radioDescription}>Your existing or expired health card</Text>
            </View>
          </TouchableOpacity>

          {/* Medical Certificate Option */}
          <TouchableOpacity
            style={[
              styles.radioOption,
              documentType === 'medical_certificate' && styles.radioOptionSelected,
              file && styles.radioOptionDisabled
            ]}
            onPress={() => !file && setDocumentType('medical_certificate')}
            disabled={!!file}
          >
            <View style={[styles.radioCircle, documentType === 'medical_certificate' && styles.radioCircleSelected]}>
              {documentType === 'medical_certificate' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radioLabel}>Medical Certificate</Text>
              <Text style={styles.radioDescription}>Certificate from your doctor</Text>
            </View>
          </TouchableOpacity>

          {/* Other Document Option */}
          <TouchableOpacity
            style={[
              styles.radioOption,
              documentType === 'other' && styles.radioOptionSelected,
              file && styles.radioOptionDisabled
            ]}
            onPress={() => !file && setDocumentType('other')}
            disabled={!!file}
          >
            <View style={[styles.radioCircle, documentType === 'other' && styles.radioCircleSelected]}>
              {documentType === 'other' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.radioLabel}>Other Supporting Document</Text>
              <Text style={styles.radioDescription}>Work permit, company ID, etc.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {isRejected && (
          <View style={styles.rejectionBanner}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={styles.rejectionText}>
              Your previous submission was rejected. Please ensure your document is clear and valid.
            </Text>
          </View>
        )}

        {!file ? (
          <TouchableOpacity
            style={[styles.uploadArea, !documentType && { opacity: 0.5 }]}
            onPress={handlePickDocument}
            activeOpacity={0.7}
            disabled={!documentType}
          >
            <Ionicons name="cloud-upload-outline" size={40} color="#6B7280" style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Tap to Upload Document</Text>
            <Text style={styles.uploadSubtext}>PDF, JPG, or PNG (Max 5MB)</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.fileInfoContainer}>
              <Ionicons name="document-text-outline" size={24} color="#4B5563" />
              <View style={styles.fileDetailsContainer}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                {file.size && (
                  <Text style={styles.fileSize}>
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setFile(null);
                  setDocumentType('');
                  setValidationWarning(null);
                }}
              >
                <Ionicons name="close-circle" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Validation Warning Banner */}
            {validationWarning && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color="#D97706" />
                <Text style={styles.warningText}>
                  {validationWarning}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        <CustomButton
          title="Submit for Approval"
          onPress={handleUpload}
          loading={uploading}
          disabled={!file || !documentType || uploading}
          buttonStyle={styles.button}
        />
      </View>
    </BaseScreen>
  );
}
