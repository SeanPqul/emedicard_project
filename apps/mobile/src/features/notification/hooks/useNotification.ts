import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

export function useNotification(notificationId: string | undefined) {
  // Fetch all notifications and find the specific one
  const notifications = useQuery(api.notifications.getUserNotifications, {});
  const notification = notifications?.find((n: { _id: string }) => n._id === notificationId);

  // Fetch related application if it exists
  const application = useQuery(
    api.applications.getApplicationById.getApplicationByIdQuery,
    notification?.applicationId ? { applicationId: notification.applicationId } : 'skip'
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
    notification,
    application,
    isLoading: notifications === undefined,
    markAsRead,
  };
}
