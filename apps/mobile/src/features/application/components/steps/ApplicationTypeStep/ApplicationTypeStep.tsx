import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationTypeStepProps, ApplicationType } from './ApplicationTypeStep.types';
import styles from './ApplicationTypeStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

export const ApplicationTypeStep: React.FC<ApplicationTypeStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const renderOption = (type: ApplicationType, icon: string, title: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        formData.applicationType === type && styles.optionCardSelected
      ]}
      onPress={() => setFormData({ ...formData, applicationType: type })}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        formData.applicationType === type && styles.iconContainerSelected
      ]}>
        <Ionicons 
          name={icon as any} 
          size={moderateScale(32)} 
          color={formData.applicationType === type ? theme.colors.background.primary : theme.colors.brand.secondary} 
        />
      </View>
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionTitle,
          formData.applicationType === type && styles.optionTitleSelected
        ]}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[
        styles.radioButton,
        formData.applicationType === type && styles.radioButtonSelected
      ]}>
        {formData.applicationType === type && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Application Type</Text>
      <Text style={styles.subtitle}>
        Choose whether you're applying for a new health card or renewing an existing one
      </Text>
      
      <View style={styles.optionsContainer}>
        {renderOption(
          'New',
          'add-circle-outline',
          'New Application',
          'Apply for your first eHealth Card'
        )}
        
        {renderOption(
          'Renew',
          'refresh-outline',
          'Renewal',
          'Renew your existing eHealth Card'
        )}
      </View>
      
      {errors.applicationType && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={moderateScale(16)} color={theme.colors.semantic.error} />
          <Text style={styles.errorText}>
            {errors.applicationType}
          </Text>
        </View>
      )}
    </View>
  );
};
