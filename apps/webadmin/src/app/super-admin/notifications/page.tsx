"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Notification = {
  _id: Id<"notifications"> | Id<"documentRejectionHistory">;
  _creationTime: number;
  title?: string;
  message: string;
  notificationType: string;
  actionUrl?: string;
  isRead: boolean;
};

export default function SuperAdminNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState("");
  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  
  // Get all admin notifications (this should be updated to get all system notifications for super admin)
  const adminNotifications = useQuery(api.notifications.getAdminNotifications, 
    { notificationType: undefined }
  );
  const rejectionNotifications = useQuery(api.notifications.getRejectionHistoryNotifications, {});
  
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markRejectionAsRead = useMutation(api.notifications.markRejectionHistoryAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);

  // Combine all notifications
  const allNotifications = [...(adminNotifications || []), ...(rejectionNotifications || [])]
    .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));

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

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (notification.notificationType === "DocumentResubmission") {
      markRejectionAsRead({ rejectionId: notification._id as Id<"documentRejectionHistory"> });
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "DocumentResubmission":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case "PaymentReceived":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "ApplicationStatusChange":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Notifications" message="Please wait..." />;
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges || adminPrivileges.managedCategories !== "all") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have Super Admin privileges to view this page."
          onCloseAction={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Notifications</h1>
              <p className="text-gray-600 mt-1">
                All notifications across the entire system
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {unreadCount} unread
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Back
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "all"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({allNotifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "unread"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === "read"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Read ({allNotifications.length - unreadCount})
              </button>
            </div>

            <select
              className="px-4 py-2 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={handleMarkAllAsRead}
              className="ml-auto px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mx-auto mb-4"
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
              <p className="text-gray-500 font-medium">No notifications to display</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {getNotificationIcon(notification.notificationType)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 bg-emerald-600 rounded-full mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification._creationTime), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {notification.notificationType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
