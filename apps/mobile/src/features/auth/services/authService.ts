// Auth Service - Centralized authentication logic
import { useSignIn, useSignUp, useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { AUTH_ROUTES, AUTH_ERRORS } from '@features/auth/constants';
import { AuthUser, SignInFormData, SignUpFormData, AuthError } from '@features/auth/types';

// Convert Clerk user to our AuthUser type
const mapClerkUserToAuthUser = (clerkUser: any): AuthUser => {
  return {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username || '',
    fullname: clerkUser.fullName || '',
    isVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
    role: 'applicant', // Default role, can be enhanced later
  };
};

// Map Clerk errors to our AuthError type
const mapClerkError = (error: any): AuthError => {
  if (error.errors && error.errors.length > 0) {
    const clerkError = error.errors[0];
    
    // Handle specific error codes
    switch (clerkError.code) {
      case 'form_identifier_not_found':
        return {
          code: 'USER_NOT_FOUND',
          message: 'No account found with this email address.',
          field: 'email',
        };
      
      case 'form_password_incorrect':
        return {
          code: 'INVALID_PASSWORD',
          message: 'Incorrect password. Please try again.',
          field: 'password',
        };
      
      case 'form_identifier_exists':
      case 'email_address_taken':
        return {
          code: 'EMAIL_TAKEN',
          message: 'This email is already registered.',
          field: 'email',
        };
      
      case 'session_exists':
        return {
          code: 'ALREADY_SIGNED_IN',
          message: 'You are already signed in.',
        };
      
      default:
        return {
          code: clerkError.code || 'UNKNOWN_ERROR',
          message: clerkError.longMessage || clerkError.message || AUTH_ERRORS.UNKNOWN_ERROR,
        };
    }
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || AUTH_ERRORS.UNKNOWN_ERROR,
  };
};

// Auth service class
export class AuthService {
  // Sign in with email and password
  static async signIn(data: SignInFormData, signInClerk: any): Promise<void> {
    try {
      const result = await signInClerk.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await signInClerk.setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      } else if (result.status === 'needs_identifier') {
        throw new Error('Please enter your email address');
      }
    } catch (error: any) {
      throw mapClerkError(error);
    }
  }

  // Sign up with email and password
  static async signUp(data: SignUpFormData, signUpClerk: any): Promise<void> {
    try {
      await signUpClerk.create({
        emailAddress: data.email,
        password: data.password,
      });
      
      await signUpClerk.prepareEmailAddressVerification({ strategy: "email_code" });
      
      router.replace({ 
        pathname: AUTH_ROUTES.VERIFICATION, 
        params: { email: data.email } 
      });
    } catch (error: any) {
      throw mapClerkError(error);
    }
  }

  // Sign out
  static async signOut(signOutFn: () => Promise<void>): Promise<void> {
    try {
      await signOutFn();
      router.replace(AUTH_ROUTES.SIGN_IN);
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  }

  // Verify email with OTP code
  static async verifyEmail(code: string, signUpClerk: any, setActive: any): Promise<string | null> {
    try {
      const attempt = await signUpClerk.attemptEmailAddressVerification({ 
        code 
      });
      
      if (attempt.status === 'complete') {
        if (attempt.createdSessionId && setActive) {
          await setActive({ session: attempt.createdSessionId });
          return attempt.createdSessionId;
        }
      }
      
      return null;
    } catch (error: any) {
      throw mapClerkError(error);
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string, signInClerk: any): Promise<void> {
    try {
      await signInClerk.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
    } catch (error: any) {
      throw mapClerkError(error);
    }
  }

  // Reset password with code
  static async resetPassword(code: string, newPassword: string, signInClerk: any): Promise<void> {
    try {
      const result = await signInClerk.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        Alert.alert('Success!', 'Your password has been reset successfully.');
        router.replace(AUTH_ROUTES.SIGN_IN);
      }
    } catch (error: any) {
      throw mapClerkError(error);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(isSignedIn: boolean | undefined): boolean {
    return isSignedIn === true;
  }

  // Get current user
  static getCurrentUser(user: any): AuthUser | null {
    if (!user) return null;
    return mapClerkUserToAuthUser(user);
  }
}

// Export a custom hook for easier usage
export function useAuthService() {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { signOut, isSignedIn, isLoaded: isAuthLoaded } = useClerkAuth();
  const { user } = useUser();

  return {
    // Auth state
    isLoaded: isSignInLoaded && isSignUpLoaded && isAuthLoaded,
    isSignedIn,
    currentUser: AuthService.getCurrentUser(user),

    // Auth methods
    signIn: (data: SignInFormData) => AuthService.signIn(data, signIn),
    signUp: (data: SignUpFormData) => AuthService.signUp(data, signUp),
    signOut: () => AuthService.signOut(signOut),
    verifyEmail: (code: string) => AuthService.verifyEmail(code, signUp, setSignUpActive),
    requestPasswordReset: (email: string) => AuthService.requestPasswordReset(email, signIn),
    resetPassword: (code: string, newPassword: string) => AuthService.resetPassword(code, newPassword, signIn),
  };
}