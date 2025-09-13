'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export default function AttendanceTrackerPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const orientations = useQuery(api.orientations.getByDate, selectedDate ? { date: new Date(selectedDate).getTime() } : 'skip');
  const trackAttendance = useMutation(api.admins.trackOrientationAttendance);

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
        {orientations?.map((orientation) => (
          <div key={orientation._id} className="flex items-center justify-between p-2 border-b">
            <div>
              <p className="font-semibold">{orientation.userName}</p>
              <p className="text-sm text-gray-500">{new Date(orientation.scheduleAt).toLocaleString()}</p>
              <p className="text-sm text-gray-500">{orientation.venue}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(orientation._id, 'Completed')}
                className="bg-green-500 text-white px-3 py-1 rounded-lg"
              >
                Attended
              </button>
              <button
                onClick={() => handleStatusChange(orientation._id, 'Missed')}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
              >
                Missed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
