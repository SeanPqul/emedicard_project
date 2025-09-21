import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UploadDocumentsStepProps, Document } from './UploadDocumentsStep.types';
import styles from './UploadDocumentsStep.styles';
import { getColor } from '@/src/styles/theme';

const DOCUMENT_LABELS: Record<Document['type'], string> = {
  id_front: 'Valid ID (Front)',
  id_back: 'Valid ID (Back)',
  photo_with_id: 'Photo with ID',
  cedula: 'Cedula',
  proof_of_residency: 'Proof of Residency'
};

const DOCUMENT_DESCRIPTIONS: Record<Document['type'], string> = {
  id_front: 'Clear photo of the front of your valid ID',
  id_back: 'Clear photo of the back of your valid ID',
  photo_with_id: 'Selfie holding your valid ID',
  cedula: 'Community tax certificate (if applicable)',
  proof_of_residency: 'Recent utility bill or barangay certificate'
};

const DOCUMENT_ICONS: Record<Document['type'], string> = {
  id_front: 'card-outline',
  id_back: 'card-outline',
  photo_with_id: 'person-circle-outline',
  cedula: 'document-text-outline',
  proof_of_residency: 'home-outline'
};

export const UploadDocumentsStep: React.FC<UploadDocumentsStepProps> = ({ 
  documents,
  onDocumentSelect,
  onDocumentRemove,
  onSelectDocument
}) => {
  const getDocument = (type: Document['type']) => {
    return documents.find(doc => doc.type === type);
  };

  const renderDocumentCard = (type: Document['type'], isOptional = false) => {
    const document = getDocument(type);
    const hasDocument = document?.uri;

    return (
      <TouchableOpacity
        key={type}
        style={[
          styles.documentCard,
          hasDocument && styles.documentCardUploaded
        ]}
        onPress={() => onSelectDocument(type)}
        activeOpacity={0.7}
      >
        <View style={styles.documentHeader}>
          <View style={[
            styles.documentIconContainer,
            hasDocument && styles.documentIconContainerUploaded
          ]}>
            <Ionicons 
              name={DOCUMENT_ICONS[type] as any} 
              size={24} 
              color={hasDocument ? getColor('white') : getColor('primary.500')} 
            />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={styles.documentTitle}>{DOCUMENT_LABELS[type]}</Text>
              {isOptional && (
                <Text style={styles.optionalBadge}>Optional</Text>
              )}
            </View>
            <Text style={styles.documentDescription}>{DOCUMENT_DESCRIPTIONS[type]}</Text>
          </View>
        </View>

        {hasDocument ? (
          <View style={styles.uploadedContainer}>
            <View style={styles.uploadedInfo}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={getColor('accent.safetyGreen')} 
              />
              <Text style={styles.uploadedText} numberOfLines={1}>
                {document.name || 'Document uploaded'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={(e) => {
                e.stopPropagation();
                onDocumentRemove(type);
              }}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={getColor('semantic.error')} 
              />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => onSelectDocument(type)}
          >
            <Ionicons 
              name="cloud-upload-outline" 
              size={20} 
              color={getColor('primary.500')} 
            />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const requiredCount = documents.filter(doc => 
    ['id_front', 'id_back', 'photo_with_id'].includes(doc.type) && doc.uri
  ).length;

  const optionalCount = documents.filter(doc => 
    ['cedula', 'proof_of_residency'].includes(doc.type) && doc.uri
  ).length;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>
        Please upload clear photos of the required documents
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Required Documents</Text>
          <Text style={styles.progressValue}>{requiredCount} of 3</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(requiredCount / 3) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Documents</Text>
        {renderDocumentCard('id_front')}
        {renderDocumentCard('id_back')}
        {renderDocumentCard('photo_with_id')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional Documents</Text>
        {renderDocumentCard('cedula', true)}
        {renderDocumentCard('proof_of_residency', true)}
      </View>

      <View style={styles.tipBox}>
        <Ionicons 
          name="bulb-outline" 
          size={20} 
          color={getColor('accent.warningOrange')} 
        />
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Tips for better photos:</Text>
          <Text style={styles.tipText}>• Ensure good lighting</Text>
          <Text style={styles.tipText}>• Avoid blurry images</Text>
          <Text style={styles.tipText}>• Make sure all text is readable</Text>
          <Text style={styles.tipText}>• Keep file size under 5MB</Text>
        </View>
      </View>
    </ScrollView>
  );
};
