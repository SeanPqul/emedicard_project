import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';
import { styles } from '../../../styles/screens/tabs-apply-forms';
import { CustomTextInput } from '../../../components/';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../../styles/theme';
import { JobCategory } from '../../../types/domain/application';

type ApplicationType = 'New' | 'Renew';
type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

interface ApplicationFormData {
  applicationType: ApplicationType;
  jobCategory: string;
  position: string;
  organization: string;
  civilStatus: CivilStatus;
}

interface PersonalDetailsStepProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  errors: Record<string, string>;
  jobCategoriesData?: JobCategory[];
}

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  formData,
  setFormData,
  errors,
  jobCategoriesData = [],
}) => {
  const { user } = useUser();
  const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);
  
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
      {user && (
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
              // Note: We don't have access to setErrors here, but this matches prototype behavior
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
              // Note: We don't have access to setErrors here, but this matches prototype behavior
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

    </View>
  );
};