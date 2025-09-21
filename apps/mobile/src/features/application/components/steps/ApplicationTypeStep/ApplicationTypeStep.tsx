import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplicationTypeStepProps, ApplicationType } from './ApplicationTypeStep.types';
import styles from './ApplicationTypeStep.styles';
import { getColor } from '@shared/styles/theme';

export const ApplicationTypeStep: React.FC<ApplicationTypeStepProps> = ({ value, onChange }) => {
  const renderOption = (type: ApplicationType, icon: string, title: string, description: string) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        value === type && styles.optionCardSelected
      ]}
      onPress={() => onChange(type)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        value === type && styles.iconContainerSelected
      ]}>
        <Ionicons 
          name={icon as any} 
          size={32} 
          color={value === type ? getColor('white') : getColor('primary.500')} 
        />
      </View>
      <View style={styles.optionContent}>
        <Text style={[
          styles.optionTitle,
          value === type && styles.optionTitleSelected
        ]}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <View style={[
        styles.radioButton,
        value === type && styles.radioButtonSelected
      ]}>
        {value === type && (
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
    </View>
  );
};
