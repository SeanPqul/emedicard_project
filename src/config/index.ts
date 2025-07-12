// Centralized configuration management
export const config = {
  // API Configuration
  api: {
    convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL!,
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // App Configuration
  app: {
    name: 'eMediCard',
    version: '1.0.0',
    environment: __DEV__ ? 'development' : 'production',
    enablePerformanceMonitoring: __DEV__,
    enableErrorReporting: !__DEV__,
  },
  
  // Feature Flags
  features: {
    enableLazyLoading: true,
    enableOfflineMode: false,
    enableBiometricAuth: false,
    enablePushNotifications: true,
    enableAnalytics: !__DEV__,
  },
  
  // Performance Settings
  performance: {
    imageCache: {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    listOptimization: {
      initialNumToRender: 10,
      maxToRenderPerBatch: 10,
      windowSize: 21,
      removeClippedSubviews: true,
    },
  },
  
  // UI Configuration
  ui: {
    animations: {
      duration: 300,
      useNativeDriver: true,
    },
    loadingTimeout: 10000, // 10 seconds
    debounceDelay: 300, // 300ms
  },
  
  // Storage Keys
  storage: {
    userPreferences: '@emedicard:preferences',
    authToken: '@emedicard:auth',
    onboardingComplete: '@emedicard:onboarding',
    theme: '@emedicard:theme',
  },
  
  // Validation Rules
  validation: {
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    username: {
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    phone: {
      pattern: /^(\+63|0)\d{10}$/,
    },
  },
};

// Helper functions for configuration access
export const getApiConfig = () => config.api;
export const getAppConfig = () => config.app;
export const getFeatureFlags = () => config.features;
export const getPerformanceConfig = () => config.performance;
export const getUIConfig = () => config.ui;
export const getStorageKeys = () => config.storage;
export const getValidationRules = () => config.validation;

// Environment checks
export const isDevelopment = () => __DEV__;
export const isProduction = () => !__DEV__;
export const isFeatureEnabled = (feature: keyof typeof config.features) => {
  return config.features[feature];
};
