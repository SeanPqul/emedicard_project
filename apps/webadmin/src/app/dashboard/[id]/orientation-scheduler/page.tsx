'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { Id } from '@backend/convex/_generated/dataModel';

type PageProps = {
  params: {
    id: Id<'applications'>;
  };
};

export default function OrientationSchedulerPage({ params }: PageProps) {
  const application = useQuery(api.applications.getApplicationById.getApplicationByIdQuery, { applicationId: params.id });
  const existingOrientation = useQuery(api.admin.orientation.getOrientationByApplicationId, { applicationId: params.id });
  const scheduleOrientation = useMutation(api.admin.orientation.scheduleOrientation);

  const [scheduleDate, setScheduleDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [venue, setVenue] = useState('');
  const [inspectorId, setInspectorId] = useState<Id<'users'> | ''>('');

  const [allowConflict, setAllowConflict] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available time slots
  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
  ];

  // Get inspectors with availability when date and time are selected
  const inspectorsWithAvailability = useQuery(
    api.admin.inspectorAvailability.getInspectorsWithAvailability,
    scheduleDate && timeSlot
      ? {
          orientationDate: new Date(scheduleDate).setHours(0, 0, 0, 0),
          timeSlot: timeSlot,
          excludeApplicationId: params.id,
        }
      : 'skip'
  );

  // Load existing orientation data
  useEffect(() => {
    if (existingOrientation) {
      if (existingOrientation.scheduledDate) {
        const date = new Date(existingOrientation.scheduledDate);
        setScheduleDate(date.toISOString().split('T')[0]);
      }
      if (existingOrientation.scheduledTime) setTimeSlot(existingOrientation.scheduledTime);
      if (existingOrientation.venue?.name) setVenue(existingOrientation.venue.name);
      if (existingOrientation.instructor) {
        // Note: instructor is an object, not an ID. The old schema might not have this.
        // This would need backend updates to properly handle inspector assignment
      }
    }
  }, [existingOrientation]);

  const handleSchedule = async () => {
    setError('');
    setSuccess('');

    if (!application || !scheduleDate || !timeSlot || !venue || !inspectorId) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await scheduleOrientation({
        applicationId: application._id,
        orientationDate: new Date(scheduleDate).setHours(0, 0, 0, 0),
        timeSlot: timeSlot,
        assignedInspectorId: inspectorId,
        orientationVenue: venue,
        allowConflict: allowConflict,
      });
      setSuccess('Orientation scheduled successfully!');
      setAllowConflict(false);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule orientation');
    }
  };

  if (!application) {
    return <div>Loading...</div>;
  }

  const selectedInspector = inspectorsWithAvailability?.find(
    (insp) => insp._id === inspectorId
  );

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Orientation Scheduler</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">{application.userName}</h2>
        <p className="text-gray-600 mb-6">{application.jobCategoryName}</p>
        
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date
            </label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => {
                setScheduleDate(e.target.value);
                setInspectorId(''); // Reset inspector when date changes
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Slot
            </label>
            <select
              value={timeSlot}
              onChange={(e) => {
                setTimeSlot(e.target.value);
                setInspectorId(''); // Reset inspector when time changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Time Slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g., City Health Office"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Inspector Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Inspector
            </label>
            <select
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value as Id<'users'>)}
              disabled={!scheduleDate || !timeSlot}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {!scheduleDate || !timeSlot
                  ? 'Select date and time first'
                  : 'Select Inspector'}
              </option>
              {inspectorsWithAvailability?.map((inspector) => (
                <option key={inspector._id} value={inspector._id}>
                  {inspector.fullname}
                  {inspector.isAvailable
                    ? ' ✓ Available'
                    : ` ⚠ Busy (${inspector.assignedCount} scheduled)`}
                </option>
              ))}
            </select>
            
            {/* Conflict Warning */}
            {selectedInspector && !selectedInspector.isAvailable && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠ This inspector is already assigned to {selectedInspector.assignedCount} orientation(s) at this time.
                </p>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={allowConflict}
                    onChange={(e) => setAllowConflict(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    I understand and want to assign anyway
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSchedule}
              disabled={
                !scheduleDate ||
                !timeSlot ||
                !venue ||
                !inspectorId ||
                (!selectedInspector?.isAvailable && !allowConflict)
              }
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {existingOrientation ? 'Update Schedule' : 'Save Schedule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
