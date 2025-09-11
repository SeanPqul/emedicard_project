// src/components/ApplicantActivityLog.tsx

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api'; // Use consolidated backend
import { Id } from '@/convex/_generated/dataModel';
// DO NOT import directly from the convex folder here.

// Define the shape of the data we expect from our query
interface DocumentActivityLog {
  _id: Id<"documentUploads">;
  uploadedAt: number;
  reviewStatus: string;
  adminRemarks?: string;
  reviewerEmail: string | null;
  healthCardColor: string | null;
  documentType: {
    name: string;
  } | null;
}

interface ApplicantActivityLogProps {
  applicationId: Id<"applications">;
  applicantName: string;
}

const ApplicantActivityLog: React.FC<ApplicantActivityLogProps> = ({ applicationId, applicantName }) => {
  const [showLog, setShowLog] = useState(false);

  // =================================================================
  // == THIS IS THE FIX: We now point to the correct, clean API path ==
  // =================================================================
  const activityLogs = useQuery(
    api.documentUploads.getReviewedDocumentsWithDetails.get, 
    { applicationId }
  );

  return (
    <div className="relative">
      <button
        onClick={() => setShowLog(!showLog)}
        className="text-gray-600 hover:text-gray-800"
        title="View Activity Log"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>

      {showLog && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 text-black rounded-md shadow-lg z-10 p-4">
          <h3 className="text-lg font-semibold mb-2">Activity History</h3>
          <p className="text-sm text-gray-800 mb-4">For: {applicantName}</p>
          <div className="max-h-60 overflow-y-auto">
            {activityLogs === undefined && <p className="text-gray-500">Loading logs...</p>}
            {activityLogs?.length === 0 && (
              <p className="text-gray-500">No activity logs found.</p>
            )}
            {activityLogs?.map((log: DocumentActivityLog) => (
              <div key={log._id} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm text-gray-800 font-medium">
                  Document <span className="font-bold">{log.documentType?.name}</span>: {log.reviewStatus}
                </p>
                {log.adminRemarks && (
                  <p className="text-xs text-gray-700 bg-gray-50 p-1 rounded">Remarks: {log.adminRemarks}</p>
                )}
                {log.reviewerEmail && (
                  <p className="text-xs text-gray-700">Reviewed by: {log.reviewerEmail}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.uploadedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantActivityLog;