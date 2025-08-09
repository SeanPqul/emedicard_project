// src/components/auth/OtpInputUI.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// Use the same styles or create a new generic style sheet
import { styles } from "@/assets/styles/auth-styles/verification"; // You can reuse styles

// Define the props this component will accept
interface OtpInputUIProps {
  title: string;
  subtitle: string;
  email: string;
  buttonText: string;
  backLinkText: string;
  code: string[];
  setCode: (code: string[]) => void;
  error?: string;
  isLoading: boolean;
  isResending: boolean;
  resendCooldown: number;
  isCodeComplete: boolean;
  onSubmit: () => void;
  onResend: () => void;
  onBack: () => void;
}

export const OtpInputUI: React.FC<OtpInputUIProps> = ({
  title,
  subtitle,
  email,
  buttonText,
  backLinkText,
  code,
  setCode,
  error,
  isLoading,
  isResending,
  resendCooldown,
  isCodeComplete,
  onSubmit,
  onResend,
  onBack,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    if (text && !/^\d$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image
            source={require("../../assets/images/email-envelope-icon.png")}
            style={styles.emailIcon}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.emailText}>{email}</Text>

        <View style={styles.formContainer}>
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
                editable={!isLoading}
              />
            ))}
          </View>

          <View style={[styles.errorContainer]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isCodeComplete || isLoading) && styles.buttonDisabled,
            ]}
            onPress={onSubmit}
            disabled={isLoading || !isCodeComplete}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? "Verifying..." : buttonText}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn&apos;t receive the code?</Text>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResend}
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
            <TouchableOpacity onPress={onBack} style={styles.backLink}>
              <View style={styles.backButton}>
                <Ionicons name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.backText}>{backLinkText}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};