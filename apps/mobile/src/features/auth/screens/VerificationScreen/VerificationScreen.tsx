// VerificationScreen component - Clean architecture implementation
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Animated, Text, TouchableOpacity, View } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OtpInputUI } from '../../components';
import { styles } from './VerificationScreen.styles';
import { OTP_CONFIG } from '../../constants';

// Success Screen Component
interface SuccessScreenProps {
  onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onContinue }) => {
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

export function VerificationScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams();

  // State management
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  const email = typeof params.email === "string" ? params.email : "";

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  // Verification handler
  const handleVerifyCode = async () => {
    if (!isLoaded) return;
    
    setIsVerifying(true);
    setError("");
    
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ 
        code: code.join("") 
      });
      
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

  // Resend code handler
  const handleResendCode = async () => {
    if (!isLoaded || resendCooldown > 0) return;
    
    setIsResending(true);
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendCooldown(OTP_CONFIG.RESEND_DELAY);
      Alert.alert("Success", "Verification code sent! Check your email.");
    } catch (err) {
      Alert.alert("Error", "Could not resend code.");
    } finally {
      setIsResending(false);
    }
  };

  // Continue after verification
  const handleContinue = useCallback(async () => {
    if (sessionId && setActive) {
      await setActive({ session: sessionId });
      router.replace('/(tabs)/index');
    }
  }, [sessionId, setActive, router]);

  // Back handler
  const handleBack = () => {
    router.replace("/(auth)/sign-up");
  };

  // Show success screen if verified
  if (isVerified) {
    return <SuccessScreen onContinue={handleContinue} />;
  }

  // Show verification form
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
      onSubmit={handleVerifyCode}
      onResend={handleResendCode}
      onBack={handleBack}
    />
  );
}
