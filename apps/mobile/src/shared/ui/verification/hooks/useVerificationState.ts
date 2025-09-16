import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Alert, Animated } from 'react-native';

interface UseVerificationStateProps {
  onVerify: (code: string) => Promise<{ success: boolean; sessionId?: string }>;
  onResendCode: () => Promise<void>;
  onSuccess?: (sessionId?: string) => void;
  autoRedirect?: boolean;
  redirectPath?: string;
}

export function useVerificationState({
  onVerify,
  onResendCode,
  onSuccess,
  autoRedirect = true,
  redirectPath = "/(tabs)"
}: UseVerificationStateProps) {
  const router = useRouter();
  
  // Code input state
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  
  // Loading states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // UI states
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Success state handling
  useEffect(() => {
    if (isVerified) {
      // Animate success icon
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      if (onSuccess) {
        // Custom success handler
        onSuccess(sessionId ?? undefined);
      } else if (autoRedirect) {
        // Default auto-redirect behavior
        const countdownTimer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              router.replace(redirectPath as any);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Show continue button after 1 second
        const buttonTimer = setTimeout(() => {
          setShowContinueButton(true);
        }, 1000);

        return () => {
          clearInterval(countdownTimer);
          clearTimeout(buttonTimer);
        };
      }
    }
  }, [isVerified, scaleAnim, sessionId, onSuccess, autoRedirect, redirectPath, router]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    if (text && !/^\d$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError("");

    return { newCode, shouldFocusNext: text && index < 5 };
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      return { newCode, shouldFocusPrevious: true };
    }
    return { newCode: code, shouldFocusPrevious: false };
  };

  const onVerifyPress = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const result = await onVerify(fullCode);
      
      if (result.success) {
        setIsVerified(true);
        if (result.sessionId) {
          setSessionId(result.sessionId);
        }
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      
      // Handle common error types
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
        setError(err.message || "Invalid or expired code. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const onResendCodePress = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);

    try {
      await onResendCode();
      setResendCooldown(60);
      Alert.alert("Success", "Verification code sent! Check your email.");
    } catch (err: any) {
      console.error("Resend error:", err);
      Alert.alert("Error", err.message || "Could not resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleContinue = () => {
    if (onSuccess) {
      onSuccess(sessionId ?? undefined);
    } else {
      router.replace(redirectPath as any);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return {
    // State
    code,
    isVerifying,
    isResending,
    resendCooldown,
    isVerified,
    error,
    countdown,
    showContinueButton,
    sessionId,
    scaleAnim,
    isCodeComplete,
    
    // Actions
    handleCodeChange,
    handleKeyPress,
    onVerifyPress,
    onResendCodePress,
    handleContinue,
    setError,
  };
}
