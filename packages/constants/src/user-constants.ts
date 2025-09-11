/**
 * User Constants
 * 
 * Constants related to user management and authentication
 */

// ===== USER ROLES =====
export const USER_ROLES = {
  APPLICANT: 'applicant',
  INSPECTOR: 'inspector', 
  ADMIN: 'admin'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.APPLICANT]: 'Applicant',
  [USER_ROLES.INSPECTOR]: 'Inspector',
  [USER_ROLES.ADMIN]: 'Administrator'
} as const;

// ===== USER PREFERENCES =====
export const LANGUAGES = {
  ENGLISH: 'en',
  FILIPINO: 'fil'
} as const;

export const LANGUAGE_LABELS = {
  [LANGUAGES.ENGLISH]: 'English',
  [LANGUAGES.FILIPINO]: 'Filipino'
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

export const THEME_LABELS = {
  [THEMES.LIGHT]: 'Light',
  [THEMES.DARK]: 'Dark',
  [THEMES.SYSTEM]: 'System'
} as const;

// ===== GENDER OPTIONS =====
export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
} as const;

export const GENDER_LABELS = {
  [GENDERS.MALE]: 'Male',
  [GENDERS.FEMALE]: 'Female',
  [GENDERS.OTHER]: 'Other'
} as const;

// ===== USER VALIDATION CONSTANTS =====
export const USER_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  FULLNAME_MIN_LENGTH: 2,
  FULLNAME_MAX_LENGTH: 100,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PHONE_PATTERN: /^(\+63|0)9\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// ===== DEFAULT VALUES =====
export const DEFAULT_USER_VALUES = {
  THEME: THEMES.SYSTEM,
  LANGUAGE: LANGUAGES.ENGLISH,
  ROLE: USER_ROLES.APPLICANT,
  NOTIFICATIONS: {
    email: true,
    push: true,
    sms: false,
    inApp: true
  }
} as const;

// ===== USER STATUS CONSTANTS =====
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
} as const;

export const USER_STATUS_LABELS = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.INACTIVE]: 'Inactive',
  [USER_STATUSES.SUSPENDED]: 'Suspended',
  [USER_STATUSES.PENDING]: 'Pending Verification'
} as const;