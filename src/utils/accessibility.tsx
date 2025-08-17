/**
 * Accessibility Utilities - Enterprise Lite
 * 
 * Essential accessibility utilities for healthcare app without unnecessary complexity
 */

import { AccessibilityInfo, Platform } from 'react-native';
import React from 'react';

// ===== ACCESSIBILITY CONSTANTS =====

export const ACCESSIBILITY_ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  TEXT: 'text',
  IMAGE: 'image',
  HEADER: 'header',
  SEARCH: 'search',
  TAB: 'tab',
  TABLIST: 'tablist',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  NONE: 'none',
} as const;

// ===== PRACTICAL ACCESSIBILITY HELPERS =====

/**
 * Creates consistent accessibility props for interactive elements
 */
export const createAccessibilityProps = ({
  label,
  hint,
  role = ACCESSIBILITY_ROLES.BUTTON,
  state,
}: {
  label: string;
  hint?: string;
  role?: string;
  state?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
  };
}) => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role as any,
  ...(state && { accessibilityState: state }),
});

/**
 * Creates accessibility props for healthcare form inputs
 */
export const createInputAccessibilityProps = ({
  label,
  hint,
  required = false,
  hasError = false,
  errorMessage,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}) => {
  const accessibilityLabel = required ? `${label}, required` : label;
  const accessibilityHint = hasError && errorMessage 
    ? `${hint || ''} ${errorMessage}`.trim()
    : hint;

  return {
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole: 'text' as const,
    accessibilityState: {
      disabled: false,
    },
    ...(hasError && {
      accessibilityLiveRegion: 'polite' as const,
    }),
  };
};

/**
 * Creates accessibility props for healthcare status updates
 */
export const createStatusAccessibilityProps = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => ({
  accessibilityLabel: `${type}: ${message}`,
  accessibilityRole: 'text' as const,
  accessibilityLiveRegion: type === 'error' ? 'assertive' : 'polite' as const,
  importantForAccessibility: 'yes' as const,
});

/**
 * Creates accessibility props for navigation elements
 */
export const createNavigationAccessibilityProps = ({
  label,
  hint,
  current = false,
}: {
  label: string;
  hint?: string;
  current?: boolean;
}) => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: 'tab' as const,
  accessibilityState: {
    selected: current,
  },
});

// ===== ESSENTIAL ACCESSIBILITY HOOKS =====

/**
 * Hook to check if screen reader is enabled
 */
export const useScreenReader = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = React.useState(false);

  React.useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);

    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    return () => subscription?.remove();
  }, []);

  return isScreenReaderEnabled;
};

/**
 * Hook to announce messages to screen readers (important for healthcare alerts)
 */
export const useAccessibilityAnnouncement = () => {
  const announce = React.useCallback((message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  }, []);

  return announce;
};

// ===== HEALTHCARE-SPECIFIC ACCESSIBILITY VALIDATION =====

/**
 * Validates touch target size for accessibility (44px minimum)
 */
export const validateTouchTarget = (width: number, height: number) => {
  const MIN_TOUCH_TARGET = 44; // Apple HIG and Material Design recommendation
  
  return {
    isValid: width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET,
    width,
    height,
    minSize: MIN_TOUCH_TARGET,
    suggestions: {
      ...(width < MIN_TOUCH_TARGET && { 
        width: `Increase width to ${MIN_TOUCH_TARGET}px` 
      }),
      ...(height < MIN_TOUCH_TARGET && { 
        height: `Increase height to ${MIN_TOUCH_TARGET}px` 
      }),
    },
  };
};

// ===== SEMANTIC GROUPING FOR HEALTHCARE FORMS =====

/**
 * Creates props for semantic grouping of related healthcare form elements
 */
export const createSemanticGroup = (
  groupLabel: string,
  role: 'group' | 'radiogroup' | 'tablist' | 'menu' = 'group'
) => ({
  accessibilityRole: role,
  accessibilityLabel: groupLabel,
});

/**
 * Creates props for healthcare app landmark regions
 */
export const createLandmarkProps = (
  label: string,
  role: 'banner' | 'navigation' | 'main' | 'complementary' | 'contentinfo' = 'main'
) => ({
  accessibilityRole: role,
  accessibilityLabel: label,
  accessibilityViewIsModal: role === 'main',
});

// ===== TYPE EXPORTS =====

export type AccessibilityRole = keyof typeof ACCESSIBILITY_ROLES;