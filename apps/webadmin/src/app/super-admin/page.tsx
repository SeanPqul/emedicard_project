"use client";

import CustomUserButton from '@/components/CustomUserButton';
import DashboardActivityLog from '@/components/DashboardActivityLog';
import DateRangeFilterDropdown from '@/components/DateRangeFilterDropdown';
import ErrorMessage from "@/components/ErrorMessage";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react"; // Changed useMutation to useAction
import Link from 'next/link';
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

// Placeholder for the new Admin Creation Modal
const AdminCreationModal = ({ isOpen, onClose, jobCategories }: { isOpen: boolean; onClose: () => void; jobCategories: { _id: Id<"jobCategories">; name: string }[] | undefined }) => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState(""); // New state for password
  const [selectedCategory, setSelectedCategory] = useState<Id<"jobCategories"> | undefined>(undefined); // Changed to single select
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createAdminAction = useAction(api.superAdmin.mutations.createAdmin); // Changed to useAction and renamed

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as Id<"jobCategories"> || undefined); // Handle single select
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createAdminAction({ // Renamed to createAdminAction and captured result
        email: adminEmail,
        password: adminPassword,
        managedCategoryIds: selectedCategory ? [selectedCategory] : [],
      });

      if (result.success) {
        setSuccessMessage(`Admin account for ${adminEmail} created/updated successfully!`);
        setAdminEmail("");
        setAdminPassword("");
        setSelectedCategory(undefined);
        // Optionally close modal after a short delay or on user action
        // setTimeout(onClose, 2000);
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
    <div className="fixed inset-0 bg-gray-100 bg-opacity-75 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4"> {/* Lighter overlay */}
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-200"> {/* Added border for professionalism */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Admin</h2>
        <p className="text-gray-600 mb-6">Fill in the details to create a new admin account and assign their privileges.</p>
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}
        {/* Display general error at the top if it's not a field-specific error */}
        {error && !error.includes("Password") && ( // Only show general error if not password related
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4"> {/* Added space-y for better spacing */}
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
          <div> {/* New div for password field */}
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
            {/* Display password-specific error below password field */}
            {error && error.includes("Password") && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          <div>
            <label htmlFor="managedCategories" className="block text-sm font-medium text-gray-700">Managed Category</label> {/* Changed label */}
            <select
              id="managedCategories"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-600 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedCategory || ""} // Bind to single selectedCategory
              onChange={handleCategoryChange}
              disabled={isLoading}
              required // Make category selection required
            >
              <option value="" disabled>Select a category</option> {/* Placeholder option */}
              {jobCategories?.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4"> {/* Added pt-4 for spacing */}
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
  const { totalApplications, applicationsByStatus } =
    useQuery(api.superAdmin.queries.getApplicationStats, user ? { startDate, endDate } : "skip") || {
      totalApplications: 0,
      applicationsByStatus: {},
    };

  const totalRegisteredAdmins =
    useQuery(api.superAdmin.queries.getTotalRegisteredAdmins, user ? {} : "skip") || 0;

  const currentYear = new Date().getFullYear();
  const applicantsOverTime =
    useQuery(api.superAdmin.queries.getApplicantsOverTime, user ? { year: currentYear } : "skip") || {};

  const applicantsByHealthCardType =
    useQuery(api.superAdmin.queries.getApplicantsByHealthCardType, user ? { startDate, endDate } : "skip") || {};
  const adminsByHealthCardType =
    useQuery(api.superAdmin.queries.getAdminsByHealthCardType, user ? {} : "skip") || {};
  const averageApprovalTime =
    useQuery(api.superAdmin.queries.getAverageApprovalTime, user ? { startDate, endDate } : "skip") || 0;
  const applicationTrends =
    useQuery(api.superAdmin.queries.getApplicationTrends, user ? { year: currentYear } : "skip") || {
      mostSubmittedMonth: "N/A",
      mostSubmittedDay: "N/A",
    };
  const mostActiveAdmins =
    useQuery(api.superAdmin.queries.getMostActiveAdmins, user ? { startDate, endDate, limit: 5 } : "skip") || [];

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

  const pieChartData = Object.entries(adminsByHealthCardType).map(([name, admins]) => ({
    name,
    value: admins.length,
  }));

  const barChartData = Object.entries(applicantsOverTime)
    .map(([monthIndex, count]) => {
      const monthName = new Date(currentYear, parseInt(monthIndex)).toLocaleString(
        "default",
        { month: "short" },
      );
      return { name: monthName, value: count as number };
    })
    .sort((a, b) => {
      const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!adminPrivileges.isAdmin || adminPrivileges.managedCategories !== "all") {
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
      <nav className="bg-white border-b border-gray-200 w-full sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">
              eMediCard
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard/notification-management"
              className="text-gray-500 hover:text-emerald-600"
              title="Manage Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Link>
            <DashboardActivityLog />
            <CustomUserButton />
          </div>
        </div>
      </nav>

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
            <div className="flex-shrink-0 flex gap-3">
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
          {Object.entries(applicationsByStatus).map(([status, count]) => {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bar Chart - always visible */}
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
                  <Bar dataKey="value">
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conditionally rendered Quick Metrics */}
          {showQuickMetricsDetails && (
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Additional Quick Metrics
              </h2>
              <div className="flex flex-col gap-8">
                {/* Pie Chart: Admins per Health Card Type */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-4">Admins per Health Card Type</h3>
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

                {/* Pie Chart: Applicants per Health Card Type */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-4">Applicants per Health Card Type</h3>
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

                {/* Performance & Trends Text Metrics */}
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Application Performance & Trends:
                  </h3>
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
                      {mostActiveAdmins.map((admin, index) => (
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
              </div>
            </div>
          )}
        </div>
      </main>

      <AdminCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobCategories={jobCategories}
      />
    </div>
  );
}
