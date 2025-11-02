'use client';

import DashboardActivityLog from '@/components/DashboardActivityLog';
import Navbar from '@/components/shared/Navbar';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit2, Filter, MapPin, Search, User, Users, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

// Database uses lowercase status values
type AttendanceStatus = 'scheduled' | 'checked-in' | 'completed' | 'missed' | 'excused' | 'cancelled' | 'no-show';

interface Attendee {
  bookingId: Id<'orientationBookings'>;  // UPDATED: Use orientationBookings table
  applicationId: Id<'applications'>;
  fullname: string;
  gender: string;
  jobCategory: string;
  jobCategoryColor: string;
  applicationStatus: string;
  orientationStatus: AttendanceStatus;
  checkInTime?: number;
  checkOutTime?: number;
  inspectorNotes?: string;
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<{ [key: string]: string }>({});
  const [finalizingSession, setFinalizingSession] = useState<string | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<{
    bookingId: Id<'orientationBookings'>;  // UPDATED: Use orientationBookings table
    scheduleId: string;
  } | null>(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState<{
    status: 'completed' | 'missed' | 'excused';
    notes: string;
  }>({ status: 'completed', notes: '' });

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

  // Mutations
  const finalizeAttendance = useMutation(
    api.orientations.attendance.finalizeSessionAttendance
  );
  const manuallyUpdateStatus = useMutation(
    api.orientations.attendance.manuallyUpdateAttendanceStatus
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
    setSelectedTimeSlot('all'); // Reset time slot filter when date changes
  };

  const handleTimeSlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeSlot(e.target.value);
  };

