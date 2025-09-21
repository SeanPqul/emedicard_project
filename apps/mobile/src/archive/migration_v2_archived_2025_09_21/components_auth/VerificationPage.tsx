import { styles } from "@/src/styles/screens/auth-verification";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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

interface VerificationPageProps {
  // Required props
  email: string;
  onVerify: (code: string) => Promise<{ success: boolean; sessionId?: string }>;
  onResendCode: () => Promise<void>;
  
  // Optional customization props
  title?: string;
  subtitle?: string;
  successTitle?: string;
  successSubtitle?: string;
  backButtonText?: string;
  backButtonHref?: string;
  verifyButtonText?: string;
  resendText?: string;
  
  // Flow type for different behaviors
  flowType?: 'signup' | 'password-reset';
  
  // Custom success handler (if you don't want auto-redirect)
  onSuccess?: (sessionId?: string) => void;
  
  // Auto redirect settings
  autoRedirect?: boolean;
  redirectPath?: string;
}

export default function VerificationPage({
  email,
  onVerify,
  onResendCode,
  title = "Verify Your Email",
  subtitle = "We've sent a 6-digit code to your email address.",
  successTitle = "Email Verified Successfully!",
  successSubtitle = "Your account has been verified. Redirecting to your dashboard...",
  backButtonText = "Back to Sign Up",
  backButtonHref = "/(auth)/sign-up",
  verifyButtonText = "Verify Email",
  resendText = "Didn't receive the code?",
  flowType = 'signup',
  onSuccess,
  autoRedirect = true,
  redirectPath = "/(tabs)"
}: VerificationPageProps) {
  const router = useRouter();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

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

  const isCodeComplete = code.every((digit) => digit !== "");

  const handleContinue = () => {
    if (onSuccess) {
      onSuccess(sessionId ?? undefined);
    } else {
      router.replace(redirectPath as any);
    }
  };

  if (isVerified) {
    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[styles.successContent, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>{successTitle}</Text>
          <Text style={styles.successSubtitle}>{successSubtitle}</Text>
          
          {autoRedirect && (
            <View style={styles.countdownContainer}>
              <Text style={styles.countdownText}>
                Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}
              </Text>
              {showContinueButton && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                >
                  <Text style={styles.continueButtonText}>Continue Now</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {!autoRedirect && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
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
            source={require("../../../assets/images/email-envelope-icon.png")}
            style={styles.emailIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
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
              {isVerifying ? "Verifying..." : verifyButtonText}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{resendText}</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCodePress}
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
            <Link href={backButtonHref as any} style={styles.backLink} replace>
              <View style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.backText}>{backButtonText}</Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}