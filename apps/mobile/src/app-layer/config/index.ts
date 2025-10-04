/**
 * Consolidated Application Configuration
 * 
 * Central configuration for all app-wide settings, constants, and environment variables.
 */

// ===== APPLICATION CONFIGURATION =====

export const APP_CONFIG = {
  // App Information
  name: 'eMediCard',
  version: '1.0.0',
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFilesPerUpload: 5,
  },
  
  // Form Configuration
  forms: {
    autoSaveInterval: 30000, // 30 seconds
    maxSteps: 5,
    validationDebounce: 500, // 0.5 seconds
  },
  
  // UI Configuration
  ui: {
    animationDuration: 300,
    toastDuration: 4000,
    loadingTimeout: 10000,
  },
  
  // Storage Keys
  storageKeys: {
    user: 'user_profile',
    auth: 'auth_tokens',
    forms: 'saved_forms',
    preferences: 'user_preferences',
  },
  
  // Development flags
  dev: {
    enableLogging: __DEV__,
    showPerformanceMetrics: false,
    enableTestMode: false,
  },
} as const;

// ===== ENVIRONMENT CONFIGURATION =====

export const ENV_CONFIG = {
  // Environment Detection
  isDevelopment: __DEV__,
  isProduction: !__DEV__,
  
  // Build Configuration
  buildNumber: '1',
  buildDate: new Date().toISOString(),
  
  // Feature Flags
  features: {
    enableBiometrics: true,
    enablePushNotifications: true,
    enableAnalytics: !__DEV__,
    enableCrashReporting: !__DEV__,
  },
  
  // Performance Settings
  performance: {
    enableHermes: true,
    enableFlipper: __DEV__,
    enableReactDevTools: __DEV__,
  },
  
  // Debugging
  debug: {
    enableReduxLogger: __DEV__,
    enableNetworkLogging: __DEV__,
    showDevMenu: __DEV__,
  },
} as const;

// ===== TYPE EXPORTS =====

export type AppConfig = typeof APP_CONFIG;
export type EnvConfig = typeof ENV_CONFIG;

// ===== CONSOLIDATED CONFIG =====

export const CONFIG = {
  app: APP_CONFIG,
  env: ENV_CONFIG,
} as const;