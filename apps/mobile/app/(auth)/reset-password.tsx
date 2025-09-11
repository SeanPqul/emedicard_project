// src/screens/auth-reset-password.tsx

import { moderateScale } from '../../src/utils/responsive';
import { layoutPatterns } from '../../src/styles/theme';
import { useSignIn } from '@clerk/clerk-expo';
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
import { OtpInputUI } from '../../src/components/OtpInputUI'; // Our reusable component
// Make sure this style file contains styles for all steps
import { styles } from '../../src/styles/screens/auth-reset-password';

// Define the steps for the password reset flow
type ResetStep = 'enterEmail' | 'enterCode' | 'changePassword';

export default function PasswordResetScreen() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // State for managing the multi-step flow
  const [step, setStep] = useState<ResetStep>('enterEmail');

  // State for user inputs across all steps
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));

  // Shared state for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // --- HANDLERS FOR EACH STEP ---

  // Step 1: Send the password reset code
  const handleSendResetCode = async () => {
    if (!isLoaded || !email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      setStep('enterCode'); // Move to the OTP step
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: "Verify" the code by moving to the next step
  // Note: Clerk verifies the code and password together in the final step
  const handleCodeSubmit = () => {
    if (code.join('').length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError('');
    setStep('changePassword'); // Move to the final step
  };
  
  // Step 2 (Resend): Request a new code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true); // You might want a dedicated `isResending` state
    try {
      await signIn?.create({ strategy: 'reset_password_email_code', identifier: email });
      setResendCooldown(60);
      Alert.alert('Success', 'A new code has been sent to your email.');
    } catch (err: any) {
        setError(err.errors?.[0]?.longMessage || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };


  // Step 3: Attempt to reset the password with code and new password
  const handleFinalReset = async () => {
    // Client-side validation
    if (!password || !confirmPassword) {
      setError('Please fill out both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordValidation.isValid) {
      setError('Password does not meet the requirements.');
      return;
    }
    
    if (!isLoaded) return;
    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.join(''),
        password,
      });

      if (result.status === 'complete') {
        //await setActive({ session: result.createdSessionId });
        Alert.alert('Success!', 'Your password has been reset successfully.');
        router.replace('/(auth)/sign-in')
      } else {
        // This case is unlikely for this flow but good to have
        console.error('Unexpected reset status:', result.status);
        setError('An unexpected error occurred.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Password reset failed. Please try again.');
      // UX Improvement: If the code was wrong, send the user back to the code entry step
      if (err.errors?.[0]?.code?.includes('code')) {
        setStep('enterCode');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PASSWORD VALIDATION ---
  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return { minLength, hasUppercase, hasLowercase, hasNumber, isValid: minLength && hasUppercase && hasLowercase && hasNumber };
  };
  const passwordValidation = validatePassword(password);

  // --- RENDER FUNCTIONS FOR UI ---

  const renderEnterEmailStep = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* The design from your image uses a different icon here, so let's match it */}
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={moderateScale(32)} color="#3B82F6" />
        </View>
      </View>

      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>Enter your email address to receive a verification code.</Text>
      
      <View style={styles.formContainer}>
        {/* THIS IS THE MISSING PART */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={moderateScale(20)} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Enter your email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError(''); // Clear error when user starts typing
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        {/* END OF MISSING PART */}

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (loading || !email) && styles.buttonDisabled]}
          onPress={handleSendResetCode}
          disabled={loading || !email}
        >
          <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/sign-in')}>
           <Ionicons name="arrow-back" size={16} color="#6B7280" />
           <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChangePasswordStep = () => (
    <View style={styles.container}>
        <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={moderateScale(40)} color="#3B82F6" />
        </View>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>Your new password must be different from previous passwords.</Text>

        <View style={styles.formContainer}>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInputWithIcon}
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInputWithIcon}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.passwordRequirements}>
                <Text style={[styles.requirementItem, passwordValidation.minLength && styles.requirementMet]}>• At least 8 characters</Text>
                <Text style={[styles.requirementItem, passwordValidation.hasUppercase && styles.requirementMet]}>• One uppercase letter (A-Z)</Text>
                <Text style={[styles.requirementItem, passwordValidation.hasLowercase && styles.requirementMet]}>• One lowercase letter (a-z)</Text>
                <Text style={[styles.requirementItem, passwordValidation.hasNumber && styles.requirementMet]}>• One number (0-9)</Text>
            </View>

            <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleFinalReset} disabled={loading}>
                <Text style={styles.primaryButtonText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
            </TouchableOpacity>
        </View>
    </View>
  );

  // Use a switch to render the correct UI for the current step
  const renderStep = () => {
    switch (step) {
      case 'enterEmail':
        return renderEnterEmailStep();
      
      case 'enterCode':
        return (
          <OtpInputUI
            title="Check Your Email"
            subtitle="We've sent a 6-digit code to"
            email={email}
            buttonText="Continue"
            backLinkText="Enter a different email"
            code={code}
            setCode={setCode}
            error={error}
            isLoading={loading}
            isResending={false} // Can add dedicated state if needed
            resendCooldown={resendCooldown}
            isCodeComplete={code.join('').length === 6}
            onSubmit={handleCodeSubmit}
            onResend={handleResendCode}
            onBack={() => {
                setError('');
                setStep('enterEmail');
            }}
          />
        );

      case 'changePassword':
        return renderChangePasswordStep();
        
      default:
        return renderEnterEmailStep();
    }
  }

  return <View style={layoutPatterns.flex1}>{renderStep()}</View>;
}