"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { NotificationCard } from "@/components/notifications";
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { getNotificationTypeLabel, getGroupedNotificationTypes } from "@/lib/notificationTypes";

type Notification = {
  _id: Id<"notifications"> | Id<"documentRejectionHistory"> | Id<"paymentRejectionHistory">;
  _creationTime: number;
  title?: string;
  message: string;
  notificationType: string;
  actionUrl?: string;
  isRead: boolean;
};

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );

  const shouldLoadNotifications =
    isClerkLoaded && !!user && !!adminPrivileges && adminPrivileges.isAdmin;
  
  const adminNotifications = useQuery(
    api.notifications.getAdminNotifications,
    shouldLoadNotifications ? { notificationType: undefined } : "skip"
  );
  const rejectionNotifications = useQuery(
    api.notifications.getRejectionHistoryNotifications,
    shouldLoadNotifications ? {} : "skip"
  );
  const paymentRejectionNotifications = useQuery(
    api.notifications.getPaymentRejectionNotifications,
    shouldLoadNotifications ? {} : "skip"
  );
  
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markRejectionAsRead = useMutation(api.notifications.markRejectionHistoryAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const clearReadNotifications = useMutation(api.notifications.clearReadNotifications);

  // Combine all notifications
  const allNotifications = [
    ...(adminNotifications || []),
    ...(rejectionNotifications || []),
    ...(paymentRejectionNotifications || [])
  ].sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

  // Filter notifications
  const filteredNotifications = allNotifications.filter((notif: Notification) => {
    const matchesReadStatus = 
      filter === "all" || 
      (filter === "unread" && !notif.isRead) || 
      (filter === "read" && notif.isRead);
    
    const matchesType = !typeFilter || notif.notificationType === typeFilter;
    
    return matchesReadStatus && matchesType;
  });

  // Get unique notification types
  const notificationTypes = Array.from(
    new Set(allNotifications.map((n: Notification) => n.notificationType))
  ).sort();

  // Group notification types for better dropdown organization
  const groupedTypes = useMemo(
    () => getGroupedNotificationTypes(notificationTypes),
    [notificationTypes]
  );

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (notification.notificationType === "DocumentResubmission") {
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
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearRead = async () => {
    const readCount = allNotifications.filter(n => n.isRead).length;
    if (readCount === 0) {
      alert('No read notifications to clear.');
      return;
    }
    
    if (confirm(`Are you sure you want to clear ${readCount} read notification(s)? This action cannot be undone.`)) {
      try {
        await clearReadNotifications();
      } catch (error) {
        console.error('Error clearing notifications:', error);
        alert('Failed to clear notifications. Please try again.');
      }
    }
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Notifications" message="Please wait..." />;
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges || !adminPrivileges.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have permission to view this page."
          onCloseAction={() => router.push("/")}
        />
      </div>
    );
  }

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        {/* Clean Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
              <p className="text-gray-500 text-sm mt-1">
                Notifications for your managed categories
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </header>

        {/* Simple Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All ({allNotifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "read"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Read ({allNotifications.length - unreadCount})
              </button>
            </div>

            <select
              className="px-3 py-1.5 border border-gray-200 text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {groupedTypes.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.types.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="sm:ml-auto flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                >
                  Mark All as Read
                </button>
              )}
              {allNotifications.filter(n => n.isRead).length > 0 && (
                <button
                  onClick={handleClearRead}
                  className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Clear Read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clean Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-300 mx-auto mb-3"
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
              <p className="text-gray-500 text-sm">No notifications to display</p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map((notification: Notification, index) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  showBorder={index !== filteredNotifications.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
