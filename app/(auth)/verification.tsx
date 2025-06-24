import { styles } from "@/assets/styles/auth-styles/verification";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function VerificationPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const params = useLocalSearchParams();

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const email = typeof params.email === "string" ? params.email : "";

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (isVerified) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [isVerified, scaleAnim]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    if (text && !/^\d$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError("");

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code: fullCode,
      });

      if (attempt.status === "complete") {
        setIsVerified(true);
        await setActive({ session: attempt.createdSessionId });
        setTimeout(() => router.replace("/(tabs)"), 2000);
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);

      if (err.errors && err.errors.length > 0) {
        const error = err.errors[0];
        if (error.code === "verification_expired") {
          setError("Code has expired. Please request a new one.");
        } else if (error.code === "verification_failed") {
          setError("Invalid code. Please try again.");
        } else {
          setError("Invalid or expired code. Please try again.");
        }
      } else {
        setError("Invalid or expired code. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onResendCode = async () => {
    if (!isLoaded || resendCooldown > 0) return;

    setIsResending(true);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(60);
      Alert.alert("Success", "Verification code sent! Check your email.");
    } catch (err) {
      console.error("Resend error:", err);
      Alert.alert("Error", "Could not resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  if (isVerified) {
    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[styles.successContent, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Email Verified Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your account has been verified. Redirecting to your dashboard...
          </Text>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Email Verification Icon */}
        <View style={styles.iconContainer}>
          <Image
            source={require("../../assets/images/email-envelope-icon.png")}
            style={styles.emailIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 6-digit code to your email address.
        </Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.formContainer}>
          {/* Individual OTP Input boxes */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit ? styles.otpInputFilled : null,
                  error ? styles.otpInputError : null,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!isVerifying}
              />
            ))}
          </View>

          <View style={[styles.errorContainer]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isVerifying) && styles.buttonDisabled,
            ]}
            onPress={onVerifyPress}
            disabled={isVerifying || !isCodeComplete}
          >
            <Text style={styles.verifyButtonText}>
              {isVerifying ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCode}
              disabled={resendCooldown > 0 || isResending}
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

          <View style={styles.backContainer}>
            <Link href="/(auth)/sign-up" style={styles.backLink} replace>
              <View style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.backText}>Back to Sign Up</Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}
