'use client';

import { useStoreUser } from '@/app/hooks/useStoreUser';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';

export default function AdminNotificationBell() {
  const adminId = useStoreUser();

  const adminNotifications = useQuery(api.notifications.getAdminNotifications, adminId ? { adminId, notificationType: undefined } : "skip");
  const rejectionHistoryNotifications = useQuery(api.notifications.getRejectionHistoryNotifications, {});
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const [isOpen, setIsOpen] = useState(false);

  const notifications = [...(adminNotifications || []), ...(rejectionHistoryNotifications || [])]
    .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleNotificationClick = (notificationId: Id<"notifications"> | Id<"documentRejectionHistory">) => {
    // This needs to be adjusted to handle both types of notifications
    // For now, we'll just mark the notification as read if it's a regular notification
    if ('markAsRead' in api.notifications) {
      markAsRead({ notificationId: notificationId as Id<"notifications"> });
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
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
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="border-b border-gray-200 px-4 py-2 flex justify-between items-center">
              <h3 className="text-lg text-gray-800 font-semibold">Notifications</h3>
              <button onClick={handleMarkAllAsRead} className="text-sm text-emerald-600 hover:text-emerald-800">Mark all as read</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications?.map(notification => (
                <Link key={notification._id} href={notification.actionUrl || '#'} onClick={() => handleNotificationClick(notification._id)} className={`block px-4 py-3 text-sm hover:bg-gray-100 ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    <p>{notification.title}</p>
                    <p className={`text-xs ${notification.isRead ? 'text-gray-400' : 'text-gray-500'}`}>{notification.message}</p>
                </Link>
              ))}
              {notifications?.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-500">No new notifications.</p>
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-2">
                <Link href="/dashboard/notification-management" onClick={() => setIsOpen(false)} className="text-sm text-emerald-600 hover:text-emerald-800 text-center block">View all notifications</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
