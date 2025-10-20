import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonalDetailsStepProps } from './PersonalDetailsStep.types';
import styles from './PersonalDetailsStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';
import { useUser } from '@clerk/clerk-expo';

type CivilStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';
type Gender = 'Male' | 'Female' | 'Other';

const CIVIL_STATUS_OPTIONS: CivilStatus[] = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

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

      {/* Info notice for legal name */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={moderateScale(20)} color={theme.colors.brand.secondary} />
        <Text style={styles.infoText}>
          Please enter your full legal name as it appears on your valid ID
        </Text>
      </View>
      
      {/* Name Fields - Always Required */}
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.inputLabel}>First Name</Text>
          <Text style={{ color: theme.colors.semantic.error, marginLeft: moderateScale(4) }}>*</Text>
        </View>
        <View style={[
          styles.inputContainer,
          errors.firstName && styles.inputContainerError
        ]}>
          <Ionicons 
            name="person-outline" 
            size={moderateScale(20)} 
            color={errors.firstName ? theme.colors.semantic.error : '#6B7280'} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.firstName}
            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            placeholder="Enter your legal first name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
        {errors.firstName && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
            <Text style={styles.errorText}>{errors.firstName}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.inputLabel}>Last Name</Text>
          <Text style={{ color: theme.colors.semantic.error, marginLeft: moderateScale(4) }}>*</Text>
        </View>
        <View style={[
          styles.inputContainer,
          errors.lastName && styles.inputContainerError
        ]}>
          <Ionicons 
            name="person-outline" 
            size={moderateScale(20)} 
            color={errors.lastName ? theme.colors.semantic.error : '#6B7280'} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.lastName}
            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            placeholder="Enter your legal last name"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
        {errors.lastName && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
            <Text style={styles.errorText}>{errors.lastName}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.inputLabel}>Position/Job Title</Text>
          <Text style={{ color: theme.colors.semantic.error, marginLeft: moderateScale(4) }}>*</Text>
        </View>
        <View style={[
          styles.inputContainer,
          errors.position && styles.inputContainerError
        ]}>
          <Ionicons 
            name="briefcase-outline" 
            size={moderateScale(20)} 
            color={errors.position ? theme.colors.semantic.error : '#6B7280'} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
            placeholder="e.g., Food Handler, Security Guard"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
        {errors.position && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
            <Text style={styles.errorText}>{errors.position}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.inputLabel}>Organization/Company</Text>
          <Text style={{ color: theme.colors.semantic.error, marginLeft: moderateScale(4) }}>*</Text>
        </View>
        <View style={[
          styles.inputContainer,
          errors.organization && styles.inputContainerError
        ]}>
          <Ionicons 
            name="business-outline" 
            size={moderateScale(20)} 
            color={errors.organization ? theme.colors.semantic.error : '#6B7280'} 
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={formData.organization}
            onChangeText={(text) => setFormData({ ...formData, organization: text })}
            placeholder="e.g., ABC Restaurant, XYZ Mall"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
          />
        </View>
        {errors.organization && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
            <Text style={styles.errorText}>{errors.organization}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.inputLabel}>Gender</Text>
          <Text style={{ color: theme.colors.semantic.error, marginLeft: moderateScale(4) }}>*</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.civilStatusContainer}>
          {GENDER_OPTIONS.map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.civilStatusOption,
                formData.gender === gender && styles.civilStatusOptionSelected
              ]}
              onPress={() => setFormData({ ...formData, gender })}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.civilStatusText,
                formData.gender === gender && styles.civilStatusTextSelected
              ]}>
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {errors.gender && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: moderateScale(8) }}>
            <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
            <Text style={styles.errorText}>{errors.gender}</Text>
          </View>
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
