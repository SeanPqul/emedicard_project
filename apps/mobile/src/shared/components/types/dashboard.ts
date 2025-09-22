/**
 * Dashboard Component Types
 * 
 * Centralized type definitions for dashboard-related components
 */

import { ViewStyle, TextStyle } from 'react-native';
import { BaseComponentProps } from '@types/design-system';

// ===== STAT CARD TYPES =====
export interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  loading?: boolean;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  titleStyle?: TextStyle;
  valueStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// ===== ACTIVITY ITEM TYPES =====
export interface RecentActivity {
  id: string;
  type: 'application' | 'payment' | 'notification' | 'verification';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface ActivityItemProps {
  activity: RecentActivity;
  onPress?: (activity: RecentActivity) => void;
  showTime?: boolean;
  showStatus?: boolean;
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  textStyle?: TextStyle;
}

// ===== DASHBOARD HEADER TYPES =====
export interface DashboardHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  avatar?: {
    uri?: string;
    initials?: string;
    backgroundColor?: string;
  };
  notifications?: {
    count: number;
    onPress: () => void;
  };
  actions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
  }>;
  onAvatarPress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

// ===== SCREEN HEADER TYPES =====
export interface ScreenHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: Array<{
    icon: string;
    onPress: () => void;
    disabled?: boolean;
  }>;
  backgroundColor?: string;
  textColor?: string;
  statusBarStyle?: 'light' | 'dark';
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
}

// ===== PROFILE LINK TYPES =====
export interface ProfileLinkProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  disabled?: boolean;
  badge?: {
    text: string;
    color?: string;
  };
  containerStyle?: ViewStyle;
  iconStyle?: ViewStyle;
  textStyle?: TextStyle;
}

// ===== DASHBOARD STATS TYPES =====
export interface DashboardStats {
  activeApplications: number;
  pendingPayments: number;
  upcomingOrientations: number;
  validHealthCards: number;
  pendingAmount: number;
  nextOrientationDate?: string;
  lastUpdated?: string;
}