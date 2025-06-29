import { moderateScale } from '@/src/utils/scaling-utils';
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../../assets/styles/auth-styles/reset-password';

export default function PasswordResetScreen() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [secondFactor, setSecondFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, router]);

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isLoaded) {
    return null;
  }

  // Password validation function
  const validatePassword = (pwd: string) => {
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

  const passwordValidation = validatePassword(password);

  // Send the password reset code to the user's email
  const handleSendResetCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessfulCreation(true);
      setError('');
    } catch (err: any) {
      console.error('Error sending reset code:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].longMessage || err.errors[0].message);
      } else {
        setError('Failed to send reset code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset the user's password
  const handleResetPassword = async () => {
    if (!code || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'needs_second_factor') {
        setSecondFactor(true);
        setError('');
      } else if (result?.status === 'complete') {
        // Set the active session (user is now signed in)
        setActive({ session: result.createdSessionId });
        setError('');
        Alert.alert('Success', 'Password reset successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        console.log('Unexpected result:', result);
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].longMessage || err.errors[0].message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/sign-in');
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setCountdown(60); // Start 60 second countdown
      setError('');
    } catch (err: any) {
      console.error('Error resending code:', err);
      if (err.errors && err.errors.length > 0) {
        setError(err.errors[0].longMessage || err.errors[0].message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const renderPasswordRequirements = () => (
    <View style={styles.passwordRequirements}>
      <Text style={styles.requirementsTitle}>Password must contain:</Text>
      <Text style={[
        styles.requirementItem,
        passwordValidation.minLength && styles.requirementMet
      ]}>
        • At least 8 characters
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
    </View>
  );

  const renderForgotPasswordStep = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="finger-print" size={moderateScale(32)} color="#3B82F6" />
        </View>
      </View>

      <Text style={styles.title}>Forgot Your Password{'\n'}and Continue</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleSendResetCode}
          disabled={loading || !email}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons name="arrow-back" size={moderateScale(16)} color="#6B7280" />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderResetPasswordStep = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={moderateScale(32)} color="#3B82F6" />
        </View>
      </View>

      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>Enter the code sent to </Text>
      <Text style={styles.emailText}>{email}</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter verification code"
            placeholderTextColor="#9CA3AF"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              if (error) setError('');
            }}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <View style={styles.passwordContainer}>
          <Ionicons name="lock-closed-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.passwordInputWithIcon}
            placeholder="Enter your new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={moderateScale(20)}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {renderPasswordRequirements()}

        {secondFactor && (
          <View style={styles.errorContainer}>
            <Text style={styles.warningText}>
              Two-factor authentication is required. Please complete 2FA to continue.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading || !code || !password || !passwordValidation.isValid}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.resendButton,
            (countdown > 0 || resendLoading) && styles.resendButtonDisabled
          ]} 
          onPress={handleResendCode}
          disabled={countdown > 0 || resendLoading}
        >
          <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
          <Text style={[
            styles.resendLink,
            (countdown > 0 || resendLoading) && styles.resendLinkDisabled
          ]}>
            {resendLoading 
              ? 'Sending...' 
              : countdown > 0 
              ? `Resend in ${countdown}s` 
              : 'Resend Code'
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={handleBackToLogin}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return !successfulCreation ? renderForgotPasswordStep() : renderResetPasswordStep();
}