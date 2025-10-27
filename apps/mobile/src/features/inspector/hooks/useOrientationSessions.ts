import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { SessionWithStats } from '../lib/types';
import { getStartOfDay, enrichSessionData } from '../lib/utils';

/**
 * Hook for fetching orientation sessions for a specific date
 * Provides date selection and session data with computed statistics
 */
export function useOrientationSessions(initialDate?: number) {
  const [selectedDate, setSelectedDate] = useState<number>(
    initialDate || getStartOfDay(Date.now())
  );

  // Fetch orientation schedules for the selected date (includes schedules with 0 attendees)
  const schedules = useQuery(
    api.orientationSchedules.getSchedulesForDate,
    { selectedDate }
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

  // Helper to go to today
  const goToToday = () => {
    setSelectedDate(getStartOfDay(Date.now()));
  };

  // Check if viewing today
  const isToday = useMemo(() => {
    const today = getStartOfDay(Date.now());
    return selectedDate === today;
  }, [selectedDate]);

  // Count sessions by status
  const sessionCounts = useMemo(() => {
    if (!sessions) {
      return { total: 0, upcoming: 0, active: 0, completed: 0 };
    }

    const now = Date.now();
    
    return sessions.reduce(
      (counts, session) => {
        const [startTime, endTime] = session.timeSlot.split(' - ');
        const sessionDate = new Date(session.date);
        
        // Parse start time
        if (!startTime || !endTime) return counts;
        const startMatch = startTime.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (startMatch) {
          let startHour = parseInt(startMatch[1] || '0', 10);
          const startMin = parseInt(startMatch[2] || '0', 10);
          const isPM = startMatch[3] === 'PM';
          
          if (isPM && startHour !== 12) startHour += 12;
          if (!isPM && startHour === 12) startHour = 0;
          
          sessionDate.setHours(startHour, startMin, 0, 0);
          const sessionStart = sessionDate.getTime();
          
          // Parse end time for session end
          const endMatch = endTime.match(/(\d+):(\d+)\s*(AM|PM)/);
          if (endMatch) {
            let endHour = parseInt(endMatch[1] || '0', 10);
            const endMin = parseInt(endMatch[2] || '0', 10);
            const endIsPM = endMatch[3] === 'PM';
            
            if (endIsPM && endHour !== 12) endHour += 12;
            if (!endIsPM && endHour === 12) endHour = 0;
            
            const sessionEndDate = new Date(session.date);
            sessionEndDate.setHours(endHour, endMin, 0, 0);
            const sessionEnd = sessionEndDate.getTime();
            
            if (now >= sessionStart && now <= sessionEnd) {
              counts.active++;
            } else if (now < sessionStart) {
              counts.upcoming++;
            } else {
              counts.completed++;
            }
          }
        }
        
        counts.total++;
        return counts;
      },
      { total: 0, upcoming: 0, active: 0, completed: 0 }
    );
  }, [sessions]);

  // Convex doesn't directly expose errors, but we can infer from undefined schedules after loading
  // For now, we'll return null for error state (can be enhanced later)
  const refetch = () => {
    // Convex automatically refetches on retry
    // We can force a refetch by changing the date slightly and back
    const currentDate = selectedDate;
    setSelectedDate(currentDate + 1);
    setTimeout(() => setSelectedDate(currentDate), 100);
  };

  return {
    sessions,
    schedules, // Raw schedules with backend status flags
    selectedDate,
    changeDate,
    goToToday,
    isToday,
    sessionCounts,
    isLoading: schedules === undefined,
    isEmpty: sessions?.length === 0,
    error: null, // Convex doesn't expose errors in this way
    refetch,
  };
}
