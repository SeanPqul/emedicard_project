import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// @ts-ignore - SVG import
import GoogleSignInButton from '../../../../assets/svgs/google-ctn-logo.svg';
import { CustomButton, CustomTextInput, Divider } from '@shared/components';
import { BaseScreen } from '@shared/components/core';
import { styles } from './SignInScreen.styles';
import { SignInFormData, AuthError } from '@features/auth/types';

export function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Helper functions
  const clearError = () => {
    if (error) setError(null);
  };

  const updateFormData = (field: keyof SignInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  const isFormValid = formData.email && formData.password;

  // Authentication handlers
  const handleSignIn = async () => {
    if (!isLoaded) return;
    
    setError(null);
    setLoading(true);

    try {
      const attempt = await signIn.create({ 
        identifier: formData.email, 
        password: formData.password 
      });
      
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError({
          code: 'ADDITIONAL_VERIFICATION',
          message: "Please complete additional verification steps.",
        });
      }
    } catch (err) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      setError({
        code: 'INVALID_CREDENTIALS',
        message: "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({
        strategy: "oauth_google",
      });
      
      if (activate && createdSessionId) {
        activate({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert("Error", "Google sign in failed. Please try again.");
    }
  };

  return (
    <BaseScreen 
      safeArea={true}
      keyboardAvoiding={true}
      scrollable={true}
      edges={['top', 'bottom']}
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

        {/* App Title */}
        <Text style={styles.title}>eMediCard</Text>
        <Text style={styles.subtitle}>
          A Mobile-Base Health Card{"\n"}Management System
        </Text>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <CustomTextInput
            leftIcon="mail-outline"
            placeholder="Enter email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => updateFormData('email', text)}
            containerStyle={styles.input}
          />

          <CustomTextInput
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? "eye" : "eye-off"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => updateFormData('password', text)}
            containerStyle={styles.input}
          />

          <View style={styles.errorForgotContainer}>
            <View style={styles.errorContainer}>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
            <Link href="/(auth)/reset-password" replace>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Link>
          </View>

          <CustomButton
            title="Log in"
            loadingText="Signing In…"
            loading={loading}
            disabled={!isFormValid || loading}
            onPress={handleSignIn}
            buttonStyle={styles.signInButton}
            textStyle={styles.signInButtonText}
          />

          <Divider text="or Login with" />

          <CustomButton
            variant="none"
            onPress={handleGoogleSignIn}
            buttonStyle={styles.googleButton}
          >
            <GoogleSignInButton width={wp("50%")} height={hp("6%")} />
          </CustomButton>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
            <Link href="/(auth)/sign-up" replace>
              <Text style={styles.signUpLinkText}>Sign up</Text>
            </Link>
          </View>
        </View>
      </View>
    </BaseScreen>
  );
}