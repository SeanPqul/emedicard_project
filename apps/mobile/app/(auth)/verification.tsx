// src/screens/auth-verification.tsx
import { styles } from "@/src/styles/screens/auth-verification";
import { useSignUp } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Text, TouchableOpacity, View } from "react-native";
import { OtpInputUI } from "../../src/features/auth/ui/OtpInputUI"; // Import our new component

// This is the "Success Screen" component, extracted for clarity
const SuccessScreen = ({ onContinue }: { onContinue: () => void }) => {
  const [countdown, setCountdown] = useState(5);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    const buttonTimer = setTimeout(() => setShowContinueButton(true), 1000);

    return () => {
      clearInterval(countdownTimer);
      clearTimeout(buttonTimer);
    };
  }, [scaleAnim]);

  useEffect(() => {
    if (countdown === 0) {
      onContinue();
    }
  }, [countdown, onContinue]);

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
          Your account has been verified. Redirecting...
        </Text>
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}
          </Text>
          {showContinueButton && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
            >
              <Text style={styles.continueButtonText}>Continue Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

export default function VerificationPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams();

  // State management remains in the parent component
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const email = typeof params.email === "string" ? params.email : "";

  // All logic (useEffect, handlers) remains here
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setIsVerifying(true);
    setError("");
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code: code.join("") });
      if (attempt.status === "complete") {
        setIsVerified(true);
        setSessionId(attempt.createdSessionId);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid or expired code.");
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
      Alert.alert("Error", "Could not resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = async () => {
    if (sessionId && setActive) {
      await setActive({ session: sessionId });
      // Explicitly redirect to applicant dashboard after verification
      router.replace('/(tabs)/index');
    }
  };

  const handleBack = () => {
    router.replace("/(auth)/sign-up");
  };

  // Conditional rendering based on verification status
  if (isVerified) {
    return <SuccessScreen onContinue={handleContinue} />;
  }

  return (
    <OtpInputUI
      title="Verify Your Email"
      subtitle="We've sent a 6-digit code to your email address."
      email={email}
      buttonText="Verify Email"
      backLinkText="Back to Sign Up"
      code={code}
      setCode={setCode}
      error={error}
      isLoading={isVerifying}
      isResending={isResending}
      resendCooldown={resendCooldown}
      isCodeComplete={code.every((d) => d !== "")}
      onSubmit={onVerifyPress}
      onResend={onResendCode}
      onBack={handleBack}
    />
  );
}