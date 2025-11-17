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
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Inbox
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">
              Updates for the applications and payments you manage.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
            >
              Back to dashboard
            </button>
          </div>
        </header>

        <section className="space-y-4">
          {/* Filters */}
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3 shadow-sm shadow-slate-100 backdrop-blur-sm sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Status filter tabs */}
              <div className="flex flex-none gap-2 overflow-x-auto pb-1 text-sm">
                <button
                  onClick={() => setFilter("all")}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  All ({allNotifications.length})
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === "read"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Read ({allNotifications.length - unreadCount})
                </button>
              </div>

              {/* Type filter + bulk actions */}
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All types</option>
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

                <div className="flex gap-2 sm:ml-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 sm:flex-none"
                    >
                      Mark all as read
                    </button>
                  )}
                  {allNotifications.filter(n => n.isRead).length > 0 && (
                    <button
                      onClick={handleClearRead}
                      className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-1 sm:flex-none"
                    >
                      Clear read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Small helper row */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
            <span>
              Showing {filteredNotifications.length} of {allNotifications.length} notifications
            </span>
            {(filter !== "all" || typeFilter) && (
              <button
                onClick={() => {
                  setFilter("all");
                  setTypeFilter("");
                }}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Notifications list */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm shadow-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-slate-300"
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
                <div>
                  <p className="text-sm font-medium text-slate-700">You're all caught up</p>
                  <p className="mt-1 text-xs text-slate-500">New updates will show up here as they come in.</p>
                </div>
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
        </section>
      </main>
    </div>
  );
}
