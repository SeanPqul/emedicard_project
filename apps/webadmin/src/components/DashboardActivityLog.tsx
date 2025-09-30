'use client';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';

// Define the type for an activity log entry
type AdminActivityLog = Doc<"adminActivityLogs"> & {
  applicantName?: string; // To be populated on the frontend or extended in the backend query
};

// Helper to format time nicely (e.g., "1 hour ago")
const timeAgo = (date: number): string => {
  const seconds = Math.floor((Date.now() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function DashboardActivityLog() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Use the new query to fetch recent admin activities
  const recentActivities = useQuery(api.admin.activityLogs.getRecentAdminActivities);

  // Logic to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* The clickable history icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-emerald-600"
        title="View Recent Activity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">A log of recent admin activities.</p>
          </div>
          <div className="py-2 max-h-96 overflow-y-auto">
            {recentActivities === undefined && <div className="p-4 text-sm text-gray-500">Loading...</div>}
            {recentActivities && recentActivities.length === 0 && <div className="p-4 text-sm text-gray-500">No recent activity.</div>}
            {recentActivities && recentActivities.map((activity: AdminActivityLog) => (
              <div key={activity._id} className="px-4 py-3 hover:bg-gray-50">
                <p className="text-sm font-medium text-gray-800">
                  <span className="font-bold">{activity.adminUsername}</span>
                  <span className="text-gray-500 ml-1">({activity.adminEmail})</span>
                  <span className="ml-1">{activity.action.toLowerCase()}</span>.
                </p>
                {activity.comment && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{activity.comment}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(activity.timestamp || 0)}</p>
              </div>
            ))}
          </div>
          <div className="p-2 bg-gray-50 rounded-b-xl">
            <a href="/super-admin" className="block text-center text-sm text-emerald-600 font-semibold hover:underline">
              View all activity
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
