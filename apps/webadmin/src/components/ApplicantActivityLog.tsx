// src/components/ApplicantActivityLog.tsx

import { api } from '@backend/convex/_generated/api';
import { Doc, Id } from '@backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { isLoggingOut } from '@/utils/convexErrorHandler';

// Define the type for an activity log entry with applicant name
type AdminActivityLogWithApplicantName = Doc<"adminActivityLogs"> & {
  applicantName?: string;
  admin?: {
    fullname?: string;
    email?: string;
  };
};

interface ApplicantActivityLogProps {
  applicationId: Id<"applications">;
  applicantName: string;
}

const ApplicantActivityLog: React.FC<ApplicantActivityLogProps> = ({ applicationId, applicantName }) => {
  const [showLog, setShowLog] = useState(false);
  const { isSignedIn } = useUser();
  const [shouldSkipQueries, setShouldSkipQueries] = useState(false);

  // Check if we should skip queries (not authenticated or logging out)
  useEffect(() => {
    setShouldSkipQueries(!isSignedIn || isLoggingOut());
  }, [isSignedIn]);

  // Use the new query to fetch application-specific admin activities
  const activityLogs: AdminActivityLogWithApplicantName[] | undefined = useQuery(
    api.admin.activityLogs.getApplicationActivityLogs,
    shouldSkipQueries ? "skip" : { applicationId }
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
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 text-black rounded-lg shadow-lg z-10 p-4">
          <h3 className="text-lg font-bold mb-2 text-gray-900">Activity History</h3>
          <p className="text-sm text-gray-700 font-semibold mb-4">For: <span className="text-gray-900">{applicantName}</span></p>
          <div className="max-h-60 overflow-y-auto">
            {activityLogs === undefined && <p className="text-gray-700 font-medium">Loading logs...</p>}
            {activityLogs?.length === 0 && (
              <p className="text-gray-700 font-medium">No activity logs found.</p>
            )}
            {activityLogs?.map((activity: AdminActivityLogWithApplicantName) => (
              <div key={activity._id} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Admin Info */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {activity.admin?.fullname || 'Unknown Admin'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {activity.admin?.email || 'No email'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Action Details */}
                    <p className="text-sm text-gray-800 leading-relaxed mb-1">
                      {activity.details || activity.action || "Performed an action"}
                      {activity.applicantName && (
                        <span className="font-semibold text-gray-900"> for {activity.applicantName}</span>
                      )}
                    </p>
                    
                    {/* Comment */}
                    {activity.comment && (
                      <div className="bg-amber-50 border-l-2 border-amber-400 px-3 py-2 rounded-r mt-2">
                        <p className="text-xs text-amber-900 font-medium">
                          <span className="font-bold">Note:</span> {activity.comment}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantActivityLog;
