/**
 * Unified Styles Export
 * 
 * This file exports all styling modules for easy imports throughout the app.
 * It provides a single source of truth for all styling-related imports.
 */

// Core theme system - single source of truth for all design tokens
export {
  // Theme object
  theme,
  // Color utilities
  colors,
  getColor,
  getColorWithAlpha,
  colorWithOpacity,
  getCategoryColorWithOpacity,
  hexWithOpacity,
  // Typography
  typography,
  getTypography,
  // Spacing (theme values, not styles)
  spacing,
  getSpacing,
  // Border radius
  borderRadius,
  getBorderRadius,
  // Shadows
  shadows,
  getShadow,
  // Breakpoints
  breakpoints,
  // Layout patterns from spacing module
  layoutPatterns,
  // Responsive tokens
  responsiveSpacing,
  responsiveFontSizes,
  responsiveBorderRadius,
  responsiveIconSizes,
  // Type exports
  type Theme
} from './theme/index';
export * from './screenStyles';

// Base component styles
export * from './components/base';

// Layout patterns and utilities - exported individually to avoid conflicts
export { flexLayouts } from './layouts/patterns';
export { spacing as spacingStyles } from './layouts/patterns'; // Aliased to avoid conflict with theme spacing
export { containers } from './layouts/patterns';
export { gridPatterns } from './layouts/patterns';
export { positioning } from './layouts/patterns';
export { overflow } from './layouts/patterns';
export * from './layouts/common-patterns';
export * from './layouts/form-patterns';

// Responsive design utilities - consolidated from responsive directory
export {
  // Scaling functions
  scale,
  verticalScale, 
  moderateScale,
  moderateVerticalScale,
  fontScale,
  scaleFont,
  scaleSpacing,
  // Dimension utilities
  wp,
  hp,
  widthPercentageToDP,
  heightPercentageToDP,
  dimensions,
  deviceUtils,
  // Breakpoint utilities
  getBreakpoint,
  isTablet,
  isMobile,
  responsiveValue,
  when,
  // Typography
  responsiveTypography,
  FONT_SIZES,
  FONT_WEIGHTS,
  // Note: Design tokens (spacing, borderRadius, iconSizes) are now in theme exports above
  // Design system object
  designSystem,
} from '../utils/responsive';

// Named style exports for easy importing
export { styles as resetPasswordStyles } from './screens/auth-reset-password';
export { styles as signInStyles } from './screens/auth-sign-in';
export { styles as signUpStyles } from './screens/auth-sign-up';
export { styles as verificationStyles } from './screens/auth-verification';

export { styles as applicationStyles } from './screens/tabs-application';
export { styles as applyStyles } from './screens/tabs-apply';
export { styles as dashboardStyles } from './screens/tabs-dashboard';
export { styles as notificationStyles } from './screens/tabs-notification';
export { styles as profileStyles } from './screens/tabs-profile';

// Component styles
export { modalStyles } from './components/modals';

// Shared screen styles  
export { profileEditStyles } from './screens/shared-profile-edit';

// Layout styles
export { layoutStyles } from './layouts/root-layout';
