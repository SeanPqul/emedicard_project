// src/app/dashboard/page.tsx
'use client';

import DashboardActivityLog from '@/components/DashboardActivityLog';
import ErrorMessage from "@/components/ErrorMessage";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Navbar from '@/components/shared/Navbar';

type ApplicationWithDetails = Doc<"applications"> & { userName: string; jobCategoryName: string };

// --- Reusable Components for this page ---
const StatCard = ({ title, value, icon, colorClass }: { title: string; value: number; icon: React.ReactNode; colorClass: string }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
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
    "Pending": { bg: "bg-blue-100", text: "text-blue-800" },
    "For Document Verification": { bg: "bg-cyan-100", text: "text-cyan-800" },
    "For Payment Validation": { bg: "bg-purple-100", text: "text-purple-800" },
    "For Orientation": { bg: "bg-indigo-100", text: "text-indigo-800" },
    "Approved": { bg: "bg-green-100", text: "text-green-800" },
    "Rejected": { bg: "bg-red-100", text: "text-red-800" },
    "Cancelled": { bg: "bg-gray-100", text: "text-gray-800" },
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

  const filteredApplications = (applications ?? []).filter(app => 
    app.userName.toLowerCase().includes(search.toLowerCase()) ||
    app.jobCategoryName.toLowerCase().includes(search.toLowerCase()) ||
    app.applicationStatus.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPending = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Submitted').length;
  const totalApproved = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Approved').length;
  const totalRejected = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'Rejected').length;
  const totalForDocVerification = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Document Verification').length;
  const totalForPaymentValidation = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Payment Validation').length;
  const totalForOrientation = filteredApplications.filter((a: ApplicationWithDetails) => a.applicationStatus === 'For Orientation').length;

  const handleViewApplication = (appId: Id<"applications">) => {
    router.push(`/dashboard/${appId}/doc_verif`);
  };

  // --- 5. LOADING & GUARD CLAUSES ---
  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
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
    <div className="min-h-screen bg-gray-50">
      <Navbar>
        <DashboardActivityLog />
      </Navbar>
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview and management of health card applications.</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard title="Submitted" value={totalPending} icon={<StatIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />} colorClass="bg-yellow-500" />
          <StatCard title="Doc Verification" value={totalForDocVerification} icon={<StatIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} colorClass="bg-cyan-500" />
          <StatCard title="Payment Validation" value={totalForPaymentValidation} icon={<StatIcon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />} colorClass="bg-purple-600" />
          <StatCard title="For Orientation" value={totalForOrientation} icon={<StatIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} colorClass="bg-indigo-500" />
          <StatCard title="Approved" value={totalApproved} icon={<StatIcon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />} colorClass="bg-green-500" />
          <StatCard title="Rejected" value={totalRejected} icon={<StatIcon d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />} colorClass="bg-red-500" />
        </div>

        {/* Controls Row */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Smart Job Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Job Category</label>
              {managedJobCategories === undefined ? (
                <div className="w-full md:w-auto px-4 py-2 border border-gray-200 bg-gray-100 text-gray-700 rounded-lg shadow-sm text-base">
                  Loading categories...
                </div>
              ) : adminPrivileges.managedCategories === "all" ? (
                <select 
                  className="w-full md:w-auto px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={categoryFilter} 
                  onChange={e => setCategoryFilter(e.target.value as Id<"jobCategories"> | "")}
                >
                  <option value="">All Categories</option>
                  {managedJobCategories.map((cat) => ( <option key={cat._id} value={cat._id}>{cat.name}</option>))}
                </select>
              ) : ( // adminPrivileges.managedCategories is an array (not "all")
                <div className="w-full md:w-auto px-4 py-2 border border-gray-200 bg-gray-100 text-gray-700 rounded-lg shadow-sm text-base">
                  {managedJobCategories && managedJobCategories.length > 0 
                    ? managedJobCategories[0].name 
                    : "No categories managed"}
                </div>
              )}
            </div>
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Status</label>
              <select className="w-full md:w-auto px-4 py-2 pr-10 border border-gray-300 text-black rounded-lg shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="For Document Verification">Document Verification</option>
                <option value="For Payment Validation">Payment Validation</option>
                <option value="For Orientation">Orientation</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Attendance Tracker Link */}
            {managedJobCategories?.some(cat => cat.name === "Food Handler") && (
                <Link href="/dashboard/attendance-tracker" className="flex items-center justify-center bg-emerald-100 text-emerald-900 px-4 py-2 rounded-lg font-medium hover:bg-emerald-500 transition-colors">Track Attendance</Link>
            )}
            {/* Search Input */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <input type="text" placeholder="Search Applicants" className="px-8 py-2 border border-gray-300 text-black rounded-lg" value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 220 }} />
            </div>
          </div>
        </div>
        </div>
        
        {/* Table with Live Data */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-600">
                  <th className="text-left px-6 py-4 font-semibold">Applicant Name</th>
                  <th className="text-left px-6 py-4 font-semibold">Job Category</th>
                  <th className="text-left px-6 py-4 font-semibold">Submission Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications === undefined && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading applicants...</td></tr>
                )}
                {applications && filteredApplications.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">No applicants found.</td></tr>
                )}
                {applications && filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{app.userName}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{app.jobCategoryName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(app._creationTime).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColorClasses[app.applicationStatus]?.bg || 'bg-gray-100'} ${statusColorClasses[app.applicationStatus]?.text || 'text-gray-800'}`}>
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleViewApplication(app._id)} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 rounded-md font-semibold text-xs transition-all">
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
  );
}