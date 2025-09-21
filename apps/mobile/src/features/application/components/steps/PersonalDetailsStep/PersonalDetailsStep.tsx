import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonalDetailsStepProps } from './PersonalDetailsStep.types';
import styles from './PersonalDetailsStep.styles';
import { getColor } from '@/src/styles/theme';

const CIVIL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Annulled'
];

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ 
  value, 
  onChange,
  errors = {}
}) => {
  const handleFieldChange = (field: keyof typeof value, text: string) => {
    onChange({
      ...value,
      [field]: text
    });
  };

  const renderInput = (
    label: string,
    field: keyof typeof value,
    placeholder: string,
    icon: string,
    multiline = false
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputContainer,
        errors[field] && styles.inputContainerError,
        multiline && styles.inputContainerMultiline
      ]}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={errors[field] ? getColor('semantic.error') : getColor('text.secondary')} 
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value[field]}
          onChangeText={(text) => handleFieldChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor={getColor('text.placeholder')}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      </View>
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Personal Details</Text>
        <Text style={styles.subtitle}>
          Please provide your employment and personal information
        </Text>

        {renderInput(
          'Position/Job Title',
          'position',
          'e.g. Software Developer, Teacher, Nurse',
          'briefcase-outline'
        )}

        {renderInput(
          'Organization/Company',
          'organization',
          'e.g. ABC Corporation, XYZ Hospital',
          'business-outline',
          true
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Civil Status</Text>
          <View style={styles.civilStatusContainer}>
            {CIVIL_STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.civilStatusOption,
                  value.civilStatus === status && styles.civilStatusOptionSelected
                ]}
                onPress={() => handleFieldChange('civilStatus', status)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.civilStatusText,
                  value.civilStatus === status && styles.civilStatusTextSelected
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.civilStatus && (
            <Text style={styles.errorText}>{errors.civilStatus}</Text>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons 
            name="information-circle" 
            size={20} 
            color={getColor('primary.500')} 
          />
          <Text style={styles.infoText}>
            This information is required for your health card application and will be kept confidential.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
