import { useMutation, useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useNotifications() {
  const userNotifications = useQuery(api.notifications.getUserNotifications.getUserNotificationsQuery, {});
  const unreadCount = useQuery(api.notifications.getUnreadCount.getUnreadCountQuery, {});

  const createNotificationMutation = useMutation(api.notifications.createNotification.createNotificationMutation);
  const markAsReadMutation = useMutation(api.notifications.markAsRead.markAsReadMutation);
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead.markAllAsReadMutation);

  const createNotification = async (input: {
    title: string;
    message: string;
    notificationType: "MissingDoc" | "PaymentReceived" | "ApplicationApproved" | "OrientationScheduled" | "CardIssue" | "status_update";
    userId: Id<'users'>;
    applicationId?: Id<'applications'>;
  }) => {
    return createNotificationMutation(input);
  };

  const markNotificationAsRead = async (notificationId: Id<'notifications'>) => {
    return markAsReadMutation({ notificationId });
  };

  const markAllNotificationsAsRead = async () => {
    return markAllAsReadMutation({});
  };

  return {
    data: {
      notifications: userNotifications,
      unreadCount,
    },
    isLoading: userNotifications === undefined,
    
    mutations: {
      createNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
    }
  };
}