import { convex } from '../lib/convexClient';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

/**
 * Notifications API Module
 * 
 * Feature-scoped API functions for notification operations.
 * Each function is small, focused, and uses Id types.
 */

/**
 * Get all notifications for the current user
 */
export async function getUserNotifications() {
  return convex.query(api.notifications.getUserNotifications.getUserNotificationsQuery, {});
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  return convex.query(api.notifications.getUnreadCount.getUnreadCountQuery, {});
}

/**
 * Create a new notification
 */
export async function createNotification(input: {
  title: string;
  message: string;
  type: "MissingDoc" | "PaymentReceived" | "FormApproved" | "OrientationScheduled" | "CardIssue";
  userId: Id<'users'>;
  formsId?: Id<'forms'>;
}) {
  return convex.mutation(api.notifications.createNotification.createNotificationMutation, input);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: Id<'notifications'>) {
  return convex.mutation(api.notifications.markAsRead.markAsReadMutation, { notificationId });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  return convex.mutation(api.notifications.markAllAsRead.markAllAsReadMutation, {});
}

