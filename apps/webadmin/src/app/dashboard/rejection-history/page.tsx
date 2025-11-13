"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
  issueType?: "medical_referral" | "document_issue"; // NEW: from documentReferralHistory table
};

export default function AdminRejectionHistoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RejectionType | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "resubmitted" | "permanently_rejected" | "referred">("");
  const [issueTypeTab, setIssueTypeTab] = useState<'all' | 'medical' | 'document'>('all'); // NEW: Tab filter for issue types
  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );
  // @ts-ignore - Type instantiation depth issue with Convex
  const rejections = useQuery(
    api.admin.rejectionHistory.getAllRejections,
    isClerkLoaded && user ? {} : "skip"
  );
  const stats = useQuery(
    api.admin.rejectionHistory.getRejectionStats,
    isClerkLoaded && user ? {} : "skip"
  );

  // Filter rejections
  const filteredRejections = (rejections || []).filter((rejection: Rejection) => {
    const matchesSearch =
      rejection.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      rejection.applicantEmail.toLowerCase().includes(search.toLowerCase()) ||
      rejection.documentType.toLowerCase().includes(search.toLowerCase()) ||
      rejection.rejectionReason.toLowerCase().includes(search.toLowerCase());

    const matchesType = !typeFilter || rejection.type === typeFilter;

    // Status filter logic
    let matchesStatus = true;
    if (statusFilter) {
      if (statusFilter === "permanently_rejected") {
        // Application rejections are permanently rejected
        matchesStatus = rejection.type === "application";
      } else if (statusFilter === "pending") {
        // Pending = document/payment rejections not yet resubmitted
        matchesStatus = rejection.type !== "application" && !rejection.wasReplaced && !rejection.issueType;
      } else if (statusFilter === "resubmitted") {
        // Resubmitted = document/payment rejections that were replaced
        matchesStatus = rejection.type !== "application" && rejection.wasReplaced;
      } else if (statusFilter === "referred") {
        // Referred = medical referrals or document issues (from documentReferralHistory)
        matchesStatus = !!rejection.issueType; // Has issueType means it's from referral table
      }
    }

    // Issue Type Tab Filter (Medical vs Document)
    // Uses backend's issueType field from documentReferralHistory table
    let matchesIssueType = true;
    if (issueTypeTab !== 'all' && rejection.type === 'document') {
      if (rejection.issueType) {
        // NEW: Use backend's issueType field (from documentReferralHistory)
        if (issueTypeTab === 'medical') {
          matchesIssueType = rejection.issueType === 'medical_referral';
        } else if (issueTypeTab === 'document') {
          matchesIssueType = rejection.issueType === 'document_issue';
        }
      } else {
        // FALLBACK: For OLD records without issueType, use heuristics
        const reasonLower = rejection.rejectionReason.toLowerCase();
        const isMedical = 
          reasonLower.includes('medical') ||
          reasonLower.includes('doctor') ||
          reasonLower.includes('x-ray') ||
          reasonLower.includes('urinalysis') ||
          reasonLower.includes('stool') ||
          reasonLower.includes('drug test') ||
          reasonLower.includes('neuro') ||
          reasonLower.includes('hepatitis');
        
        if (issueTypeTab === 'medical') {
          matchesIssueType = isMedical;
        } else if (issueTypeTab === 'document') {
          matchesIssueType = !isMedical;
        }
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesIssueType;
  });

  const getTypeBadgeColor = (type: RejectionType) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800";
      case "payment":
        return "bg-purple-100 text-purple-800";
      case "orientation":
        return "bg-indigo-100 text-indigo-800";
      case "application":
        return "bg-red-900 text-red-50 font-bold";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status?: RejectionStatus, wasReplaced?: boolean, type?: RejectionType) => {
    // Application rejections are final decisions
    if (type === "application") {
      return (
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-red-900 text-red-50 flex items-center gap-1.5">
          ❌ Application Rejected
        </span>
      );
    }
    
    // Use new status field if available, otherwise fall back to wasReplaced
    const finalStatus = status || (wasReplaced ? "resubmitted" : "pending");
    
    switch (finalStatus) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending Resubmission
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-lg hover:bg-white/80 shadow-sm transition-all"
              aria-label="Go back to dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Referral & Issue History</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                Track medical referrals, document issues, and other flagged items for your managed categories
              </p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 mb-6">
          <div className="p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setIssueTypeTab('all')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  issueTypeTab === 'all'
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  All
                </span>
              </button>
              <button
                onClick={() => setIssueTypeTab('medical')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  issueTypeTab === 'medical'
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Medical Referrals
                </span>
              </button>
              <button
                onClick={() => setIssueTypeTab('document')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  issueTypeTab === 'document'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Document Issues
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Statistics Cards - Like Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {/* Calculate live stats for Medical Referrals and Document Issues */}
            {(() => {
              const documentRecords = (rejections || []).filter((r: Rejection) => r.type === 'document');
              const medicalReferrals = documentRecords.filter((r: Rejection) => 
                r.issueType === 'medical_referral' || 
                r.rejectionReason?.toLowerCase().includes('medical')
              ).length;
              const documentIssues = documentRecords.filter((r: Rejection) => 
                r.issueType === 'document_issue' || 
                (!r.issueType && !r.rejectionReason?.toLowerCase().includes('medical'))
              ).length;
              
              return (
                <>
                  {/* Medical Referrals */}
                  <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-blue-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{medicalReferrals}</div>
                        <div className="text-xs font-medium text-gray-600 mt-1">Medical Referrals</div>
                      </div>
                    </div>
                  </div>

                  {/* Document Issues */}
                  <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-orange-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-md group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">{documentIssues}</div>
                        <div className="text-xs font-medium text-gray-600 mt-1">Document Issues</div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-red-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-md group-hover:scale-110 transition-transform">
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
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalRejections}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1">Total Rejections</div>
                </div>
              </div>
            </div>

            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-yellow-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md group-hover:scale-110 transition-transform">
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
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.pendingResubmission}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1">Pending Resubmission</div>
                </div>
              </div>
            </div>

            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-green-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 shadow-md group-hover:scale-110 transition-transform">
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
                  <div className="text-3xl font-bold text-gray-900">{stats.resubmitted}</div>
                  <div className="text-xs font-medium text-gray-600 mt-1">Resubmitted</div>
                </div>
              </div>
            </div>

            <div className="group bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-xl hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:scale-110 transition-transform">
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
                  <div className="text-3xl font-bold text-gray-900">
                    {Object.keys(stats.byCategory).length}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1">Categories</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </label>
              <input
                type="text"
                placeholder="Search by applicant, email, or reason..."
                className="w-full px-4 py-3 border border-gray-300 text-black rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Status
              </label>
              <select
                className="w-full md:w-auto px-4 py-3 pr-10 border border-gray-300 text-black rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "" | "pending" | "resubmitted" | "permanently_rejected" | "referred")}
              >
                <option value="">All Status</option>
                <option value="referred">Referred/Flagged</option>
                <option value="pending">Pending Resubmission</option>
                <option value="resubmitted">Resubmitted</option>
                <option value="permanently_rejected">Permanently Rejected</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Type
              </label>
              <select
                className="w-full md:w-auto px-4 py-3 pr-10 border border-gray-300 text-black rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as RejectionType | "")}
              >
                <option value="">All Types</option>
                <option value="document">Document</option>
                <option value="payment">Payment</option>
                <option value="application">Application</option>
                <option value="orientation">Orientation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Rejections Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{issueTypeTab === 'all' ? 'All Records' : issueTypeTab === 'medical' ? 'Medical Referrals' : 'Document Issues'}</h2>
                <p className="text-xs text-gray-600 mt-0.5">Showing {filteredRejections.length} of {rejections?.length || 0} total</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Applicant</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Job Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Document/Item</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Reason</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Rejected By</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rejections === undefined && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading rejections...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {rejections && filteredRejections.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-gray-900 font-semibold text-base mb-1">No rejections found</p>
                          <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {rejections &&
                  filteredRejections.map((rejection: Rejection) => (
                    <tr 
                      key={rejection._id} 
                      className={`transition-colors group ${
                        rejection.type === "application" 
                          ? "bg-red-50/50 hover:bg-red-50 border-l-4 border-red-900" 
                          : "hover:bg-gray-50"
                      }`}
                    >
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
                        {getStatusBadge(rejection.status, rejection.wasReplaced, rejection.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {rejection.type === "application" ? (
                          <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-semibold text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            No Action
                          </div>
                        ) : rejection.applicationId ? (
                          <Link
                            href={
                              rejection.type === 'payment' 
                                ? `/dashboard/${rejection.applicationId}/payment_validation`
                                : `/dashboard/${rejection.applicationId}/doc_verif`
                            }
                            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow group-hover:scale-105"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                        ) : null}
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
