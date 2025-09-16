import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColor, getSpacing } from '../../styles/theme';
import { StepItem } from './StepItem';

interface StepIndicatorProps {
  currentStep: number;
  stepTitles: string[];
  showStepIndicator?: boolean;
  canNavigateDirectly?: boolean;
  onStepPress?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  stepTitles,
  showStepIndicator = true,
  canNavigateDirectly = false,
  onStepPress,
}) => {
  if (!showStepIndicator) return null;

  return (
    <View style={styles.container}>
      {stepTitles.map((title, index) => (
        <StepItem
          key={index}
          index={index}
          title={title}
          currentStep={currentStep}
          canNavigateDirectly={canNavigateDirectly}
          onStepPress={onStepPress}
          isLast={index === stepTitles.length - 1}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getSpacing('lg'),
    paddingVertical: getSpacing('md'),
    backgroundColor: getColor('background.secondary'),
  },
});
