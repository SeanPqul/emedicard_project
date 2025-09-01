<<<<<<< HEAD
/**
 * Apply Screen - eMediCard Application
 * 
 * IMPLEMENTATION NOTES:
 * - Multi-step form following UI_DESIGN_PROMPT.md specifications (lines 66-103)
 * - Implements health card classification system from emedicarddocumentation.txt
 * - Step-by-step wizard: Application Type → Job Category → Personal Details → Upload Documents → Review
 * - Supports Yellow (food handlers), Green (non-food), Pink (skin contact) card types
 * - Document upload with validation per job category requirements
 * - Follows accessibility guidelines from UI_UX_IMPLEMENTATION_GUIDE.md
 * 
 * DOCUMENTATION REFERENCES:
 * - UI_DESIGN_PROMPT.md: Application screen structure and step indicator
 * - emedicarddocumentation.txt: Health card classification system (lines 217-226)
 * - UI_UX_IMPLEMENTATION_GUIDE.md: Form validation and accessibility standards
 * 
 * HEALTH CARD CATEGORIES (per documentation):
 * - Yellow: Food handlers (require orientation with sanitary inspector)
 * - Green: Non-food industry workers (security guards, receptionists, BPO staff)
 * - Pink: Skin-to-skin contact jobs (barbers, massage therapists, tattoo artists)
 * 
 * REQUIRED DOCUMENTS (per emedicarddocumentation.txt):
 * - Chest X-ray, CBC, urinalysis, fecalysis, drug test
 * - Neuropsychiatric test, Hepatitis B antibody test
 * - Valid ID, Community Tax Certificate, health card receipt (OR), 1x1 picture
 * 
 * PAYMENT PROCESSING:
 * - ₱10 transaction fee automatically added (per documentation line 213-215)
 * - Supports GCash and manual payment receipt upload
 * 
 * ACCESSIBILITY COMPLIANCE:
 * - Keyboard navigation support
 * - Screen reader compatible
 * - Form validation with descriptive error messages
 * - Touch targets meet 44x44 pixel minimum
 */

import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/apply';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { CustomButton, CustomTextInput } from '../../src/components';
import { useDocumentUpload } from '../../src/hooks/useDocumentUpload';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../src/styles/theme';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation: string;
}

interface FormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

const STEP_TITLES = [
  'Application Type',
  'Job Category', 
  'Personal Details',
  'Upload Documents',
  'Review & Submit'
];

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

