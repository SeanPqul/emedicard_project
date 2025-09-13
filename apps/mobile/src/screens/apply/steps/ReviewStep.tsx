import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { getColor, getSpacing, getBorderRadius, getTypography } from '../../../styles/theme';
import { JobCategory, DocumentRequirement } from '../../../types/domain/application';
import { SelectedDocuments } from '../../../types';

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

interface ReviewStepProps {
  formData: ApplicationFormData;
  jobCategoriesData: JobCategory[];
  requirementsByJobCategory: DocumentRequirement[];
  selectedDocuments: SelectedDocuments;
  getUploadState: (documentId: string) => UploadState;
  onEditStep: (step: number) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  jobCategoriesData,
  requirementsByJobCategory,
  selectedDocuments,
  getUploadState,
  onEditStep,
}) => {
  
  const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
  const documentRequirements = requirementsByJobCategory || [];
  const uploadedDocuments = documentRequirements.filter(doc => selectedDocuments[doc.fieldName]);
  const missingDocuments = documentRequirements.filter(doc => doc.required && !selectedDocuments[doc.fieldName]);
  const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => getUploadState(docKey)?.error);
  
  return (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepHeading}>Review & Submit</Text>
      <Text style={styles.stepDescription}>
        Please review your application details and uploaded documents before submitting.
      </Text>
      
      {/* Application Details Section */}
      <View style={[styles.reviewCard, { overflow: 'hidden' }]}>
        <View style={styles.reviewSection}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: getSpacing('md'),
          }}>
            <Text style={styles.reviewSectionTitle}>Application Details</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEditStep(0)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Type:</Text>
            <Text style={styles.reviewValue}>{formData.applicationType} Application</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Job Category:</Text>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              flex: 2,
              justifyContent: 'flex-end',
            }}>
              <View style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: selectedCategory?.colorCode || '#F1C40F',
                marginRight: getSpacing('sm'),
              }} />
              <Text style={[styles.reviewValue, { flex: 0, textAlign: 'left' }]}>{selectedCategory?.name}</Text>
            </View>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Position:</Text>
            <Text style={styles.reviewValue}>{formData.position}</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Organization:</Text>
            <Text style={styles.reviewValue}>{formData.organization}</Text>
          </View>
          <View style={[styles.reviewItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.reviewLabel}>Civil Status:</Text>
            <Text style={styles.reviewValue}>{formData.civilStatus}</Text>
          </View>
        </View>
        
        {/* Document Summary Section */}
        <View style={styles.reviewSection}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: getSpacing('md'),
          }}>
            <Text style={styles.reviewSectionTitle}>Document Summary</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => onEditStep(3)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          {/* Individual Document Status */}
          {documentRequirements.map((document, index) => {
            const isUploaded = selectedDocuments[document.fieldName];
            const hasError = getUploadState(document.fieldName)?.error;
            const isUploading = getUploadState(document.fieldName)?.uploading;
            
            return (
              <View key={document.fieldName || `review-doc-${index}`} style={styles.documentStatusItem}>
                <View style={styles.documentStatusContent}>
                  <Text style={styles.documentStatusTitle}>
                    {document.name}
                    {document.required && <Text style={styles.requiredAsterisk}> *</Text>}
                  </Text>
                  {isUploaded && (
                    <Text style={styles.documentStatusFile}>
                      File: {selectedDocuments[document.fieldName]?.name || selectedDocuments[document.fieldName]?.fileName || 'selected'}
                    </Text>
                  )}
                </View>
                
                {isUploading ? (
                  <View style={styles.documentStatusIndicator}>
                    <Ionicons name="hourglass" size={20} color={getColor('semantic.warning')} />
                    <Text style={[styles.documentStatusText, { color: getColor('semantic.warning') }]}>Uploading...</Text>
                  </View>
                ) : hasError ? (
                  <View style={styles.documentStatusIndicator}>
                    <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
                    <Text style={[styles.documentStatusText, { color: getColor('semantic.error') }]}>Error</Text>
                  </View>
                ) : isUploaded ? (
                  <View style={styles.documentStatusIndicator}>
                    <Ionicons name="checkmark-circle" size={20} color={getColor('semantic.success')} />
                    <Text style={[styles.documentStatusText, { color: getColor('semantic.success') }]}>Ready</Text>
                  </View>
                ) : (
                  <View style={styles.documentStatusIndicator}>
                    <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                    <Text style={[styles.documentStatusText, { color: getColor('semantic.error') }]}>Missing</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Application Fee Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>Application Fee</Text>
          <Text style={styles.feeNote}>
            Includes ₱10 processing fee for secure application handling and verification.
          </Text>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Application Fee:</Text>
            <Text style={styles.reviewValue}>₱50.00</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Processing Fee:</Text>
            <Text style={styles.reviewValue}>₱10.00</Text>
          </View>
          <View style={[styles.reviewItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.reviewLabel}>Total Amount:</Text>
            <Text style={[styles.reviewValue, styles.totalAmount]}>₱60.00</Text>
          </View>
        </View>
        
        {/* Orientation Notice */}
        {selectedCategory?.requireOrientation === 'yes' && (
          <View style={styles.orientationNotice}>
            <Ionicons name="information-circle" size={20} color="#F18F01" />
            <Text style={styles.orientationText}>
              🟡 Yellow Card Requirement: Food handlers must attend mandatory food safety orientation 
              with a sanitary inspector as per eMediCard system requirements.
            </Text>
          </View>
        )}

        {/* Validation Warnings */}
        {(missingDocuments.length > 0 || documentsWithErrors.length > 0) && (
          <View style={styles.validationWarning}>
            <View style={styles.validationHeader}>
              <Ionicons name="warning" size={20} color={getColor('semantic.error')} />
              <Text style={styles.validationTitle}>Application Incomplete</Text>
            </View>
            
            {missingDocuments.length > 0 && (
              <Text style={styles.validationMessage}>Missing required documents: {missingDocuments.map(doc => doc.name).join(', ')}</Text>
            )}
            
            {documentsWithErrors.length > 0 && (
              <Text style={styles.validationMessage}>Please fix upload errors before submitting.</Text>
            )}
          </View>
        )}
      </View>
      
      {/* Terms and Conditions */}
      <View style={{
        backgroundColor: getColor('background.secondary'),
        padding: getSpacing('md'),
        borderRadius: getBorderRadius('md'),
        marginTop: getSpacing('md'),
        overflow: 'hidden',
      }}>
        <Text style={{
          ...getTypography('bodyMedium'),
          color: getColor('text.primary'),
          fontWeight: '600',
          marginBottom: getSpacing('sm'),
        }}>Terms & Conditions</Text>
        <Text style={{
          ...getTypography('bodySmall'),
          color: getColor('text.secondary'),
          lineHeight: 18,
        }}>By submitting this application, I confirm that all information provided is accurate and complete. I understand that false information may result in the rejection of my application or cancellation of my health card.</Text>
      </View>
    </ScrollView>
  );
};