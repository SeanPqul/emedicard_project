// Auth feature constants

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in',
  ACCOUNT_LOCKED: 'Your account has been locked',
  NETWORK_ERROR: 'Network error. Please try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

export const AUTH_ROUTES = {
  SIGN_IN: '/(auth)/sign-in',
  SIGN_UP: '/(auth)/sign-up',
  VERIFICATION: '/(auth)/verification',
  RESET_PASSWORD: '/(auth)/reset-password',
} as const;

export const AUTH_STORAGE_KEYS = {
  USER_TOKEN: '@auth_user_token',
  USER_DATA: '@auth_user_data',
  REMEMBER_ME: '@auth_remember_me',
} as const;

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
} as const;

export const OTP_CONFIG = {
  LENGTH: 6,
  TIMEOUT: 300, // 5 minutes in seconds
  RESEND_DELAY: 60, // 1 minute in seconds
} as const;
