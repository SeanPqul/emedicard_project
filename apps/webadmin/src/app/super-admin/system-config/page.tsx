// app/super-admin/system-config/page.tsx
"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from "@backend/convex/_generated/api";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SystemConfigPage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, user } = useUser();
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );
  const canViewConfig =
    isClerkLoaded && !!user && !!adminPrivileges && adminPrivileges.isSuperAdmin;
  const officials = useQuery(
    api.systemConfig.index.getActiveOfficials,
    canViewConfig ? {} : "skip"
  );
  
  const [editing, setEditing] = useState<"city_health_officer" | "sanitation_chief" | null>(null);

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading System Configuration" message="Please wait..." />;
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges || !adminPrivileges.isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage 
          title="Access Denied" 
          message="Only System Administrators can access this page." 
          onCloseAction={() => router.push('/dashboard')} 
        />
      </div>
    );
  }

  if (!officials) {
    return <LoadingScreen title="Loading Officials" message="Please wait..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                System Configuration
              </h1>
              <p className="text-gray-600 mt-2">
                Manage health card officials and system settings
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
        </header>

        <div className="space-y-6">
          {/* City Health Officer */}
          <OfficialCard
            title="City Health Officer"
            configKey="city_health_officer"
            official={officials.cityHealthOfficer}
            isEditing={editing === "city_health_officer"}
            onEdit={() => setEditing("city_health_officer")}
            onCancel={() => setEditing(null)}
            onSave={async (data) => {
              await setOfficial({
                key: "city_health_officer",
                name: data.name,
                designation: data.designation,
                signatureStorageId: data.signatureStorageId,
                notes: data.notes,
                changeReason: data.changeReason,
              });
              setEditing(null);
            }}
          />
          
          {/* Sanitation Chief */}
          <OfficialCard
            title="Sanitation Chief"
            configKey="sanitation_chief"
            official={officials.sanitationChief}
            isEditing={editing === "sanitation_chief"}
            onEdit={() => setEditing("sanitation_chief")}
            onCancel={() => setEditing(null)}
            onSave={async (data) => {
              await setOfficial({
                key: "sanitation_chief",
                name: data.name,
                designation: data.designation,
                signatureStorageId: data.signatureStorageId,
                notes: data.notes,
                changeReason: data.changeReason,
              });
              setEditing(null);
            }}
          />
        </div>
        
        {/* Important Notes */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Important Notes
          </h3>
          <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
            <li>Changing officials will NOT affect existing health cards (historical accuracy preserved)</li>
            <li>New health cards will automatically use the updated officials</li>
            <li>All changes are logged for audit purposes</li>
            <li>Only System Administrators can modify these settings</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

interface OfficialCardProps {
  title: string;
  configKey: string;
  official: any;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: any) => Promise<void>;
}

function OfficialCard({ title, configKey, official, isEditing, onEdit, onCancel, onSave }: OfficialCardProps) {
  const [formData, setFormData] = useState({
    name: official?.name || "",
    designation: official?.designation || "",
    notes: "",
    changeReason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
            </div>
            
            {official ? (
              <>
                <p className="text-gray-900 font-medium">{official.name}</p>
                <p className="text-sm text-gray-600 mt-1">{official.designation}</p>
                {official.effectiveFrom && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>In office since: {new Date(official.effectiveFrom).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">Not set</p>
            )}
          </div>
          
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50 shadow-md">
      <h3 className="font-semibold text-lg mb-4 text-blue-900">Edit {title}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Dr. Maria Santos"
            className="w-full p-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
          <input
            type="text"
            required
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="City Health Officer II"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Change Reason (Optional)</label>
          <input
            type="text"
            value={formData.changeReason}
            onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
            placeholder="New appointment per City Order No. 2025-123"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-3 pt-2 border-t border-blue-200">
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                await onSave(formData);
              } catch (err: any) {
                setError(err.message || "Failed to save changes");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !formData.name || !formData.designation}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
