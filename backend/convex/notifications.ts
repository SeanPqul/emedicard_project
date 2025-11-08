// Barrel Export File for Notifications
// This file re-exports all notification functions so they can be imported as:
// api.notifications.getAdminNotifications instead of api.notifications.getAdminNotifications.getAdminNotifications
//
// The folder was renamed from "notifications/" to "_notifications/" to avoid path conflicts
// Convex cannot have both a file and folder with the same name

export { getAdminNotifications } from "./_notifications/getAdminNotifications";
export { getUserNotifications } from "./_notifications/getUserNotifications";
export { getRejectionHistoryNotifications } from "./_notifications/getRejectionHistoryNotifications";
export { getPaymentRejectionNotifications } from "./_notifications/getPaymentRejectionNotifications";
// Alias the underlying export name to a stable public name
export { getUnreadCountQuery as getUnreadCount } from "./_notifications/getUnreadCount";

export { markNotificationAsRead } from "./_notifications/markNotificationAsRead";
export { markAllNotificationsAsRead } from "./_notifications/markAllNotificationsAsRead";
export { markRejectionHistoryAsRead } from "./_notifications/markRejectionHistoryAsRead";
// Optional secondary names used in mobile app hooks
export { markAsReadMutation as markAsRead } from "./_notifications/markAsRead";
export { markAllAsReadMutation as markAllAsRead } from "./_notifications/markAllAsRead";

export { createNotificationMutation as createNotification } from "./_notifications/createNotification";
export { sendAdminNotification } from "./_notifications/sendAdminNotification";

