"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const AdminNotificationDropdown = () => {
  const { user } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const admin = useQuery(api.users.getCurrentUserAlternative as any, user ? {} : "skip");
  const notifications = useQuery(
    api.notifications.getAdminNotifications as any,
    admin ? { adminId: admin._id, notificationType: "document_resubmitted" } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markNotificationAsRead as any);

  const unreadNotifications = notifications?.filter((n: Doc<"notifications">) => !n.isRead) || [];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId: Doc<"notifications">["_id"]) => {
    await markAsRead({ notificationId });
  };

  const handleMarkAllAsRead = async () => {
    if (notifications) {
      for (const notification of unreadNotifications) {
        await markAsRead({ notificationId: notification._id });
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user || !admin) {
    return null; // Don't render if user or admin data is not loaded
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative text-gray-500 hover:text-emerald-600 focus:outline-none"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadNotifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-emerald-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((notification: Doc<"notifications">) => (
                <Link
                  href={notification.actionUrl || "#"}
                  key={notification._id}
                  className={`block p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification._creationTime), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="p-4 text-gray-500 text-center">No new notifications.</p>
            )}
          </div>
          <div className="p-2 border-t border-gray-200 text-center">
            <Link
              href="/dashboard/notification-management" // Link to the full notification page
              className="text-sm text-emerald-600 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
