"use client";

import DateRangeFilterDropdown from '@/components/DateRangeFilterDropdown';
import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from '@/components/shared/LoadingScreen';
import Navbar from '@/components/shared/Navbar';
import { api } from '@backend/convex/_generated/api';
import { Doc, Id } from '@backend/convex/_generated/dataModel';
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend as RechartsLegend,
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

// Typed Legend component to fix TypeScript issues with recharts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Legend = RechartsLegend as any;

// Admin Creation Modal
const AdminCreationModal = ({ isOpen, onClose, jobCategories }: { isOpen: boolean; onClose: () => void; jobCategories: { _id: Id<"jobCategories">; name: string }[] | undefined }) => {
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminGender, setAdminGender] = useState("");
  const [adminBirthDate, setAdminBirthDate] = useState("");
  const [adminPhoneNumber, setAdminPhoneNumber] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Id<"jobCategories"> | undefined>(undefined);
  const [selectedRole, setSelectedRole] = useState<"admin" | "inspector">("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const createAdminAction = useAction(api.superAdmin.mutations.createAdmin);

  if (!isOpen) return null;

  // Check if selected category is Food-Handler (Yellow Card)
  const foodHandlerCategory = jobCategories?.find(cat => 
    cat.name.toLowerCase().includes("food") || 
    cat.name.toLowerCase().includes("yellow")
  );
  const isFoodHandlerSelected = selectedCategory === foodHandlerCategory?._id;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as Id<"jobCategories"> || undefined;
    setSelectedCategory(newCategory);
    // Reset role to admin if changing away from Food-Handler category
    if (newCategory !== foodHandlerCategory?._id) {
      setSelectedRole("admin");
    }
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
        role: isFoodHandlerSelected ? selectedRole : undefined,
        fullname: adminName || undefined,
        username: adminUsername || undefined,
        gender: adminGender || undefined,
        birthDate: adminBirthDate || undefined,
        phoneNumber: adminPhoneNumber || undefined,
      });

      if (result.success) {
        const roleText = isFoodHandlerSelected && selectedRole === "inspector" ? " (Inspector)" : "";
        setSuccessMessage(`${isFoodHandlerSelected && selectedRole === "inspector" ? "Inspector" : "Admin"} account for ${adminEmail} created successfully!${roleText}`);
        setAdminEmail("");
        setAdminPassword("");
        setAdminName("");
        setAdminUsername("");
        setAdminGender("");
        setAdminBirthDate("");
        setAdminPhoneNumber("");
        setSelectedCategory(undefined);
        setSelectedRole("admin");
        setShowPassword(false);
      } else {
        setError(result.errorMessage || "Failed to create admin. Please try again.");
      }
    } catch (err: unknown) {
      console.error("Failed to create admin (frontend catch):", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-start sm:items-center z-50 p-2 sm:p-4 lg:p-6 animate-fadeIn">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 transform transition-all max-h-[95vh] sm:max-h-[90vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Create Admin</h2>
                <p className="text-emerald-100 text-xs sm:text-sm mt-1 hidden sm:block">Add a new administrator or inspector to manage health card applications</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 animate-fadeIn">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && !error.includes("Password") && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 flex items-start sm:items-center gap-2 sm:gap-3 animate-fadeIn">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="adminName" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input
                type="text"
                id="adminName"
                className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 text-sm sm:text-base rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="adminUsername" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Username
              </label>
              <input
                type="text"
                id="adminUsername"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="john.doe.admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">Optional. If left blank, username will be based on the email.</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="adminEmail" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                id="adminEmail"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="admin@emedicard.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="adminGender" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Gender
              </label>
              <select
                id="adminGender"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                value={adminGender}
                onChange={(e) => setAdminGender(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select gender (optional)</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Birthdate */}
            <div>
              <label htmlFor="adminBirthDate" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Birthdate
              </label>
              <input
                type="date"
                id="adminBirthDate"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                value={adminBirthDate}
                onChange={(e) => setAdminBirthDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="adminPhoneNumber" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 19.72V23a2 2 0 01-2 2h-1C9.82 25 3 18.18 3 10V5z" />
                </svg>
                Phone Number
              </label>
              <input
                type="tel"
                id="adminPhoneNumber"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="e.g. 09XX XXX XXXX"
                value={adminPhoneNumber}
                onChange={(e) => setAdminPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="adminPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="adminPassword"
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="Enter secure password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {error && error.includes("Password") && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">Password must be at least 8 characters long</p>
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="managedCategories" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Health Card Category
              </label>
              <select
                id="managedCategories"
                className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
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

            {/* Role Selection (Only for Food-Handler Category) */}
            {isFoodHandlerSelected && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 animate-fadeIn">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Select Role for Food-Handler
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedRole === "admin"}
                      onChange={(e) => setSelectedRole(e.target.value as "admin" | "inspector")}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Admin</div>
                      <div className="text-sm text-gray-600">Full access to manage Food-Handler applications</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all">
                    <input
                      type="radio"
                      name="role"
                      value="inspector"
                      checked={selectedRole === "inspector"}
                      onChange={(e) => setSelectedRole(e.target.value as "admin" | "inspector")}
                      className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                      disabled={isLoading}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        Inspector
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">Special Role</span>
                      </div>
                      <div className="text-sm text-gray-600">Limited access for Food-Handler inspection tasks</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all border border-gray-300"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create {isFoodHandlerSelected && selectedRole === "inspector" ? "Inspector" : "Admin"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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

export default function SystemAdministratorPage() {
  const [startDate, setStartDate] = useState<number | undefined>(undefined);
  const [endDate, setEndDate] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showQuickMetricsDetails, setShowQuickMetricsDetails] =
    useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);

  const router = useRouter();

  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );
  const jobCategories = useQuery(
    api.jobCategories.getManaged.get,
    isClerkLoaded && user ? undefined : "skip"
  );
  const { totalApplications, applicationsByStatus } = useQuery(
    api.superAdmin.queries.getApplicationStats,
    isClerkLoaded && user ? { startDate, endDate } : "skip"
  ) || { totalApplications: 0, applicationsByStatus: {} };

  const totalRegisteredAdmins = useQuery(
    api.superAdmin.queries.getTotalRegisteredAdmins,
    isClerkLoaded && user ? {} : "skip"
  ) || 0;

  // NEW: Fetch rejection and referral statistics
  const rejectionStats = useQuery(
    api.superAdmin.queries.getRejectionAndReferralStats,
    isClerkLoaded && user ? { startDate, endDate } : "skip"
  );

  // NEW: Fetch system health metrics
  const systemHealthMetrics = useQuery(
    api.superAdmin.queries.getSystemHealthMetrics,
    isClerkLoaded && user ? {} : "skip"
  );

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
  const allAdminActivities = (useQuery(
    api.admin.activityLogs.getAllAdminActivities,
    isClerkLoaded && user ? {} : "skip"
  ) || []) as AdminActivityLogWithApplicantName[];

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

  const statusIconAndColorClasses: Record<string, { icon: React.ReactNode; colorClass: string }> = {
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
    return <LoadingScreen title="Loading System Administrator Dashboard" message="Please wait while we fetch your system administrator data..." />;
  }
  
  if (!user) {
    return <RedirectToSignIn />;
  }
  
  if (!adminPrivileges || adminPrivileges.managedCategories !== "all") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have System Administrator privileges to view this page."
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
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                System Administrator Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Overview and management of all health card applications
              </p>
            </div>
          </div>
        </header>

        {/* Enhanced Controls Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">Filters & Actions</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4 pb-6 border-b border-gray-200">
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
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"
                  >
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
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
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1"
                  >
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
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
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-xl font-semibold transition-colors border border-gray-300 shadow-sm"
                >
                  Clear Filter
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-6">
            <span className="text-sm font-semibold text-gray-700 self-center">Quick Actions:</span>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border border-blue-300 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Oversee Admin Dashboard
            </button>
            <button
              onClick={() => router.push("/super-admin/rejection-history")}
              className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Referral/Management History
            </button>
            <button
              onClick={() => router.push("/super-admin/orientation-schedules")}
              className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Manage Schedules
            </button>
            <button
              onClick={() =>
                setShowQuickMetricsDetails(!showQuickMetricsDetails)
              }
              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showQuickMetricsDetails ? "Hide Metrics" : "Show Metrics"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 px-3 py-2 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Admin
            </button>
            <div className="relative">
              <button
                onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
                onBlur={() => setTimeout(() => setShowAdvancedMenu(false), 200)}
                className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border border-gray-200 transition-all shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
                Advanced Options
              </button>
              {showAdvancedMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => router.push("/super-admin/system-config")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors group w-full text-left"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center group-hover:from-teal-100 group-hover:to-teal-200 transition-all">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">System Config</div>
                      <div className="text-xs text-gray-500">Manage officials & settings</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - Main Overview Metrics */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Overview Metrics</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
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
              colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatCard
              title="Scheduled for Orientation"
              value={applicationsByStatus["Scheduled"] || 0}
              icon={
                <StatIcon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              }
              colorClass="bg-gradient-to-br from-indigo-400 to-indigo-500"
            />
            <StatCard
              title="Referred to Doctor"
              value={rejectionStats?.documentReferrals.pending || 0}
              icon={
                <StatIcon d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
              }
              colorClass="bg-gradient-to-br from-blue-400 to-blue-500"
            />
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Application Status Breakdown</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            <StatCard
              title="Submitted"
              value={applicationsByStatus["Submitted"] || 0}
              icon={statusIconAndColorClasses["Submitted"].icon}
              colorClass={statusIconAndColorClasses["Submitted"].colorClass}
            />
            <StatCard
              title="For Document Verification"
              value={applicationsByStatus["For Document Verification"] || 0}
              icon={statusIconAndColorClasses["For Document Verification"].icon}
              colorClass={statusIconAndColorClasses["For Document Verification"].colorClass}
            />
            <StatCard
              title="For Payment Validation"
              value={applicationsByStatus["For Payment Validation"] || 0}
              icon={statusIconAndColorClasses["For Payment Validation"].icon}
              colorClass={statusIconAndColorClasses["For Payment Validation"].colorClass}
            />
            <StatCard
              title="For Orientation"
              value={applicationsByStatus["For Orientation"] || 0}
              icon={statusIconAndColorClasses["For Orientation"].icon}
              colorClass={statusIconAndColorClasses["For Orientation"].colorClass}
            />
            <StatCard
              title="Approved"
              value={applicationsByStatus["Approved"] || 0}
              icon={statusIconAndColorClasses["Approved"].icon}
              colorClass={statusIconAndColorClasses["Approved"].colorClass}
            />
          </div>
        </div>

        {/* NEW: Rejection & Referral Metrics */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Rejection & Referral Metrics</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4">
            <StatCard
              title="Payment Rejected"
              value={rejectionStats?.paymentRejections.pending || 0}
              icon={<StatIcon d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              colorClass="bg-gradient-to-br from-orange-400 to-orange-500"
            />
            <StatCard
              title="Application Rejected"
              value={rejectionStats?.permanentRejections.total || 0}
              icon={<StatIcon d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
              colorClass="bg-gradient-to-br from-red-600 to-red-700"
            />
            <StatCard
              title="Total Referred to Doctor"
              value={rejectionStats?.documentReferrals.total || 0}
              icon={<StatIcon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              colorClass="bg-gradient-to-br from-amber-400 to-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {/* Left column: Enhanced Graph */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Applicants Submitted</h2>
                  <p className="text-xs text-gray-600 mt-0.5">Monthly overview for {currentYear}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
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
          </div>

          {/* Right column: Enhanced Recent Admin Activity */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Admin Activity</h2>
                    <p className="text-xs text-gray-600 mt-0.5">Latest actions from all admins</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 pb-4">
            <div className="max-h-[280px] overflow-y-auto space-y-3 pr-2 custom-scrollbar mb-4">
              {allAdminActivities.length > 0 ? (
                allAdminActivities.map((activity: AdminActivityLogWithApplicantName) => {
                  if (!activity) return null;
                  
                  // Get action style based on activity type
                  const getActionStyle = () => {
                    const action = (activity.details || activity.action || "").toLowerCase();
                    if (action.includes("approved") || action.includes("approve")) {
                      return {
                        icon: (
                          <svg className="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        iconBg: "bg-emerald-100",
                        accentBorderClass: "border-l-4 border-emerald-500",
                      };
                    }
                    if (action.includes("rejected") || action.includes("reject")) {
                      return {
                        icon: (
                          <svg className="h-4 w-4 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        iconBg: "bg-rose-100",
                        accentBorderClass: "border-l-4 border-rose-500",
                      };
                    }
                    if (action.includes("finalized")) {
                      return {
                        icon: (
                          <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ),
                        iconBg: "bg-blue-100",
                        accentBorderClass: "border-l-4 border-blue-500",
                      };
                    }
                    return {
                      icon: (
                        <svg className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      ),
                      iconBg: "bg-slate-100",
                      accentBorderClass: "border-l-4 border-slate-400",
                    };
                  };
                  
                  const actionStyle = getActionStyle();
                  
                  return (
                    <div
                      key={activity._id}
                      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-7 h-7 rounded-full ${actionStyle.iconBg} flex items-center justify-center shrink-0`}>
                            {actionStyle.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {activity.admin?.fullname || "Admin"}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">
                          {activity.timestamp
                            ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
                            : ""}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1 ml-9">
                        {activity.details || activity.action || "Performed action"}
                        {activity.applicantName && (
                          <span className="font-medium text-gray-900"> • {activity.applicantName}</span>
                        )}
                      </p>
                      
                      {activity.comment && (
                        <p className="text-xs text-gray-600 italic ml-9 mt-1">
                          &quot;{activity.comment}&quot;
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500 font-medium">
                    No recent admin activity found.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => router.push("/super-admin/admin-activity")}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 px-5 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              View All Activity
            </button>
            </div>
          </div>
        </div>

        {showQuickMetricsDetails && (
          <div className="mb-8 animate-fadeIn">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Detailed Metrics & Analytics</h2>
                      <p className="text-indigo-100 text-sm mt-0.5">Deep dive into system performance and trends</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-white text-sm font-semibold">Live Data</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* First Row: Performance, Health, Rejection Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Application Performance & Trends */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Application Performance & Trends
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Average Approval Time</span>
                      <span className="text-lg font-bold text-blue-700">{formatDuration(averageApprovalTime)}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Most Submitted Month ({currentYear})</span>
                      <span className="text-lg font-bold text-green-700">{applicationTrends.mostSubmittedMonth}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Most Submitted Day ({currentYear})</span>
                      <span className="text-lg font-bold text-purple-700">{applicationTrends.mostSubmittedDay}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Most Active Admins</h3>
                    <ul className="space-y-2">
                      {mostActiveAdmins.map((admin: { adminName: string; activityCount: number }, index: number) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">🏆 {admin.adminName}</span>
                          <span className="text-sm font-bold text-amber-700">{admin.activityCount} activities</span>
                        </li>
                      ))}
                      {mostActiveAdmins.length === 0 && (
                        <li className="text-sm text-gray-500">No data available.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* NEW: System Health & Performance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    System Health & Performance
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Processing Bottlenecks */}
                  <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Processing Bottlenecks (Avg Time)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Document Verification</span>
                        <span className="text-sm font-bold text-cyan-700">{systemHealthMetrics?.processingBottlenecks.documentVerification.toFixed(1) || 0} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Payment Validation</span>
                        <span className="text-sm font-bold text-cyan-700">{systemHealthMetrics?.processingBottlenecks.paymentValidation.toFixed(1) || 0} hrs</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Orientation Scheduling</span>
                        <span className="text-sm font-bold text-cyan-700">{systemHealthMetrics?.processingBottlenecks.orientationScheduling.toFixed(1) || 0} hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Completion Rates */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Stage Completion Rates
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Submitted → Doc Verified</span>
                        <span className="text-sm font-bold text-blue-700">{systemHealthMetrics?.stageCompletionRates.submittedToDocVerified || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Doc Verified → Payment</span>
                        <span className="text-sm font-bold text-blue-700">{systemHealthMetrics?.stageCompletionRates.docVerifiedToPayment || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Payment → Approved</span>
                        <span className="text-sm font-bold text-blue-700">{systemHealthMetrics?.stageCompletionRates.paymentToApproved || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Attention Needed */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Attention Needed
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          Docs pending {'>'}24hrs
                          {(systemHealthMetrics?.attentionNeeded.docsPendingOver24h || 0) > 10 && <span className="text-red-600">🔴</span>}
                          {(systemHealthMetrics?.attentionNeeded.docsPendingOver24h || 0) > 5 && (systemHealthMetrics?.attentionNeeded.docsPendingOver24h || 0) <= 10 && <span className="text-amber-600">🟡</span>}
                        </span>
                        <span className="text-sm font-bold text-amber-700">{systemHealthMetrics?.attentionNeeded.docsPendingOver24h || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          Payments pending {'>'}48hrs
                          {(systemHealthMetrics?.attentionNeeded.paymentsPendingOver48h || 0) > 5 && <span className="text-red-600">🔴</span>}
                          {(systemHealthMetrics?.attentionNeeded.paymentsPendingOver48h || 0) > 2 && (systemHealthMetrics?.attentionNeeded.paymentsPendingOver48h || 0) <= 5 && <span className="text-amber-600">🟡</span>}
                        </span>
                        <span className="text-sm font-bold text-amber-700">{systemHealthMetrics?.attentionNeeded.paymentsPendingOver48h || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          Orientations not scheduled
                          {(systemHealthMetrics?.attentionNeeded.orientationsNotScheduled || 0) > 10 && <span className="text-orange-600">🟠</span>}
                        </span>
                        <span className="text-sm font-bold text-amber-700">{systemHealthMetrics?.attentionNeeded.orientationsNotScheduled || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Efficiency */}
                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      System Efficiency
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Overall Success Rate</span>
                        <span className="text-sm font-bold text-emerald-700">{systemHealthMetrics?.systemEfficiency.overallSuccessRate || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Avg Application Lifespan</span>
                        <span className="text-sm font-bold text-emerald-700">{systemHealthMetrics?.systemEfficiency.avgApplicationLifespanDays || 0} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Peak Processing Hour</span>
                        <span className="text-xs font-bold text-emerald-700">{systemHealthMetrics?.systemEfficiency.peakProcessingHour || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection & Referral Analytics */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Rejection & Referral Analytics
                  </h2>
                </div>
                <div className="space-y-4">
                  {/* Payment Rejection Stats */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Payment Rejections
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total Rejected</span>
                        <span className="text-lg font-bold text-orange-700">{rejectionStats?.paymentRejections.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Pending Resubmission</span>
                        <span className="text-lg font-bold text-orange-600">{rejectionStats?.paymentRejections.pending || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Already Resubmitted</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {(rejectionStats?.paymentRejections.total || 0) - (rejectionStats?.paymentRejections.pending || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Document Referral Stats */}
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Document Referrals to Doctor
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total Referred</span>
                        <span className="text-lg font-bold text-amber-700">{rejectionStats?.documentReferrals.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Pending Resolution</span>
                        <span className="text-lg font-bold text-amber-600">{rejectionStats?.documentReferrals.pending || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Resolved</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {(rejectionStats?.documentReferrals.total || 0) - (rejectionStats?.documentReferrals.pending || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Permanent Rejection Stats */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Permanent Application Rejections
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total Permanently Rejected</span>
                        <span className="text-lg font-bold text-red-700">{rejectionStats?.permanentRejections.total || 0}</span>
                      </div>
                      <p className="text-xs text-gray-600 italic mt-2">
                        These applications cannot be resubmitted and require a new application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Assignments Row - Full Width */}
            <div className="mb-8">
              {/* Detailed Admin Assignments */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Detailed Admin Assignments</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(adminsByHealthCardType).map(([categoryName, admins]: [string, string[]]) => (
                    <div key={categoryName} className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-100 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900">{categoryName}</h3>
                        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">{admins.length} admins</span>
                      </div>
                      <ul className="space-y-2">
                        {admins.map((adminName: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {adminName}
                          </li>
                        ))}
                        {admins.length === 0 && <li className="text-sm text-gray-500">No admins assigned.</li>}
                      </ul>
                    </div>
                  ))}
                  {Object.keys(adminsByHealthCardType).length === 0 && (
                    <p className="text-gray-600 text-center py-4">No admin data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Pie Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Admins per Health Card Type */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Admins per Health Card Type</h2>
                </div>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Applicants per Health Card Type */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Applicants per Health Card Type</h2>
                </div>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(applicantsByHealthCardType).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                        {Object.entries(applicantsByHealthCardType).map((_, index) => (
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
          </div>
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
