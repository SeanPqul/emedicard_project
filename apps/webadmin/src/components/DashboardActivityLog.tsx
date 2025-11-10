'use client';

import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { useEffect, useRef, useState } from 'react';

// Define the type for an activity log entry
type AdminActivityLog = Doc<"adminActivityLogs"> & {
  applicantName?: string;
  admin?: {
    fullname?: string;
    email?: string;
  };
};

// Helper to format time nicely (e.g., "1 hour ago")
const timeAgo = (date: number): string => {
  const seconds = Math.floor((Date.now() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  return "Just now";
};

// Helper to get action icon and color based on action type
const getActionStyle = (action: string) => {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('approved') || lowerAction.includes('approve')) {
    return { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200'
    };
  }
  
  // Medical referral (blue)
  if (lowerAction.includes('referred') || lowerAction.includes('referral') || lowerAction.includes('medical')) {
    return { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    };
  }
  
  // Document issue flagged (orange)
  if (lowerAction.includes('flagged') || lowerAction.includes('issue')) {
    return { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    };
  }
  
  // Application rejection (red) - for final application rejections
  if (lowerAction.includes('rejected') || lowerAction.includes('reject')) {
    return { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    };
  }
  
  if (lowerAction.includes('finalized') || lowerAction.includes('complete')) {
    return { 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      borderColor: 'border-teal-200'
    };
  }
  
  // Default style for other actions
  return { 
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    borderColor: 'border-gray-200'
  };
};

export default function DashboardActivityLog() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // @ts-ignore - Type instantiation is excessively deep
  const recentActivities = useQuery(
    // @ts-ignore
    api.admin.activityLogs.getRecentAdminActivities
  );

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
        className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 transition-all"
        title="View Recent Activity"
        aria-label="View Recent Activity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-[380px] origin-top-right rounded-xl bg-white shadow-xl border border-gray-200 z-50 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-emerald-100 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-xs text-gray-500">Latest admin actions</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Activity List */}
          <div className="py-1 max-h-[360px] overflow-y-auto custom-scrollbar">
            {recentActivities === undefined && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
                  <p className="text-xs text-gray-500 font-medium">Loading...</p>
                </div>
              </div>
            )}
            
            {recentActivities && recentActivities.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-600">No Recent Activity</p>
                  <p className="text-xs text-gray-400">Admin actions will appear here</p>
                </div>
              </div>
            )}
            
            {recentActivities && recentActivities.map((activity: AdminActivityLog, index: number) => {
              const actionStyle = getActionStyle(activity.details || activity.action || '');
              
              return (
                <div 
                  key={activity._id} 
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                    index !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex gap-2.5">
                    {/* Icon */}
                    <div className={`shrink-0 w-7 h-7 rounded-lg ${actionStyle.bgColor} ${actionStyle.iconColor} border ${actionStyle.borderColor} flex items-center justify-center mt-0.5`}>
                      {actionStyle.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Admin Info */}
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {activity.admin?.fullname || 'Unknown Admin'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {activity.admin?.email || 'No email'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {timeAgo(activity.timestamp || 0)}
                        </span>
                      </div>
                      
                      {/* Action Details */}
                      <p className="text-xs text-gray-700 leading-relaxed mb-1.5">
                        {activity.details || activity.action || "Performed an action"}
                        {activity.applicantName && (
                          <span className="font-semibold text-gray-900"> for {activity.applicantName}</span>
                        )}
                      </p>
                      
                      {/* Comment */}
                      {activity.comment && (
                        <div className="bg-amber-50 border-l-2 border-amber-400 px-3 py-2 rounded-r mt-2">
                          <p className="text-xs text-amber-900 font-medium">
                            <span className="font-bold">Note:</span> {activity.comment}
                          </p>
                        </div>
                      )}
                      
                      {/* Application ID */}
                      {activity.applicationId && (
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-md">
                          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <p className="text-xs font-mono text-gray-600 truncate">
                            {activity.applicationId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 border-t border-gray-200 rounded-b-xl">
            <a 
              href="/super-admin/admin-activity" 
              className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors group"
            >
              <span>View all activity</span>
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
