// SignUpScreen component - Clean architecture implementation
import React, { useState } from 'react';
import { Alert, Image, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore - SVG import
import GoogleSignInButton from '../../../../assets/svgs/google-ctn-logo.svg';
import { BaseScreen } from '@shared/components/core';
import { CustomButton } from '@shared/components';
import { moderateScale } from '@shared/utils/responsive';
import { styles } from './SignUpScreen.styles';
import { SignUpFormData, AuthError } from '@features/auth/types';
import { PASSWORD_REQUIREMENTS } from '@features/auth/constants';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

export function SignUpScreen() {
  const { isLoaded, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    fullname: '',
    username: '',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
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

  const passwordValidation = validatePassword(formData.password);

  // Helper functions
  const clearError = () => {
    if (error) setError(null);
  };

  const updateFormData = (field: keyof SignUpFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  // Authentication handlers
  const handleSignUp = async () => {
    if (!isLoaded) return;

    setError(null);
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      router.replace({ 
        pathname: "/(auth)/verification", 
        params: { email: formData.email } 
      });
    } catch (err: any) {
      console.error('Sign up error:', JSON.stringify(err, null, 2));
      handleSignUpError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpError = (err: any) => {
    if (err.errors && err.errors.length > 0) {
      const emailError = err.errors.find(
        (e: any) => e.meta?.paramName === "email_address"
      );
      const passwordError = err.errors.find(
        (e: any) => e.meta?.paramName === "password"
      );

      if (emailError) {
        switch (emailError.code) {
          case "form_identifier_exists":
          case "email_address_taken":
            setError({
              code: 'EMAIL_TAKEN',
              message: "The email you entered is already registered.",
            });
            break;
          case "form_param_format_invalid":
          case "form_identifier_invalid":
            setError({
              code: 'INVALID_EMAIL',
              message: "Please enter a valid email address.",
            });
            break;
          default:
            setError({
              code: 'EMAIL_ERROR',
              message: emailError.longMessage || emailError.message || "Invalid email address.",
            });
        }
      } else if (passwordError) {
        setError({
          code: 'INVALID_PASSWORD',
          message: "Invalid password. Please try again.",
        });
      } else {
        const error = err.errors[0];
        setError({
          code: 'SIGNUP_ERROR',
          message: error.longMessage || error.message || "An error occurred during sign up.",
        });
      }
    } else {
      setError({
        code: 'UNKNOWN_ERROR',
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert("Error", "Google sign up failed. Please try again.");
    }
  };

  const isFormValid = formData.email && passwordValidation.isValid;

  return (
    <BaseScreen 
      keyboardAvoiding={true}
      scrollable={true}
    >
      <View style={styles.container}>
        {/* Organization Logos */}
        <View style={styles.orgLogosContainer}>
          <View style={styles.orgLogo}>
            <Image
              source={require("@/assets/images/cho-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
          </View>
          <View style={styles.orgLogo}>
            <Image
              source={require("@/assets/images/davao-city-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.orgText}>DAVAO CITY</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Register in app to manage{"\n"}your health card applications
        </Text>

        {/* Sign Up Form */}
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
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
            />
          </View>
          
          {/* Password Input */}
          <View style={styles.input}>
            <Ionicons
              name="lock-closed-outline"
              size={moderateScale(20)}
              color="#9CA3AF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.inputWithIcon}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
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

          {/* Error Message */}
          <View style={styles.errorContainer}>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>

          {/* Password Requirements */}
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
          </View>

          {/* Sign Up Button */}
          <CustomButton
            title="Continue"
            loadingText="Signing Up…"
            loading={loading}
            disabled={!isFormValid || loading}
            onPress={handleSignUp}
            buttonStyle={styles.signUpButton}
            textStyle={styles.signUpButtonText}
          />

          {/* Divider */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>or Sign up with</Text>
            <View style={styles.line} />
          </View>

          {/* Google Sign Up */}
          <CustomButton
            variant="none"
            onPress={handleGoogleSignUp}
            buttonStyle={styles.googleButton}
          >
            <GoogleSignInButton
              width={styles.googleIcon.width}
              height={styles.googleIcon.height}
            />
          </CustomButton>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" replace>
              <Text style={styles.signInLinkText}>Sign in</Text>
            </Link>
          </View>
        </View>
      </View>
    </BaseScreen>
  );
}