export default function Apply() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    applicationType: 'New',
    jobCategory: '',
    position: '',
    organization: '',
    civilStatus: 'Single',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  
  // Upload documents state
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Id<"_storage">>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [tempFormId, setTempFormId] = useState<string | null>(null);

  // Convex queries and mutations
  const jobCategories = useQuery(api.jobCategories?.getAllJobCategories);
  const createForm = useMutation(api.forms.createForm);
  const submitApplication = useMutation(api.forms.submitApplicationForm);
  const userProfile = useQuery(api.users.getCurrentUser);
  const requirementsByJobCategory = useQuery(api.requirements.getRequirementsByJobCategory, 
    formData.jobCategory ? { jobCategoryId: formData.jobCategory as any } : 'skip'
  );
  
  // Document upload hook (only initialize when we have a form ID)
  const documentUploadHook = useDocumentUpload(tempFormId as Id<"forms">);
  const {
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
  } = tempFormId ? documentUploadHook : {
    uploadFile: () => Promise.reject(new Error('No form ID')),
    replaceFile: () => Promise.reject(new Error('No form ID')),
    removeFile: () => Promise.reject(new Error('No form ID')),
    retryUpload: () => Promise.reject(new Error('No form ID')),
    getUploadState: () => ({ uploading: false, progress: 0, error: null, success: false }),
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    switch (currentStep) {
      case 0:
        // Application type is always valid (radio button)
        break;
      case 1:
        if (!formData.jobCategory) {
          newErrors.jobCategory = 'Please select a job category';
        }
        break;
      case 2:
        if (!formData.position.trim()) {
          newErrors.position = 'Position is required';
        }
        if (!formData.organization.trim()) {
          newErrors.organization = 'Organization is required';
        }
        break;
      case 3:
        // Upload Documents step - validate required documents
        const documentRequirements = requirementsByJobCategory?.requirements || [];
        const requiredDocuments = documentRequirements.filter(doc => doc.required);
        const missingDocuments = requiredDocuments.filter(doc => !selectedDocuments[doc.fieldName]);
        
        if (missingDocuments.length > 0) {
          Alert.alert(
            'Missing Required Documents',
            `Please upload the following required documents: ${missingDocuments.map(doc => doc.name).join(', ')}`,
            [{ text: 'OK' }]
          );
          return false;
        }
        
        // Check for any upload errors
        const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => 
          getUploadState(docKey)?.error
        );
        
        if (documentsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before proceeding.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        break;
      case 4:
        // Review step - comprehensive validation before submission
        const docRequirements = requirementsByJobCategory?.requirements || [];
        const requiredDocs = docRequirements.filter(doc => doc.required);
        const missingDocs = requiredDocs.filter(doc => !selectedDocuments[doc.fieldName]);
        const docsWithErrors = Object.keys(selectedDocuments).filter(docKey => getUploadState(docKey)?.error);
        const uploading = Object.keys(selectedDocuments).some(docKey => getUploadState(docKey)?.uploading);
        
        if (missingDocs.length > 0) {
          Alert.alert(
            'Missing Required Documents',
            `Please upload the following required documents: ${missingDocs.map(doc => doc.name).join(', ')}`,
            [{ text: 'OK' }]
          );
          return false;
        }
        
        if (docsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before submitting.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        if (uploading) {
          Alert.alert(
            'Upload in Progress',
            'Please wait for all documents to finish uploading before submitting.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        // Validate all previous steps data
        if (!formData.jobCategory || !formData.position.trim() || !formData.organization.trim()) {
          Alert.alert(
            'Incomplete Application',
            'Please ensure all required fields are completed.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleNext = async () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('formData:', formData);
    
    if (validateCurrentStep()) {
      console.log('Validation passed');
      if (currentStep < STEP_TITLES.length - 1) {
        // If moving to upload documents step (step 3), create a temporary form
        if (currentStep === 2 && !tempFormId) {
          try {
            setLoading(true);
            const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
            if (!selectedCategory) {
              throw new Error('Invalid job category selected');
            }

            const formId = await createForm({
              applicationType: formData.applicationType,
              jobCategory: formData.jobCategory as any,
              position: formData.position,
              organization: formData.organization,
              civilStatus: formData.civilStatus,
            });
            
            setTempFormId(formId);
            setLoading(false);
          } catch (error) {
            console.error('Error creating temporary form:', error);
            Alert.alert('Error', 'Failed to create form. Please try again.');
            setLoading(false);
            return;
          }
        }

        console.log('Moving to next step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
        renderStepIndicator();  // Ensure active step is indicated visually
      } else {
        console.log('Submitting form');
        handleSubmit();
      }
    } else {
      console.log('Validation failed, errors:', errors);
      // Optionally, visually highlight the first error for user prompt
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      // Show payment method selection
      Alert.alert(
        'Payment Method',
        'Please select your payment method for the ₱60 application fee (₱50 + ₱10 service fee):',
        [
          {
            text: 'GCash',
            onPress: () => handlePaymentMethodSelected('Gcash'),
          },
          {
            text: 'Maya',
            onPress: () => handlePaymentMethodSelected('Maya'),
          },
          {
            text: 'Barangay Hall',
            onPress: () => handlePaymentMethodSelected('BaranggayHall'),
          },
          {
            text: 'City Hall',
            onPress: () => handlePaymentMethodSelected('CityHall'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = (paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall') => {
    // For digital payments, show reference number input
    if (paymentMethod === 'Gcash' || paymentMethod === 'Maya') {
      Alert.prompt(
        'Payment Reference',
        `Please enter your ${paymentMethod} reference number:`,
        async (referenceNumber) => {
          if (referenceNumber && referenceNumber.trim()) {
            await submitApplicationWithPayment(paymentMethod, referenceNumber.trim());
          } else {
            Alert.alert('Invalid Reference', 'Please provide a valid reference number.');
            setLoading(false);
          }
        }
      );
    } else {
      // For manual payments, just use a placeholder reference
      const referenceNumber = `MANUAL-${Date.now()}`;
      Alert.alert(
        'Manual Payment',
        `Please proceed to ${paymentMethod === 'BaranggayHall' ? 'Barangay Hall' : 'City Hall'} to complete your payment. Your reference number is: ${referenceNumber}`,
        [
          {
            text: 'OK',
            onPress: () => submitApplicationWithPayment(paymentMethod, referenceNumber),
          },
        ]
      );
    }
  };

  const submitApplicationWithPayment = async (
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
    referenceNumber: string
  ) => {
    try {
      const result = await submitApplication({
        formId: tempFormId as Id<"forms">,
        paymentMethod,
        paymentReferenceNumber: referenceNumber,
      });

      if (result.success) {
        Alert.alert(
          'Application Submitted Successfully!',
          `Your application has been submitted with payment reference: ${referenceNumber}\n\nTotal Amount: ₱${result.totalAmount}\nPayment Method: ${result.paymentMethod}\n\n${result.requiresOrientation ? '📚 Note: Food safety orientation is required for your health card category.' : ''}\n\nYou will receive notifications about your application status.`,
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/(tabs)/application'),
            },
          ]
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(
        'Submission Error',
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Document upload helper functions
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

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
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

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
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
    console.log('handleDocumentSelected called with:', { file, documentId });
    
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created yet. Please try again.');
      return;
    }

    if (!file || !file.uri) {
      console.error('Invalid file object:', file);
      Alert.alert('Error', 'Invalid file selected. Please try again.');
      return;
    }

    try {
      // Convert file to the format expected by the upload hook
      console.log('Fetching file blob from:', file.uri);
      const fileBlob = await fetch(file.uri).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }
        return response.blob();
      });
      
      // Fix file type detection
      let fileType = file.type || file.mimeType || 'image/jpeg';
      if (fileType === 'image') {
        fileType = 'image/jpeg'; // Default to JPEG for generic image type
      }
      
      const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || 
                           fileType.split('/')[1] || 'jpg';
      
      const fileName = file.fileName || file.name || `document_${documentId}.${fileExtension}`;
      console.log('Creating file object:', { fileName, fileType, size: fileBlob.size });
      
      const fileObject = new File([fileBlob], fileName, {
        type: fileType,
      });

      const isReplacing = selectedDocuments[documentId] && uploadedFiles[documentId];
      console.log('Upload mode:', isReplacing ? 'replacing' : 'new upload');
      
      if (isReplacing) {
        // Replace existing file
        const result = await replaceFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      } else {
        // Upload new file
        const result = await uploadFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      }

      // Update selected documents for UI
      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: file,
      }));

      console.log('Upload successful for document:', documentId);
      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const storageId = uploadedFiles[documentId];
    if (!storageId) {
      // If no uploaded file, just remove from local state
      setSelectedDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        return newDocs;
      });
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
          onPress: async () => {
            try {
              await removeFile(documentId, storageId);
              
              // Remove from local state
              setSelectedDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[documentId];
                return newDocs;
              });
              
              setUploadedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
              });
              
              Alert.alert('Success', 'Document removed successfully!');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove document. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {STEP_TITLES.map((title, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  index <= currentStep ? styles.stepNumberActive : styles.stepNumberInactive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              index <= currentStep ? styles.stepTitleActive : styles.stepTitleInactive
            ]}>
              {title}
            </Text>
            {index < STEP_TITLES.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderApplicationTypeStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Application Type</Text>
        <Text style={styles.stepDescription}>
          Choose whether this is a new application or renewal of an existing health card.
        </Text>
        
        <View style={styles.radioGroup}>
          {(['New', 'Renew'] as ApplicationType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => setFormData({ ...formData, applicationType: type })}
            >
              <View style={[
                styles.radioCircle,
                formData.applicationType === type && styles.radioCircleSelected
              ]}>
                {formData.applicationType === type && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioTitle}>{type} Application</Text>
                <Text style={styles.radioSubtitle}>
                  {type === 'New' 
                    ? 'Apply for a new health card' 
                    : 'Renew your existing health card'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderJobCategoryStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Job Category</Text>
        <Text style={styles.stepDescription}>
          Choose the category that best describes your job. Yellow for Food Handlers, Green for Non-Food Workers, and Pink for Skin-to-Skin Contact Jobs
        </Text>
        
        <View style={styles.categoryGrid}>
          {jobCategories?.map((category, index) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                formData.jobCategory === category._id && styles.categoryCardSelected,
                { borderColor: category.colorCode },
                // If it's the third item and there are 3 items total, center it
                jobCategories.length === 3 && index === 2 && styles.categoryCardCentered
              ]}
              onPress={() => setFormData({ ...formData, jobCategory: category._id })}
            >
              <View style={[
                styles.categoryIcon,
                { backgroundColor: category.colorCode + '20' }
              ]}>
                <Ionicons 
                  name={category.name.toLowerCase().includes('food') ? 'restaurant' : 'shield'} 
                  size={24} 
                  color={category.colorCode} 
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.requireOrientation === 'Yes' && (
                <Text style={styles.categoryRequirement}>
                  Food Safety Orientation Required
                </Text>
              )}
              {formData.jobCategory === category._id && (
                <View style={styles.categorySelected}>
                  <Ionicons name="checkmark-circle" size={20} color={category.colorCode} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {errors.jobCategory && (
          <Text style={styles.errorText}>{errors.jobCategory}</Text>
        )}
      </View>
    );
  };

  const renderPersonalDetailsStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Personal Details</Text>
        <Text style={styles.stepDescription}>
          Provide your job position, organization, and civil status.
        </Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Position/Job Title</Text>
          <CustomTextInput
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
            placeholder="e.g., Food Server, Security Guard"
            style={styles.input}
          />
          {errors.position && (
            <Text style={styles.errorText}>{errors.position}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Organization/Company</Text>
          <CustomTextInput
            value={formData.organization}
            onChangeText={(text) => setFormData({ ...formData, organization: text })}
            placeholder="e.g., ABC Restaurant, XYZ Security Agency"
            style={styles.input}
          />
          {errors.organization && (
            <Text style={styles.errorText}>{errors.organization}</Text>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Civil Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
            {CIVIL_STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.civilStatusOption,
                  formData.civilStatus === status && styles.civilStatusOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, civilStatus: status })}
              >
                <Text style={[
                  styles.civilStatusText,
                  formData.civilStatus === status && styles.civilStatusTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderUploadDocumentsStep = () => {
    // Get document requirements from job category
    const documentRequirements = requirementsByJobCategory?.requirements || [];
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Upload Documents</Text>
        <Text style={styles.stepDescription}>
          Please upload clear and readable copies of all required medical documents
          to ensure proper processing of your {formData.applicationType?.toLowerCase()} application.
        </Text>
        
        {/* Instructions */}
        <View style={[styles.formGroup, { marginBottom: getSpacing('md') }]}>
          <View style={{
            flexDirection: 'row',
            padding: getSpacing('md'),
            backgroundColor: getColor('semanticUI.infoCard'),
            borderRadius: getBorderRadius('md'),
          }}>
            <Ionicons name="information-circle-outline" size={24} color={getColor('primary.500')} />
            <View style={{ flex: 1, marginLeft: getSpacing('sm') }}>
              <Text style={{
...getTypography('body'),
                color: getColor('primary.500'),
                fontWeight: '600',
                marginBottom: getSpacing('xs'),
              }}>Document Requirements</Text>
              <Text style={{
                ...getTypography('bodySmall'),
                color: getColor('primary.500'),
                lineHeight: 16,
              }}>⚠️ Note: Documents must be from accredited clinics and laboratories. Accepted formats: JPG, PNG, PDF</Text>
            </View>
          </View>
        </View>
        
        {/* Document List */}
        <View style={{ marginBottom: getSpacing('lg') }}>
          {documentRequirements.map((document, index) => (
            <View key={document.fieldName || `doc-${index}`} style={{
              backgroundColor: getColor('background.primary'),
              borderRadius: getBorderRadius('md'),
              padding: getSpacing('md'),
              marginBottom: getSpacing('md'),
              ...getShadow('card'),
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: getSpacing('sm'),
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
...getTypography('body'),
                    fontWeight: '600',
                    color: getColor('text.primary'),
                    marginBottom: getSpacing('xs'),
                  }}>
                    {document.name}
                    {document.required && <Text style={{ color: getColor('semantic.error') }}> *</Text>}
                  </Text>
                  <Text style={{
                    ...getTypography('bodyMedium'),
                    color: getColor('text.secondary'),
                    marginBottom: getSpacing('xs'),
                  }}>{document.description}</Text>
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('text.secondary'),
                    fontStyle: 'italic',
                  }}>
                    Formats: {document.formats ? document.formats.join(', ').toUpperCase() : 'JPG, PNG, PDF'}
                  </Text>
                </View>
                <View style={{ marginLeft: getSpacing('sm') }}>
                  {selectedDocuments[document.fieldName] ? (
                    <Ionicons name="checkmark-circle" size={24} color={getColor('semantic.success')} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={getColor('text.secondary')} />
                  )}
                </View>
              </View>

              {/* Upload Progress */}
              {getUploadState(document.fieldName)?.uploading && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: getSpacing('sm'),
                }}>
                  <View style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: getColor('border.light'),
                    borderRadius: getBorderRadius('xs'),
                    marginRight: getSpacing('sm'),
                  }}>
                    <View style={{
                      height: '100%',
                      backgroundColor: getColor('primary.500'),
                      borderRadius: getBorderRadius('xs'),
                      width: `${getUploadState(document.fieldName).progress}%`,
                    }} />
                  </View>
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('text.secondary'),
                    minWidth: 35,
                  }}>
                    {getUploadState(document.fieldName).progress}%
                  </Text>
                </View>
              )}

              {/* Error State */}
              {getUploadState(document.fieldName)?.error && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: getColor('semanticUI.dangerCard'),
                  padding: getSpacing('sm'),
                  borderRadius: getBorderRadius('sm'),
                  marginBottom: getSpacing('sm'),
                }}>
                  <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('semantic.error'),
                    flex: 1,
                    marginLeft: getSpacing('xs'),
                  }}>
                    {getUploadState(document.fieldName).error}
                  </Text>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: getSpacing('sm'),
                      paddingVertical: getSpacing('xs'),
                      borderRadius: getBorderRadius('xs'),
                      backgroundColor: getColor('semantic.error'),
                      marginLeft: getSpacing('sm'),
                    }}
                    onPress={() => selectedDocuments[document.fieldName] && retryUpload(selectedDocuments[document.fieldName], document.fieldName)}
                  >
                    <Text style={{
                      ...getTypography('bodySmall'),
                      color: getColor('background.primary'),
                      fontWeight: '600',
                    }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Document Preview */}
              {selectedDocuments[document.fieldName] && !getUploadState(document.fieldName)?.uploading && (
                <View style={{
                  position: 'relative',
                  marginBottom: getSpacing('sm'),
                }}>
                  <Image
                    source={{ uri: selectedDocuments[document.fieldName].uri }}
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: getBorderRadius('sm'),
                      backgroundColor: getColor('background.secondary'),
                    }}
                  />
                  <TouchableOpacity 
                    style={{
                      position: 'absolute',
                      top: getSpacing('sm'),
                      right: getSpacing('sm'),
                      backgroundColor: getColor('background.primary'),
                      borderRadius: getBorderRadius('sm'),
                      padding: getSpacing('xs'),
                    }}
                    onPress={() => handleRemoveDocument(document.fieldName)}
                  >
                    <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: getSpacing('lg'),
                    paddingVertical: getSpacing('sm'),
                    borderRadius: getBorderRadius('sm'),
                    borderWidth: 1,
                    borderColor: getColor('primary.500'),
                    backgroundColor: getColor('background.primary'),
                  }}
                  onPress={() => handleDocumentPicker(document.fieldName)}
                  disabled={getUploadState(document.fieldName)?.uploading}
                >
                  <Ionicons 
                    name={selectedDocuments[document.fieldName] ? "refresh" : "cloud-upload-outline"} 
                    size={20} 
                    color={getColor('primary.500')} 
                  />
                  <Text style={{
                    ...getTypography('bodyMedium'),
                    color: getColor('primary.500'),
                    fontWeight: '600',
                    marginLeft: getSpacing('sm'),
                  }}>
                    {selectedDocuments[document.fieldName] ? 'Replace' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReviewStep = () => {
    const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
    const documentRequirements = requirementsByJobCategory?.requirements || [];
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
        <View style={styles.reviewCard}>
          <View style={styles.reviewSection}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: getSpacing('md'),
            }}>
              <Text style={styles.reviewSectionTitle}>Application Details</Text>
              <TouchableOpacity 
                style={{
                  paddingHorizontal: getSpacing('sm'),
                  paddingVertical: getSpacing('xs'),
                  borderRadius: getBorderRadius('sm'),
                  backgroundColor: getColor('primary.50'),
                  borderWidth: 1,
                  borderColor: getColor('primary.500'),
                }}
                onPress={() => setCurrentStep(0)}
              >
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('primary.500'),
                  fontWeight: '600',
                }}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Type:</Text>
              <Text style={styles.reviewValue}>{formData.applicationType} Application</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Job Category:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: selectedCategory?.colorCode || '#999',
                  marginRight: getSpacing('sm'),
                }} />
                <Text style={styles.reviewValue}>{selectedCategory?.name}</Text>
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
            <View style={styles.reviewItem}>
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
                style={{
                  paddingHorizontal: getSpacing('sm'),
                  paddingVertical: getSpacing('xs'),
                  borderRadius: getBorderRadius('sm'),
                  backgroundColor: getColor('primary.50'),
                  borderWidth: 1,
                  borderColor: getColor('primary.500'),
                }}
                onPress={() => setCurrentStep(3)}
              >
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('primary.500'),
                  fontWeight: '600',
                }}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            {/* Document Status Overview */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: getSpacing('md'),
              padding: getSpacing('md'),
              backgroundColor: getColor('background.secondary'),
              borderRadius: getBorderRadius('md'),
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.success'),
                  fontWeight: '700',
                }}>{uploadedDocuments.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Uploaded</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.error'),
                  fontWeight: '700',
                }}>{missingDocuments.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Missing</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.warning'),
                  fontWeight: '700',
                }}>{documentsWithErrors.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Errors</Text>
              </View>
            </View>
            
            {/* Individual Document Status */}
            {documentRequirements.map((document, index) => {
              const isUploaded = selectedDocuments[document.fieldName];
              const hasError = getUploadState(document.fieldName)?.error;
              const isUploading = getUploadState(document.fieldName)?.uploading;
              
              return (
                <View key={document.fieldName || `review-doc-${index}`} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: getSpacing('sm'),
                  borderBottomWidth: 1,
                  borderBottomColor: getColor('border.light'),
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      ...getTypography('bodyMedium'),
                      color: getColor('text.primary'),
                      fontWeight: '600',
                    }}>
                      {document.name}
                      {document.required && <Text style={{ color: getColor('semantic.error') }}> *</Text>}
                    </Text>
                    {isUploaded && (
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('text.secondary'),
                      }}>
                        File: {selectedDocuments[document.fieldName].name || 'uploaded'}
                      </Text>
                    )}
                  </View>
                  
                  {isUploading ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="hourglass" size={20} color={getColor('semantic.warning')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.warning'),
                      }}>Uploading...</Text>
                    </View>
                  ) : hasError ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.error'),
                      }}>Error</Text>
                    </View>
                  ) : isUploaded ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={20} color={getColor('semantic.success')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.success'),
                      }}>Uploaded</Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.error'),
                      }}>Missing</Text>
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
              As per eMediCard documentation: ₱10 transaction fee included for processing costs.
            </Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Application Fee:</Text>
              <Text style={styles.reviewValue}>₱50.00</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Transaction Fee:</Text>
              <Text style={styles.reviewValue}>₱10.00</Text>
            </View>
            <View style={styles.reviewItem}>
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
            <View style={{
              backgroundColor: getColor('semanticUI.dangerCard'),
              padding: getSpacing('md'),
              borderRadius: getBorderRadius('md'),
              marginTop: getSpacing('md'),
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: getSpacing('sm'),
              }}>
                <Ionicons name="warning" size={20} color={getColor('semantic.error')} />
                <Text style={{
                  ...getTypography('bodyMedium'),
                  color: getColor('semantic.error'),
                  fontWeight: '600',
                  marginLeft: getSpacing('sm'),
                }}>Application Incomplete</Text>
              </View>
              
              {missingDocuments.length > 0 && (
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('semantic.error'),
                  marginBottom: getSpacing('xs'),
                }}>Missing required documents: {missingDocuments.map(doc => doc.name).join(', ')}</Text>
              )}
              
              {documentsWithErrors.length > 0 && (
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('semantic.error'),
                }}>Please fix upload errors before submitting.</Text>
              )}
            </View>
          )}
          
          {/* Terms and Conditions */}
          <View style={{
            backgroundColor: getColor('background.secondary'),
            padding: getSpacing('md'),
            borderRadius: getBorderRadius('md'),
            marginTop: getSpacing('md'),
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
        </View>
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderApplicationTypeStep();
      case 1:
        return renderJobCategoryStep();
      case 2:
        return renderPersonalDetailsStep();
      case 3:
        return renderUploadDocumentsStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Application</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content with Keyboard Avoiding */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 100, // Space for fixed navigation buttons + tab bar
            flexGrow: 1 // Ensure content can expand
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons - Fixed at bottom */}
      <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.previousButton} 
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {/* Navigation Button with proper validation */}
          <TouchableOpacity
            style={[{
              backgroundColor: loading ? '#999' : '#2E86AB',
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 8,
              flex: 1,
              marginLeft: currentStep > 0 ? 0 : 0,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Loading...' : (currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next')}
            </Text>
          </TouchableOpacity>
          
          {/* Original CustomButton (hidden for debugging) */}
          {false && (
            <CustomButton
              title={currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next'}
              onPress={handleNext}
              loading={loading}
              style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            />
          )}
        </View>
        
        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: getColor('background.primary'),
              borderTopLeftRadius: getBorderRadius('xl'),
              borderTopRightRadius: getBorderRadius('xl'),
              padding: getSpacing('lg'),
            }}>
              <Text style={{
...getTypography('h4'),
                color: getColor('text.primary'),
                textAlign: 'center',
                marginBottom: getSpacing('lg'),
              }}>Select Document Source</Text>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickFromCamera}>
                <Ionicons name="camera" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickFromGallery}>
                <Ionicons name="images" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickDocument}>
                <Ionicons name="document" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Select File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  paddingVertical: getSpacing('md'),
                  alignItems: 'center',
                }}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={{
...getTypography('body'),
                  color: getColor('semantic.error'),
                  fontWeight: '600',
                }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}
