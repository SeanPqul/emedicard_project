'use client';

import DashboardActivityLog from '@/components/DashboardActivityLog';
import Navbar from '@/components/shared/Navbar';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit2, Filter, MapPin, Search, User, Users, XCircle, Lock, AlertCircle } from 'lucide-react';
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
  isActive: boolean;
  isPast: boolean;
  isUpcoming: boolean;
  isFinalized: boolean;
  finalizedAt?: number;
  finalizedBy?: Id<'users'>;
}

export default function AttendanceTrackerPage() {
  const router = useRouter();
  
  // Set today as default date in PHT timezone
  const getTodayPHTMidnight = () => {
    const now = new Date();
    // Get current date in PHT
    const phtDateStr = now.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const [month, day, year] = phtDateStr.split('/').map(Number);
    
    // Create UTC midnight for today's PHT date
    const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    
    // Convert to PHT midnight by subtracting 8 hours
    const phtMidnightUTC = utcMidnight - (8 * 60 * 60 * 1000);
    
    return new Date(phtMidnightUTC);
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayPHTMidnight());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<{ [key: string]: string }>({});
  // Finalization now handled by inspector QR code check-out, no longer needed here
  const [editingAttendee, setEditingAttendee] = useState<{
    bookingId: Id<'orientationBookings'>;  // UPDATED: Use orientationBookings table
    scheduleId: string;
  } | null>(null);
  const [statusUpdateForm, setStatusUpdateForm] = useState<{
    status: 'completed' | 'missed' | 'excused';
    notes: string;
  }>({ status: 'completed', notes: '' });
  const [successModal, setSuccessModal] = useState<{
    show: boolean;
    completedCount: number;
    missedCount: number;
    excusedCount: number;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    schedule: OrientationSchedule | null;
  }>({ show: false, schedule: null });

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
  const manuallyUpdateStatus = useMutation(
    api.orientations.attendance.manuallyUpdateAttendanceStatus
  );
  const finalizeSession = useMutation(
    api.orientations.attendance.finalizeSessionAttendance
  );

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse the date input value (YYYY-MM-DD format)
    const [year, month, day] = e.target.value.split('-').map(Number);
    
    // Create UTC midnight for the selected date
    const utcMidnight = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
    
    // Convert to PHT midnight by subtracting 8 hours
    // This gives us the UTC timestamp that represents midnight in PHT
    const phtMidnightUTC = utcMidnight - (8 * 60 * 60 * 1000);
    
    const date = new Date(phtMidnightUTC);
    
    console.log('🔍 Date Filter Changed:', {
      inputValue: e.target.value,
      dateObject: date,
      timestamp: date.getTime(),
      phtMidnight: phtMidnightUTC,
      formatted: date.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })
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
    // Show confirmation modal
    setConfirmModal({ show: true, schedule });
  };

  const confirmFinalization = async () => {
    if (!confirmModal.schedule) return;

    const schedule = confirmModal.schedule;
    setConfirmModal({ show: false, schedule: null });

    try {
      const result = await finalizeSession({
        scheduleId: schedule.scheduleId,
        selectedDate: schedule.date,
        timeSlot: schedule.time,
        venue: schedule.venue.name,
      });

      if (result.success) {
        setSuccessModal({
          show: true,
          completedCount: result.completedCount,
          missedCount: result.missedCount,
          excusedCount: result.excusedCount,
        });
      }
    } catch (error: any) {
      console.error('Error finalizing session:', error);
      alert(`❌ ${error.message || 'Failed to finalize session. Please try again.'}`);
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
        setEditingAttendee(null);
        setStatusUpdateForm({ status: 'completed', notes: '' });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(`❌ ${error.message || 'Failed to update status. Please try again.'}`);
    }
  };

  const getSessionStatusBadge = (schedule: OrientationSchedule) => {
    if (schedule.isFinalized) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg border-2 border-gray-600">
          <Lock className="w-4 h-4" />
          <span className="font-semibold text-sm">Finalized</span>
        </div>
      );
    } else if (schedule.isActive) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg animate-pulse border-2 border-emerald-400">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="font-semibold text-sm">Active Now</span>
        </div>
      );
    } else if (schedule.isPast) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-2 border-blue-400">
          <CheckCircle className="w-4 h-4" />
          <span className="font-semibold text-sm">Completed</span>
        </div>
      );
    }
    return null;
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
    // Format the date in PHT timezone for the input field
    const phtDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    const year = phtDate.getFullYear();
    const month = String(phtDate.getMonth() + 1).padStart(2, '0');
    const day = String(phtDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
                Track orientation attendance for food safety sessions
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
              No active or finished orientation sessions
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no active or finished orientation sessions for {new Date(selectedTimestamp).toLocaleDateString('en-US', { timeZone: 'Asia/Manila' })}.
              Sessions will appear here once they have started.
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
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${
                  schedule.isFinalized 
                    ? 'border-2 border-gray-400 opacity-95' 
                    : 'border-2 border-gray-200 hover:border-emerald-300'
                }`}
              >
                {/* Enhanced Session Header */}
                <div className={`px-6 py-5 text-white relative overflow-hidden ${
                  schedule.isFinalized
                    ? 'bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800'
                    : schedule.isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700'
                    : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
                }`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm shadow-lg">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">
                            Food Safety Orientation
                          </h2>
                          <p className="text-xs text-white/80 mt-0.5">{schedule.venue.address}</p>
                        </div>
                      </div>
                      {getSessionStatusBadge(schedule)}
                    </div>
                    
                    <div className="flex flex-wrap gap-3 text-sm">
                      <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{schedule.time}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{schedule.venue.name}</span>
                      </div>
                      {schedule.instructor && (
                        <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{schedule.instructor.name}</span>
                          {schedule.instructor.designation && (
                            <span className="text-xs text-white/70">• {schedule.instructor.designation}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-lg backdrop-blur-sm border border-white/20">
                        <Users className="w-4 h-4" />
                        <span className="font-bold text-lg">{schedule.attendeeCount}</span>
                        <span className="text-white/80">/ {schedule.totalSlots} slots</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Session Stats */}
                <div className={`px-6 py-4 border-b border-gray-200 ${
                  schedule.isFinalized 
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200' 
                    : 'bg-gradient-to-r from-gray-50 to-gray-100'
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Checked In</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {schedule.checkedInCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shadow-sm">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</span>
                          <span className="text-2xl font-bold text-green-600">
                            {schedule.completedCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shadow-sm">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <span className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</span>
                          <span className="text-2xl font-bold text-orange-600">
                            {schedule.attendeeCount - schedule.completedCount}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Finalize Button or Finalized Info */}
                    {schedule.isFinalized ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl">
                        <Lock className="w-4 h-4" />
                        <div className="text-left">
                          <p className="text-xs font-medium">Finalized</p>
                          <p className="text-xs text-gray-300">
                            {schedule.finalizedAt && new Date(schedule.finalizedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ) : schedule.isPast && schedule.attendees.length > 0 ? (
                      <button
                        onClick={() => handleFinalizeSession(schedule)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl font-semibold text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Finalize Session
                      </button>
                    ) : null}
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

                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Applicant Name
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Gender
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Job Category
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Attendance
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getFilteredAttendees(schedule.scheduleId, schedule.attendees).map((attendee) => (
                            <tr key={attendee.applicationId} className={`hover:bg-gray-50 transition-colors ${schedule.isFinalized ? 'opacity-90' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {attendee.fullname}
                                </div>
                                {attendee.inspectorNotes && (
                                  <div className="text-xs text-gray-500 mt-1 italic flex items-start gap-1">
                                    <span className="font-medium">Note:</span> {attendee.inspectorNotes}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">
                                  {attendee.gender}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
                                  style={{
                                    backgroundColor: attendee.jobCategoryColor + '20',
                                    color: attendee.jobCategoryColor,
                                  }}
                                >
                                  {attendee.jobCategory}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(attendee.orientationStatus)}
                              </td>
                              <td className="px-6 py-4">
                                {getAttendanceStatus(attendee)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {schedule.isFinalized ? (
                                  <div className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingAttendee({
                                        bookingId: attendee.bookingId,
                                        scheduleId: schedule.scheduleId,
                                      });
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
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors border border-blue-200 hover:border-blue-300"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit Status
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    </>
                  )}
                </div>

                {/* Session Status Note */}
                {schedule.attendees.length > 0 && (
                  <div className={`px-6 py-4 border-t border-gray-200 ${
                    schedule.isFinalized 
                      ? 'bg-gray-100' 
                      : schedule.isActive
                      ? 'bg-emerald-50'
                      : 'bg-blue-50'
                  }`}>
                    {schedule.isFinalized ? (
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-gray-700 shrink-0" />
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Session Finalized:</span> This orientation session has been finalized. All attendance records have been processed and applicant statuses have been updated. No further changes can be made.
                        </p>
                      </div>
                    ) : schedule.isPast ? (
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">Action Required:</span> This session has ended. Please review the attendance records and click "Finalize Session" to process all attendance and update applicant statuses.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-blue-700">
                          <span className="font-semibold">Note:</span> Attendance is automatically tracked when inspectors check in/out attendees via QR code scanning. You can finalize the session after it ends to process all records.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.show && confirmModal.schedule && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 transform transition-all animate-in zoom-in-95 duration-300">
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <AlertCircle className="w-12 h-12 text-orange-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Finalize Session?
              </h3>
              
              {/* Warning Message */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-orange-800 font-medium mb-2">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-sm text-gray-700">
                  Finalizing this session will:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
                  <li>Lock all attendance records</li>
                  <li>Update applicant statuses automatically</li>
                  <li>Prevent any further edits to this session</li>
                  <li>Send notifications to affected applicants</li>
                </ul>
              </div>

              {/* Session Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Session Details:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {new Date(confirmModal.schedule.date).toLocaleDateString('en-US', {
                        timeZone: 'Asia/Manila',
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{confirmModal.schedule.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{confirmModal.schedule.venue.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {confirmModal.schedule.attendeeCount} attendees ({confirmModal.schedule.completedCount} completed)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ show: false, schedule: null })}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmFinalization}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-semibold transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Yes, Finalize Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successModal?.show && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-in zoom-in-95 duration-300">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="bg-emerald-100 rounded-full p-3">
                  <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Session Validated Successfully!
              </h3>
              
              {/* Message */}
              <p className="text-center text-gray-600 text-sm mb-6">
                Attendance records have been validated and applicant statuses updated to Approved.
              </p>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                {successModal.completedCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Completed</span>
                    <span className="text-lg font-bold text-green-600">{successModal.completedCount}</span>
                  </div>
                )}
                {successModal.missedCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-900">Missed</span>
                    <span className="text-lg font-bold text-red-600">{successModal.missedCount}</span>
                  </div>
                )}
                {successModal.excusedCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-900">Excused</span>
                    <span className="text-lg font-bold text-yellow-600">{successModal.excusedCount}</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSuccessModal(null)}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Continue
              </button>
            </div>
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
