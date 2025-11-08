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
import React, { useState } from "react";

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
    api.users.roles.getAdminPrivileges
  );
  
  const adminNotifications = useQuery(
    api.notifications.getAdminNotifications,
    { notificationType: undefined }
  );
  const rejectionNotifications = useQuery(
    api.notifications.getRejectionHistoryNotifications,
    {}
  );
  const paymentRejectionNotifications = useQuery(
    api.notifications.getPaymentRejectionNotifications,
    {}
  );
  
  const markAsRead = useMutation(api.notifications.markNotificationAsRead.markNotificationAsRead);
  const markRejectionAsRead = useMutation(api.notifications.markRejectionHistoryAsRead.markRejectionHistoryAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead.markAllNotificationsAsRead);

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
      case "PaymentResubmission":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
              <h1 className="text-2xl font-semibold text-gray-900">My Notifications</h1>
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
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="sm:ml-auto px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Mark All as Read
              </button>
            )}
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
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-emerald-50/50 border-l-4 border-emerald-500" : "border-l-4 border-transparent"
                  } ${index !== filteredNotifications.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <span className="shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-1.5"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification._creationTime), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {notification.notificationType.replace(/([A-Z])/g, ' $1').trim()}
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
