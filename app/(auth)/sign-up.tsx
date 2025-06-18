import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "@/assets/styles/auth-styles/sign-up";
import GoogleSignInButton from "@/assets/svgs/google-ctn-logo.svg";
import AuthLayout from "@/src/layouts/AuthLayout";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  // Handle the submission of the sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Clear any previous errors
    setErrorMessage("");
    setIsLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      router.replace({
        pathname: "/(auth)/verification",
        params: { email: emailAddress },
      });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));

      // Handle specific error types
      if (err.errors && err.errors.length > 0) {
        // Handle multiple errors - prioritize email errors first, then password
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
              setErrorMessage(
                "Email address already registered."
              );
              break;
            case "form_param_format_invalid":
            case "form_identifier_invalid":
              setErrorMessage("Please enter a valid email address.");
              break;
            default:
              setErrorMessage(
                emailError.longMessage ||
                  emailError.message ||
                  "Invalid email address."
              );
          }
        } else if (passwordError) {
          setErrorMessage("Invalid password. Please try again.");
        } else {
          // Fallback for other errors
          const error = err.errors[0];
          setErrorMessage(
            error.longMessage ||
              error.message ||
              "An error occurred during sign up."
          );
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error("OAuth error:", error);
      Alert.alert("Error", "Google sign up failed. Please try again.");
    }
  };

  return (
      <AuthLayout>
        {/* Organization Logos */}
        <View style={styles.orgLogosContainer}>
          <View style={styles.orgLogo}>
            <View style={styles.healthLogo}>
              <Image
                source={require("../../assets/images/cho-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
          </View>
          <View style={styles.orgLogo}>
            <View style={styles.cityLogo}>
              <Image
                source={require("../../assets/images/davao-city-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
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
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#9CA3AF"
            onChangeText={(email) => {
              setEmailAddress(email);
              // Clear error when user starts typing
              if (errorMessage) setErrorMessage("");
            }}
            keyboardType="email-address"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              onChangeText={(password) => {
                setPassword(password);
                // Clear error when user starts typing
                if (errorMessage) setErrorMessage("");
              }}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          <View style={styles.errorContainer}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password must contain:</Text>
            <Text style={styles.requirementItem}>• At least 8 characters</Text>
            <Text style={styles.requirementItem}>
              • One uppercase letter (A-Z)
            </Text>
            <Text style={styles.requirementItem}>
              • One lowercase letter (a-z)
            </Text>
            <Text style={styles.requirementItem}>• One number (0-9)</Text>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isLoading && styles.buttonDisabled]}
            onPress={onSignUpPress}
            disabled={isLoading || !emailAddress || !password}
          >
            <Text style={styles.signUpButtonText}>
              {isLoading ? "Signing Up..." : "Continue"}
            </Text>
          </TouchableOpacity>

          {/* Or Sign Up With */}
          <Text style={styles.orText}>or Sign up with</Text>

          {/* Google Sign Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignUp}
          >
            <GoogleSignInButton width={200} height={50} />
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Link href="/sign-in" style={styles.signInLink} replace>
              <Text style={styles.signInLinkText}>Sign in</Text>
            </Link>
          </View>
        </View>
      </AuthLayout>
  );
}
