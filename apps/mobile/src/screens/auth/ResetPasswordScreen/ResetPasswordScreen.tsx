// ResetPasswordScreen component - Clean architecture implementation
import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BaseScreen } from '@core/components';
import { OtpInputUI, PasswordStrengthIndicator } from '@features/auth/components';
import { styles } from './ResetPasswordScreen.styles';
import { moderateScale } from '@/shared/utils/responsive';
import { PASSWORD_REQUIREMENTS } from '@features/auth/constants';
import { AuthError, PasswordValidation } from '@features/auth/types';

// Define the steps for the password reset flow
type ResetStep = 'enterEmail' | 'enterCode' | 'changePassword';

export function ResetPasswordScreen() {
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

  const passwordValidation = validatePassword(password);

  // Clear error helper
  const clearError = () => {
    if (error) setError('');
  };

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
      await signIn!.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      setStep('enterCode'); // Move to the OTP step
    } catch (err: any) {
      console.error('Reset code error:', err);
      handleResetError(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset errors
  const handleResetError = (err: any) => {
    if (err.errors && err.errors.length > 0) {
      const error = err.errors[0];
      if (error.code === 'form_identifier_not_found') {
        setError('No account found with this email address.');
      } else {
        setError(error.longMessage || 'Failed to send reset code.');
      }
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  // Step 2: Verify the code
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
    if (resendCooldown > 0 || loading || !signIn) return;
    
    setLoading(true);
    try {
      await signIn.create({ 
        strategy: 'reset_password_email_code', 
        identifier: email 
      });
      setResendCooldown(60);
      Alert.alert('Success', 'A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset the password with code and new password
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
    
    if (!isLoaded || !signIn) return;
    
    setLoading(true);
    setError('');

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.join(''),
        password,
      });

      if (result.status === 'complete') {
        Alert.alert('Success!', 'Your password has been reset successfully.');
        router.replace('/(auth)/sign-in');
      } else {
        console.error('Unexpected reset status:', result.status);
        setError('An unexpected error occurred.');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.errors?.[0]?.longMessage || 'Password reset failed. Please try again.');
      
      // If the code was wrong, send the user back to the code entry step
      if (err.errors?.[0]?.code?.includes('code')) {
        setStep('enterCode');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FUNCTIONS FOR UI ---

  const renderEnterEmailStep = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={moderateScale(32)} color="#3B82F6" />
        </View>
      </View>

      <Text style={styles.title}>Reset Your Password</Text>
      <Text style={styles.subtitle}>
        Enter your email address to receive a verification code.
      </Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
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

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (loading || !email) && styles.buttonDisabled]}
          onPress={handleSendResetCode}
          disabled={loading || !email}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Sending...' : 'Send Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Ionicons name="arrow-back" size={16} color="#6B7280" />
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChangePasswordStep = () => (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed-outline" size={moderateScale(32)} color="#3B82F6" />
        </View>
      </View>

      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Your new password must be different from previous passwords.
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed-outline" 
            size={moderateScale(20)} 
            color="#9CA3AF" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="New Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye" : "eye-off"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons 
            name="lock-closed-outline" 
            size={moderateScale(20)} 
            color="#9CA3AF" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Confirm New Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              clearError();
            }}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye" : "eye-off"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <PasswordStrengthIndicator 
          password={password} 
          containerStyle={styles.passwordRequirements}
        />

        <TouchableOpacity 
          style={[
            styles.primaryButton, 
            (loading || !passwordValidation.isValid) && styles.buttonDisabled
          ]} 
          onPress={handleFinalReset} 
          disabled={loading || !passwordValidation.isValid}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            setError('');
            setStep('enterCode');
          }}
        >
          <Ionicons name="arrow-back" size={16} color="#6B7280" />
          <Text style={styles.backButtonText}>Back to Code Entry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Use a switch to render the correct UI for the current step
  const renderContent = () => {
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
            isResending={false}
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
  };

  return (
    <BaseScreen 
      safeArea={true}
      keyboardAvoiding={true}
      scrollable={true}
    >
      {renderContent()}
    </BaseScreen>
  );
}
