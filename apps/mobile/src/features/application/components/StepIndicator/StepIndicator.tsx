import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StepIndicatorProps } from './StepIndicator.types';
import { styles } from './StepIndicator.styles';
import { theme } from '@shared/styles/theme';
import { moderateScale } from '@shared/utils/responsive';

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  stepTitles 
}) => {
  return (
    <View style={styles.stepIndicator}>
      {stepTitles.map((title, index) => (
        <View key={index} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            index <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            {index < currentStep ? (
              <Ionicons name="checkmark" size={moderateScale(16)} color={theme.colors.background.primary} />
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
          {index < stepTitles.length - 1 && (
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
