import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonalDetailsStepProps } from './PersonalDetailsStep.types';
import styles from './PersonalDetailsStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';
import { useUser } from '@clerk/clerk-expo';

type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  formData,
  setFormData,
  errors,
  jobCategoriesData = [],
}) => {
  const { user } = useUser();
  const selectedCategory = jobCategoriesData?.find(cat => cat._id === formData.jobCategory);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Details</Text>
      <Text style={styles.subtitle}>
        Complete your {selectedCategory?.name || 'job'} application details.
      </Text>

      {/* Auto-fill from profile notice */}
      {user && (
        <View style={styles.infoBox}>
          <Ionicons name="person-circle-outline" size={moderateScale(20)} color={theme.colors.brand.secondary} />
          <Text style={styles.infoText}>
            Using profile info for {user?.firstName} {user?.lastName}
          </Text>
        </View>
      )}
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Position/Job Title</Text>
        <View style={[
          styles.inputContainer,
          errors.position && styles.inputContainerError
        ]}>
          <Ionicons 
            name="briefcase-outline" 
            size={moderateScale(20)} 
            color={errors.position ? theme.colors.semantic.error : theme.colors.text.secondary} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
            placeholder="e.g., Your job position"
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="words"
          />
        </View>
        {errors.position && (
          <Text style={styles.errorText}>{errors.position}</Text>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Organization/Company</Text>
        <View style={[
          styles.inputContainer,
          errors.organization && styles.inputContainerError
        ]}>
          <Ionicons 
            name="business-outline" 
            size={moderateScale(20)} 
            color={errors.organization ? theme.colors.semantic.error : theme.colors.text.secondary} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.organization}
            onChangeText={(text) => setFormData({ ...formData, organization: text })}
            placeholder="e.g., Your company name"
            placeholderTextColor={theme.colors.text.tertiary}
            autoCapitalize="words"
          />
        </View>
        {errors.organization && (
          <Text style={styles.errorText}>{errors.organization}</Text>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Civil Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
          {CIVIL_STATUS_OPTIONS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.civilStatusOption,
                formData.civilStatus === status && styles.civilStatusOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, civilStatus: status })}
              activeOpacity={0.7}
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
