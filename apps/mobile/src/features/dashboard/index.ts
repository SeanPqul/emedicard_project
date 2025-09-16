/**
 * Dashboard Feature - Complete Implementation
 * Extracted from useOptimizedDashboard.ts
 */

import { useMemo } from 'react';
import { useCurrentUser } from '../../entities/user';
import { useApplications } from '../../entities/application';
import { useHealthCards } from '../../entities/healthCard';
import { useUserPayments } from '../../entities/payment';

// ===== TYPES =====
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  activeHealthCards: number;
  upcomingOrientations: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'application' | 'payment' | 'health_card' | 'notification';
  title: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'success' | 'warning' | 'info';
  actionUrl?: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
}

// ===== HOOKS =====
export const useOptimizedDashboard = () => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: { userApplications }, isLoading: isLoadingApplications } = useApplications();
  const { data: healthCards, isLoading: isLoadingHealthCards } = useHealthCards();
  const { data: payments, isLoading: isLoadingPayments } = useUserPayments();

  const dashboardStats = useMemo((): DashboardStats => {
    if (!userApplications || !healthCards || !payments) {
      return {
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        activeHealthCards: 0,
        upcomingOrientations: 0,
        recentActivity: [],
      };
    }

    const totalApplications = userApplications.length;
    const pendingApplications = userApplications.filter(app => 
      app.status === 'Submitted' || app.status === 'Under Review'
    ).length;
    const approvedApplications = userApplications.filter(app => 
      app.status === 'Approved' || app.status === 'Completed'
    ).length;
    const activeHealthCards = healthCards.filter(card => 
      card.status === 'Active'
    ).length;

    // Generate recent activity from applications, payments, etc.
    const recentActivity: ActivityItem[] = [
      ...userApplications.slice(0, 3).map(app => ({
        id: app._id,
        type: 'application' as const,
        title: 'Application Update',
        description: `Your ${app.applicationType.toLowerCase()} application is ${app.status.toLowerCase()}`,
        timestamp: app._creationTime,
        status: getStatusFromApplicationStatus(app.status),
      })),
      ...payments.slice(0, 2).map(payment => ({
        id: payment._id,
        type: 'payment' as const,
        title: 'Payment Processed',
        description: `Payment of ₱${payment.netAmount} via ${payment.paymentMethod}`,
        timestamp: payment._creationTime,
        status: getStatusFromPaymentStatus(payment.status),
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      activeHealthCards,
      upcomingOrientations: 0, // TODO: Implement when orientations are added
      recentActivity,
    };
  }, [userApplications, healthCards, payments]);

  const dashboardCards = useMemo((): DashboardCard[] => {
    return [
      {
        id: 'total-applications',
        title: 'Total Applications',
        value: dashboardStats.totalApplications,
        icon: 'document-text',
        color: '#3B82F6',
      },
      {
        id: 'pending-applications',
        title: 'Pending Review',
        value: dashboardStats.pendingApplications,
        icon: 'time',
        color: '#F59E0B',
      },
      {
        id: 'approved-applications',
        title: 'Approved',
        value: dashboardStats.approvedApplications,
        icon: 'checkmark-circle',
        color: '#10B981',
      },
      {
        id: 'active-cards',
        title: 'Active Health Cards',
        value: dashboardStats.activeHealthCards,
        icon: 'card',
        color: '#8B5CF6',
      },
    ];
  }, [dashboardStats]);

  const isLoading = isLoadingUser || isLoadingApplications || isLoadingHealthCards || isLoadingPayments;

  return {
    user: currentUser,
    stats: dashboardStats,
    cards: dashboardCards,
    isLoading,
    error: null, // TODO: Implement proper error handling
  };
};

// ===== UTILITY FUNCTIONS =====
const getStatusFromApplicationStatus = (status: string): ActivityItem['status'] => {
  switch (status) {
    case 'Approved':
    case 'Completed':
      return 'success';
    case 'Submitted':
    case 'Under Review':
      return 'pending';
    case 'Rejected':
      return 'warning';
    default:
      return 'info';
  }
};

const getStatusFromPaymentStatus = (status: string): ActivityItem['status'] => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'pending';
    case 'Failed':
      return 'warning';
    default:
      return 'info';
  }
};

// ===== DASHBOARD WIDGETS =====
export const useDashboardWidgets = () => {
  const { stats } = useOptimizedDashboard();

  const widgets = useMemo(() => [
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      data: [
        { id: 'new-application', title: 'New Application', icon: 'add-circle', route: '/(tabs)/apply' },
        { id: 'view-cards', title: 'Health Cards', icon: 'card', route: '/(screens)/(shared)/health-cards' },
        { id: 'track-application', title: 'Track Application', icon: 'search', route: '/(tabs)/application' },
      ],
    },
    {
      id: 'recent-activity',
      type: 'activity',
      title: 'Recent Activity',
      data: stats.recentActivity,
    },
    {
      id: 'application-status',
      type: 'status',
      title: 'Application Status',
      data: {
        total: stats.totalApplications,
        pending: stats.pendingApplications,
        approved: stats.approvedApplications,
      },
    },
  ], [stats]);

  return widgets;
};

// ===== UI COMPONENTS =====
export interface DashboardProps {
  userRole?: string;
}

export interface DashboardCardProps {
  card: DashboardCard;
  onPress?: () => void;
}

export interface ActivityListProps {
  activities: ActivityItem[];
  onActivityPress?: (activity: ActivityItem) => void;
}

// ===== UI COMPONENTS =====
export * from './ui';

// Placeholder components that would be extracted from existing dashboard components
export const StatsCards = () => null; // TODO: Extract from existing component
export const RecentActivityList = () => null; // TODO: Extract from existing component
export const QuickActions = () => null; // TODO: Extract from existing component
export const ApplicationStatusChart = () => null; // TODO: Create new component
