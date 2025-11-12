import React, { useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BaseScreen } from '@shared/components/core';
import { CustomButton } from '@shared/components';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ResetPasswordScreen.styles';
import { PASSWORD_REQUIREMENTS } from '@features/auth/constants';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

export function ResetPasswordScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // Step 1: Send reset code
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  // Step 2: Enter code and new password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation
  const validatePassword = (pwd: string): PasswordValidation => {
    const minLength = pwd.length >= PASSWORD_REQUIREMENTS.MIN_LENGTH;
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

  const passwordValidation = validatePassword(newPassword);

  const clearError = () => {
    if (error) setError('');
  };

  // Step 1: Send password reset code
  const handleSendCode = async () => {
    if (!isLoaded || !email) {
      setError('Please enter your email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signIn!.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      setCodeSent(true);
      Alert.alert('Code Sent!', 'Check your email for the verification code.');
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        
        // Check for various error codes
        if (error.code === 'form_identifier_not_found') {
          setError('No account found with this email address.');
        } else if (error.code === 'form_password_not_set' || error.message?.includes('password')) {
          setError('This account uses Google Sign In. You cannot reset a password for OAuth accounts.');
        } else {
          setError(error.longMessage || 'Failed to send reset code.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async () => {
    // Validation
    if (!code || !newPassword || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordValidation.isValid) {
      setError('Password does not meet the requirements.');
      return;
    }
    
    if (!isLoaded || !signIn) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        Alert.alert('Success!', 'Your password has been reset successfully.', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          }
        ]);
      } else {
        setError('Unable to complete password reset.');
      }
    } catch (err: any) {
      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        setError(error.longMessage || 'Password reset failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Enter Email
  if (!codeSent) {
    return (
      <BaseScreen 
        safeArea={true}
        keyboardAvoiding={true}
        scrollable={true}
        edges={['top', 'bottom']}
      >
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={moderateScale(40)} color="#10B981" />
            </View>
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address to receive a verification code.
          </Text>
          
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.input}>
              <Ionicons
                name="mail-outline"
                size={moderateScale(20)}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Error Message */}
            <View style={styles.errorContainer}>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Send Code Button */}
            <CustomButton
              title="Send Code"
              loadingText="Sending…"
              loading={loading}
              disabled={!email || loading}
              onPress={handleSendCode}
              buttonStyle={styles.sendCodeButton}
              textStyle={styles.sendCodeButtonText}
            />

            {/* Back to Sign In */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              <Ionicons name="arrow-back" size={16} color="#6B7280" />
              <Text style={styles.backText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BaseScreen>
    );
  }

  // Render Step 2: Enter Code and New Password
  return (
    <BaseScreen 
      safeArea={true}
      keyboardAvoiding={true}
      scrollable={true}
      edges={['top', 'bottom']}
      >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={moderateScale(40)} color="#10B981" />
          </View>
        </View>

        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Enter the code sent to {email} and your new password.
        </Text>
        
        <View style={styles.formContainer}>
          {/* Verification Code Input */}
          <View style={styles.input}>
            <Ionicons
              name="key-outline"
              size={moderateScale(20)}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={(text) => {
                setCode(text);
                clearError();
              }}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* New Password Input */}
          <View style={styles.input}>
            <Ionicons
              name="lock-closed-outline"
              size={moderateScale(20)}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError();
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={23}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.input}>
            <Ionicons
              name="lock-closed-outline"
              size={moderateScale(20)}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={23}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          <View style={styles.errorContainer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <Text style={[
                styles.requirementItem,
                passwordValidation.minLength && styles.requirementMet
              ]}>
                • At least {PASSWORD_REQUIREMENTS.MIN_LENGTH} characters
              </Text>
              <Text style={[
                styles.requirementItem,
                passwordValidation.hasUppercase && styles.requirementMet
              ]}>
                • One uppercase letter (A-Z)
              </Text>
              <Text style={[
                styles.requirementItem,
                passwordValidation.hasLowercase && styles.requirementMet
              ]}>
                • One lowercase letter (a-z)
              </Text>
              <Text style={[
                styles.requirementItem,
                passwordValidation.hasNumber && styles.requirementMet
              ]}>
                • One number (0-9)
              </Text>
              {confirmPassword.length > 0 && (
                <Text style={[
                  styles.requirementItem,
                  newPassword === confirmPassword && styles.requirementMet
                ]}>
                  • Passwords match
                </Text>
              )}
            </View>
          )}

          {/* Reset Password Button */}
          <CustomButton
            title="Reset Password"
            loadingText="Resetting…"
            loading={loading}
            disabled={!code || !passwordValidation.isValid || newPassword !== confirmPassword || loading}
            onPress={handleResetPassword}
            buttonStyle={styles.resetPasswordButton}
            textStyle={styles.resetPasswordButtonText}
          />

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setCodeSent(false);
              setCode('');
              setNewPassword('');
              setConfirmPassword('');
              setError('');
            }}
          >
            <Ionicons name="arrow-back" size={16} color="#6B7280" />
            <Text style={styles.backText}>Back to Email Entry</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BaseScreen>
  );
}
