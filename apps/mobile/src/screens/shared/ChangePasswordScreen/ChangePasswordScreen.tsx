import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { BaseScreen } from '@shared/components/core';
import { CustomButton } from '@shared/components';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './ChangePasswordScreen.styles';
import { AuthError } from '@features/auth/types';
import { PASSWORD_REQUIREMENTS } from '@features/auth/constants';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

export function ChangePasswordScreen() {
  const { user } = useUser();
  const router = useRouter();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

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

  // Helper functions
  const clearError = () => {
    if (error) setError(null);
  };

  const handleInputChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    clearError();
  };

  const isFormValid = 
    currentPassword && 
    passwordValidation.isValid && 
    newPassword === confirmPassword;

  // Handle password change
  const handleChangePassword = async () => {
    if (!user) {
      setError({
        code: 'NO_USER',
        message: 'User not found. Please sign in again.',
      });
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError({
        code: 'PASSWORD_MISMATCH',
        message: 'New passwords do not match.',
      });
      return;
    }

    // Validate new password requirements
    if (!passwordValidation.isValid) {
      setError({
        code: 'INVALID_PASSWORD',
        message: 'New password does not meet requirements.',
      });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await user.updatePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
        signOutOfOtherSessions: true, // Sign out other devices for security
      });

      Alert.alert(
        'Success!', 
        'Your password has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (err: any) {
      handlePasswordChangeError(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeError = (err: any) => {
    if (err.errors && err.errors.length > 0) {
      const error = err.errors[0];
      
      switch (error.code) {
        case 'form_password_incorrect':
        case 'form_param_nil':
          setError({
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect.',
          });
          break;
        
        case 'form_password_pwned':
          setError({
            code: 'WEAK_PASSWORD',
            message: 'This password has been compromised. Please choose a different one.',
          });
          break;
        
        case 'form_password_length_too_short':
          setError({
            code: 'PASSWORD_TOO_SHORT',
            message: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters.`,
          });
          break;
        
        default:
          setError({
            code: 'PASSWORD_CHANGE_ERROR',
            message: error.longMessage || error.message || 'Failed to update password. Please try again.',
          });
      }
    } else {
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  };

  return (
    <BaseScreen 
      safeArea={true}
      keyboardAvoiding={true}
      scrollable={true}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={moderateScale(40)} color="#10B981" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>
          Update your account password{"\n"}for better security
        </Text>

        {/* Change Password Form */}
        <View style={styles.formContainer}>
          {/* Current Password Input */}
          <View style={styles.input}>
            <Ionicons
              name="lock-closed-outline"
              size={moderateScale(20)}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Current password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showCurrentPassword}
              value={currentPassword}
              onChangeText={(text) => handleInputChange(setCurrentPassword, text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? "eye" : "eye-off"}
                size={23}
                color="#9CA3AF"
              />
            </TouchableOpacity>
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
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={(text) => handleInputChange(setNewPassword, text)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Ionicons
                name={showNewPassword ? "eye" : "eye-off"}
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
              onChangeText={(text) => handleInputChange(setConfirmPassword, text)}
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
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>

          {/* Password Requirements */}
          {newPassword.length > 0 && (
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>New password must contain:</Text>
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

          {/* Change Password Button */}
          <CustomButton
            title="Update Password"
            loadingText="Updating…"
            loading={loading}
            disabled={!isFormValid || loading}
            onPress={handleChangePassword}
            buttonStyle={styles.changePasswordButton}
            style={(!isFormValid || loading) && styles.changePasswordButtonDisabled}
            textStyle={styles.changePasswordButtonText}
          />

          {/* Cancel Button */}
          <CustomButton
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
            buttonStyle={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        </View>
      </View>
    </BaseScreen>
  );
}
