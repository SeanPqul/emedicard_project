/**
 * Theme Colors Module
 * 
 * Centralized color palette for the application.
 * Includes brand colors, semantic colors, and UI-specific colors.
 */

export const colors = {
  // Brand colors - your main identity
  brand: {
    primary: '#10B981', // Green - Emedicard brand color
    secondary: '#2E86AB', // Blue - medical/healthcare theme (matches master)
  },
  
  // Primary color palette (for backward compatibility)
  primary: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981', // Main brand green
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Extended color palettes
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981', // Main brand green
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Secondary blue
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  neutral: {
    100: '#F5F5F5',
    200: '#E0E0E0',
    300: '#BDBDBD',
    400: '#9E9E9E',
  },
  // Semantic colors for UI states
  semantic: {
    success: '#10B981', // Same as brand primary
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6', // Same as brand secondary
  },
  accent: {
    primaryGreen: '#10B981', // AppBar, Primary Buttons
    medicalBlue: '#2E86AB', // Medical/Healthcare theme
    accentSky: '#107B5D', // Background highlights, Icons
    secondaryPale: '#D4F1FF', // Cards, Info Sections
    background: '#EDF7FA', // App background
    highlightYellow: '#FFEB3B', // Alerts, QR highlights
    safetyGreen: '#28A745', // Success states
    warningOrange: '#F18F01', // Warning states
  },
  // UI component specific colors
  ui: {
    primaryButton: '#10B981', // Green for primary actions
    secondaryButton: '#3B82F6', // Blue for secondary actions
    disabled: '#9CA3AF',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  jobCategories: {
    foodHandler: '#FFD700', // Yellow for food handlers
    securityGuard: '#4169E1', // Royal Blue for security guards
    others: '#6B46C1', // Purple for other categories
    pink: '#FF69B4', // Pink for skin-to-skin contact jobs
  },
  // Special purpose colors
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

export type Colors = typeof colors;