=======
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { styles } from '../../assets/styles/tabs-styles/apply';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { CustomButton, CustomTextInput } from '../../src/components';
import { useDocumentUpload } from '../../src/hooks/useDocumentUpload';
import { getBorderRadius, getColor, getShadow, getSpacing, getTypography } from '../../src/styles/theme';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';

interface JobCategory {
  _id: string;
  name: string;
  colorCode: string;
  requireOrientation: string;
}

interface FormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

const STEP_TITLES = [
  'Application Type',
  'Job Category', 
  'Personal Details',
  'Upload Documents',
  'Payment Method',
  'Review & Submit'
];

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed'];

export default function Apply() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    applicationType: 'New',
    jobCategory: '',
    position: '',
    organization: '',
    civilStatus: 'Single',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  
  // Upload documents state
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, Id<"_storage">>>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [tempFormId, setTempFormId] = useState<string | null>(null);
  
  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall' | ''>('');
  const [paymentReference, setPaymentReference] = useState('');

  // Convex queries and mutations
  const jobCategories = useQuery(api.jobCategories?.getAllJobCategories);
  const createForm = useMutation(api.forms.createForm);
  const submitApplication = useMutation(api.forms.submitApplicationForm);
  const userProfile = useQuery(api.users.getCurrentUser);
  const requirementsByJobCategory = useQuery(api.requirements.getRequirementsByJobCategory, 
    formData.jobCategory ? { jobCategoryId: formData.jobCategory as any } : 'skip'
  );
  
  // Document upload hook (only initialize when we have a form ID)
  const documentUploadHook = useDocumentUpload(tempFormId as Id<"forms">);
  const {
    uploadFile,
    replaceFile,
    removeFile,
    retryUpload,
    getUploadState,
  } = tempFormId ? documentUploadHook : {
    uploadFile: () => Promise.reject(new Error('No form ID')),
    replaceFile: () => Promise.reject(new Error('No form ID')),
    removeFile: () => Promise.reject(new Error('No form ID')),
    retryUpload: () => Promise.reject(new Error('No form ID')),
    getUploadState: () => ({ uploading: false, progress: 0, error: null, success: false }),
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    switch (currentStep) {
      case 0:
        // Application type is always valid (radio button)
        break;
      case 1:
        if (!formData.jobCategory) {
          newErrors.jobCategory = 'Please select a job category';
        }
        break;
      case 2:
        if (!formData.position.trim()) {
          newErrors.position = 'Position is required';
        }
        if (!formData.organization.trim()) {
          newErrors.organization = 'Organization is required';
        }
        break;
      case 3:
        // Upload Documents step - validate required documents
        const documentRequirements = requirementsByJobCategory?.requirements || [];
        const requiredDocuments = documentRequirements.filter(doc => doc.required);
        const missingDocuments = requiredDocuments.filter(doc => !selectedDocuments[doc.fieldName]);
        
        if (missingDocuments.length > 0) {
          Alert.alert(
            'Missing Required Documents',
            `Please upload the following required documents: ${missingDocuments.map(doc => doc.name).join(', ')}`,
            [{ text: 'OK' }]
          );
          return false;
        }
        
        // Check for any upload errors
        const documentsWithErrors = Object.keys(selectedDocuments).filter(docKey => 
          getUploadState(docKey)?.error
        );
        
        if (documentsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before proceeding.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        break;
      case 4:
        // Payment method step
        if (!selectedPaymentMethod) {
          Alert.alert('Payment Method Required', 'Please select a payment method to continue.');
          return false;
        }
        if ((selectedPaymentMethod === 'Gcash' || selectedPaymentMethod === 'Maya') && !paymentReference.trim()) {
          Alert.alert('Reference Number Required', 'Please enter your payment reference number.');
          return false;
        }
        break;
      case 5:
        // Review step - comprehensive validation before submission
        const docRequirements = requirementsByJobCategory?.requirements || [];
        const requiredDocs = docRequirements.filter(doc => doc.required);
        const missingDocs = requiredDocs.filter(doc => !selectedDocuments[doc.fieldName]);
        const docsWithErrors = Object.keys(selectedDocuments).filter(docKey => getUploadState(docKey)?.error);
        const uploading = Object.keys(selectedDocuments).some(docKey => getUploadState(docKey)?.uploading);
        
        if (missingDocs.length > 0) {
          Alert.alert(
            'Missing Required Documents',
            `Please upload the following required documents: ${missingDocs.map(doc => doc.name).join(', ')}`,
            [{ text: 'OK' }]
          );
          return false;
        }
        
        if (docsWithErrors.length > 0) {
          Alert.alert(
            'Upload Errors',
            'Please fix the upload errors before submitting.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        if (uploading) {
          Alert.alert(
            'Upload in Progress',
            'Please wait for all documents to finish uploading before submitting.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        // Validate all previous steps data
        if (!formData.jobCategory || !formData.position.trim() || !formData.organization.trim()) {
          Alert.alert(
            'Incomplete Application',
            'Please ensure all required fields are completed.',
            [{ text: 'OK' }]
          );
          return false;
        }
        
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleNext = async () => {
    console.log('handleNext called, currentStep:', currentStep);
    console.log('formData:', formData);
    
    if (validateCurrentStep()) {
      console.log('Validation passed');
      if (currentStep < STEP_TITLES.length - 1) {
        // If moving to upload documents step (step 3), create a temporary form
        if (currentStep === 2 && !tempFormId) {
          try {
            setLoading(true);
            const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
            if (!selectedCategory) {
              throw new Error('Invalid job category selected');
            }

            const formId = await createForm({
              applicationType: formData.applicationType,
              jobCategory: formData.jobCategory as any,
              position: formData.position,
              organization: formData.organization,
              civilStatus: formData.civilStatus,
            });
            
            setTempFormId(formId);
            setLoading(false);
          } catch (error) {
            console.error('Error creating temporary form:', error);
            Alert.alert('Error', 'Failed to create form. Please try again.');
            setLoading(false);
            return;
          }
        }

        console.log('Moving to next step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
        renderStepIndicator();  // Ensure active step is indicated visually
      } else {
        console.log('Submitting form');
        handleSubmit();
      }
    } else {
      console.log('Validation failed, errors:', errors);
      // Optionally, visually highlight the first error for user prompt
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created. Please try again.');
      return;
    }
    
    setLoading(true);
    try {
      const referenceNumber = paymentReference || `MANUAL-${Date.now()}`;
      await submitApplicationWithPayment(selectedPaymentMethod as any, referenceNumber);
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentMethodSelected = (paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall') => {
    // For digital payments, show reference number input
    if (paymentMethod === 'Gcash' || paymentMethod === 'Maya') {
      Alert.prompt(
        'Payment Reference',
        `Please enter your ${paymentMethod} reference number:`,
        async (referenceNumber) => {
          if (referenceNumber && referenceNumber.trim()) {
            await submitApplicationWithPayment(paymentMethod, referenceNumber.trim());
          } else {
            Alert.alert('Invalid Reference', 'Please provide a valid reference number.');
            setLoading(false);
          }
        }
      );
    } else {
      // For manual payments, just use a placeholder reference
      const referenceNumber = `MANUAL-${Date.now()}`;
      Alert.alert(
        'Manual Payment',
        `Please proceed to ${paymentMethod === 'BaranggayHall' ? 'Barangay Hall' : 'City Hall'} to complete your payment. Your reference number is: ${referenceNumber}`,
        [
          {
            text: 'OK',
            onPress: () => submitApplicationWithPayment(paymentMethod, referenceNumber),
          },
        ]
      );
    }
  };

  const submitApplicationWithPayment = async (
    paymentMethod: 'Gcash' | 'Maya' | 'BaranggayHall' | 'CityHall',
    referenceNumber: string
  ) => {
    try {
      const result = await submitApplication({
        formId: tempFormId as Id<"forms">,
        paymentMethod,
        paymentReferenceNumber: referenceNumber,
      });

      if (result.success) {
        Alert.alert(
          'Application Submitted Successfully!',
          `Your application has been submitted with payment reference: ${referenceNumber}\n\nTotal Amount: ₱${result.totalAmount}\nPayment Method: ${result.paymentMethod}\n\n${result.requiresOrientation ? '📚 Note: Food safety orientation is required for your health card category.' : ''}\n\nYou will receive notifications about your application status.`,
          [
            {
              text: 'View Applications',
              onPress: () => router.push('/(tabs)/application'),
            },
          ]
        );
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(
        'Submission Error',
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Document upload helper functions
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

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
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

    if (!result.canceled && result.assets && result.assets.length > 0 && selectedDocumentId) {
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
    console.log('handleDocumentSelected called with:', { file, documentId });
    
    if (!tempFormId) {
      Alert.alert('Error', 'Form not created yet. Please try again.');
      return;
    }

    if (!file || !file.uri) {
      console.error('Invalid file object:', file);
      Alert.alert('Error', 'Invalid file selected. Please try again.');
      return;
    }

    try {
      // Convert file to the format expected by the upload hook
      console.log('Fetching file blob from:', file.uri);
      const fileBlob = await fetch(file.uri).then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }
        return response.blob();
      });
      
      // Fix file type detection
      let fileType = file.type || file.mimeType || 'image/jpeg';
      if (fileType === 'image') {
        fileType = 'image/jpeg'; // Default to JPEG for generic image type
      }
      
      const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || 
                           fileType.split('/')[1] || 'jpg';
      
      const fileName = file.fileName || file.name || `document_${documentId}.${fileExtension}`;
      console.log('Creating file object:', { fileName, fileType, size: fileBlob.size });
      
      const fileObject = new File([fileBlob], fileName, {
        type: fileType,
      });

      const isReplacing = selectedDocuments[documentId] && uploadedFiles[documentId];
      console.log('Upload mode:', isReplacing ? 'replacing' : 'new upload');
      
      if (isReplacing) {
        // Replace existing file
        const result = await replaceFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      } else {
        // Upload new file
        const result = await uploadFile(fileObject, documentId);
        setUploadedFiles(prev => ({
          ...prev,
          [documentId]: result.storageId,
        }));
      }

      // Update selected documents for UI
      setSelectedDocuments(prev => ({
        ...prev,
        [documentId]: file,
      }));

      console.log('Upload successful for document:', documentId);
      Alert.alert('Success', 'Document uploaded successfully!');
    } catch (error) {
      console.error('Upload error details:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload document. Please try again.');
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const storageId = uploadedFiles[documentId];
    if (!storageId) {
      // If no uploaded file, just remove from local state
      setSelectedDocuments(prev => {
        const newDocs = { ...prev };
        delete newDocs[documentId];
        return newDocs;
      });
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
          onPress: async () => {
            try {
              await removeFile(documentId, storageId);
              
              // Remove from local state
              setSelectedDocuments(prev => {
                const newDocs = { ...prev };
                delete newDocs[documentId];
                return newDocs;
              });
              
              setUploadedFiles(prev => {
                const newFiles = { ...prev };
                delete newFiles[documentId];
                return newFiles;
              });
              
              Alert.alert('Success', 'Document removed successfully!');
            } catch (error) {
              console.error('Remove error:', error);
              Alert.alert('Error', 'Failed to remove document. Please try again.');
            }
          }
        },
      ]
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {STEP_TITLES.map((title, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  index <= currentStep ? styles.stepNumberActive : styles.stepNumberInactive
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              index <= currentStep ? styles.stepTitleActive : styles.stepTitleInactive
            ]}>
              {title}
            </Text>
            {index < STEP_TITLES.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStep ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderApplicationTypeStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Application Type</Text>
        <Text style={styles.stepDescription}>
          Choose whether this is a new application or renewal of an existing health card.
        </Text>
        
        <View style={styles.radioGroup}>
          {(['New', 'Renew'] as ApplicationType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioOption}
              onPress={() => setFormData({ ...formData, applicationType: type })}
            >
              <View style={[
                styles.radioCircle,
                formData.applicationType === type && styles.radioCircleSelected
              ]}>
                {formData.applicationType === type && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <View style={styles.radioContent}>
                <Text style={styles.radioTitle}>{type} Application</Text>
                <Text style={styles.radioSubtitle}>
                  {type === 'New' 
                    ? 'Apply for a new health card' 
                    : 'Renew your existing health card'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderJobCategoryStep = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Select Your Health Card Type</Text>
        <Text style={styles.stepDescription}>
          Based on your job, you need a specific health card color. Choose the one that matches your work.
        </Text>

        {/* Color Guide */}
        <View style={{
          backgroundColor: getColor('background.secondary'),
          padding: getSpacing('md'),
          borderRadius: getBorderRadius('md'),
          marginBottom: getSpacing('lg'),
        }}>
          <Text style={{
            ...getTypography('bodySmall'),
            color: getColor('text.primary'),
            fontWeight: '600',
            marginBottom: getSpacing('sm'),
          }}>Health Card Color Guide:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: getSpacing('sm') }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#F1C40F', marginRight: 6 }} />
              <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Yellow - Food</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#27AE60', marginRight: 6 }} />
              <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Green - Non-Food</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E91E63', marginRight: 6 }} />
              <Text style={{ ...getTypography('caption'), color: getColor('text.secondary') }}>Pink - Skin Contact</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.categoryGrid}>
          {jobCategories?.map((category, index) => {
            const isSelected = formData.jobCategory === category._id;
            const cardColor = category.name.toLowerCase().includes('food') ? 'Yellow' :
                             category.name.toLowerCase().includes('security') || category.name.toLowerCase().includes('non-food') ? 'Green' : 'Pink';
            
            return (
              <TouchableOpacity
                key={category._id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                  { 
                    borderColor: isSelected ? category.colorCode : getColor('border.light'),
                    borderWidth: isSelected ? 3 : 1,
                    backgroundColor: getColor('background.primary'),
                    transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
                  },
                  // Remove the auto-centering for third card - let it flow naturally
                ]}
                onPress={() => {
                  setFormData({ ...formData, jobCategory: category._id });
                  if (errors.jobCategory) {
                    setErrors(prev => ({ ...prev, jobCategory: undefined }));
                  }
                }}
              >
                {/* Card Color Indicator */}
                <View style={{
                  position: 'absolute',
                  top: getSpacing('sm'),
                  right: getSpacing('sm'),
                  backgroundColor: category.colorCode,
                  paddingHorizontal: getSpacing('xs'),
                  paddingVertical: 2,
                  borderRadius: getBorderRadius('xs'),
                }}>
                  <Text style={{
                    ...getTypography('caption'),
                    color: getColor('text.inverse'),
                    fontWeight: '700',
                    fontSize: 10,
                  }}>{cardColor}</Text>
                </View>

                <View style={[
                  styles.categoryIcon,
                  { 
                    backgroundColor: isSelected ? category.colorCode + '30' : category.colorCode + '15',
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? category.colorCode : 'transparent',
                  }
                ]}>
                  <Ionicons 
                    name={category.name.toLowerCase().includes('food') ? 'restaurant' : 
                         category.name.toLowerCase().includes('skin') ? 'hand-left' : 'shield'} 
                    size={28} 
                    color={category.colorCode} 
                  />
                </View>
                
                <Text style={[styles.categoryName, isSelected && { color: category.colorCode }]}>
                  {category.name}
                </Text>
                
                {/* Job Examples */}
                <Text style={{
                  ...getTypography('caption'),
                  color: getColor('text.secondary'),
                  textAlign: 'center',
                  marginTop: getSpacing('xs'),
                  lineHeight: 14,
                }}>
                  {category.name.toLowerCase().includes('food') ? 'Restaurant staff, kitchen workers, food servers' :
                   category.name.toLowerCase().includes('skin') ? 'Barbers, massage therapists, tattoo artists' :
                   'Security guards, office workers, retail staff'}
                </Text>
                
                {category.requireOrientation === 'Yes' && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: getColor('accent.warningOrange') + '20',
                    padding: getSpacing('xs'),
                    borderRadius: getBorderRadius('xs'),
                    marginTop: getSpacing('sm'),
                  }}>
                    <Ionicons name="school-outline" size={12} color={getColor('accent.warningOrange')} />
                    <Text style={{
                      ...getTypography('caption'),
                      color: getColor('accent.warningOrange'),
                      fontWeight: '600',
                      marginLeft: 4,
                      fontSize: 10,
                    }}>Orientation Required</Text>
                  </View>
                )}
                
                {isSelected && (
                  <View style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    backgroundColor: category.colorCode,
                    borderRadius: getBorderRadius('full'),
                    padding: 4,
                  }}>
                    <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {errors.jobCategory && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: getSpacing('md') }}>
            <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
            <Text style={[styles.errorText, { marginLeft: getSpacing('xs') }]}>{errors.jobCategory}</Text>
          </View>
        )}

        {/* Help text based on selection */}
        {formData.jobCategory && (
          <View style={{
            backgroundColor: getColor('accent.medicalBlue') + '10',
            padding: getSpacing('md'),
            borderRadius: getBorderRadius('md'),
            borderLeftWidth: 4,
            borderLeftColor: getColor('accent.medicalBlue'),
            marginTop: getSpacing('sm'),
          }}>
            <Text style={{
              ...getTypography('bodySmall'),
              color: getColor('accent.medicalBlue'),
              fontWeight: '600',
            }}>
              {jobCategories?.find(cat => cat._id === formData.jobCategory)?.requireOrientation === 'Yes' ?
                '📚 Note: Food handlers must complete a mandatory food safety orientation before card issuance.' :
                '✅ Great choice! This category doesn\'t require additional orientation.'
              }
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderPersonalDetailsStep = () => {
    const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
    
    // Smart placeholder suggestions based on job category
    const getSmartPlaceholder = () => {
      if (selectedCategory?.name?.toLowerCase().includes('food')) {
        return "e.g., Food Server, Kitchen Staff, Cashier";
      } else if (selectedCategory?.name?.toLowerCase().includes('security')) {
        return "e.g., Security Guard, Safety Officer";
      } else if (selectedCategory?.name?.toLowerCase().includes('skin')) {
        return "e.g., Barber, Massage Therapist, Tattoo Artist";
      }
      return "e.g., Your job position";
    };

    const getOrganizationPlaceholder = () => {
      if (selectedCategory?.name?.toLowerCase().includes('food')) {
        return "e.g., McDonald's, Jollibee, ABC Restaurant";
      } else if (selectedCategory?.name?.toLowerCase().includes('security')) {
        return "e.g., XYZ Security Agency, ABC Mall";
      }
      return "e.g., Your company name";
    };

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Personal Details</Text>
        <Text style={styles.stepDescription}>
          Complete your {selectedCategory?.name || 'job'} application details.
        </Text>

        {/* Auto-fill from profile notice */}
        {userProfile && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getColor('accent.medicalBlue') + '10',
            padding: getSpacing('sm'),
            borderRadius: getBorderRadius('md'),
            marginBottom: getSpacing('md'),
          }}>
            <Ionicons name="person-circle-outline" size={20} color={getColor('accent.medicalBlue')} />
            <Text style={{
              ...getTypography('bodySmall'),
              color: getColor('accent.medicalBlue'),
              marginLeft: getSpacing('xs'),
              flex: 1,
            }}>
              Using profile info for {user?.firstName} {user?.lastName}
            </Text>
          </View>
        )}
        
        <View style={styles.formGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('xs') }}>
            <Text style={styles.label}>Position/Job Title</Text>
            <Text style={{ color: getColor('semantic.error'), marginLeft: 4 }}>*</Text>
          </View>
          <CustomTextInput
            value={formData.position}
            onChangeText={(text) => {
              setFormData({ ...formData, position: text });
              // Clear error on input
              if (errors.position && text.trim()) {
                setErrors(prev => ({ ...prev, position: undefined }));
              }
            }}
            placeholder={getSmartPlaceholder()}
            style={[styles.input, errors.position && { borderColor: getColor('semantic.error') }]}
            autoCapitalize="words"
          />
          {errors.position && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: getSpacing('xs') }}>
              <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
              <Text style={[styles.errorText, { marginLeft: getSpacing('xs') }]}>{errors.position}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: getSpacing('xs') }}>
            <Text style={styles.label}>Organization/Company</Text>
            <Text style={{ color: getColor('semantic.error'), marginLeft: 4 }}>*</Text>
          </View>
          <CustomTextInput
            value={formData.organization}
            onChangeText={(text) => {
              setFormData({ ...formData, organization: text });
              // Clear error on input
              if (errors.organization && text.trim()) {
                setErrors(prev => ({ ...prev, organization: undefined }));
              }
            }}
            placeholder={getOrganizationPlaceholder()}
            style={[styles.input, errors.organization && { borderColor: getColor('semantic.error') }]}
            autoCapitalize="words"
          />
          {errors.organization && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: getSpacing('xs') }}>
              <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
              <Text style={[styles.errorText, { marginLeft: getSpacing('xs') }]}>{errors.organization}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Civil Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
            {CIVIL_STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.civilStatusOption,
                  formData.civilStatus === status && styles.civilStatusOptionSelected
                ]}
                onPress={() => setFormData({ ...formData, civilStatus: status })}
              >
                <Text style={[
                  styles.civilStatusText,
                  formData.civilStatus === status && styles.civilStatusTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Progress encouragement */}
        <View style={{
          backgroundColor: getColor('accent.safetyGreen') + '10',
          padding: getSpacing('sm'),
          borderRadius: getBorderRadius('md'),
          borderLeftWidth: 4,
          borderLeftColor: getColor('accent.safetyGreen'),
          marginTop: getSpacing('md'),
        }}>
          <Text style={{
            ...getTypography('bodySmall'),
            color: getColor('accent.safetyGreen'),
            fontWeight: '600',
          }}>
            📝 You're doing great! Next step will be document upload.
          </Text>
        </View>
      </View>
    );
  };

  const renderUploadDocumentsStep = () => {
    // Get document requirements from job category
    const documentRequirements = requirementsByJobCategory?.requirements || [];
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Upload Documents</Text>
        <Text style={styles.stepDescription}>
          Please upload clear and readable copies of all required medical documents
          to ensure proper processing of your {formData.applicationType?.toLowerCase()} application.
        </Text>
        
        {/* Instructions */}
        <View style={[styles.formGroup, { marginBottom: getSpacing('md') }]}>
          <View style={{
            flexDirection: 'row',
            padding: getSpacing('md'),
            backgroundColor: getColor('semanticUI.infoCard'),
            borderRadius: getBorderRadius('md'),
          }}>
            <Ionicons name="information-circle-outline" size={24} color={getColor('primary.500')} />
            <View style={{ flex: 1, marginLeft: getSpacing('sm') }}>
              <Text style={{
...getTypography('body'),
                color: getColor('primary.500'),
                fontWeight: '600',
                marginBottom: getSpacing('xs'),
              }}>Document Requirements</Text>
              <Text style={{
                ...getTypography('bodySmall'),
                color: getColor('primary.500'),
                lineHeight: 16,
              }}>⚠️ Note: Documents must be from accredited clinics and laboratories. Accepted formats: JPG, PNG, PDF</Text>
            </View>
          </View>
        </View>
        
        {/* Document List */}
        <View style={{ marginBottom: getSpacing('lg') }}>
          {documentRequirements.map((document, index) => (
            <View key={document.fieldName || `doc-${index}`} style={{
              backgroundColor: getColor('background.primary'),
              borderRadius: getBorderRadius('md'),
              padding: getSpacing('md'),
              marginBottom: getSpacing('md'),
              ...getShadow('card'),
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: getSpacing('sm'),
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
...getTypography('body'),
                    fontWeight: '600',
                    color: getColor('text.primary'),
                    marginBottom: getSpacing('xs'),
                  }}>
                    {document.name}
                    {document.required && <Text style={{ color: getColor('semantic.error') }}> *</Text>}
                  </Text>
                  <Text style={{
                    ...getTypography('bodyMedium'),
                    color: getColor('text.secondary'),
                    marginBottom: getSpacing('xs'),
                  }}>{document.description}</Text>
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('text.secondary'),
                    fontStyle: 'italic',
                  }}>
                    Formats: {document.formats ? document.formats.join(', ').toUpperCase() : 'JPG, PNG, PDF'}
                  </Text>
                </View>
                <View style={{ marginLeft: getSpacing('sm') }}>
                  {selectedDocuments[document.fieldName] ? (
                    <Ionicons name="checkmark-circle" size={24} color={getColor('semantic.success')} />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color={getColor('text.secondary')} />
                  )}
                </View>
              </View>

              {/* Upload Progress */}
              {getUploadState(document.fieldName)?.uploading && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: getSpacing('sm'),
                }}>
                  <View style={{
                    flex: 1,
                    height: 4,
                    backgroundColor: getColor('border.light'),
                    borderRadius: getBorderRadius('xs'),
                    marginRight: getSpacing('sm'),
                  }}>
                    <View style={{
                      height: '100%',
                      backgroundColor: getColor('primary.500'),
                      borderRadius: getBorderRadius('xs'),
                      width: `${getUploadState(document.fieldName).progress}%`,
                    }} />
                  </View>
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('text.secondary'),
                    minWidth: 35,
                  }}>
                    {getUploadState(document.fieldName).progress}%
                  </Text>
                </View>
              )}

              {/* Error State */}
              {getUploadState(document.fieldName)?.error && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: getColor('semanticUI.dangerCard'),
                  padding: getSpacing('sm'),
                  borderRadius: getBorderRadius('sm'),
                  marginBottom: getSpacing('sm'),
                }}>
                  <Ionicons name="alert-circle" size={16} color={getColor('semantic.error')} />
                  <Text style={{
                    ...getTypography('bodySmall'),
                    color: getColor('semantic.error'),
                    flex: 1,
                    marginLeft: getSpacing('xs'),
                  }}>
                    {getUploadState(document.fieldName).error}
                  </Text>
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: getSpacing('sm'),
                      paddingVertical: getSpacing('xs'),
                      borderRadius: getBorderRadius('xs'),
                      backgroundColor: getColor('semantic.error'),
                      marginLeft: getSpacing('sm'),
                    }}
                    onPress={() => selectedDocuments[document.fieldName] && retryUpload(selectedDocuments[document.fieldName], document.fieldName)}
                  >
                    <Text style={{
                      ...getTypography('bodySmall'),
                      color: getColor('background.primary'),
                      fontWeight: '600',
                    }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Document Preview */}
              {selectedDocuments[document.fieldName] && !getUploadState(document.fieldName)?.uploading && (
                <View style={{
                  position: 'relative',
                  marginBottom: getSpacing('sm'),
                }}>
                  <Image
                    source={{ uri: selectedDocuments[document.fieldName].uri }}
                    style={{
                      width: '100%',
                      height: 120,
                      borderRadius: getBorderRadius('sm'),
                      backgroundColor: getColor('background.secondary'),
                    }}
                  />
                  <TouchableOpacity 
                    style={{
                      position: 'absolute',
                      top: getSpacing('sm'),
                      right: getSpacing('sm'),
                      backgroundColor: getColor('background.primary'),
                      borderRadius: getBorderRadius('sm'),
                      padding: getSpacing('xs'),
                    }}
                    onPress={() => handleRemoveDocument(document.fieldName)}
                  >
                    <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: getSpacing('lg'),
                    paddingVertical: getSpacing('sm'),
                    borderRadius: getBorderRadius('sm'),
                    borderWidth: 1,
                    borderColor: getColor('primary.500'),
                    backgroundColor: getColor('background.primary'),
                  }}
                  onPress={() => handleDocumentPicker(document.fieldName)}
                  disabled={getUploadState(document.fieldName)?.uploading}
                >
                  <Ionicons 
                    name={selectedDocuments[document.fieldName] ? "refresh" : "cloud-upload-outline"} 
                    size={20} 
                    color={getColor('primary.500')} 
                  />
                  <Text style={{
                    ...getTypography('bodyMedium'),
                    color: getColor('primary.500'),
                    fontWeight: '600',
                    marginLeft: getSpacing('sm'),
                  }}>
                    {selectedDocuments[document.fieldName] ? 'Replace' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPaymentMethodStep = () => {
    const paymentMethods = [
      {
        id: 'Gcash',
        name: 'GCash',
        icon: 'card-outline',
        description: 'Pay instantly with GCash',
        requiresReference: true,
        bgColor: getColor('accent.primaryGreen') + '10',
        iconColor: getColor('accent.primaryGreen'),
      },
      {
        id: 'Maya',
        name: 'Maya',
        icon: 'card-outline', 
        description: 'Pay instantly with Maya',
        requiresReference: true,
        bgColor: getColor('accent.medicalBlue') + '10',
        iconColor: getColor('accent.medicalBlue'),
      },
      {
        id: 'BaranggayHall',
        name: 'Barangay Hall',
        icon: 'business-outline',
        description: 'Pay in person at your local Barangay Hall',
        requiresReference: false,
        bgColor: getColor('accent.warningOrange') + '10',
        iconColor: getColor('accent.warningOrange'),
      },
      {
        id: 'CityHall',
        name: 'City Hall',
        icon: 'library-outline',
        description: 'Pay in person at Davao City Hall',
        requiresReference: false,
        bgColor: getColor('accent.safetyGreen') + '10',
        iconColor: getColor('accent.safetyGreen'),
      },
    ] as const;

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Payment Method</Text>
        <Text style={styles.stepDescription}>
          Choose how you'd like to pay the ₱60 application fee (₱50 + ₱10 processing fee).
        </Text>

        {/* Fee Breakdown */}
        <View style={{
          backgroundColor: getColor('background.secondary'),
          padding: getSpacing('md'),
          borderRadius: getBorderRadius('md'),
          marginBottom: getSpacing('lg'),
        }}>
          <Text style={{
            ...getTypography('bodySmall'),
            color: getColor('text.primary'),
            fontWeight: '600',
            marginBottom: getSpacing('sm'),
          }}>Fee Breakdown:</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ ...getTypography('bodySmall'), color: getColor('text.secondary') }}>Application Fee:</Text>
            <Text style={{ ...getTypography('bodySmall'), color: getColor('text.primary') }}>₱50.00</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ ...getTypography('bodySmall'), color: getColor('text.secondary') }}>Processing Fee:</Text>
            <Text style={{ ...getTypography('bodySmall'), color: getColor('text.primary') }}>₱10.00</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: getSpacing('xs'), borderTopWidth: 1, borderTopColor: getColor('border.light') }}>
            <Text style={{ ...getTypography('bodyMedium'), color: getColor('text.primary'), fontWeight: '700' }}>Total:</Text>
            <Text style={{ ...getTypography('bodyMedium'), color: getColor('text.primary'), fontWeight: '700' }}>₱60.00</Text>
          </View>
        </View>

        {/* Payment Method Options */}
        <View style={{ gap: getSpacing('md') }}>
          {paymentMethods.map((method) => {
            const isSelected = selectedPaymentMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={{
                  backgroundColor: getColor('background.primary'),
                  borderWidth: isSelected ? 3 : 1,
                  borderColor: isSelected ? method.iconColor : getColor('border.light'),
                  borderRadius: getBorderRadius('lg'),
                  padding: getSpacing('md'),
                  ...getShadow('small'),
                  transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
                }}
                onPress={() => {
                  setSelectedPaymentMethod(method.id as any);
                  if (!method.requiresReference) {
                    setPaymentReference(`MANUAL-${Date.now()}`);
                  } else {
                    setPaymentReference('');
                  }
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: getBorderRadius('full'),
                    backgroundColor: method.iconColor + '20',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: getSpacing('md'),
                  }}>
                    <Ionicons name={method.icon as any} size={24} color={method.iconColor} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      ...getTypography('bodyMedium'),
                      color: getColor('text.primary'),
                      fontWeight: '600',
                      marginBottom: 2,
                    }}>{method.name}</Text>
                    <Text style={{
                      ...getTypography('bodySmall'),
                      color: getColor('text.secondary'),
                      lineHeight: 16,
                    }}>{method.description}</Text>
                  </View>

                  {isSelected && (
                    <View style={{
                      backgroundColor: method.iconColor,
                      borderRadius: getBorderRadius('full'),
                      padding: 4,
                    }}>
                      <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reference Number Input for Digital Payments */}
        {(selectedPaymentMethod === 'Gcash' || selectedPaymentMethod === 'Maya') && (
          <View style={{ marginTop: getSpacing('lg') }}>
            <Text style={styles.label}>Payment Reference Number</Text>
            <CustomTextInput
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholder={`Enter your ${selectedPaymentMethod} reference number`}
              style={styles.input}
              autoCapitalize="none"
            />
            <Text style={{
              ...getTypography('caption'),
              color: getColor('text.secondary'),
              marginTop: getSpacing('xs'),
            }}>
              Complete your payment on {selectedPaymentMethod} first, then enter the reference number here.
            </Text>
          </View>
        )}

        {/* Manual Payment Instructions */}
        {(selectedPaymentMethod === 'BaranggayHall' || selectedPaymentMethod === 'CityHall') && (
          <View style={{
            backgroundColor: getColor('accent.warningOrange') + '10',
            padding: getSpacing('md'),
            borderRadius: getBorderRadius('md'),
            borderLeftWidth: 4,
            borderLeftColor: getColor('accent.warningOrange'),
            marginTop: getSpacing('lg'),
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="information-circle" size={20} color={getColor('accent.warningOrange')} />
              <View style={{ flex: 1, marginLeft: getSpacing('sm') }}>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('accent.warningOrange'),
                  fontWeight: '600',
                  marginBottom: getSpacing('xs'),
                }}>Payment Instructions:</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('accent.warningOrange'),
                  lineHeight: 18,
                }}>
                  After submitting this application, visit {selectedPaymentMethod === 'BaranggayHall' ? 'your local Barangay Hall' : 'Davao City Hall'} to complete your ₱60 payment. Bring your application reference number.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderReviewStep = () => {
    const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
    const documentRequirements = requirementsByJobCategory?.requirements || [];
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
                style={{
                  paddingHorizontal: getSpacing('sm'),
                  paddingVertical: getSpacing('xs'),
                  borderRadius: getBorderRadius('sm'),
                  backgroundColor: getColor('primary.50'),
                  borderWidth: 1,
                  borderColor: getColor('primary.500'),
                }}
                onPress={() => setCurrentStep(0)}
              >
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('primary.500'),
                  fontWeight: '600',
                }}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Type:</Text>
              <Text style={styles.reviewValue}>{formData.applicationType} Application</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Job Category:</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: selectedCategory?.colorCode || '#999',
                  marginRight: getSpacing('sm'),
                }} />
                <Text style={styles.reviewValue}>{selectedCategory?.name}</Text>
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
                style={{
                  paddingHorizontal: getSpacing('sm'),
                  paddingVertical: getSpacing('xs'),
                  borderRadius: getBorderRadius('sm'),
                  backgroundColor: getColor('primary.50'),
                  borderWidth: 1,
                  borderColor: getColor('primary.500'),
                }}
                onPress={() => setCurrentStep(3)}
              >
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('primary.500'),
                  fontWeight: '600',
                }}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            {/* Document Status Overview */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: getSpacing('md'),
              padding: getSpacing('md'),
              backgroundColor: getColor('background.secondary'),
              borderRadius: getBorderRadius('md'),
            }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.success'),
                  fontWeight: '700',
                }}>{uploadedDocuments.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Uploaded</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.error'),
                  fontWeight: '700',
                }}>{missingDocuments.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Missing</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  ...getTypography('headingSmall'),
                  color: getColor('semantic.warning'),
                  fontWeight: '700',
                }}>{documentsWithErrors.length}</Text>
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('text.secondary'),
                }}>Errors</Text>
              </View>
            </View>
            
            {/* Individual Document Status */}
            {documentRequirements.map((document, index) => {
              const isUploaded = selectedDocuments[document.fieldName];
              const hasError = getUploadState(document.fieldName)?.error;
              const isUploading = getUploadState(document.fieldName)?.uploading;
              
              return (
                <View key={document.fieldName || `review-doc-${index}`} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: getSpacing('sm'),
                  borderBottomWidth: 1,
                  borderBottomColor: getColor('border.light'),
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      ...getTypography('bodyMedium'),
                      color: getColor('text.primary'),
                      fontWeight: '600',
                    }}>
                      {document.name}
                      {document.required && <Text style={{ color: getColor('semantic.error') }}> *</Text>}
                    </Text>
                    {isUploaded && (
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('text.secondary'),
                      }}>
                        File: {selectedDocuments[document.fieldName].name || 'uploaded'}
                      </Text>
                    )}
                  </View>
                  
                  {isUploading ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="hourglass" size={20} color={getColor('semantic.warning')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.warning'),
                      }}>Uploading...</Text>
                    </View>
                  ) : hasError ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="alert-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.error'),
                      }}>Error</Text>
                    </View>
                  ) : isUploaded ? (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="checkmark-circle" size={20} color={getColor('semantic.success')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.success'),
                      }}>Uploaded</Text>
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="close-circle" size={20} color={getColor('semantic.error')} />
                      <Text style={{
                        ...getTypography('bodySmall'),
                        color: getColor('semantic.error'),
                      }}>Missing</Text>
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
              As per eMediCard documentation: ₱10 transaction fee included for processing costs.
            </Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Application Fee:</Text>
              <Text style={styles.reviewValue}>₱50.00</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Transaction Fee:</Text>
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
            <View style={{
              backgroundColor: getColor('semanticUI.dangerCard'),
              padding: getSpacing('md'),
              borderRadius: getBorderRadius('md'),
              marginTop: getSpacing('md'),
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: getSpacing('sm'),
              }}>
                <Ionicons name="warning" size={20} color={getColor('semantic.error')} />
                <Text style={{
                  ...getTypography('bodyMedium'),
                  color: getColor('semantic.error'),
                  fontWeight: '600',
                  marginLeft: getSpacing('sm'),
                }}>Application Incomplete</Text>
              </View>
              
              {missingDocuments.length > 0 && (
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('semantic.error'),
                  marginBottom: getSpacing('xs'),
                }}>Missing required documents: {missingDocuments.map(doc => doc.name).join(', ')}</Text>
              )}
              
              {documentsWithErrors.length > 0 && (
                <Text style={{
                  ...getTypography('bodySmall'),
                  color: getColor('semantic.error'),
                }}>Please fix upload errors before submitting.</Text>
              )}
            </View>
          )}
          
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
        </View>
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderApplicationTypeStep();
      case 1:
        return renderJobCategoryStep();
      case 2:
        return renderPersonalDetailsStep();
      case 3:
        return renderUploadDocumentsStep();
      case 4:
        return renderPaymentMethodStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#212529" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Application</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Content with Keyboard Avoiding */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingBottom: 120, // Extra space for fixed navigation buttons + tab bar
            flexGrow: 1 // Ensure content can expand
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentWrapper}>
            {renderCurrentStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons - Fixed at bottom */}
      <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.previousButton} 
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {/* Navigation Button with proper validation */}
          <TouchableOpacity
            style={[{
              backgroundColor: loading ? '#999' : '#2E86AB',
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 8,
              flex: 1,
              marginLeft: currentStep > 0 ? 0 : 0,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
              {loading ? 'Loading...' : (currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next')}
            </Text>
          </TouchableOpacity>
          
          {/* Original CustomButton (hidden for debugging) */}
          {false && (
            <CustomButton
              title={currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next'}
              onPress={handleNext}
              loading={loading}
              style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
            />
          )}
        </View>
        
        {/* Image Picker Modal */}
        <Modal
          visible={showImagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowImagePicker(false)}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              backgroundColor: getColor('background.primary'),
              borderTopLeftRadius: getBorderRadius('xl'),
              borderTopRightRadius: getBorderRadius('xl'),
              padding: getSpacing('lg'),
            }}>
              <Text style={{
...getTypography('h4'),
                color: getColor('text.primary'),
                textAlign: 'center',
                marginBottom: getSpacing('lg'),
              }}>Select Document Source</Text>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickFromCamera}>
                <Ionicons name="camera" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickFromGallery}>
                <Ionicons name="images" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: getSpacing('md'),
                paddingHorizontal: getSpacing('lg'),
                borderRadius: getBorderRadius('lg'),
                backgroundColor: getColor('background.secondary'),
                marginBottom: getSpacing('sm'),
              }} onPress={pickDocument}>
                <Ionicons name="document" size={24} color={getColor('primary.500')} />
                <Text style={{
...getTypography('body'),
                  color: getColor('text.primary'),
                  marginLeft: getSpacing('md'),
                }}>Select File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{
                  paddingVertical: getSpacing('md'),
                  alignItems: 'center',
                }}
                onPress={() => setShowImagePicker(false)}
              >
                <Text style={{
...getTypography('body'),
                  color: getColor('semantic.error'),
                  fontWeight: '600',
                }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}
>>>>>>> 05b3e18 (UI Improvement and Bug fixes)
