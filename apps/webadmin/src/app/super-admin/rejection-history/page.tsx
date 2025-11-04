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
import { useState } from "react";

type RejectionType = "document" | "payment" | "orientation" | "application" | "other";
type RejectionStatus = "pending" | "resubmitted" | "rejected" | "approved";

type Rejection = {
  _id: Id<"documentRejectionHistory"> | Id<"paymentRejectionHistory"> | Id<"applicationRejectionHistory"> | Id<"adminActivityLogs">;
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
  status?: RejectionStatus;
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

  const getStatusBadge = (status?: RejectionStatus, wasReplaced?: boolean) => {
    // Use new status field if available, otherwise fall back to wasReplaced
    const finalStatus = status || (wasReplaced ? "resubmitted" : "pending");
    
    switch (finalStatus) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "resubmitted":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Resubmitted
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Approved
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
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
            <div className="bg-gradient-to-br from-red-400 to-red-500 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Rejection History</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Complete history of all rejected documents, payments, and orientations
              </p>
            </div>
          </div>
        </header>

        {/* Enhanced Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-300 to-red-400 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
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
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalRejections}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Rejections</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
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
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.pendingResubmission}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Pending Resubmission</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-green-300 to-green-400 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
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
                  <div className="text-3xl font-bold text-gray-900">{stats.resubmitted}</div>
                  <div className="text-sm font-medium text-gray-600">Resubmitted</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-300 to-blue-400 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-white"
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
                  <div className="text-3xl font-bold text-gray-900">
                    {Object.keys(stats.byCategory).length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Categories</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by applicant, email, or reason..."
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Type
                </label>
                <select
                  className="w-full md:w-auto px-4 py-2.5 pr-10 border border-gray-300 text-gray-700 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Job Category
                </label>
                <select
                  className="w-full md:w-auto px-4 py-2.5 pr-10 border border-gray-300 text-gray-700 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
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
        </div>

        {/* Enhanced Rejections Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rejection Records</h2>
                <p className="text-xs text-gray-600 mt-0.5">Detailed view of all rejected submissions</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-gray-700">
                  <th className="text-left px-6 py-4 font-bold">Applicant</th>
                  <th className="text-left px-6 py-4 font-bold">Job Category</th>
                  <th className="text-left px-6 py-4 font-bold">Type</th>
                  <th className="text-left px-6 py-4 font-bold">Document/Item</th>
                  <th className="text-left px-6 py-4 font-bold">Reason</th>
                  <th className="text-left px-6 py-4 font-bold">Rejected By</th>
                  <th className="text-left px-6 py-4 font-bold">Date</th>
                  <th className="text-left px-6 py-4 font-bold">Status</th>
                  <th className="text-right px-6 py-4 font-bold">Actions</th>
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
                    <tr key={rejection._id} className="hover:bg-red-50/30 transition-all duration-150 border-b border-gray-100 last:border-0">
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
                        {getStatusBadge(rejection.status, rejection.wasReplaced)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {rejection.applicationId && (
                          <Link
                            href={
                              rejection.type === 'payment'
                                ? `/dashboard/${rejection.applicationId}/payment_validation`
                                : `/dashboard/${rejection.applicationId}/doc_verif`
                            }
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
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
