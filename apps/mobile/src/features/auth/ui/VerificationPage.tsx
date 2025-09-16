import { styles } from "@/src/styles/screens/auth-verification";
import React from 'react';
import { useVerificationState } from '../shared/ui/verification/hooks/useVerificationState';
import { VerificationForm } from '../shared/ui/verification/VerificationForm';
import { VerificationSuccess } from '../shared/ui/verification/VerificationSuccess';

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
  const verificationState = useVerificationState({
    onVerify,
    onResendCode,
    onSuccess,
    autoRedirect,
    redirectPath,
  });

  if (verificationState.isVerified) {
    return (
      <VerificationSuccess
        successTitle={successTitle}
        successSubtitle={successSubtitle}
        countdown={verificationState.countdown}
        showContinueButton={verificationState.showContinueButton}
        autoRedirect={autoRedirect}
        scaleAnim={verificationState.scaleAnim}
        onContinue={verificationState.handleContinue}
        styles={{
          successContainer: styles.successContainer,
          successContent: styles.successContent,
          successIcon: styles.successIcon,
          successTitle: styles.successTitle,
          successSubtitle: styles.successSubtitle,
          countdownContainer: styles.countdownContainer,
          countdownText: styles.countdownText,
          continueButton: styles.continueButton,
          continueButtonText: styles.continueButtonText,
        }}
      />
    );
  }

  return (
    <VerificationForm
      email={email}
      title={title}
      subtitle={subtitle}
      verifyButtonText={verifyButtonText}
      resendText={resendText}
      backButtonText={backButtonText}
      backButtonHref={backButtonHref}
      code={verificationState.code}
      error={verificationState.error}
      isVerifying={verificationState.isVerifying}
      isResending={verificationState.isResending}
      resendCooldown={verificationState.resendCooldown}
      isCodeComplete={verificationState.isCodeComplete}
      onCodeChange={verificationState.handleCodeChange}
      onKeyPress={verificationState.handleKeyPress}
      onVerifyPress={verificationState.onVerifyPress}
      onResendCodePress={verificationState.onResendCodePress}
      styles={styles}
    />
  );
}
