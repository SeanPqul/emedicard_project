// components/LabFindingsList.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@backend/convex/_generated/api";
import { Id } from "@backend/convex/_generated/dataModel";

interface Props {
  applicationId: Id<"applications">;
  onRecordNew?: () => void;
}

export default function LabFindingsList({ applicationId, onRecordNew }: Props) {
  const findings = useQuery(api.labFindings.index.getLabFindings, { applicationId });
  const deleteFinding = useMutation(api.labFindings.index.deleteLabFinding);
  
  if (!findings) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (findings.all.length === 0) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-600 mb-4">No lab findings recorded for this application.</p>
        {onRecordNew && (
          <button
            onClick={onRecordNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Record First Finding
          </button>
        )}
      </div>
    );
  }
  
  const handleDelete = async (findingId: Id<"labTestFindings">) => {
    if (!confirm("Delete this finding? This cannot be undone.")) return;
    
    try {
      await deleteFinding({ findingId });
    } catch (err: any) {
      alert(err.message || "Failed to delete finding");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Lab Findings Summary
        </h3>
        {onRecordNew && (
          <button
            onClick={onRecordNew}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Finding
          </button>
        )}
      </div>
      
      {/* Urinalysis Findings */}
      {findings.urinalysis.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
            <h4 className="font-medium text-sm text-blue-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              URINALYSIS ({findings.urinalysis.length})
            </h4>
          </div>
          <div className="p-4 space-y-2">
            {findings.urinalysis.map((finding: any) => (
              <FindingCard 
                key={finding._id} 
                finding={finding} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* X-Ray/Sputum Findings */}
      {findings.xray_sputum.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-purple-50 px-4 py-2 border-b border-purple-100">
            <h4 className="font-medium text-sm text-purple-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              X-RAY / SPUTUM ({findings.xray_sputum.length})
            </h4>
          </div>
          <div className="p-4 space-y-2">
            {findings.xray_sputum.map((finding: any) => (
              <FindingCard 
                key={finding._id} 
                finding={finding} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Stool Findings */}
      {findings.stool.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="bg-green-50 px-4 py-2 border-b border-green-100">
            <h4 className="font-medium text-sm text-green-900 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
              </svg>
              STOOL EXAMINATION ({findings.stool.length})
            </h4>
          </div>
          <div className="p-4 space-y-2">
            {findings.stool.map((finding: any) => (
              <FindingCard 
                key={finding._id} 
                finding={finding} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ finding, onDelete }: { finding: any; onDelete: (id: Id<"labTestFindings">) => void }) {
  const clearedDate = new Date(finding.clearedDate).toLocaleDateString();
  const expiryDate = new Date(finding.monitoringExpiry).toLocaleDateString();
  const isExpiringSoon = finding.monitoringExpiry - Date.now() < 30 * 24 * 60 * 60 * 1000; // 30 days
  const isExpired = finding.monitoringExpiry < Date.now();
  
  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-md hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 mb-2">{finding.findingKind}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Cleared: {clearedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className={`w-4 h-4 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className={isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                Retest Due: {expiryDate}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Doctor: {finding.doctorName}</span>
          </div>
          
          {finding.treatmentNotes && (
            <p className="text-xs text-gray-500 italic mt-2 pl-5">&quot;{finding.treatmentNotes}&quot;</p>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {finding.showOnCard && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              On Card
            </span>
          )}
          {isExpiringSoon && !isExpired && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
              Expiring Soon
            </span>
          )}
          {isExpired && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
              Expired
            </span>
          )}
          {!finding.healthCardId && (
            <button
              onClick={() => onDelete(finding._id)}
              className="text-xs text-red-600 hover:text-red-800 hover:underline font-medium"
              title="Delete this finding"
            >
              Delete
            </button>
          )}
          {finding.healthCardId && (
            <span className="text-xs text-gray-400 italic">Card generated</span>
          )}
        </div>
      </div>
    </div>
  );
}
