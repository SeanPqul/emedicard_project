// app/super-admin/pricing-config/page.tsx
"use client";

import ErrorMessage from "@/components/ErrorMessage";
import LoadingScreen from "@/components/shared/LoadingScreen";
import Navbar from "@/components/shared/Navbar";
import { api } from "@backend/convex/_generated/api";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PricingConfigPage() {
  const router = useRouter();
  const { isLoaded: isClerkLoaded, user } = useUser();
  
  const adminPrivileges = useQuery(
    api.users.roles.getAdminPrivileges,
    isClerkLoaded && user ? undefined : "skip"
  );
  
  const canViewConfig =
    isClerkLoaded && !!user && !!adminPrivileges && adminPrivileges.isSuperAdmin;
  
  const activePricing = useQuery(
    api.pricingConfig.index.getActivePricing,
    canViewConfig ? {} : "skip"
  );
  
  const pricingHistory = useQuery(
    api.pricingConfig.index.getPricingHistory,
    canViewConfig ? {} : "skip"
  );
  
  const [editing, setEditing] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return <LoadingScreen title="Loading Pricing Configuration" message="Please wait..." />;
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

  if (!activePricing) {
    return <LoadingScreen title="Loading Pricing" message="Please wait..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pricing Configuration
              </h1>
              <p className="text-gray-600 mt-2">
                Manage application fees and service charges
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
          {/* Base Application Fee */}
          <PricingCard
            title="Base Application Fee"
            icon="💰"
            pricingKey="base_fee"
            currentAmount={activePricing.baseFee?.amount || 0}
            currency={activePricing.baseFee?.currency || "PHP"}
            description={activePricing.baseFee?.description || ""}
            effectiveFrom={activePricing.baseFee?.effectiveFrom || Date.now()}
            isEditing={editing === "base_fee"}
            onEdit={() => setEditing("base_fee")}
            onCancel={() => setEditing(null)}
            onSave={() => setEditing(null)}
          />

          {/* Service Fees */}
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="font-semibold text-lg text-gray-900">Service Fees by Payment Method</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Maya Service Fee */}
              <ServiceFeeCard
                title="Maya"
                pricingKey="maya_service_fee"
                currentAmount={activePricing.serviceFees.Maya?.amount || 0}
                currency={activePricing.serviceFees.Maya?.currency || "PHP"}
                isEditing={editing === "maya_service_fee"}
                onEdit={() => setEditing("maya_service_fee")}
                onCancel={() => setEditing(null)}
                onSave={() => setEditing(null)}
                badgeColor="bg-teal-100 text-teal-800"
              />

              {/* Baranggay Hall Service Fee */}
              <ServiceFeeCard
                title="Baranggay Hall"
                pricingKey="baranggay_service_fee"
                currentAmount={activePricing.serviceFees.BaranggayHall?.amount || 0}
                currency={activePricing.serviceFees.BaranggayHall?.currency || "PHP"}
                isEditing={editing === "baranggay_service_fee"}
                onEdit={() => setEditing("baranggay_service_fee")}
                onCancel={() => setEditing(null)}
                onSave={() => setEditing(null)}
                badgeColor="bg-emerald-100 text-emerald-800"
              />

              {/* City Hall Service Fee */}
              <ServiceFeeCard
                title="City Hall"
                pricingKey="cityhall_service_fee"
                currentAmount={activePricing.serviceFees.CityHall?.amount || 0}
                currency={activePricing.serviceFees.CityHall?.currency || "PHP"}
                isEditing={editing === "cityhall_service_fee"}
                onEdit={() => setEditing("cityhall_service_fee")}
                onCancel={() => setEditing(null)}
                onSave={() => setEditing(null)}
                badgeColor="bg-purple-100 text-purple-800"
              />
            </div>
          </div>

          {/* Pricing History */}
          <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 w-full text-left"
              >
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="font-semibold text-lg text-gray-900 flex-1">Pricing Change History</h3>
                <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showHistory && pricingHistory && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase">Pricing Type</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase">Changed By</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-700 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pricingHistory.slice(0, 20).map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(record.effectiveFrom).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatPricingKey(record.key)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ₱{record.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            {record.isActive ? (
                              <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded-full">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.updatedBy.fullname}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.changeReason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Important Notes */}
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Important Notes
            </h3>
            <ul className="text-sm text-yellow-700 space-y-2 list-disc list-inside">
              <li>Changing pricing will NOT affect existing payments (historical accuracy preserved)</li>
              <li>New applications will automatically use the updated pricing</li>
              <li>All changes are logged for audit purposes</li>
              <li>Only System Administrators can modify pricing</li>
              <li>A change reason is required for every pricing update</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to format pricing key
function formatPricingKey(key: string): string {
  const formats: Record<string, string> = {
    base_fee: "Base Application Fee",
    maya_service_fee: "Maya Service Fee",
    baranggay_service_fee: "Baranggay Hall Service Fee",
    cityhall_service_fee: "City Hall Service Fee",
  };
  return formats[key] || key;
}

// Pricing Card Component
interface PricingCardProps {
  title: string;
  icon: string;
  pricingKey: string;
  currentAmount: number;
  currency: string;
  description: string;
  effectiveFrom: number;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

function PricingCard({
  title,
  icon,
  pricingKey,
  currentAmount,
  currency,
  description,
  effectiveFrom,
  isEditing,
  onEdit,
  onCancel,
  onSave,
}: PricingCardProps) {
  const updatePricing = useMutation(api.pricingConfig.index.updatePricing);
  const [formData, setFormData] = useState({
    amount: currentAmount.toString(),
    changeReason: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{icon}</span>
              <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
            </div>
            
            <div className="mb-2">
              <div className="text-3xl font-bold text-emerald-600">
                ₱{currentAmount.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Effective since: {new Date(effectiveFrom).toLocaleDateString()}</span>
            </div>
          </div>
          
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-emerald-300 rounded-lg p-6 bg-emerald-50 shadow-md">
      <h3 className="font-semibold text-lg mb-4 text-emerald-900">Edit {title}</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Amount: ₱{currentAmount.toFixed(2)}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Amount (₱) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="50.00"
            className="w-full p-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Change Reason *</label>
          <input
            type="text"
            required
            value={formData.changeReason}
            onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
            placeholder="Price adjustment per city ordinance"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        
        <div className="flex gap-3 pt-2 border-t border-emerald-200">
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const amount = parseFloat(formData.amount);
                if (isNaN(amount) || amount <= 0) {
                  throw new Error("Please enter a valid amount greater than zero");
                }
                
                await updatePricing({
                  key: pricingKey,
                  amount: amount,
                  changeReason: formData.changeReason,
                  notes: formData.notes || undefined,
                });
                
                onSave();
              } catch (err: any) {
                setError(err.message || "Failed to save changes");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !formData.amount || !formData.changeReason}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
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

// Service Fee Card Component
interface ServiceFeeCardProps {
  title: string;
  pricingKey: string;
  currentAmount: number;
  currency: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  badgeColor: string;
}

function ServiceFeeCard({
  title,
  pricingKey,
  currentAmount,
  currency,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  badgeColor,
}: ServiceFeeCardProps) {
  const updatePricing = useMutation(api.pricingConfig.index.updatePricing);
  const [formData, setFormData] = useState({
    amount: currentAmount.toString(),
    changeReason: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${badgeColor}`}>
            {title}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-3">
          ₱{currentAmount.toFixed(2)}
        </div>
        <button
          onClick={onEdit}
          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-4 bg-white shadow-md ${badgeColor.includes('teal') ? 'border-teal-300' : badgeColor.includes('emerald') ? 'border-emerald-300' : 'border-purple-300'}`}>
      <h4 className="font-semibold text-sm mb-3 text-gray-900">Edit {title}</h4>
      
      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Amount (₱) *</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full p-2 text-sm border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Reason *</label>
          <input
            type="text"
            required
            value={formData.changeReason}
            onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
            placeholder="Fee update"
            className="w-full p-2 text-sm border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const amount = parseFloat(formData.amount);
                if (isNaN(amount) || amount <= 0) {
                  throw new Error("Invalid amount");
                }
                
                await updatePricing({
                  key: pricingKey,
                  amount: amount,
                  changeReason: formData.changeReason,
                  notes: formData.notes || undefined,
                });
                
                onSave();
              } catch (err: any) {
                setError(err.message || "Failed");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading || !formData.amount || !formData.changeReason}
            className="flex-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            {loading ? "..." : "Save"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
