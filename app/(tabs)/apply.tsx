import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CustomTextInput, CustomButton } from '../../src/components';
import { styles } from '../../assets/styles/tabs-styles/apply';

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

  // Convex queries and mutations
  const jobCategories = useQuery(api.jobCategories?.getAllJobCategories);
  const createForm = useMutation(api.forms.createForm);
  const userProfile = useQuery(api.users.getCurrentUser);

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
        // Review step - validation already done
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEP_TITLES.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    try {
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

      Alert.alert(
        'Application Submitted',
        'Your application has been submitted successfully. You will receive a notification once it is reviewed.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/application')
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
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
          Choose the category that best describes your job. eMediCard uses color-coded classifications:
          Yellow (Food Handlers), Green (Non-Food Workers), Pink (Skin-to-Skin Contact Jobs).
        </Text>
        <Text style={styles.categoryNote}>
          📋 Reference: As defined in eMediCard project documentation for Davao City health card system.
        </Text>
        
        <View style={styles.categoryGrid}>
          {jobCategories?.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryCard,
                formData.jobCategory === category._id && styles.categoryCardSelected,
                { borderColor: category.colorCode }
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
              <Text style={styles.categoryRequirement}>
                {category.requireOrientation === 'yes' 
                  ? '📚 Mandatory Food Safety Orientation Required' 
                  : '✓ No Orientation Required'
                }
              </Text>
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

  const renderReviewStep = () => {
    const selectedCategory = jobCategories?.find(cat => cat._id === formData.jobCategory);
    
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepHeading}>Review & Submit</Text>
        <Text style={styles.stepDescription}>
          Please review your application details before submitting.
        </Text>
        
        <View style={styles.reviewCard}>
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Application Details</Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Type:</Text>
              <Text style={styles.reviewValue}>{formData.applicationType} Application</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Job Category:</Text>
              <Text style={styles.reviewValue}>{selectedCategory?.name}</Text>
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
          
          {selectedCategory?.requireOrientation === 'yes' && (
            <View style={styles.orientationNotice}>
              <Ionicons name="information-circle" size={20} color="#F18F01" />
              <Text style={styles.orientationText}>
                🟡 Yellow Card Requirement: Food handlers must attend mandatory food safety orientation 
                with a sanitary inspector as per eMediCard system requirements.
              </Text>
            </View>
          )}
        </View>
      </View>
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
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
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

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.previousButton} 
              onPress={handlePrevious}
            >
              <Text style={styles.previousButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <CustomButton
            title={currentStep === STEP_TITLES.length - 1 ? 'Submit Application' : 'Next'}
            onPress={handleNext}
            loading={loading}
            style={[styles.nextButton, currentStep === 0 && styles.nextButtonFull]}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
