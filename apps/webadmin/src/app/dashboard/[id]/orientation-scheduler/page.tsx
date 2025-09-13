'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

type PageProps = {
  params: {
    id: Id<'forms'>;
  };
};

export default function OrientationSchedulerPage({ params }: PageProps) {
  const form = useQuery(api.forms.get, { id: params.id });
  const inspectors = useQuery(api.admins.getInspectors);
  const scheduleOrientation = useMutation(api.admins.scheduleOrientation);

  const [scheduleDate, setScheduleDate] = useState('');
  const [venue, setVenue] = useState('');
  const [inspectorId, setInspectorId] = useState<Id<'users'>>();

  const handleSchedule = () => {
    if (form && scheduleDate && venue && inspectorId) {
      scheduleOrientation({
        formId: form._id,
        scheduleAt: new Date(scheduleDate).getTime(),
        venue,
        inspectorId,
      });
    }
  };

  if (!form || !inspectors) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orientation Scheduler</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{form.userName}</h2>
        <p className="text-gray-600 mb-4">{form.jobCategoryName}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspector</label>
            <select
              onChange={(e) => setInspectorId(e.target.value as Id<'users'>)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option>Select Inspector</option>
              {inspectors.map((inspector) => (
                <option key={inspector._id} value={inspector._id}>
                  {inspector.fullname}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSchedule}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
