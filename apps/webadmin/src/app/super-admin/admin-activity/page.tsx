"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from '@backend/convex/_generated/api';
import { Doc } from '@backend/convex/_generated/dataModel';
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminActivityLogWithApplicantName = Doc<"adminActivityLogs"> & {
  applicantName?: string;
  admin?: {
    fullname?: string;
    email?: string;
  };
};

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  
  // For super admin: get all activities
  // For regular admin: get only their category activities (handled in backend)
  const allAdminActivities: AdminActivityLogWithApplicantName[] = useQuery(
    api.admin.activityLogs.getAllAdminActivities,
    isClerkLoaded && user ? {} : "skip"
  ) || [];

  // Filter activities
  const filteredActivities = allAdminActivities.filter((activity) => {
    const matchesSearch =
      activity.admin?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      activity.admin?.email?.toLowerCase().includes(search.toLowerCase()) ||
      activity.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      activity.details?.toLowerCase().includes(search.toLowerCase()) ||
      activity.action?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = !actionFilter || activity.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Get unique actions for filter
  const actions = Array.from(
    new Set(allAdminActivities.map((a) => a.action).filter(Boolean))
  ).sort();

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      "Approved": "bg-green-100 text-green-800 border-green-200",
      "Referred": "bg-blue-100 text-blue-800 border-blue-200",
      "Flagged": "bg-orange-100 text-orange-800 border-orange-200",
      "Updated": "bg-purple-100 text-purple-800 border-purple-200",
      "Verified": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "Created": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Rejected": "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[action] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Admin Activity" message="Please wait..." />;
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have admin privileges to view this page."
          onCloseAction={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  const isSuperAdmin = adminPrivileges.managedCategories === "all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-xl hover:bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {isSuperAdmin ? "All Admin Activity" : "Activity History"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {isSuperAdmin 
                  ? "Complete activity log for all administrators"
                  : "Activity log for your assigned category"}
              </p>
            </div>
          </div>
        </header>

        {/* Enhanced Filters Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by admin, applicant, or action..."
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Action Type
                </label>
                <select
                  className="w-full md:w-auto px-4 py-2.5 pr-10 border border-gray-300 text-gray-700 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  <option value="">All Actions</option>
                  {actions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Activity List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
                <p className="text-xs text-gray-600 mt-0.5">Showing {filteredActivities.length} of {allAdminActivities.length} activities</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium text-lg">No activities found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100 hover:border-purple-200 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-md">
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="text-base font-bold text-gray-900">
                              {activity.admin?.fullname || "Unknown Admin"}
                            </p>
                            <p className="text-sm text-gray-600">{activity.admin?.email}</p>
                          </div>
                          {activity.action && (
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getActionColor(activity.action)}`}>
                              {activity.action}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {activity.details || activity.action || "Performed an action"}
                          {activity.applicantName && (
                            <span className="font-semibold"> for {activity.applicantName}</span>
                          )}
                        </p>
                        {activity.comment && (
                          <div className="bg-white/70 border border-purple-200 p-3 rounded-lg mb-2">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Comment:</p>
                            <p className="text-sm text-gray-800">{activity.comment}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {activity.applicationId && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              App ID: {activity.applicationId}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {activity.timestamp
                              ? formatDistanceToNow(new Date(activity.timestamp), {
                                  addSuffix: true,
                                })
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
