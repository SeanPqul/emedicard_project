export const theme = {
  colors: {
    primary: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#10B981', // Main primary green 
      600: '#059669',
      700: '#047857',
      800: '#065F46',
      900: '#064E3B',
    },
    secondary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
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
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#DC3545',
      info: '#3B82F6',
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
    semanticUI: {
      primaryButton: '#10B981',
      secondaryButton: '#6C757D',
      disabled: '#BDBDBD',
      alert: '#FFEB3B',
      errorText: '#DC3545',
      successText: '#28A745',
      warningText: '#FFC107',
      infoText: '#17A2B8',
      infoCard: '#D4F1FF',
      dangerCard: '#F8D7DA',
      successCard: '#D4EDDA',
      warningCard: '#FFF3CD',
    },
    jobCategories: {
      foodHandler: '#FFD700', // Yellow for food handlers
      securityGuard: '#4169E1', // Royal Blue for security guards
      others: '#6B46C1', // Purple for other categories
      pink: '#FF69B4', // Pink for skin-to-skin contact jobs
    },
    ui: {
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
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
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

export type Theme = typeof theme;

export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let current: any = theme.colors;

  for (const key of keys) {
    current = current[key];
    if (!current) return undefined;
  }

  return current;
};

// Enhanced color utilities with alpha channel support
export const getColorWithAlpha = (colorPath: string, alpha: number = 1) => {
  const color = getColor(colorPath);
  if (!color) return undefined;
  
  // Convert hex to rgba if alpha is not 1
  if (alpha !== 1) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  return color;
};

// Create color variants with predefined alpha values
export const colorWithOpacity = {
  10: (colorPath: string) => getColorWithAlpha(colorPath, 0.1),
  20: (colorPath: string) => getColorWithAlpha(colorPath, 0.2),
  30: (colorPath: string) => getColorWithAlpha(colorPath, 0.3),
  40: (colorPath: string) => getColorWithAlpha(colorPath, 0.4),
  50: (colorPath: string) => getColorWithAlpha(colorPath, 0.5),
  60: (colorPath: string) => getColorWithAlpha(colorPath, 0.6),
  70: (colorPath: string) => getColorWithAlpha(colorPath, 0.7),
  80: (colorPath: string) => getColorWithAlpha(colorPath, 0.8),
  90: (colorPath: string) => getColorWithAlpha(colorPath, 0.9),
};

export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size];
};

export const getTypography = (variant: keyof typeof theme.typography) => {
  return theme.typography[variant];
};

export const getBorderRadius = (size: keyof typeof theme.borderRadius) => {
  return theme.borderRadius[size];
};

export const getShadow = (size: keyof typeof theme.shadows) => {
  return theme.shadows[size];
};

// Layout pattern helpers - for common inline style patterns
export const layoutPatterns = {
  // Flexbox patterns
  row: {
    flexDirection: 'row' as const,
  },
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  rowCenterSpaceBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  column: {
    flexDirection: 'column' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  centerHorizontal: {
    alignItems: 'center' as const,
  },
  centerVertical: {
    justifyContent: 'center' as const,
  },
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  flex1: {
    flex: 1,
  },
  
  // Spacing helpers for common spacing patterns
  spacer: (size: keyof typeof theme.spacing) => ({
    height: theme.spacing[size],
  }),
  horizontalSpacer: (size: keyof typeof theme.spacing) => ({
    width: theme.spacing[size],
  }),
  marginBottom: (size: keyof typeof theme.spacing) => ({
    marginBottom: theme.spacing[size],
  }),
  marginTop: (size: keyof typeof theme.spacing) => ({
    marginTop: theme.spacing[size],
  }),
  marginHorizontal: (size: keyof typeof theme.spacing) => ({
    marginHorizontal: theme.spacing[size],
  }),
  marginVertical: (size: keyof typeof theme.spacing) => ({
    marginVertical: theme.spacing[size],
  }),
  padding: (size: keyof typeof theme.spacing) => ({
    padding: theme.spacing[size],
  }),
  paddingHorizontal: (size: keyof typeof theme.spacing) => ({
    paddingHorizontal: theme.spacing[size],
  }),
  paddingVertical: (size: keyof typeof theme.spacing) => ({
    paddingVertical: theme.spacing[size],
  }),
};

// Color helper for category colors with opacity (for the dynamic background pattern)
export const getCategoryColorWithOpacity = (categoryColor: string, opacity: number = 0.2) => {
  // Handle both hex codes with and without #
  const hex = categoryColor.startsWith('#') ? categoryColor.slice(1) : categoryColor;
  
  // Parse hex color
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper function to convert hex to hex with alpha (for simpler usage)
export const hexWithOpacity = (hex: string, opacity: number) => {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${hex}${alpha}`;
};
