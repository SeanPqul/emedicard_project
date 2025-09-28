import { api } from '@backend/convex/_generated/api';
import { ConvexClient } from 'convex/browser';
import { DashboardData, DashboardStats, RecentActivity } from '@features/dashboard/types';

/**
 * Dashboard Service
 * 
 * Handles all dashboard-related API operations with proper error handling,
 * data transformation, and caching strategies.
 */
export class DashboardService {
  constructor(private convexClient: ConvexClient) {}

  /**
   * Fetch complete dashboard data
   * Returns aggregated data from the backend
   */
  async getDashboardData(): Promise<DashboardData | null> {
    try {
      const data = await this.convexClient.query(
        api.dashboard.getDashboardData.getDashboardDataQuery,
        {}
      );
      
      if (!data) return null;

      // Transform backend data to match our frontend types
      const stats: DashboardStats = {
        activeApplications: data.stats.activeApplications,
        pendingPayments: data.stats.pendingPayments,
        pendingAmount: data.stats.pendingAmount,
        validHealthCards: data.stats.validHealthCards,
        unreadNotifications: data.stats.unreadNotifications,
      };

      // Transform activities
      const recentActivities = this.transformActivities(
        data.notifications,
        data.applications,
        data.payments
      );

      return {
        stats,
        recentActivities,
        alerts: [], // TODO: Implement alerts based on business rules
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new DashboardServiceError(
        'Failed to fetch dashboard data',
        'FETCH_ERROR',
        error
      );
    }
  }

  /**
   * Transform raw backend data into RecentActivity format
   */
  private transformActivities(
    notifications: any[],
    applications: any[],
    payments: any[]
  ): RecentActivity[] {
    const activities: RecentActivity[] = [];

    // Add notifications
    notifications?.forEach(notification => {
      activities.push({
        id: notification._id,
        userId: notification.userId || '',
        type: 'notification_sent' as const,
        title: notification.message || notification.title || 'New Notification',
        description: this.getNotificationDescription(notification),
        timestamp: new Date(notification._creationTime || 0),
        status: notification.isRead ? 'success' : 'pending',
        metadata: {
          notificationType: notification.notificationType,
          actionUrl: notification.actionUrl,
        },
      });
    });

    // Add applications
    applications?.slice(0, 2).forEach(application => {
      activities.push({
        id: application._id,
        userId: application.userId || '',
        type: 'application_submitted' as const,
        title: `Health Card Application ${application.status || 'Pending'}`,
        description: `Application for ${application.applicationType || 'health card'} is now ${application.status?.toLowerCase() || 'pending'}`,
        timestamp: new Date(application._creationTime || 0),
        status: this.getApplicationActivityStatus(application.status || 'pending'),
        metadata: {
          applicationType: application.applicationType,
          jobCategory: application.jobCategory,
        },
      });
    });

    // Add payments
    payments?.forEach(payment => {
      if (payment) {
        activities.push({
          id: payment._id,
          userId: payment.userId || '',
          type: 'payment_made' as const,
          title: `Payment ${payment.status}`,
          description: `₱${payment.netAmount.toFixed(2)} payment via ${payment.paymentMethod}`,
          timestamp: new Date(payment.updatedAt || payment._creationTime || 0),
          status: payment.status === 'Complete' ? 'success' : payment.status === 'Failed' ? 'error' : 'pending',
          metadata: {
            amount: payment.netAmount,
            method: payment.paymentMethod,
          },
        });
      }
    });

    // Sort by timestamp and limit to 5 most recent
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }

  /**
   * Get appropriate description for notification types
   */
  private getNotificationDescription(notification: any): string {
    const descriptions: Record<string, string> = {
      'application_update': 'Your health card application status has been updated',
      'payment_reminder': 'Payment reminder for your health card application',
      'document_required': 'Additional documents required for your application',
      'appointment': 'Appointment scheduled for health card processing',
      'MissingDoc': 'Missing documents need to be uploaded',
      'PaymentReceived': 'Your payment has been received',
      'FormApproved': 'Your application has been approved',
      'OrientationScheduled': 'Food safety orientation has been scheduled',
      'CardIssue': 'Your health card has been issued',
    };
    
    return descriptions[notification.notificationType || notification.type] || 
           'You have a new notification regarding your health card';
  }

  /**
   * Map application status to activity status
   */
  private getApplicationActivityStatus(status: string): 'success' | 'pending' | 'error' {
    const statusMap: Record<string, 'success' | 'pending' | 'error'> = {
      'Approved': 'success',
      'Complete': 'success',
      'Rejected': 'error',
      'Cancelled': 'error',
      'Submitted': 'pending',
      'Under Review': 'pending',
    };
    
    return statusMap[status] || 'pending';
  }

  /**
   * Mock data for development/testing
   */
  getMockDashboardData(): DashboardData {
    return {
      stats: {
        activeApplications: 1,
        pendingPayments: 0,
        pendingAmount: 0,
        validHealthCards: 2,
        unreadNotifications: 3,
      },
      recentActivities: [
        {
          id: '1',
          userId: 'mock-user-id',
          type: 'application_submitted' as const,
          title: 'Health Card Application Approved',
          description: 'Your health card application has been approved',
          timestamp: new Date(),
          status: 'success',
        },
        {
          id: '2',
          userId: 'mock-user-id',
          type: 'payment_made' as const,
          title: 'Payment Complete',
          description: '₱60.00 payment via Gcash',
          timestamp: new Date(Date.now() - 86400000),
          status: 'success',
        },
      ],
      alerts: [],
    };
  }
}

/**
 * Custom error class for dashboard service errors
 */
export class DashboardServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DashboardServiceError';
  }
}

/**
 * Dashboard service singleton factory
 */
let dashboardService: DashboardService | null = null;

export const getDashboardService = (convexClient: ConvexClient): DashboardService => {
  if (!dashboardService) {
    dashboardService = new DashboardService(convexClient);
  }
  return dashboardService;
};
