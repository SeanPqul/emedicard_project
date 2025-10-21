'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function AttendanceTrackerPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const orientations = useQuery(api.orientations.queries.getApplicantsForScheduling);
  const trackAttendance = useMutation(api.admin.adminMain.trackOrientationAttendance);

  const handleStatusChange = (orientationId: Id<'orientations'>, status: 'Completed' | 'Missed') => {
    trackAttendance({ orientationId, status });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orientation Attendance Tracker</h1>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        {orientations?.map((application: { _id: Id<'applications'>; applicantName: string }) => (
          <div key={application._id} className="flex items-center justify-between p-2 border-b">
            <div>
              <p className="font-semibold">{application.applicantName}</p>
              <p className="text-sm text-gray-500">Awaiting orientation schedule</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
