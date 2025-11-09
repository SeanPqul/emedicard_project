"use client";

import ErrorMessage from "@/components/ErrorMessage";
import Navbar from "@/components/shared/Navbar";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  calculateDuration,
  formatDuration,
  formatTimeRange,
  minutesToTime,
  timeToMinutes,
  validateTimeRange,
} from "@/lib/timeUtils";
import { dateStringToPHTMidnight, dateToPHTMidnight } from "@/lib/dateUtils";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { addDays, format, startOfWeek } from "date-fns";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type Schedule = Doc<"orientationSchedules">;

// Create/Edit Schedule Modal Component
const ScheduleModal = ({
  isOpen,
  onClose,
  schedule,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  schedule?: Schedule | null;
  onSave: () => void;
}) => {
  const [date, setDate] = useState(schedule ? new Date(schedule.date).toISOString().split("T")[0] : "");
  const [startTime, setStartTime] = useState(
    schedule?.startMinutes !== undefined ? minutesToTime(schedule.startMinutes) : "09:00"
  );
  const [endTime, setEndTime] = useState(
    schedule?.endMinutes !== undefined ? minutesToTime(schedule.endMinutes) : "11:00"
  );
  const [venueName, setVenueName] = useState(schedule?.venue.name || "");
  const [venueAddress, setVenueAddress] = useState(schedule?.venue.address || "");
  const [totalSlots, setTotalSlots] = useState(schedule?.totalSlots.toString() || "");
  const [selectedInspectorId, setSelectedInspectorId] = useState<Id<'users'> | ''>('' as any);
  const [notes, setNotes] = useState(schedule?.notes || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all inspectors
  const inspectors = useQuery(api.admin.orientation.getInspectors);

  const createSchedule = useMutation(api.orientationSchedules.createSchedule) as any;
  const updateSchedule = useMutation(api.orientationSchedules.updateSchedule) as any;

  // Initialize inspector selection when editing existing schedule
  useEffect(() => {
    if (schedule?.instructor && inspectors) {
      // Find inspector by name match
      const matchingInspector = inspectors.find(
        (i: any) => i.fullname === schedule.instructor?.name
      );
      if (matchingInspector) {
        setSelectedInspectorId(matchingInspector._id);
      }
    }
  }, [schedule, inspectors]);

  // Live preview and validation
  const timePreview = useMemo(() => formatTimeRange(startTime, endTime), [startTime, endTime]);
  const duration = useMemo(() => calculateDuration(startTime, endTime), [startTime, endTime]);
  const timeError = useMemo(() => validateTimeRange(startTime, endTime), [startTime, endTime]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate time range
      if (timeError) {
        setError(timeError);
        setIsLoading(false);
        return;
      }

      // Validate inspector is selected
      if (!selectedInspectorId) {
        setError("Please select a health inspector");
        setIsLoading(false);
        return;
      }

      // Use centralized timezone utility for consistent date handling
      const utcTimestamp = dateStringToPHTMidnight(date);
      
      // Get selected inspector details
      const selectedInspector = inspectors?.find((i: any) => i._id === selectedInspectorId);
      
      if (!selectedInspector) {
        setError("Selected inspector not found");
        setIsLoading(false);
        return;
      }

      const scheduleData = {
        date: utcTimestamp,
        startMinutes: timeToMinutes(startTime),
        endMinutes: timeToMinutes(endTime),
        venue: {
          name: venueName,
          address: venueAddress,
          capacity: parseFloat(totalSlots), // Use totalSlots as capacity
        },
        totalSlots: parseFloat(totalSlots),
        instructor: { name: selectedInspector.fullname, designation: "Health Inspector" },
        notes: notes || undefined,
      };

      if (schedule) {
        await updateSchedule({ scheduleId: schedule._id, ...scheduleData });
      } else {
        await createSchedule(scheduleData);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save schedule");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {schedule ? "Edit Schedule" : "Create Schedule"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            {/* Time Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Time Schedule</h3>
                <span className="text-xs text-gray-500">🇵🇭 Philippine Time (UTC+8)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="900"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="900"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* Live Preview */}
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Time Slot:</span>
                  <span className="text-emerald-700 font-semibold">{timePreview}</span>
                </div>
                {duration > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-700">{formatDuration(duration)}</span>
                  </div>
                )}
                {timeError && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ {timeError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Venue Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Venue Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Venue Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g., City Health Office"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Venue Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Full address"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Slots <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                min="1"
                placeholder="Number of available slots"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum number of applicants that can book this session
              </p>
            </div>
          </div>

          {/* Inspector Selection - REQUIRED */}
          <div className="space-y-4 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
            <h3 className="font-semibold text-gray-900">Assigned Inspector <span className="text-red-500">*</span></h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Health Inspector <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value as Id<'users'>)}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={isLoading || !inspectors}
                required
              >
                <option value="">-- Select an Inspector --</option>
                {inspectors?.map((inspector: any) => (
                  <option key={inspector._id} value={inspector._id}>
                    {inspector.fullname}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                An inspector must be assigned to conduct the orientation session
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  schedule,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  schedule: Schedule | null;
  isDeleting: boolean;
}) => {
  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-red-100 rounded-full">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Schedule?</h2>
          <p className="text-gray-600 mb-2">
            Are you sure you want to delete this orientation schedule?
          </p>
          <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
            <p className="text-sm text-gray-700"><strong>Date:</strong> {format(new Date(schedule.date), "MMMM dd, yyyy")}</p>
            <p className="text-sm text-gray-700"><strong>Time:</strong> {schedule.time}</p>
            <p className="text-sm text-gray-700"><strong>Venue:</strong> {schedule.venue.name}</p>
          </div>
          <p className="text-red-600 text-sm font-medium">This action cannot be undone.</p>
        </div>
        <div className="flex bg-gray-50 rounded-b-2xl px-6 py-4 gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-2.5 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Create Modal
const BulkCreateModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [startDate, setStartDate] = useState("");
  const [weeksCount, setWeeksCount] = useState("4");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // Monday by default
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [totalSlots, setTotalSlots] = useState("");
  const [selectedInspectorId, setSelectedInspectorId] = useState<Id<'users'> | ''>('' as any);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all inspectors
  const inspectors = useQuery(api.admin.orientation.getInspectors);

  const bulkCreateSchedules = useMutation(api.orientationSchedules.mutations.bulkCreateSchedules) as any;

  // Live preview and validation
  const timePreview = useMemo(() => formatTimeRange(startTime, endTime), [startTime, endTime]);
  const duration = useMemo(() => calculateDuration(startTime, endTime), [startTime, endTime]);
  const timeError = useMemo(() => validateTimeRange(startTime, endTime), [startTime, endTime]);

  if (!isOpen) return null;

  const toggleDayOfWeek = (day: number) => {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate time range
      if (timeError) {
        setError(timeError);
        setIsLoading(false);
        return;
      }

      const start = startOfWeek(new Date(startDate), { weekStartsOn: 0 });
      const dates: number[] = [];
      for (let week = 0; week < parseInt(weeksCount); week++) {
        for (const day of daysOfWeek) {
          const scheduleDate = addDays(start, week * 7 + day);
          // Use centralized timezone utility for consistent date handling
          const utcTimestamp = dateToPHTMidnight(scheduleDate);
          dates.push(utcTimestamp);
        }
      }

      // Get selected inspector details if one is selected
      const selectedInspector = selectedInspectorId && inspectors
        ? inspectors.find((i: any) => i._id === selectedInspectorId)
        : null;

      await bulkCreateSchedules({
        dates,
        startMinutes: timeToMinutes(startTime),
        endMinutes: timeToMinutes(endTime),
        venue: {
          name: venueName,
          address: venueAddress,
          capacity: parseFloat(totalSlots), // Use totalSlots as capacity
        },
        totalSlots: parseFloat(totalSlots),
        instructor: selectedInspector ? { name: selectedInspector.fullname, designation: "Health Inspector" } : undefined,
        notes: notes || undefined,
      });

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create schedules");
    } finally {
      setIsLoading(false);
    }
  };

  const days = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Create Schedule</h2>
              <p className="text-gray-600 text-sm mt-1">Create multiple schedules for recurring weekly sessions</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Date Range */}
          <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Schedule Period</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Week <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Weeks <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={weeksCount}
                  onChange={(e) => setWeeksCount(e.target.value)}
                  min="1"
                  max="12"
                  className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Days of Week <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      daysOfWeek.includes(day.value)
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    disabled={isLoading}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Time Schedule</h3>
                <span className="text-xs text-gray-500">🇵🇭 Philippine Time (UTC+8)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="900"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    step="900"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* Live Preview */}
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Time Slot:</span>
                  <span className="text-emerald-700 font-semibold">{timePreview}</span>
                </div>
                {duration > 0 && (
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-700">{formatDuration(duration)}</span>
                  </div>
                )}
                {timeError && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠️ {timeError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Venue Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Venue Name *"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Venue Address *"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
              <input
                type="number"
                value={totalSlots}
                onChange={(e) => setTotalSlots(e.target.value)}
                placeholder="Total Slots *"
                min="1"
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-2">
                Maximum number of applicants per session
              </p>
            </div>
          </div>

          {/* Inspector Selection (Optional) */}
          <div className="space-y-4 p-4 bg-emerald-50 rounded-lg">
            <h3 className="font-semibold text-gray-900">Assigned Inspector (Optional)</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Health Inspector
              </label>
              <select
                value={selectedInspectorId}
                onChange={(e) => setSelectedInspectorId(e.target.value as Id<'users'>)}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={isLoading || !inspectors}
              >
                <option value="">No inspector assigned</option>
                {inspectors?.map((inspector: any) => (
                  <option key={inspector._id} value={inspector._id}>
                    {inspector.fullname}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Leave empty if instructor will be assigned later
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                rows={2}
                className="w-full px-4 py-2.5 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : `Create ${parseInt(weeksCount) * daysOfWeek.length} Schedules`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
export default function OrientationSchedulesPage() {
  const [viewMode, setViewMode] = useState<"upcoming" | "all">("upcoming");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { isLoaded: isClerkLoaded, user } = useUser();
  
  const adminPrivileges = useQuery(api.users.roles.getAdminPrivileges);
  const allSchedules = useQuery(api.orientationSchedules.getAllSchedules);
  const upcomingSchedules = useQuery(api.orientationSchedules.getUpcomingSchedules);
  
  const deleteSchedule = useMutation(api.orientationSchedules.deleteSchedule);
  const toggleAvailability = useMutation(api.orientationSchedules.toggleAvailability);

  const schedules = viewMode === "upcoming" ? upcomingSchedules : allSchedules;

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await deleteSchedule({ scheduleId: selectedSchedule._id });
      setIsDeleteModalOpen(false);
      setSelectedSchedule(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete schedule");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (scheduleId: Id<"orientationSchedules">) => {
    try {
      await toggleAvailability({ scheduleId });
    } catch (err: any) {
      setError(err.message || "Failed to update availability");
    }
  };

  const openEditModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  if (!isClerkLoaded || adminPrivileges === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  if (!adminPrivileges || adminPrivileges.managedCategories !== "all") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ErrorMessage
          title="Access Denied"
          message="You do not have Super Admin privileges to manage orientation schedules."
          onCloseAction={() => router.push("/dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/super-admin")}
              className="p-3 rounded-xl hover:bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-4 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Orientation Schedule Manager</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage orientation schedules for applicants</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl mb-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </header>

        {/* Enhanced Controls Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900">View & Actions</h3>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode("upcoming")}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                    viewMode === "upcoming"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
                    viewMode === "all"
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  All Schedules
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsBulkCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Bulk Create
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Schedules Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Orientation Schedules</h2>
                <p className="text-xs text-gray-600 mt-0.5">Manage all scheduled orientation sessions</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Date & Time</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Venue</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Instructor</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Capacity</th>
                  <th className="text-left px-6 py-4 font-bold text-gray-700">Status</th>
                  <th className="text-right px-6 py-4 font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules === undefined && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
                        <span>Loading schedules...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {schedules && schedules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-gray-600 font-medium">No schedules found</p>
                          <p className="text-gray-400 text-sm">Create your first orientation schedule</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {schedules && Array.isArray(schedules) && schedules.map((schedule: Schedule) => {
                  const slotPercentage = (schedule.availableSlots / schedule.totalSlots) * 100;
                  // Calculate isPast correctly: check if session END time has passed
                  const endMinutes = schedule.endMinutes ?? 1439; // Default to end of day if not set
                  const sessionEndTimestamp = schedule.date + (endMinutes * 60 * 1000);
                  const isPast = sessionEndTimestamp < Date.now();
                  const isFull = schedule.availableSlots <= 0;
                  const isActuallyAvailable = schedule.isAvailable && !isFull;
                  
                  return (
                    <tr key={schedule._id} className={`hover:bg-indigo-50/30 transition-all duration-150 border-b border-gray-100 last:border-0 ${isPast ? "opacity-60" : ""}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {format(new Date(schedule.date), "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-gray-600">{schedule.time}</div>
                        {isPast && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                            Past
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{schedule.venue.name}</div>
                        <div className="text-sm text-gray-500">{schedule.venue.address}</div>
                      </td>
                      <td className="px-6 py-4">
                        {schedule.instructor ? (
                          <>
                            <div className="font-medium text-gray-900">{schedule.instructor.name}</div>
                            <div className="text-sm text-gray-500">{schedule.instructor.designation}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                slotPercentage > 50
                                  ? "bg-emerald-500"
                                  : slotPercentage > 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${slotPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {schedule.availableSlots} / {schedule.totalSlots} slots
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleAvailability(schedule._id)}
                          disabled={isFull}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            isActuallyAvailable
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } ${isFull ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                          title={isFull ? "Cannot enable - No slots available" : isActuallyAvailable ? "Click to disable" : "Click to enable"}
                        >
                          {isFull ? "Full" : isActuallyAvailable ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md border border-blue-200"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(schedule)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:shadow-md border border-red-200"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={() => {}}
      />

      <ScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onSave={() => setSelectedSchedule(null)}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleDelete}
        schedule={selectedSchedule}
        isDeleting={isDeleting}
      />

      <BulkCreateModal
        isOpen={isBulkCreateModalOpen}
        onClose={() => setIsBulkCreateModalOpen(false)}
        onSave={() => {}}
      />
    </div>
  );
}
