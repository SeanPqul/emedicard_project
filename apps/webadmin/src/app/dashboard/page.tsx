// src/app/dashboard/page.tsx
'use client';

import DashboardActivityLog from '@/components/DashboardActivityLog';
import ErrorBoundary from '@/components/ErrorBoundary';
import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from '@/components/shared/LoadingScreen';
import Navbar from '@/components/shared/Navbar';
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type ApplicationWithDetails = Doc<"applications"> & { userName: string; jobCategoryName: string };

// --- Reusable Components for this page ---
const StatCard = ({ title, value, icon, colorClass }: { title: string; value: number; icon: React.ReactNode; colorClass: string }) => (
  <div className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClass} shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      <div className="text-sm font-medium text-gray-600">{title}</div>
    </div>
  </div>
);

export default function DashboardPage() {
  // --- 1. UI STATE ---
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | Id<"jobCategories"> | "">("");
  const router = useRouter();

  // --- Constants ---
  const statusColorClasses: { [key: string]: { bg: string; text: string } } = {
    "Submitted": { bg: "bg-yellow-100", text: "text-yellow-800" },
    "For Orientation": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "For Document Verification": { bg: "bg-cyan-100", text: "text-cyan-800" },
    "Payment Validation": { bg: "bg-purple-100", text: "text-purple-800" },
    "Scheduled": { bg: "bg-blue-100", text: "text-blue-800" },
    "Attendance Validation": { bg: "bg-orange-100", text: "text-orange-800" },
    "Under Review": { bg: "bg-yellow-100", text: "text-yellow-800" },
    "Approved": { bg: "bg-green-100", text: "text-green-800" },
    "Rejected": { bg: "bg-red-100", text: "text-red-800" },
    "Expired": { bg: "bg-gray-100", text: "text-gray-800" },
  };

  // --- 2. DATA FETCHING ---
  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges); 
  const managedJobCategories: Doc<"jobCategories">[] | undefined = useQuery(api.jobCategories.getManaged.get);

  useEffect(() => {
    if (adminPrivileges && adminPrivileges.managedCategories !== "all" && managedJobCategories && managedJobCategories.length > 0 && categoryFilter === "") {
      setCategoryFilter(managedJobCategories[0]._id);
    }
  }, [adminPrivileges, managedJobCategories, categoryFilter]);

  const applications = useQuery(
    api.applications.list.list,
    adminPrivileges === undefined ? { } : // Pass an empty object or specific defaults if adminPrivileges is still loading
    {
      status: statusFilter || undefined,
      jobCategory: categoryFilter === "" ? undefined : (categoryFilter as Id<"jobCategories">),
      managedCategories: adminPrivileges.managedCategories as "all" | Id<"jobCategories">[] | undefined, // Explicitly cast to resolve TypeScript error
    }
  );

  const filteredApplications = (applications ?? []).filter((app: ApplicationWithDetails) => 
    app.userName.toLowerCase().includes(search.toLowerCase()) ||
    app.jobCategoryName.toLowerCase().includes(search.toLowerCase()) ||
    app.applicationStatus.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPending = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Submitted').length;
  const totalApproved = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Approved').length;
  const totalRejected = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Rejected').length;
  const totalForDocVerification = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Document Verification').length;
  const totalForPaymentValidation = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Payment Validation').length;
  const totalForOrientation = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Orientation').length;

  const handleViewApplication = (appId: Id<"applications">) => {
    router.push(`/dashboard/${appId}/doc_verif`);
  };

  // --- 5. LOADING & GUARD CLAUSES ---
  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Dashboard" message="Please wait while we fetch your dashboard data..." />;
  }
  if (!user) return <RedirectToSignIn />;
  if (!adminPrivileges || !adminPrivileges.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage title="Access Denied" message="You do not have permission to view this page." onCloseAction={() => router.push('/')} />
      </div>
    );
  }

  // --- 6. RENDER THE DASHBOARD ---
  const StatIcon = ({ d }: { d: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
    </svg>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar>
          <DashboardActivityLog />
        </Navbar>
      
      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="mb-8 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2 text-base">Overview and management of health card applications</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </header>

        {/* Stats Grid - Improved Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5 mb-8">
          <StatCard title="Submitted" value={totalPending} icon={<StatIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-600" />
          <StatCard title="Doc Verification" value={totalForDocVerification} icon={<StatIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} colorClass="bg-gradient-to-br from-cyan-500 to-cyan-600" />
          <StatCard title="Payment Validation" value={totalForPaymentValidation} icon={<StatIcon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />} colorClass="bg-gradient-to-br from-purple-600 to-purple-700" />
          <StatCard title="For Orientation" value={totalForOrientation} icon={<StatIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600" />
          <StatCard title="Approved" value={totalApproved} icon={<StatIcon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600" />
          <StatCard title="Rejected" value={totalRejected} icon={<StatIcon d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />} colorClass="bg-gradient-to-br from-red-500 to-red-600" />
        </div>

        {/* Controls Panel - Improved Layout */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 mb-8">
          <div className="p-6">
            {/* Top Section: Filters */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Smart Job Category Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Job Category
                  </label>
                  {managedJobCategories === undefined ? (
                    <div className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl shadow-sm text-sm">
                      Loading categories...
                    </div>
                  ) : adminPrivileges.managedCategories === "all" ? (
                    <select 
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-gray-900 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all"
                      value={categoryFilter} 
                      onChange={e => setCategoryFilter(e.target.value as Id<"jobCategories"> | "")}
                    >
                      <option value="">All Categories</option>
                      {managedJobCategories.map((cat) => ( <option key={cat._id} value={cat._id}>{cat.name}</option>))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-700 rounded-xl shadow-sm text-sm font-medium">
                      {managedJobCategories && managedJobCategories.length > 0 
                        ? managedJobCategories[0].name 
                        : "No categories managed"}
                    </div>
                  )}
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Status Filter
                  </label>
                  <select 
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 text-gray-900 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all" 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Submitted">Submitted</option>
                    <option value="For Orientation">For Orientation</option>
                    <option value="For Document Verification">For Document Verification</option>
                    <option value="Payment Validation">Payment Validation</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Attendance Validation">Attendance Validation</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              
              {/* Search Input */}
              <div className="relative flex-shrink-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search applicants..." 
                    className="w-full sm:w-80 pl-11 pr-4 py-2.5 border border-gray-300 text-gray-900 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Bottom Section: Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">Quick Actions:</span>
              <Link 
                href="/dashboard/rejection-history" 
                className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-xl font-medium hover:bg-red-100 border border-red-200 transition-all shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rejection History
              </Link>
              {managedJobCategories?.some(cat => cat.name === "Food Handler") && (
                <Link 
                  href="/dashboard/attendance-tracker" 
                  className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-medium hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm hover:shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Track Attendance
                </Link>
              )}
              <div className="ml-auto text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filteredApplications.length}</span> of <span className="font-semibold text-gray-700">{applications?.length || 0}</span> applications
              </div>
            </div>
          </div>
        </div>
        
        {/* Applications Table - Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Applicant Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Job Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications === undefined && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <p className="text-gray-500 text-sm font-medium">Loading applicants...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {applications && filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <div>
                          <p className="text-gray-900 font-semibold text-base mb-1">No applicants found</p>
                          <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {applications && filteredApplications.map((app: ApplicationWithDetails) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                          {app.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">{app.userName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-700 text-sm font-medium">{app.jobCategoryName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-600 text-sm">{new Date(app._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClasses[app.applicationStatus]?.bg || 'bg-gray-100'} ${statusColorClasses[app.applicationStatus]?.text || 'text-gray-800'} shadow-sm`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleViewApplication(app._id)} 
                        className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm hover:shadow group-hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      </div>
    </ErrorBoundary>
  );
}
