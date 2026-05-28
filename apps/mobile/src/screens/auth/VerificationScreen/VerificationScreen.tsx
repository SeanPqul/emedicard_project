// VerificationScreen component - Clean architecture implementation
import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { OtpInputUI } from '@features/auth/components';
import { OTP_CONFIG } from '@features/auth/constants';

export function VerificationScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const params = useLocalSearchParams();

  // State management
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");

  const email = typeof params.email === "string" ? params.email : "";

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [resendCooldown]);

  // Verification handler - redirect immediately after verification
  const handleVerifyCode = async () => {
    if (!isLoaded) return;

    setIsVerifying(true);
    setError("");

    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code: code.join("")
      });

      if (attempt.status === "complete" && attempt.createdSessionId) {
        // Set the session active
        await setActive?.({ session: attempt.createdSessionId });

        // Redirect directly to upload documents - no success screen
        router.replace('/(auth)/upload-documents');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Invalid or expired code.");
      setIsVerifying(false);
    }
    // Note: Don't set isVerifying to false on success since we're redirecting
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

  // Back handler
  const handleBack = () => {
    router.replace("/(auth)/sign-up");
  };

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