  const handleSearchChange = (scheduleId: string, query: string) => {
    setSearchQuery(prev => ({ ...prev, [scheduleId]: query }));
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
          `✅ ${result.message}\n\nCompleted: ${result.completedCount}\nMissed: ${result.missedCount}${result.excusedCount ? `\nExcused: ${result.excusedCount}` : ''}`
        );
      }
    } catch (error) {
      console.error('Error finalizing session:', error);
      alert('❌ Failed to finalize session. Please try again.');
    } finally {
      setFinalizingSession(null);
    }
  };

  const handleManualStatusUpdate = async () => {
    if (!editingAttendee) return;

    try {
      const result = await manuallyUpdateStatus({
        bookingId: editingAttendee.bookingId,  // UPDATED: Use bookingId
        newStatus: statusUpdateForm.status,
        adminNotes: statusUpdateForm.notes || undefined,
      });

      if (result.success) {
        alert(`✅ ${result.message}`);
        setEditingAttendee(null);
        setStatusUpdateForm({ status: 'completed', notes: '' });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`❌ ${error.message || 'Failed to update status. Please try again.'}`);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'missed':
      case 'no-show':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Missed
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Excused
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        );
      case 'checked-in':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            <Clock className="w-3 h-3" />
            Checked In
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3" />
            Cancelled
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

  // Get unique time slots from schedules
  const availableTimeSlots = useMemo(() => {
    if (!schedules) return [];
    const slots = schedules.map(s => s.time);
    return [...new Set(slots)];
  }, [schedules]);

  // Filter schedules by selected time slot
  const filteredSchedules = useMemo(() => {
    if (!schedules) return [];
    if (selectedTimeSlot === 'all') return schedules;
    return schedules.filter(s => s.time === selectedTimeSlot);
  }, [schedules, selectedTimeSlot]);

  // Filter attendees by search query
  const getFilteredAttendees = (scheduleId: string, attendees: Attendee[]) => {
    const query = searchQuery[scheduleId]?.toLowerCase() || '';
    if (!query) return attendees;
    return attendees.filter(a => a.fullname.toLowerCase().includes(query));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar>
        <DashboardActivityLog />
      </Navbar>
      
      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Attendance Tracker</h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600">
                Track and finalize orientation attendance for food safety sessions
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Date and Time Slot Filters */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                Select Date
              </label>
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Time Slot Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Filter className="w-5 h-5 text-emerald-600" />
                Filter by Time Slot
              </label>
              <select
                value={selectedTimeSlot}
                onChange={handleTimeSlotChange}
                disabled={!schedules || schedules.length === 0}
                className="block w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              >
                <option value="all">All Time Slots</option>
                {availableTimeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
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
              No finished orientation sessions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no finished orientation sessions for {new Date(selectedTimestamp).toLocaleDateString()}.
              Only sessions that have ended can be finalized.
            </p>
          </div>
        )}

        {/* No Filtered Schedules */}
        {schedules && schedules.length > 0 && filteredSchedules.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No sessions match the selected filter
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try selecting a different time slot or choose "All Time Slots".
            </p>
          </div>
        )}

        {/* Orientation Sessions */}
        {filteredSchedules && filteredSchedules.length > 0 && (
          <div className="space-y-6">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden hover:border-emerald-300 transition-all"
              >
                {/* Enhanced Session Header */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-6 py-5 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-bold">
                          Food Safety Orientation
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <Clock className="w-4 h-4" />
                          {schedule.time}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                          <MapPin className="w-4 h-4" />
                          {schedule.venue.name}
                        </span>
                        {schedule.instructor && (
                          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <User className="w-4 h-4" />
                            {schedule.instructor.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right bg-white/10 px-6 py-3 rounded-xl backdrop-blur-sm">
                      <div className="text-3xl font-bold">
                        {schedule.attendeeCount}/{schedule.totalSlots}
                      </div>
                      <div className="text-xs opacity-90 mt-1">Registered</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Session Stats */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Checked In</span>
                        <span className="text-lg font-bold text-blue-600">
                          {schedule.checkedInCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Completed</span>
                        <span className="text-lg font-bold text-green-600">
                          {schedule.completedCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <span className="block text-xs text-gray-500">Pending</span>
                        <span className="text-lg font-bold text-gray-600">
                          {schedule.attendeeCount - schedule.completedCount}
                        </span>
                      </div>
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
                    <>
                      {/* Search Bar */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search attendees by name..."
                            value={searchQuery[schedule.scheduleId] || ''}
                            onChange={(e) => handleSearchChange(schedule.scheduleId, e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Applicant Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gender
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
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getFilteredAttendees(schedule.scheduleId, schedule.attendees).map((attendee) => (
                            <tr key={attendee.applicationId} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {attendee.fullname}
                                </div>
                                {attendee.inspectorNotes && (
                                  <div className="text-xs text-gray-500 mt-1 italic">
                                    Note: {attendee.inspectorNotes}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">
                                  {attendee.gender}
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
                              <td className="px-4 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEditingAttendee({
                                      bookingId: attendee.bookingId,  // UPDATED: Use bookingId
                                      scheduleId: schedule.scheduleId,
                                    });
                                    // Determine initial status for form
                                    const initialStatus: 'completed' | 'missed' | 'excused' = 
                                      attendee.orientationStatus === 'scheduled' || attendee.orientationStatus === 'checked-in' 
                                        ? 'completed' 
                                        : (attendee.orientationStatus === 'completed' || attendee.orientationStatus === 'missed' || attendee.orientationStatus === 'excused')
                                          ? attendee.orientationStatus
                                          : 'completed';
                                    setStatusUpdateForm({
                                      status: initialStatus,
                                      notes: attendee.inspectorNotes || '',
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Edit Status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
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

        {/* Manual Status Update Modal */}
        {editingAttendee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Attendance Status
              </h3>
              
              <div className="space-y-4">
                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusUpdateForm.status}
                    onChange={(e) => setStatusUpdateForm(prev => ({ 
                      ...prev, 
                      status: e.target.value as 'completed' | 'missed' | 'excused'
                    }))}
                    className="block w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="excused">Excused</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={statusUpdateForm.notes}
                    onChange={(e) => setStatusUpdateForm(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    rows={3}
                    placeholder="Add any notes about this status change..."
                    className="block w-full px-4 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingAttendee(null);
                    setStatusUpdateForm({ status: 'completed', notes: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleManualStatusUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
