"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type RejectionType = "document" | "payment" | "orientation" | "other";

type Rejection = {
  _id: Id<"documentRejectionHistory"> | Id<"adminActivityLogs">;
  type: RejectionType;
  applicationId: Id<"applications"> | undefined;
  applicantName: string;
  applicantEmail: string;
  jobCategory: string;
  documentType: string;
  rejectionCategory: string;
  rejectionReason: string;
  specificIssues: string[];
  rejectedAt: number;
  rejectedBy: string;
  rejectedByEmail: string;
  attemptNumber: number;
  wasReplaced: boolean;
  replacedAt?: number;
};

export default function RejectionHistoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RejectionType | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  const rejections = useQuery(api.admin.rejectionHistory.getAllRejections, {});
  const stats = useQuery(api.admin.rejectionHistory.getRejectionStats, {});

  // Filter rejections
  const filteredRejections = (rejections || []).filter((rejection: Rejection) => {
    const matchesSearch =
      rejection.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      rejection.applicantEmail.toLowerCase().includes(search.toLowerCase()) ||
      rejection.documentType.toLowerCase().includes(search.toLowerCase()) ||
      rejection.rejectionReason.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || rejection.type === typeFilter;
    const matchesCategory = !categoryFilter || rejection.jobCategory === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique job categories
  const jobCategories = Array.from(
    new Set((rejections || []).map((r: Rejection) => r.jobCategory))
  ).sort();

  const getTypeBadgeColor = (type: RejectionType) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800";
      case "payment":
        return "bg-purple-100 text-purple-800";
      case "orientation":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (wasReplaced: boolean) => {
    if (wasReplaced) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Resubmitted
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Rejection History" message="Please wait..." />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-screen-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rejection History</h1>
              <p className="text-gray-600 text-sm mt-1">
                Complete history of all rejected documents, payments, and orientations
              </p>
            </div>
          </div>
        </header>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.totalRejections}
                  </div>
                  <div className="text-sm text-gray-500">Total Rejections</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {stats.pendingResubmission}
                  </div>
                  <div className="text-sm text-gray-500">Pending Resubmission</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stats.resubmitted}</div>
                  <div className="text-sm text-gray-500">Resubmitted</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.keys(stats.byCategory).length}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by applicant, email, or reason..."
                className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select
                className="w-full md:w-auto px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as RejectionType | "")}
              >
                <option value="">All Types</option>
                <option value="document">Document</option>
                <option value="payment">Payment</option>
                <option value="orientation">Orientation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Job Category
              </label>
              <select
                className="w-full md:w-auto px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {jobCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rejections Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="text-left px-6 py-4 font-semibold">Applicant</th>
                  <th className="text-left px-6 py-4 font-semibold">Job Category</th>
                  <th className="text-left px-6 py-4 font-semibold">Type</th>
                  <th className="text-left px-6 py-4 font-semibold">Document/Item</th>
                  <th className="text-left px-6 py-4 font-semibold">Reason</th>
                  <th className="text-left px-6 py-4 font-semibold">Rejected By</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rejections === undefined && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      Loading rejections...
                    </td>
                  </tr>
                )}
                {rejections && filteredRejections.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-400">
                      No rejections found.
                    </td>
                  </tr>
                )}
                {rejections &&
                  filteredRejections.map((rejection: Rejection) => (
                    <tr key={rejection._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {rejection.applicantName}
                        </div>
                        <div className="text-xs text-gray-500">{rejection.applicantEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {rejection.jobCategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(rejection.type)}`}
                        >
                          {rejection.type.charAt(0).toUpperCase() + rejection.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {rejection.documentType}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-gray-900 truncate">{rejection.rejectionReason}</div>
                        {rejection.specificIssues.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Issues: {rejection.specificIssues.join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{rejection.rejectedBy}</div>
                        <div className="text-xs text-gray-500">{rejection.rejectedByEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {formatDistanceToNow(new Date(rejection.rejectedAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(rejection.wasReplaced)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {rejection.applicationId && (
                          <Link
                            href={`/dashboard/${rejection.applicationId}/doc_verif`}
                            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 rounded-md font-semibold text-xs transition-all"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
