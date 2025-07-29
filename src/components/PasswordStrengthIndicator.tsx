import { FONT_SIZES, FONT_WEIGHTS } from '@/src/constants/customFontSizes';
import { moderateScale, verticalScale } from '@/src/utils/scaling-utils';
import React from 'react';
import { Text, View } from 'react-native';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  containerStyle?: any;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  containerStyle,
}) => {
  const validatePassword = (pwd: string): PasswordValidation => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber
    };
  };

  const validation = validatePassword(password);

  const requirements = [
    { text: 'At least 8 characters', met: validation.minLength },
    { text: 'One uppercase letter (A-Z)', met: validation.hasUppercase },
    { text: 'One lowercase letter (a-z)', met: validation.hasLowercase },
    { text: 'One number (0-9)', met: validation.hasNumber },
  ];

  return (
    <View style={[defaultStyles.container, containerStyle]}>
      <Text style={defaultStyles.title}>Password must contain:</Text>
      {requirements.map((requirement, index) => (
        <Text
          key={index}
          style={[
            defaultStyles.requirementItem,
            requirement.met && defaultStyles.requirementMet,
          ]}
        >
          • {requirement.text}
        </Text>
      ))}
    </View>
  );
};

const defaultStyles = {
  container: {
    marginBottom: verticalScale(16),
  },
  title: {
    fontSize: FONT_SIZES.micro,
    color: '#6B7280',
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: verticalScale(4),
  },
  requirementItem: {
    fontSize: FONT_SIZES.micro,
    color: '#9CA3AF',
    lineHeight: moderateScale(16),
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: FONT_WEIGHTS.medium,
  },
};