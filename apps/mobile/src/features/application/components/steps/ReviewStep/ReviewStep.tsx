import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getColor, getSpacing, getBorderRadius, getTypography } from '@/src/styles/theme';

import { ReviewStepProps, DocumentStatusInfo, ApplicationSummary } from './ReviewStep.types';
import { styles } from './ReviewStep.styles';

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

  // Application fee constants
  const APPLICATION_FEE = 50;
  const PROCESSING_FEE = 10;
  const TOTAL_FEE = APPLICATION_FEE + PROCESSING_FEE;

  const renderApplicationDetails = () => (
    <View style={styles.reviewSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Application Details</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => onEditStep(0)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Type:</Text>
        <Text style={styles.detailValue}>{formData.applicationType} Application</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Job Category:</Text>
        <View style={styles.jobCategoryRow}>
          <View style={[styles.colorIndicator, { 
            backgroundColor: selectedCategory?.colorCode || '#F1C40F' 
          }]} />
          <Text style={styles.detailValue}>{selectedCategory?.name}</Text>
        </View>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Position:</Text>
        <Text style={styles.detailValue}>{formData.position}</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Organization:</Text>
        <Text style={styles.detailValue}>{formData.organization}</Text>
      </View>
      
      <View style={[styles.detailItem, styles.lastItem]}>
        <Text style={styles.detailLabel}>Civil Status:</Text>
        <Text style={styles.detailValue}>{formData.civilStatus}</Text>
      </View>
    </View>
  );

  const renderDocumentStatus = (document: any, index: number) => {
    const isUploaded = selectedDocuments[document.fieldName];
    const hasError = getUploadState(document.fieldName)?.error;
    const isUploading = getUploadState(document.fieldName)?.uploading;
    
    let statusIcon, statusColor, statusText;
    
    if (isUploading) {
      statusIcon = "hourglass";
      statusColor = getColor('semantic.warning');
      statusText = "Uploading...";
    } else if (hasError) {
      statusIcon = "alert-circle";
      statusColor = getColor('semantic.error');
      statusText = "Error";
    } else if (isUploaded) {
      statusIcon = "checkmark-circle";
      statusColor = getColor('semantic.success');
      statusText = "Ready";
    } else {
      statusIcon = "close-circle";
      statusColor = getColor('semantic.error');
      statusText = "Missing";
    }
    
    return (
      <View key={document.fieldName || `review-doc-${index}`} style={styles.documentItem}>
        <View style={styles.documentContent}>
          <Text style={styles.documentTitle}>
            {document.name}
            {document.required && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
          {isUploaded && (
            <Text style={styles.documentFileName}>
              File: {selectedDocuments[document.fieldName]?.name || 
                     selectedDocuments[document.fieldName]?.fileName || 
                     'selected'}
            </Text>
          )}
        </View>
        
        <View style={styles.documentStatus}>
          <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          <Text style={[styles.documentStatusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      </View>
    );
  };

  const renderDocumentSummary = () => (
    <View style={styles.reviewSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Document Summary</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => onEditStep(3)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {documentRequirements.map(renderDocumentStatus)}
    </View>
  );

  const renderApplicationFee = () => (
    <View style={styles.reviewSection}>
      <Text style={styles.sectionTitle}>Application Fee</Text>
      <Text style={styles.feeNote}>
        Payment will be required after submission. You'll have 7 days to complete the payment.
      </Text>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Application Fee:</Text>
        <Text style={styles.detailValue}>₱{APPLICATION_FEE}.00</Text>
      </View>
      
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Processing Fee:</Text>
        <Text style={styles.detailValue}>₱{PROCESSING_FEE}.00</Text>
      </View>
      
      <View style={[styles.detailItem, styles.lastItem]}>
        <Text style={styles.detailLabel}>Total Amount:</Text>
        <Text style={[styles.detailValue, styles.totalAmount]}>₱{TOTAL_FEE}.00</Text>
      </View>
    </View>
  );

  const renderOrientationNotice = () => {
    if (selectedCategory?.requireOrientation !== 'yes') return null;
    
    return (
      <View style={styles.orientationNotice}>
        <Ionicons name="information-circle" size={20} color="#F18F01" />
        <Text style={styles.orientationText}>
          🟡 Yellow Card Requirement: Food handlers must attend mandatory food safety orientation 
          with a sanitary inspector as per eMediCard system requirements.
        </Text>
      </View>
    );
  };

  const renderValidationWarnings = () => {
    const hasIssues = missingDocuments.length > 0 || documentsWithErrors.length > 0;
    if (!hasIssues) return null;
    
    return (
      <View style={styles.validationWarning}>
        <View style={styles.validationHeader}>
          <Ionicons name="warning" size={20} color={getColor('semantic.error')} />
          <Text style={styles.validationTitle}>Application Incomplete</Text>
        </View>
        
        {missingDocuments.length > 0 && (
          <Text style={styles.validationMessage}>
            Missing required documents: {missingDocuments.map(doc => doc.name).join(', ')}
          </Text>
        )}
        
        {documentsWithErrors.length > 0 && (
          <Text style={styles.validationMessage}>
            Please fix upload errors before submitting.
          </Text>
        )}
      </View>
    );
  };

  const renderTermsAndConditions = () => (
    <View style={styles.termsContainer}>
      <Text style={styles.termsTitle}>Terms & Conditions</Text>
      <Text style={styles.termsText}>
        By submitting this application, I confirm that all information provided is accurate and complete. 
        I understand that false information may result in the rejection of my application or cancellation 
        of my health card.
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Review & Submit</Text>
      <Text style={styles.description}>
        Please review your application details and uploaded documents before submitting.
      </Text>
      
      <View style={styles.reviewCard}>
        {renderApplicationDetails()}
        {renderDocumentSummary()}
        {renderApplicationFee()}
        {renderOrientationNotice()}
        {renderValidationWarnings()}
      </View>
      
      {renderTermsAndConditions()}
    </ScrollView>
  );
};
