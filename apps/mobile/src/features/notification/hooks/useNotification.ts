import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useNotification(notificationId: string | undefined) {
  // Use combined query to fetch notification and application in single request
  const data = useQuery(
    api.notifications.getNotificationWithDetails,
    notificationId ? { notificationId: notificationId as Id<'notifications'> } : 'skip'
  );

  // Mark as read mutation
  const markAsReadMutation = useMutation(api.notifications.markAsRead);

  const markAsRead = async () => {
    if (!notificationId) return;
    
    try {
      await markAsReadMutation({ notificationId: notificationId as Id<'notifications'> });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notification: data?.notification,
    application: data?.application,
    isLoading: notificationId ? data === undefined : false,
    markAsRead,
  };
}
