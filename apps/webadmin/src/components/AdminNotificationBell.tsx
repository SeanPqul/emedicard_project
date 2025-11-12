'use client';

import { useStoreUser } from '@/app/hooks/useStoreUser';
import { NotificationCardCompact } from './notifications';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isLoggingOut } from '@/utils/convexErrorHandler';

export default function AdminNotificationBell() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [shouldSkipQueries, setShouldSkipQueries] = useState(false);

  // Check if we should skip queries (not authenticated or logging out)
  useEffect(() => {
    setShouldSkipQueries(!isSignedIn || isLoggingOut());
  }, [isSignedIn]);

  // Only run queries if user is authenticated and not logging out
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    shouldSkipQueries ? "skip" : undefined
  );
  const adminNotifications = useQuery(
    api.notifications.getAdminNotifications,
    shouldSkipQueries ? "skip" : { notificationType: undefined }
  );
  const rejectionHistoryNotifications = useQuery(
    api.notifications.getRejectionHistoryNotifications,
    shouldSkipQueries ? "skip" : {}
  );
  const paymentRejectionNotifications = useQuery(
    api.notifications.getPaymentRejectionNotifications,
    shouldSkipQueries ? "skip" : {}
  );
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markRejectionAsRead = useMutation(api.notifications.markRejectionHistoryAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const [isOpen, setIsOpen] = useState(false);

  const notifications = [
    ...(adminNotifications || []),
    ...(rejectionHistoryNotifications || []),
    ...(paymentRejectionNotifications || [])
  ].sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = (notification: any) => {
    // Mark as read based on notification type
    if (notification.notificationType === "DocumentResubmission" || notification.notificationType === "MedicalReferralResubmission") {
      markRejectionAsRead({ rejectionId: notification._id as Id<"documentRejectionHistory">, rejectionType: "document" });
    } else if (notification.notificationType === "PaymentResubmission") {
      markRejectionAsRead({ rejectionId: notification._id as Id<"paymentRejectionHistory">, rejectionType: "payment" });
    } else {
      markAsRead({ notificationId: notification._id as Id<"notifications"> });
    }
    
    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    // Determine the correct route based on admin privileges
    const isSuperAdmin = adminPrivileges?.managedCategories === "all";
    const notificationsRoute = isSuperAdmin ? "/super-admin/notifications" : "/dashboard/notifications";
    router.push(notificationsRoute);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[480px] origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center">
              <h3 className="text-lg text-gray-800 font-semibold">Notifications</h3>
              <button onClick={handleMarkAllAsRead} className="text-sm text-emerald-600 hover:text-emerald-800">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications?.map(notification => (
                <NotificationCardCompact
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
              {notifications?.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-2">
              <button onClick={handleViewAll} className="text-sm text-emerald-600 hover:text-emerald-800 text-center block w-full">View all notifications</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
