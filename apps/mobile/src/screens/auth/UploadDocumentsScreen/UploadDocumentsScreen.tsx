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

export function UploadDocumentsScreen() {
  const router = useRouter();
  const { mutations: { generateUploadUrl } } = useStorage();
  const { data: { currentUser }, mutations: { updateUser } } = useUsers();
  
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRejected = currentUser?.registrationStatus === 'rejected';

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        if (pickedFile) {
             setFile(pickedFile);
             setError(null);
        }
      }
    } catch (err: unknown) {
      setError('Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

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
        registrationStatus: 'pending', // Important: Set status to pending
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
    <BaseScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Verification</Text>
          <Text style={styles.subtitle}>
            Please upload a valid ID or supporting document to complete your registration.
          </Text>
        </View>

        {isRejected && (
          <View style={{ 
            backgroundColor: '#FEF2F2', 
            borderColor: '#FECACA', 
            borderWidth: 1, 
            borderRadius: 8, 
            padding: 12, 
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}>
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text style={{ color: '#B91C1C', flex: 1, fontSize: 14 }}>
              Your previous submission was rejected. Please ensure your document is clear and valid.
            </Text>
          </View>
        )}

        {!file ? (
          <TouchableOpacity 
            style={styles.uploadArea} 
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <Ionicons name="cloud-upload-outline" size={40} color="#6B7280" style={styles.uploadIcon} />
            <Text style={styles.uploadText}>Tap to Upload Document</Text>
            <Text style={styles.uploadSubtext}>PDF, JPG, or PNG (Max 5MB)</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fileInfoContainer}>
            <Ionicons name="document-text-outline" size={24} color="#4B5563" />
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => setFile(null)}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <CustomButton
          title="Submit for Approval"
          onPress={handleUpload}
          loading={uploading}
          disabled={!file || uploading}
          buttonStyle={styles.button}
        />
      </View>
    </BaseScreen>
  );
}
