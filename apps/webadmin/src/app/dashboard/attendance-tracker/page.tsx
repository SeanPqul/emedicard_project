'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar, Users, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import DashboardActivityLog from '@/components/DashboardActivityLog';
import { useRouter } from 'next/navigation';

type AttendanceStatus = 'Scheduled' | 'Completed' | 'Missed';

interface Attendee {
  orientationId: Id<'orientations'>;
  applicationId: Id<'applications'>;
  fullname: string;
  jobCategory: string;
  jobCategoryColor: string;
  applicationStatus: string;
  orientationStatus: AttendanceStatus;
  checkInTime?: number;
  checkOutTime?: number;
  qrCodeUrl: string;
}

interface OrientationSchedule {
  scheduleId: Id<'orientationSchedules'>;
  date: number;
  time: string;
  venue: {
    name: string;
    address: string;
    capacity: number;
  };
  instructor?: {
    name: string;
    designation?: string;
    email?: string;
  } | null;
  totalSlots: number;
  availableSlots: number;
  attendees: Attendee[];
  attendeeCount: number;
  completedCount: number;
  checkedInCount: number;
}

export default function AttendanceTrackerPage() {
  const router = useRouter();
  
  // Set today as default date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [finalizingSession, setFinalizingSession] = useState<string | null>(null);

  // Convert selected date to timestamp (start of day)
  const selectedTimestamp = selectedDate.getTime();

  // Query orientation schedules for the selected date
  const schedules = useQuery(
    api.orientations.attendance.getOrientationSchedulesForDate,
    { selectedDate: selectedTimestamp }
  );

  // Debug logging
  React.useEffect(() => {
    if (schedules !== undefined) {
      console.log('📊 Query Result:', {
        selectedDate: selectedDate.toLocaleDateString(),
        timestamp: selectedTimestamp,
        schedulesFound: schedules?.length || 0,
        schedules: schedules
      });
    }
  }, [schedules, selectedDate, selectedTimestamp]);

  // Mutation to finalize attendance
  const finalizeAttendance = useMutation(
    api.orientations.attendance.finalizeSessionAttendance
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    date.setHours(0, 0, 0, 0);
    console.log('🔍 Date Filter Changed:', {
      inputValue: e.target.value,
      dateObject: date,
      timestamp: date.getTime(),
      formatted: date.toLocaleDateString()
    });
    setSelectedDate(date);
  };

  const handleFinalizeSession = async (schedule: OrientationSchedule) => {
    try {
      setFinalizingSession(schedule.scheduleId);
      const result = await finalizeAttendance({
        scheduleId: schedule.scheduleId,
        selectedDate: schedule.date,
        timeSlot: schedule.time,
        venue: schedule.venue.name,
      });

      if (result.success) {
        alert(
          `✅ ${result.message}\n\nCompleted: ${result.completedCount}\nMissed: ${result.missedCount}`
        );
      }
    } catch (error) {
      console.error('Error finalizing session:', error);
      alert('❌ Failed to finalize session. Please try again.');
    } finally {
      setFinalizingSession(null);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'Missed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Missed
          </span>
        );
      case 'Scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
    }
  };

  const getAttendanceStatus = (attendee: Attendee) => {
    if (attendee.checkInTime && attendee.checkOutTime) {
      return (
        <span className="text-green-600 text-sm font-medium">
          ✓ Attended (In: {new Date(attendee.checkInTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}, Out: {new Date(attendee.checkOutTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })})
        </span>
      );
    } else if (attendee.checkInTime) {
      return (
        <span className="text-yellow-600 text-sm font-medium">
          ⏳ Checked In ({new Date(attendee.checkInTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })})
        </span>
      );
    } else {
      return (
        <span className="text-gray-500 text-sm">
          ⊘ Not Checked In
        </span>
      );
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar>
        <DashboardActivityLog />
      </Navbar>
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Orientation Attendance Tracker</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track and finalize orientation attendance for food safety sessions.
          </p>
        </div>

        {/* Date Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleDateChange}
            className="block w-full max-w-xs px-4 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Loading State */}
        {schedules === undefined && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading orientation schedules...</p>
          </div>
        )}

        {/* No Schedules Found */}
        {schedules && schedules.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No orientation schedules found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no orientation sessions scheduled for {new Date(selectedTimestamp).toLocaleDateString()}.
            </p>
          </div>
        )}

        {/* Orientation Sessions */}
        {schedules && schedules.length > 0 && (
          <div className="space-y-6">
            {schedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Session Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Food Safety Orientation
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {schedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.venue.name}
                        </span>
                        {schedule.instructor && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Instructor: {schedule.instructor.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {schedule.attendeeCount}/{schedule.totalSlots}
                      </div>
                      <div className="text-xs opacity-90">Registered</div>
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex gap-8 text-sm">
                    <div>
                      <span className="text-gray-600">Checked In:</span>
                      <span className="ml-2 font-semibold text-blue-600">
                        {schedule.checkedInCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        {schedule.completedCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Pending:</span>
                      <span className="ml-2 font-semibold text-gray-600">
                        {schedule.attendeeCount - schedule.completedCount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendees List */}
                <div className="p-6">
                  {schedule.attendees.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p>No attendees registered for this session.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Applicant Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Job Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schedule.attendees.map((attendee) => (
                            <tr key={attendee.applicationId} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {attendee.fullname}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: attendee.jobCategoryColor + '20',
                                    color: attendee.jobCategoryColor,
                                  }}
                                >
                                  {attendee.jobCategory}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                {getStatusBadge(attendee.orientationStatus)}
                              </td>
                              <td className="px-4 py-4">
                                {getAttendanceStatus(attendee)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Finalize Button */}
                {schedule.attendees.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Finalize this session to validate attendance and update applicant statuses.
                      </p>
                      <button
                        onClick={() => handleFinalizeSession(schedule)}
                        disabled={finalizingSession === schedule.scheduleId}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                      >
                        {finalizingSession === schedule.scheduleId ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Finalizing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Finalize Session
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
