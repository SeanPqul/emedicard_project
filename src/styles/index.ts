/**
 * Unified Styles Export
 * 
 * This file exports all styling modules for easy imports throughout the app.
 * It provides a single source of truth for all styling-related imports.
 */

// Core theme system
export * from './theme';
export * from './screenStyles';

// Base component styles
export * from './components/base';

// Layout patterns and utilities
export * from './layouts/patterns';
export * from './layouts/common-patterns';
export * from './layouts/form-patterns';

// Responsive design utilities - consolidated from new responsive structure
export {
  moderateScale,
  verticalScale,
  scale,
  wp,
  hp,
  widthPercentageToDP,
  heightPercentageToDP,
  spacing,
  borderRadius,
  iconSizes,
  dimensions,
  responsiveValue,
  responsiveTypography,
  designSystem,
  getBreakpoint,
  isTablet,
  isMobile,
  when,
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

// Form styles
export { styles as applyFormStyles } from './screens/tabs-apply-forms';
