import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBorderRadius, getColor, getSpacing, getTypography } from '../../styles/theme';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = React.memo(({
  steps,
  currentStep,
  completedSteps = [],
}) => {
  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (stepIndex < currentStep) return 'completed';
    return 'inactive';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return getColor('primary.500');
      case 'active': return getColor('primary.500');
      default: return getColor('gray.300');
    }
  };

  const getStepBackgroundColor = (status: string) => {
    switch (status) {
      case 'completed': return getColor('primary.500');
      case 'active': return getColor('background.primary');
      default: return getColor('gray.100');
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: getSpacing('lg'),
      paddingVertical: getSpacing('md'),
      backgroundColor: getColor('background.secondary'),
    }}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              {/* Step Circle */}
              <View style={{
                width: 32,
                height: 32,
                borderRadius: getBorderRadius('full'),
                backgroundColor: getStepBackgroundColor(status),
                borderWidth: 2,
                borderColor: getStepColor(status),
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: getSpacing('xs'),
              }}>
                {status === 'completed' ? (
                  <Ionicons name="checkmark" size={16} color={getColor('text.inverse')} />
                ) : (
                  <Text style={{
                    ...getTypography('caption'),
                    fontWeight: '600',
                    color: status === 'active' ? getColor('primary.500') : getColor('text.secondary'),
                  }}>
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Step Label */}
              <Text style={{
                ...getTypography('caption'),
                fontWeight: status === 'active' ? '600' : '400',
                color: status === 'active' ? getColor('primary.500') : getColor('text.secondary'),
                textAlign: 'center',
                maxWidth: 80,
              }} numberOfLines={2}>
                {step}
              </Text>
            </View>

            {/* Connector Line */}
            {!isLast && (
              <View style={{
                height: 2,
                flex: 1,
                backgroundColor: index < currentStep ? getColor('primary.500') : getColor('gray.300'),
                marginHorizontal: getSpacing('xs'),
                marginTop: -getSpacing('lg'),
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
});