export interface VerificationPageProps {
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

export interface VerificationState {
  code: string;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
  showSuccess: boolean;
}

export interface SuccessScreenProps {
  title?: string;
  subtitle?: string;
  onClose?: () => void;
}
