import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

type ConvexId<T extends string> = Id<T>;

export function useNotifications() {
  const userNotifications = useQuery(api.notifications.getUserNotifications.getUserNotificationsQuery, {});
  const unreadCount = useQuery(api.notifications.getUnreadCount.getUnreadCountQuery, {});

  const createNotificationMutation = useMutation(api.notifications.createNotification.createNotificationMutation);
  const markAsReadMutation = useMutation(api.notifications.markAsRead.markAsReadMutation);
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead.markAllAsReadMutation);

  const createNotification = async (input: {
    title: string;
    message: string;
    type: "MissingDoc" | "PaymentReceived" | "FormApproved" | "OrientationScheduled" | "CardIssue";
    userId: ConvexId<'users'>;
    formsId?: ConvexId<'forms'>;
  }) => {
    return createNotificationMutation(input);
  };

  const markNotificationAsRead = async (notificationId: ConvexId<'notifications'>) => {
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