import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColor, getSpacing, getTypography } from '../../styles/theme';

interface StepItemProps {
  index: number;
  title: string;
  currentStep: number;
  canNavigateDirectly?: boolean;
  onStepPress?: (step: number) => void;
  isLast?: boolean;
}

export const StepItem: React.FC<StepItemProps> = ({
  index,
  title,
  currentStep,
  canNavigateDirectly = false,
  onStepPress,
  isLast = false,
}) => {
  const isActive = index === currentStep;
  const isCompleted = index < currentStep;
  const isClickable = canNavigateDirectly && onStepPress;
  const isAccessible = index <= currentStep || canNavigateDirectly;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !isClickable && styles.containerDisabled,
      ]}
      onPress={() => isClickable && onStepPress(index)}
      disabled={!isClickable}
      accessibilityRole="button"
      accessibilityLabel={`Step ${index + 1}: ${title}${isActive ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
      accessibilityState={{
        selected: isActive,
        disabled: !isAccessible,
      }}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.circle,
            isActive && styles.circleActive,
            isCompleted && styles.circleCompleted,
            !isAccessible && styles.circleDisabled,
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={16} color={getColor('background.primary')} />
          ) : (
            <Text
              style={[
                styles.number,
                isActive && styles.numberActive,
                !isAccessible && styles.numberDisabled,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>
        <Text
          style={[
            styles.title,
            isActive && styles.titleActive,
            !isAccessible && styles.titleDisabled,
          ]}
        >
          {title}
        </Text>
      </View>
      {!isLast && (
        <View
          style={[
            styles.connector,
            isCompleted && styles.connectorCompleted,
          ]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  containerDisabled: {
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: getColor('background.primary'),
    borderWidth: 2,
    borderColor: getColor('border.default'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing('xs'),
  },
  circleActive: {
    backgroundColor: getColor('interactive'),
    borderColor: getColor('interactive'),
  },
  circleCompleted: {
    backgroundColor: getColor('success'),
    borderColor: getColor('success'),
  },
  circleDisabled: {
    backgroundColor: getColor('background.secondary'),
    borderColor: getColor('border.light'),
    opacity: 0.5,
  },
  number: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    fontWeight: '600',
  },
  numberActive: {
    color: getColor('background.primary'),
  },
  numberDisabled: {
    color: getColor('text.secondary'),
    opacity: 0.5,
  },
  title: {
    ...getTypography('bodySmall'),
    color: getColor('text.secondary'),
    textAlign: 'center',
    maxWidth: 80,
  },
  titleActive: {
    color: getColor('text.primary'),
    fontWeight: '600',
  },
  titleDisabled: {
    color: getColor('text.secondary'),
    opacity: 0.5,
  },
  connector: {
    position: 'absolute',
    top: 16,
    right: -50,
    width: 100,
    height: 2,
    backgroundColor: getColor('border.default'),
    zIndex: -1,
  },
  connectorCompleted: {
    backgroundColor: getColor('success'),
  },
});
