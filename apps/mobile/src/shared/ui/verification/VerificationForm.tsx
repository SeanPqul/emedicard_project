import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { OTPInputGroup } from './OTPInputGroup';

interface VerificationFormProps {
  email: string;
  title: string;
  subtitle: string;
  verifyButtonText: string;
  resendText: string;
  backButtonText: string;
  backButtonHref: string;
  
  // State
  code: string[];
  error: string;
  isVerifying: boolean;
  isResending: boolean;
  resendCooldown: number;
  isCodeComplete: boolean;
  
  // Actions
  onCodeChange: (text: string, index: number) => { newCode: string[]; shouldFocusNext: boolean } | undefined;
  onKeyPress: (key: string, index: number) => { newCode: string[]; shouldFocusPrevious: boolean };
  onVerifyPress: () => Promise<void>;
  onResendCodePress: () => Promise<void>;
  
  styles: any;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  email,
  title,
  subtitle,
  verifyButtonText,
  resendText,
  backButtonText,
  backButtonHref,
  code,
  error,
  isVerifying,
  isResending,
  resendCooldown,
  isCodeComplete,
  onCodeChange,
  onKeyPress,
  onVerifyPress,
  onResendCodePress,
  styles,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Email Verification Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require("../../../../assets/images/email-envelope-icon.png")}
            style={styles.emailIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.formContainer}>
          {/* OTP Input */}
          <OTPInputGroup
            code={code}
            onCodeChange={onCodeChange}
            onKeyPress={onKeyPress}
            error={error}
            isVerifying={isVerifying}
            styles={{
              otpContainer: styles.otpContainer,
              otpInput: styles.otpInput,
              otpInputFilled: styles.otpInputFilled,
              otpInputError: styles.otpInputError,
            }}
          />

          {/* Error Display */}
          <View style={styles.errorContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isVerifying) && styles.buttonDisabled,
            ]}
            onPress={onVerifyPress}
            disabled={isVerifying || !isCodeComplete}
            accessibilityRole="button"
            accessibilityLabel={verifyButtonText}
            accessibilityState={{ disabled: isVerifying || !isCodeComplete }}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? "Verifying..." : verifyButtonText}
            </Text>
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{resendText}</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCodePress}
              disabled={resendCooldown > 0 || isResending}
              accessibilityRole="button"
              accessibilityLabel="Resend verification code"
              accessibilityState={{ disabled: resendCooldown > 0 || isResending }}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  (resendCooldown > 0 || isResending) &&
                    styles.resendButtonDisabled,
                ]}
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <View style={styles.backContainer}>
            <Link href={backButtonHref as any} style={styles.backLink} replace>
              <View style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.backText}>{backButtonText}</Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
};
