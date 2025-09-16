import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface OTPInputGroupProps {
  code: string[];
  onCodeChange: (text: string, index: number) => { newCode: string[]; shouldFocusNext: boolean } | undefined;
  onKeyPress: (key: string, index: number) => { newCode: string[]; shouldFocusPrevious: boolean };
  error?: string;
  isVerifying?: boolean;
  styles: {
    otpContainer: any;
    otpInput: any;
    otpInputFilled?: any;
    otpInputError?: any;
  };
}

export const OTPInputGroup: React.FC<OTPInputGroupProps> = ({
  code,
  onCodeChange,
  onKeyPress,
  error,
  isVerifying = false,
  styles,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const result = onCodeChange(text, index);
    if (result?.shouldFocusNext) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    const result = onKeyPress(e.nativeEvent.key, index);
    if (result?.shouldFocusPrevious) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {code.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          style={[
            styles.otpInput,
            digit ? styles.otpInputFilled : null,
            error ? styles.otpInputError : null,
          ]}
          value={digit}
          onChangeText={(text) => handleCodeChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          editable={!isVerifying}
          accessibilityLabel={`Verification code digit ${index + 1}`}
          accessibilityHint={`Enter digit ${index + 1} of 6 for verification code`}
        />
      ))}
    </View>
  );
};
