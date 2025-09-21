/**
 * UI Constants
 * 
 * Constants for UI elements, layouts, and user interface behavior.
 */

export const UI_CONSTANTS = {
  // Screen Dimensions (as percentages for responsiveness)
  SCREEN: {
    HEADER_HEIGHT_PERCENT: 12,
    TAB_BAR_HEIGHT_PERCENT: 8,
    SAFE_AREA_PADDING: 20,
  } as const,

  // Animation Durations (in milliseconds)
  ANIMATIONS: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000,
  } as const,

  // Z-Index Levels
  Z_INDEX: {
    BACKGROUND: 0,
    CONTENT: 1,
    OVERLAY: 10,
    MODAL: 100,
    TOOLTIP: 1000,
    LOADING: 9999,
  } as const,

  // Touch Target Sizes (for accessibility)
  TOUCH_TARGET: {
    MIN_SIZE: 44, // WCAG recommendation
    COMFORTABLE_SIZE: 48,
    LARGE_SIZE: 56,
  } as const,

  // Form Constants
  FORM: {
    INPUT_HEIGHT: 48,
    BUTTON_HEIGHT: 48,
    BORDER_WIDTH: 1,
    FOCUS_BORDER_WIDTH: 2,
  } as const,

  // List and Grid Constants
  LIST: {
    ITEM_HEIGHT: 64,
    SECTION_HEADER_HEIGHT: 40,
    SEPARATOR_HEIGHT: 1,
  } as const,

  // Loading and Error States
  STATES: {
    LOADING_TIMEOUT: 30000, // 30 seconds
    ERROR_DISPLAY_TIME: 5000, // 5 seconds
    SUCCESS_DISPLAY_TIME: 3000, // 3 seconds
  } as const,
} as const;

export type UIConstants = typeof UI_CONSTANTS;
