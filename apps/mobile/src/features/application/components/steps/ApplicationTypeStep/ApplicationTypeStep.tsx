import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ApplicationTypeStepProps } from './ApplicationTypeStep.types';
import type { ApplicationType } from '../../../types';
import styles from './ApplicationTypeStep.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

export const ApplicationTypeStep: React.FC<ApplicationTypeStepProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  const handleTypeSelection = (type: ApplicationType) => {
    setFormData({ ...formData, applicationType: type });
    
    // If user selects Renew, navigate directly to card selection screen
    if (type === 'Renew') {
      router.push('/(screens)/(shared)/renewal/select-card');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Application Type</Text>
      <Text style={styles.subtitle}>
        Choose whether this is a new application or renewal of an existing health card.
      </Text>
      
      <View style={styles.optionsContainer}>
        {(['New', 'Renew'] as ApplicationType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.radioOption,
              formData.applicationType === type && styles.radioOptionSelected
            ]}
            onPress={() => handleTypeSelection(type)}
            activeOpacity={0.7}
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
