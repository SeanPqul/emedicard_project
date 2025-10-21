"use client";

import DateRangeFilterDropdown from '@/components/DateRangeFilterDropdown';
import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from '@/components/shared/LoadingScreen';
import Navbar from '@/components/shared/Navbar';
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Define the type for an activity log entry with applicant name
type AdminActivityLogWithApplicantName = Doc<"adminActivityLogs"> & {
  applicantName?: string;
  admin?: {
    fullname?: string;
    email?: string;
  };
};

// Admin Creation Modal
const AdminCreationModal = ({ isOpen, onClose, jobCategories }: { isOpen: boolean; onClose: () => void; jobCategories: { _id: Id<"jobCategories">; name: string }[] | undefined }) => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Id<"jobCategories"> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createAdminAction = useAction(api.superAdmin.mutations.createAdmin);

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as Id<"jobCategories"> || undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createAdminAction({
        email: adminEmail,
        password: adminPassword,
        managedCategoryIds: selectedCategory ? [selectedCategory] : [],
      });

      if (result.success) {
        setSuccessMessage(`Admin account for ${adminEmail} created/updated successfully!`);
        setAdminEmail("");
        setAdminPassword("");
        setSelectedCategory(undefined);
      } else {
        setError(result.errorMessage || "Failed to create admin. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to create admin (frontend catch):", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Admin</h2>
        <p className="text-gray-600 mb-6">Fill in the details to create a new admin account and assign their privileges.</p>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {error && !error.includes("Password") && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">Admin Email</label>
            <input
              type="email"
              id="adminEmail"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="admin@example.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="adminPassword"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {error && error.includes("Password") && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          <div>
            <label htmlFor="managedCategories" className="block text-sm font-medium text-gray-700">Managed Category</label>
            <select
              id="managedCategories"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory || ""}
              onChange={handleCategoryChange}
              disabled={isLoading}
              required
            >
              <option value="" disabled>Select a category</option>
              {jobCategories?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Reusable Components for this page ---
const StatIcon = ({ d }: { d: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

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

export default function SuperAdminPage() {
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQuickMetricsDetails, setShowQuickMetricsDetails] =
    useState(false);

  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  const jobCategories = useQuery(api.jobCategories.getManaged.get);
  const { totalApplications, applicationsByStatus } = useQuery(
    api.superAdmin.queries.getApplicationStats,
    isClerkLoaded && user ? { startDate, endDate } : "skip"
  ) || { totalApplications: 0, applicationsByStatus: {} };

  const totalRegisteredAdmins = useQuery(
    api.superAdmin.queries.getTotalRegisteredAdmins,
    isClerkLoaded && user ? {} : "skip"
  ) || 0;

  const currentYear = new Date().getFullYear();
  const applicantsOverTime = useQuery(
    api.superAdmin.queries.getApplicantsOverTime,
    isClerkLoaded && user ? { year: currentYear } : "skip"
  ) || {};

  const applicantsByHealthCardType = useQuery(
    api.superAdmin.queries.getApplicantsByHealthCardType,
    isClerkLoaded && user ? { startDate, endDate } : "skip"
  ) || {};
  const adminsByHealthCardType = useQuery(
    api.superAdmin.queries.getAdminsByHealthCardType,
    isClerkLoaded && user ? {} : "skip"
  ) || {};
  const averageApprovalTime = useQuery(
    api.superAdmin.queries.getAverageApprovalTime,
    isClerkLoaded && user ? { startDate, endDate } : "skip"
  ) || 0;
  const applicationTrends = useQuery(
    api.superAdmin.queries.getApplicationTrends,
    isClerkLoaded && user ? { year: currentYear } : "skip"
  ) || { mostSubmittedMonth: "N/A", mostSubmittedDay: "N/A" };
  const mostActiveAdmins = useQuery(
    api.superAdmin.queries.getMostActiveAdmins,
    isClerkLoaded && user ? { startDate, endDate, limit: 5 } : "skip"
  ) || [];

  // Use the new query for all admin activities
  const allAdminActivities: AdminActivityLogWithApplicantName[] = useQuery(
    api.admin.activityLogs.getAllAdminActivities,
    isClerkLoaded && user ? {} : "skip"
  ) || [];

  const handleClearFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const formatDuration = (milliseconds: number) => {
    if (milliseconds === 0) return "N/A";
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day(s)`;
    if (hours > 0) return `${hours} hour(s)`;
    if (minutes > 0) return `${minutes} minute(s)`;
    return `${seconds} second(s)`;
  };

  const pieChartData = Object.entries(adminsByHealthCardType).map(([name, admins]: [string, string[]]) => ({
    name,
    value: admins.length,
  }));

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const initialBarChartData = monthOrder.map((monthName, index) => ({
    name: monthName,
    value: (applicantsOverTime[index.toString()] as number) || 0,
  }));

  const barChartData = initialBarChartData.sort((a, b) => {
    return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const statusIconAndColorClasses: Record<
    string,
    { icon: React.ReactNode; colorClass: string }
  > = {
    "Total Applications": {
      icon: (
        <StatIcon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      ),
      colorClass: "bg-blue-500",
    },
    Submitted: {
      icon: (
        <StatIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
      colorClass: "bg-yellow-500",
    },
    "For Document Verification": {
      icon: (
        <StatIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      ),
      colorClass: "bg-cyan-500",
    },
    "For Payment Validation": {
      icon: (
        <StatIcon d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
      ),
      colorClass: "bg-purple-600",
    },
    "For Orientation": {
      icon: (
        <StatIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      ),
      colorClass: "bg-indigo-500",
    },
    Approved: {
      icon: <StatIcon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      colorClass: "bg-green-500",
    },
    Rejected: {
      icon: (
        <StatIcon d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      colorClass: "bg-red-500",
    },
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Super Admin Dashboard" message="Please wait while we fetch your super admin data..." />;
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

      <main className="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8 px-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview and management of all health card applications.
          </p>
        </header>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-3 flex-wrap items-end">
              <DateRangeFilterDropdown
                onSelect={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={
                    startDate
                      ? new Date(startDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                        ? new Date(e.target.value).setHours(0, 0, 0, 0)
                        : undefined,
                    )
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={endDate ? new Date(endDate).toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                        ? new Date(e.target.value).setHours(23, 59, 59, 999)
                        : undefined,
                    )
                  }
                />
              </div>
              <button
                onClick={handleClearFilter}
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filter
              </button>
            </div>
            <div className="flex-shrink-0 flex flex-wrap gap-3">
              <button
                onClick={() => router.push("/super-admin/rejection-history")}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Rejection History
              </button>
              <button
                onClick={() => router.push("/super-admin/orientation-schedules")}
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                Manage Schedules
              </button>
              <button
                onClick={() =>
                  setShowQuickMetricsDetails(!showQuickMetricsDetails)
                }
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zm0 4a1 1 0 000 2h7a1 1 0 100-2H3zm0 4a1 1 0 000 2h4a1 1 0 100-2H3zm12.707-3.293a1 1 0 00-1.414-1.414L11 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {showQuickMetricsDetails ? "Hide Metrics" : "Show Metrics"}
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Admin
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Applications"
            value={totalApplications}
            icon={statusIconAndColorClasses["Total Applications"].icon}
            colorClass={
              statusIconAndColorClasses["Total Applications"].colorClass
            }
          />
          <StatCard
            title="Registered Admins"
            value={totalRegisteredAdmins}
            icon={
              <StatIcon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            }
            colorClass="bg-purple-500"
          />
          {Object.keys(statusIconAndColorClasses)
            .filter(
              (status) =>
                status !== "Total Applications" && status !== "Registered Admins",
            )
            .map((status) => {
              const count = applicationsByStatus[status] || 0;
              const { icon, colorClass } = statusIconAndColorClasses[status] || {
                icon: (
                  <StatIcon d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                colorClass: "bg-gray-500",
              };
              return (
                <StatCard
                  key={status}
                  title={status}
                  value={count}
                  icon={icon}
                  colorClass={colorClass}
                />
              );
            })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left column: Graph */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Applicants Submitted ({currentYear})
            </h2>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Applicants">
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === applicationTrends.mostSubmittedMonth
                            ? "#8884d8"
                            : COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right column: Recent Admin Activity */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Admin Activity
            </h2>
            <div className="max-h-[320px] overflow-y-auto space-y-4 pr-2">
              {allAdminActivities.length > 0 ? (
                allAdminActivities.map((activity: AdminActivityLogWithApplicantName) => {
                  if (!activity) return null;
                  return (
                    <div
                      key={activity._id}
                      className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-emerald-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-bold">
                            {activity.admin?.fullname}
                          </span>{" "}
                          ({activity.admin?.email}) {(activity.details || activity.action || "performed an action").toLowerCase()}
                          {activity.applicantName && ` for `}
                          {activity.applicantName && <span className="font-bold">{activity.applicantName}</span>}.
                        </p>
                        {activity.comment && (
                          <p className="text-xs text-gray-700 bg-gray-50 p-1 rounded mt-1">Comment: {activity.comment}</p>
                        )}
                        {activity.applicationId && (
                          <p className="text-xs text-gray-500 mt-1">Application ID: {activity.applicationId}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp
                            ? formatDistanceToNow(new Date(activity.timestamp), {
                                addSuffix: true,
                              })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 mt-4 text-center">
                  No recent admin activity found.
                </p>
              )}
            </div>
          </div>
        </div>

        {showQuickMetricsDetails && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Application Performance & Trends */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Application Performance & Trends
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <strong>Average Approval Time:</strong>{" "}
                    {formatDuration(averageApprovalTime)}
                  </p>
                  <p className="text-gray-600">
                    <strong>Most Submitted Month ({currentYear}):</strong>{" "}
                    {applicationTrends.mostSubmittedMonth}
                  </p>
                  <p className="text-gray-600">
                    <strong>Most Submitted Day ({currentYear}):</strong>{" "}
                    {applicationTrends.mostSubmittedDay}
                  </p>
                  <p className="text-gray-600 mt-3">
                    <strong>Most Active Admins:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-600 ml-4">
                    {mostActiveAdmins.map((admin: { adminName: string; activityCount: number }, index: number) => (
                      <li key={index}>
                        {admin.adminName} ({admin.activityCount} activities)
                      </li>
                    ))}
                    {mostActiveAdmins.length === 0 && (
                      <li>No data available.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Detailed Admin Assignments */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Admin Assignments</h2>
                <div className="space-y-4">
                  {Object.entries(adminsByHealthCardType).map(([categoryName, admins]: [string, string[]]) => (
                    <div key={categoryName}>
                      <h3 className="font-medium text-gray-700 mb-2">{categoryName} ({admins.length} admins)</h3>
                      <ul className="list-disc list-inside text-gray-600 ml-4">
                        {admins.map((adminName: string, index: number) => (
                          <li key={index}>{adminName}</li>
                        ))}
                        {admins.length === 0 && <li>No admins assigned.</li>}
                      </ul>
                    </div>
                  ))}
                  {Object.keys(adminsByHealthCardType).length === 0 && (
                    <p className="text-gray-600">No admin data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pie charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Admins per Health Card Type - back to Pie Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Admins per Health Card Type</h2>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Applicants per Health Card Type - remains a pie chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Applicants per Health Card Type</h2>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(applicantsByHealthCardType).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                        {Object.entries(applicantsByHealthCardType).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AdminCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobCategories={jobCategories}
      />
    </div>
  );
}
