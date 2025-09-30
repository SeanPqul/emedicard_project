// useAuth hook - Simplified auth state management
import { useState, useCallback, useEffect } from 'react';
import { useAuthService } from '@features/auth/services';
import { AuthUser, SignInFormData, SignUpFormData, AuthError, AuthState } from '@features/auth/types';

interface UseAuthReturn extends AuthState {
  // Auth methods
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const authService = useAuthService();
  
  // Local state for error handling and loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Sign in handler
  const signIn = useCallback(async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.signIn(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Sign up handler
  const signUp = useCallback(async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.signUp(data);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Sign out handler
  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.signOut();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Verify email handler
  const verifyEmail = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.verifyEmail(code);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Request password reset handler
  const requestPasswordReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.requestPasswordReset(email);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  // Reset password handler
  const resetPassword = useCallback(async (code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authService.resetPassword(code, newPassword);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [authService]);
  
  return {
    // Auth state
    user: authService.currentUser,
    isLoading: isLoading || !authService.isLoaded,
    isAuthenticated: authService.isSignedIn || false,
    error,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    
    // Utility methods
    clearError,
  };
}

// Password validation hook
export function usePasswordValidation() {
  const validatePassword = useCallback((password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      isValid: minLength && hasUppercase && hasLowercase && hasNumber,
    };
  }, []);
  
  return { validatePassword };
}

// OTP timer hook
export function useOtpTimer(initialTime: number = 60) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [isActive, timeLeft]);
  
  const startTimer = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(true);
  }, [initialTime]);
  
  const resetTimer = useCallback(() => {
    setTimeLeft(0);
    setIsActive(false);
  }, []);
  
  return {
    timeLeft,
    isActive,
    startTimer,
    resetTimer,
    canResend: !isActive || timeLeft === 0,
  };
}
