// src/components/ApplicantActivityLog.tsx

import { api } from '@/convex/_generated/api'; // Use consolidated backend
import { Doc, Id } from '@/convex/_generated/dataModel'; // Added Doc import
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
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 text-black rounded-md shadow-lg z-10 p-4">
          <h3 className="text-lg font-semibold mb-2">Activity History</h3>
          <p className="text-sm text-gray-800 mb-4">For: {applicantName}</p>
          <div className="max-h-60 overflow-y-auto">
            {activityLogs === undefined && <p className="text-gray-500">Loading logs...</p>}
            {activityLogs?.length === 0 && (
              <p className="text-gray-500">No activity logs found.</p>
            )}
            {activityLogs?.map((activity: AdminActivityLogWithApplicantName) => (
              <div key={activity._id} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm text-gray-800 font-medium">
                  <span className="font-bold">{activity.admin?.fullname}</span> ({activity.admin?.email}) {(activity.details || activity.action || "performed an action").toLowerCase()}
                  {activity.applicantName && ` for `}
                  {activity.applicantName && <span className="font-bold">{activity.applicantName}</span>}.
                </p>
                {activity.comment && (
                  <p className="text-xs text-gray-700 bg-gray-50 p-1 rounded">Remarks: {activity.comment}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
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
