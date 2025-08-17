/**
 * Design System Types
 * 
 * TypeScript interfaces for component variants and design system utilities
 */

// ===== BUTTON TYPES =====
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'none';

export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

// ===== CARD TYPES =====
export type CardVariant = 
  | 'default' 
  | 'flat' 
  | 'elevated' 
  | 'interactive' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

export interface CardStyleProps {
  variant?: CardVariant;
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
}

// ===== BADGE TYPES =====
export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'neutral' 
  | 'successOutline' 
  | 'warningOutline' 
  | 'errorOutline' 
  | 'infoOutline';

export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeStyleProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

// ===== INPUT TYPES =====
export type InputVariant = 'default' | 'success' | 'error';
export type InputState = 'default' | 'focused' | 'disabled';

export interface InputStyleProps {
  variant?: InputVariant;
  state?: InputState;
  hasError?: boolean;
  multiline?: boolean;
}

// ===== SPACING TYPES =====
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface SpacingProps {
  margin?: SpacingSize;
  marginHorizontal?: SpacingSize;
  marginVertical?: SpacingSize;
  marginTop?: SpacingSize;
  marginBottom?: SpacingSize;
  marginLeft?: SpacingSize;
  marginRight?: SpacingSize;
  padding?: SpacingSize;
  paddingHorizontal?: SpacingSize;
  paddingVertical?: SpacingSize;
  paddingTop?: SpacingSize;
  paddingBottom?: SpacingSize;
  paddingLeft?: SpacingSize;
  paddingRight?: SpacingSize;
}

// ===== LAYOUT TYPES =====
export type FlexDirection = 'row' | 'column';
export type JustifyContent = 
  | 'flex-start' 
  | 'flex-end' 
  | 'center' 
  | 'space-between' 
  | 'space-around' 
  | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

export interface LayoutProps extends SpacingProps {
  flex?: number;
  flexDirection?: FlexDirection;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  wrap?: boolean;
}

// ===== COLOR TYPES =====
export type ThemeColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'gray'
  | 'neutral';

export type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export interface ColorProps {
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
}

// ===== TYPOGRAPHY TYPES =====
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'bodySmall' 
  | 'caption' 
  | 'button';

export type FontWeight = 
  | 'thin'
  | 'extraLight' 
  | 'light' 
  | 'regular' 
  | 'medium' 
  | 'semiBold' 
  | 'bold' 
  | 'extraBold' 
  | 'black';

export interface TypographyProps {
  variant?: TypographyVariant;
  weight?: FontWeight;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
}

// ===== RESPONSIVE TYPES =====
export type BreakpointSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveValue<T> {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

// ===== ACCESSIBILITY TYPES =====
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 
    | 'button' 
    | 'link' 
    | 'text' 
    | 'image' 
    | 'header' 
    | 'none'
    | 'search'
    | 'tab'
    | 'tablist'
    | 'menu'
    | 'menuitem';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
  testID?: string;
}

// ===== COMPONENT BASE PROPS =====
export interface BaseComponentProps extends AccessibilityProps {
  style?: any;
  children?: React.ReactNode;
}

// ===== DESIGN SYSTEM COMPONENT PROPS =====
export interface DesignSystemButtonProps 
  extends BaseComponentProps, ButtonStyleProps, ColorProps {
  title?: string;
  onPress?: () => void;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  // Legacy CustomButton compatibility
  minimumTouchTarget?: boolean;
  loadingIndicatorColor?: string;
  buttonStyle?: any;
  textStyle?: any;
}

export interface DesignSystemCardProps 
  extends BaseComponentProps, CardStyleProps, ColorProps {
  onPress?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export interface DesignSystemTextProps 
  extends BaseComponentProps, TypographyProps {
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

// ===== STATUS TYPES =====
export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusProps {
  status?: StatusType;
  message?: string;
  showIcon?: boolean;
}