// app/dashboard/lab-findings/page.tsx
"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LabFindingRecorderForm from "@/components/LabFindingRecorderForm";
import LabFindingsList from "@/components/LabFindingsList";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from "@backend/convex/_generated/api";
import { Id } from "@backend/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LabFindingsPage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );
  
  const [selectedApplicationId, setSelectedApplicationId] = useState<Id<"applications"> | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [search, setSearch] = useState("");

  // Get all applications with findings
  const applications = useQuery(
    api.applications.list.list,
    isClerkLoaded && !!user && !!adminPrivileges && adminPrivileges.isAdmin ? {
      managedCategories: adminPrivileges.managedCategories as any,
    } : "skip"
  );

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Lab Findings" message="Please wait..." />;
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges || !adminPrivileges.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage 
          title="Access Denied" 
          message="You do not have permission to view this page." 
          onCloseAction={() => router.push('/')} 
        />
      </div>
    );
  }

  const filteredApplications = (applications ?? []).filter((app: any) =>
    app.userName?.toLowerCase().includes(search.toLowerCase()) ||
    app.jobCategoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Gradient */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Lab Findings Management</h1>
                  <p className="text-blue-100">
                    Record and manage medical test findings for health card applications
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-blue-600 bg-white border border-white/20 rounded-xl hover:bg-blue-50 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Applications List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Applications</h2>
                  <p className="text-xs text-gray-500">{filteredApplications.length} found</p>
                </div>
              </div>
              
              {/* Enhanced Search */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Applications List with Enhanced Styling */}
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">No applications found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  filteredApplications.map((app: any) => (
                    <button
                      key={app._id}
                      onClick={() => {
                        setSelectedApplicationId(app._id);
                        setShowRecorder(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                        selectedApplicationId === app._id
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          selectedApplicationId === app._id
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 group-hover:from-blue-400 group-hover:to-indigo-500 group-hover:text-white"
                        }`}>
                          {app.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{app.userName}</p>
                          <p className="text-xs text-gray-600 truncate">{app.jobCategoryName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          app.applicationStatus === "Approved" ? "bg-emerald-100 text-emerald-700" :
                          app.applicationStatus === "Rejected" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {app.applicationStatus}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Findings Details */}
          <div className="lg:col-span-2">
            {!selectedApplicationId ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                    <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Application Selected</h3>
                  <p className="text-gray-600 mb-6">Choose an application from the list to view or record lab findings</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Select from the left panel
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {showRecorder ? (
                  <LabFindingRecorderForm
                    applicationId={selectedApplicationId}
                    onSuccess={() => {
                      setShowRecorder(false);
                    }}
                    onCancel={() => setShowRecorder(false)}
                  />
                ) : (
                  <LabFindingsList
                    applicationId={selectedApplicationId}
                    onRecordNew={() => setShowRecorder(true)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
