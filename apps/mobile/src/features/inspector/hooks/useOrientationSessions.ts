import { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { SessionWithStats } from '../lib/types';
import { getStartOfDay, enrichSessionData } from '../lib/utils';

/**
 * Hook to manage orientation sessions for the inspector
 * Provides date selection and session data with computed statistics
 */
export function useOrientationSessions(initialDate?: number) {
  // Get server date (tamper-proof)
  const serverDate = useQuery(api.lib.serverTime.getCurrentPHTDate);
  
  // Use server date as initial date if not provided
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  
  // Initialize selectedDate with server date when available
  useEffect(() => {
    if (serverDate !== undefined && selectedDate === null && !initialDate) {
      setSelectedDate(serverDate);
    } else if (initialDate && selectedDate === null) {
      setSelectedDate(initialDate);
    }
  }, [serverDate, initialDate, selectedDate]);

  // Fetch orientation schedules for the selected date (includes schedules with 0 attendees)
  const schedules = useQuery(
    api.orientationSchedules.getSchedulesForDate,
    selectedDate !== null ? { selectedDate } : "skip"
  );

  // Enrich sessions with computed stats and sort by time (latest first)
  const sessions = useMemo<SessionWithStats[] | null>(() => {
    if (!schedules) return null;

    const enrichedSessions = schedules.map((schedule: any) =>
      enrichSessionData({
        _id: schedule.scheduleId,
        date: schedule.date,
        timeSlot: schedule.time,
        venue: schedule.venue.name,
        maxCapacity: schedule.totalSlots,
        currentBookings: schedule.attendeeCount,
        attendees: schedule.attendees,
      })
    );

    // Sort by time slot - latest session first (descending order)
    // Use startMinutes if available, otherwise parse time string
    return enrichedSessions.sort((a, b) => {
      // Try to use startMinutes from backend if available
      const aSchedule = schedules.find((s: any) => s.scheduleId === a._id);
      const bSchedule = schedules.find((s: any) => s.scheduleId === b._id);
      
      if (aSchedule?.startMinutes !== undefined && bSchedule?.startMinutes !== undefined) {
        return bSchedule.startMinutes - aSchedule.startMinutes; // Descending
      }
      
      // Fallback to parsing time string
      const parseTime = (timeSlot: string): number => {
        const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!match) return 0;
        
        let hour = parseInt(match[1] || '0', 10);
        const minute = parseInt(match[2] || '0', 10);
        const isPM = match[3] === 'PM';
        
        if (isPM && hour !== 12) hour += 12;
        if (!isPM && hour === 12) hour = 0;
        
        return hour * 60 + minute;
      };
      
      const aTime = parseTime(a.timeSlot);
      const bTime = parseTime(b.timeSlot);
      
      return bTime - aTime; // Descending (latest first)
    });
  }, [schedules]);

  // Helper to change date
  const changeDate = (newDate: number) => {
    setSelectedDate(getStartOfDay(newDate));
  };

  // Helper to go to today (using server date)
  const goToToday = () => {
    if (serverDate !== undefined) {
      setSelectedDate(serverDate);
    }
  };

  // Check if viewing today (based on server date)
  const isToday = useMemo(() => {
    return selectedDate === serverDate;
  }, [selectedDate, serverDate]);

  // Count sessions by status using backend flags
  const sessionCounts = useMemo(() => {
    if (!sessions || !schedules) {
      return { total: 0, upcoming: 0, active: 0, completed: 0 };
    }

    return sessions.reduce(
      (counts, session) => {
        // Find the corresponding schedule with backend status flags
        const schedule = schedules.find((s: any) => s.scheduleId === session._id);
        
        if (schedule) {
          if (schedule.isUpcoming === true) {
            counts.upcoming++;
          } else if (schedule.isPast === true) {
            counts.completed++;
          } else {
            // Neither upcoming nor past = currently active
            counts.active++;
          }
        }
        
        counts.total++;
        return counts;
      },
      { total: 0, upcoming: 0, active: 0, completed: 0 }
    );
  }, [sessions, schedules]);

  // Convex doesn't directly expose errors, but we can infer from undefined schedules after loading
  // For now, we'll return null for error state (can be enhanced later)
  const refetch = () => {
    // Convex automatically refetches on retry
    // We can force a refetch by changing the date slightly and back
    if (selectedDate !== null) {
      const currentDate = selectedDate;
      setSelectedDate(currentDate + 1);
      setTimeout(() => setSelectedDate(currentDate), 100);
    }
  };

  return {
    sessions,
    schedules, // Raw schedules with backend status flags
    selectedDate: selectedDate ?? serverDate ?? getStartOfDay(Date.now()), // Fallback chain
    changeDate,
    goToToday,
    isToday,
    sessionCounts,
    isLoading: serverDate === undefined || selectedDate === null || schedules === undefined,
    isEmpty: sessions?.length === 0,
    error: null, // Convex doesn't expose errors in this way
    refetch,
  };
}
