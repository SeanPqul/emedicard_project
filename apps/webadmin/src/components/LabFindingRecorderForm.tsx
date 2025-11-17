// components/LabFindingRecorderForm.tsx
"use client";

import { api } from "@backend/convex/_generated/api";
import { Id } from "@backend/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";

interface Props {
  applicationId: Id<"applications">;
  referralHistoryId?: Id<"documentReferralHistory">;
  documentName?: string; // NEW: Auto-detect test type from document name
  prefillFinding?: string; // Pre-fill finding from referral
  prefillDoctorName?: string; // Pre-fill doctor name from referral
  prefillClearedDate?: string; // Pre-fill cleared date (today's date when approved onsite)
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Reference data (imported from backend)
// NOTE: Option labels intentionally keep only the text before the previous "  " suffixes
// (e.g., "WBC elevated" instead of "WBC elevated  Cleared post-Rx") per UI requirements.
const LAB_FINDING_OPTIONS = {
  urinalysis: [
    "WBC elevated",
    "RBC elevated",
    "Protein detected",
    "Glucose detected",
    "Bacteria present",
    "Crystals present",
    "pH abnormal",
    "Specific gravity abnormal",
    "Other urinalysis finding",
  ],
  xray_sputum: [
    "Chest X-ray abnormal",
    "Chest X-ray abnormal",
    "Sputum positive",
    "Lung infiltrates",
    "Pleural effusion",
    "Bronchitis",
    "Other chest finding",
  ],
  stool: [
    "Parasite detected",
    "Ova detected",
    "Blood in stool",
    "Bacteria detected",
    "Amoeba detected",
    "Giardia detected",
    "Other stool finding",
  ],
};

// City policy defaults (Davao City)
// Urinalysis: 3 months, Stool: 3 months, Chest X-ray/Sputum: 6 months
const MONITORING_PERIOD_RECOMMENDATIONS = {
  urinalysis: 3,
  xray_sputum: 6,
  stool: 3,
};

export default function LabFindingRecorderForm({ applicationId, referralHistoryId, documentName, prefillFinding, prefillDoctorName, prefillClearedDate, onSuccess, onCancel }: Props) {
  const recordFinding = useMutation(api.labFindings.index.recordLabFinding);
  
  // Auto-detect test type from document name
  const detectTestType = (docName?: string): "urinalysis" | "xray_sputum" | "stool" | "" => {
    if (!docName) return "";
    const lowerName = docName.toLowerCase();
    if (lowerName.includes("urinalysis")) return "urinalysis";
    if (lowerName.includes("chest x-ray") || lowerName.includes("sputum") || lowerName.includes("x-ray")) return "xray_sputum";
    if (lowerName.includes("stool")) return "stool";
    return "";
  };
  
  const detectedTestType = detectTestType(documentName);
  
  // Get recommended monitoring period based on test type
  const getRecommendedPeriod = (testType: string): number => {
    if (testType === "xray_sputum") return 6;
    if (testType === "urinalysis" || testType === "stool") return 3;
    return 1;
  };
  
  const [formData, setFormData] = useState({
    testType: detectedTestType,
    findingKind: prefillFinding || "", // Pre-fill finding from referral
    findingStatus: "cleared_with_monitoring" as const,
    clearedDate: prefillClearedDate || new Date().toISOString().split('T')[0], // Pre-fill cleared date or use today
    monitoringPeriodMonths: getRecommendedPeriod(detectedTestType),
    doctorName: prefillDoctorName || "Dr. Marjorie D. Culas", // Pre-fill doctor name from referral or use default
    treatmentNotes: "",
    clinicAddress: "City Health Office, Davao City",
    showOnCard: true, // Always checked by default
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Calculate monitoring expiry date
      const clearedDate = new Date(formData.clearedDate);
      const monitoringExpiry = new Date(clearedDate);

      if (formData.monitoringPeriodMonths < 1) {
        // Handle sub-month durations (e.g., 0.5 month = ~2 weeks)
        const days = Math.round(formData.monitoringPeriodMonths * 30);
        monitoringExpiry.setDate(monitoringExpiry.getDate() + days);
      } else {
        monitoringExpiry.setMonth(
          monitoringExpiry.getMonth() + formData.monitoringPeriodMonths
        );
      }
      
      await recordFinding({
        applicationId,
        testType: formData.testType as any,
        findingKind: formData.findingKind,
        findingStatus: formData.findingStatus,
        clearedDate: clearedDate.getTime(),
        monitoringExpiry: monitoringExpiry.getTime(),
        monitoringPeriodMonths: formData.monitoringPeriodMonths,
        doctorName: formData.doctorName,
        treatmentNotes: formData.treatmentNotes || undefined,
        clinicAddress: formData.clinicAddress || undefined,
        showOnCard: formData.showOnCard,
        referralHistoryId,
      });
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to record finding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Record Lab Finding</h3>
        <span className="text-xs text-gray-500">All fields marked with * are required</span>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-start gap-2">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {/* Test Type Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Test Type *</label>
        <select
          required
          value={formData.testType}
          onChange={(e) => {
            const testType = e.target.value as any;
            setFormData({ 
              ...formData, 
              testType,
              findingKind: "",
              monitoringPeriodMonths: MONITORING_PERIOD_RECOMMENDATIONS[testType as keyof typeof MONITORING_PERIOD_RECOMMENDATIONS] || 6
            });
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select Test Type</option>
          <option value="urinalysis">Urinalysis</option>
          <option value="xray_sputum">X-Ray / Sputum</option>
          <option value="stool">Stool Examination</option>
        </select>
      </div>
      
      {/* Finding Kind Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Finding *</label>
        <select
          required={!!formData.testType}
          disabled={!formData.testType}
          value={formData.findingKind}
          onChange={(e) => setFormData({ ...formData, findingKind: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">
            {formData.testType ? "Select Finding" : "Select test type first"}
          </option>
          {(LAB_FINDING_OPTIONS as any)[formData.testType]?.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cleared Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cleared Date *</label>
          <input
            type="date"
            required
            value={formData.clearedDate}
            onChange={(e) => setFormData({ ...formData, clearedDate: e.target.value })}
            className="w-full p-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        {/* Monitoring Period */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Monitoring Period *</label>
          <select
            required
            value={formData.monitoringPeriodMonths}
            onChange={(e) => setFormData({ ...formData, monitoringPeriodMonths: Number(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {(() => {
              const recommended = MONITORING_PERIOD_RECOMMENDATIONS[formData.testType as keyof typeof MONITORING_PERIOD_RECOMMENDATIONS] ?? 1;
              const opts = [
                { v: 0.5, label: '2 weeks' },
                { v: 1, label: '1 month' },
                { v: 3, label: '3 months' },
                { v: 6, label: '6 months' },
              ];
              return opts.map(o => (
                <option key={o.v} value={o.v}>
                  {o.label}{o.v === recommended ? ' (Recommended)' : ''}
                </option>
              ));
            })()}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            Retest due: {(() => {
              const date = new Date(formData.clearedDate);
              if (formData.monitoringPeriodMonths < 1) {
                const days = Math.round(formData.monitoringPeriodMonths * 30);
                date.setDate(date.getDate() + days);
              } else {
                date.setMonth(date.getMonth() + formData.monitoringPeriodMonths);
              }
              return date.toLocaleDateString();
            })()}
          </p>
        </div>
      </div>
      
      {/* Doctor Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Clearing Doctor *</label>
        <input
          type="text"
          required
          value={formData.doctorName}
          onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
          placeholder="Dr. Juan Dela Cruz"
          className="w-full p-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Treatment Notes */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Treatment Notes (Optional)</label>
        <textarea
          value={formData.treatmentNotes}
          onChange={(e) => setFormData({ ...formData, treatmentNotes: e.target.value })}
          placeholder="Patient completed antibiotic treatment..."
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Clinic Address */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Clinic Address (Optional)</label>
        <input
          type="text"
          value={formData.clinicAddress}
          onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
          placeholder="City Health Office, Davao City"
          className="w-full p-2 border border-gray-300 rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      {/* Show on Card Checkbox */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <input
          type="checkbox"
          id="showOnCard"
          checked={formData.showOnCard}
          onChange={(e) => setFormData({ ...formData, showOnCard: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="showOnCard" className="text-sm font-medium text-blue-900">
          Display this finding on health card
        </label>
      </div>
      
      {/* Buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? "Saving..." : "Save Finding"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
