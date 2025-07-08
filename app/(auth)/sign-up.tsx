import GoogleSignInButton from "@/assets/svgs/google-ctn-logo.svg";
import { moderateScale } from "@/src/utils/scaling-utils";
import { useSignUp, useSSO } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../assets/styles/auth-styles/sign-up";

export default function SignUpScreen() {
  const { isLoaded, signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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

  const onSignUp = async () => {
    if (!isLoaded) return;

    // Clear any previous errors
    setError("");
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      router.replace({ pathname: "/(auth)/verification", params: { email } });
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
              setError("The email you entered is already registered.");
              break;
            case "form_param_format_invalid":
            case "form_identifier_invalid":
              setError("Please enter a valid email address.");
              break;
            default:
              setError(
                emailError.longMessage ||
                  emailError.message ||
                  "Invalid email address."
              );
          }
        } else if (passwordError) {
          setError("Invalid password. Please try again.");
        } else {
          // Fallback for other errors
          const error = err.errors[0];
          setError(
            error.longMessage ||
              error.message ||
              "An error occurred during sign up."
          );
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
      });
      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch {
      Alert.alert("Error", "Google sign up failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logos */}
      <View style={styles.orgLogosContainer}>
        <View style={styles.orgLogo}>
          <Image
            source={require("../../assets/images/cho-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.orgText}>CITY HEALTH OFFICE</Text>
        </View>
        <View style={styles.orgLogo}>
          <Image
            source={require("../../assets/images/davao-city-logo.png")}
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

      {/* Form */}
      <View style={styles.formContainer}>
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
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (error) setError("");
            }}
            />
        </View>
        
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
            secureTextEntry={!showPwd}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError("");
            }}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPwd((v) => !v)}
          >
            <Ionicons
              name={showPwd ? "eye" : "eye-off"}
              size={23}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>

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

        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.buttonDisabled]}
          onPress={onSignUp}
          disabled={loading || !email || !password}
        >
          <Text style={styles.signUpButtonText}>
            {loading ? "Signing Up…" : "Continue"}
          </Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or Sign up with</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={onGoogle}>
          <GoogleSignInButton
            width={styles.googleIcon.width}
            height={styles.googleIcon.height}
          />
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" replace>
            <Text style={styles.signInLinkText}>Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}