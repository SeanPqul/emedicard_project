import { useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import {
  DashboardData,
  DashboardStats,
  SessionWithStats,
} from '../lib/types';
import {
  getStartOfDay,
  calculateSessionStats,
  enrichSessionData,
  isTimeSlotActive,
} from '../lib/utils';

/**
 * Hook for Inspector Dashboard data
 * Fetches orientation schedules for today and calculates statistics
 */
export function useInspectorDashboard() {
  const today = useMemo(() => getStartOfDay(Date.now()), []);

  // Fetch orientation schedules for today
  const schedules = useQuery(
    api.orientations.attendance.getOrientationSchedulesForDate,
    { selectedDate: today }
  );

  // Calculate dashboard data
  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!schedules) return null;

    // Enrich sessions with computed stats
    const enrichedSessions: SessionWithStats[] = schedules.map((schedule: any) =>
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

    // Calculate overall stats
    const stats: DashboardStats = {
      totalScheduled: 0,
      checkedIn: 0,
      checkedOut: 0,
      pending: 0,
      completed: 0,
    };

    enrichedSessions.forEach((session) => {
      stats.totalScheduled += session.stats.totalAttendees;
      stats.checkedIn += session.stats.checkedIn;
      stats.checkedOut += session.stats.completed;
      stats.pending += session.stats.pending;
      stats.completed += session.stats.completed;
    });

    // Find current active session
    const currentSession = enrichedSessions.find((session) =>
      isTimeSlotActive(session.timeSlot)
    );

    // Get upcoming sessions (after current time)
    const now = Date.now();
    const upcomingSessions = enrichedSessions
      .filter((session) => {
        const [startTime] = session.timeSlot.split(' - ');
        if (!startTime) return false;
        const sessionDate = new Date(session.date);
        const [hours, minutes] = startTime.match(/(\d+):(\d+)/)?.slice(1) || ['0', '0'];
        const isPM = startTime.includes('PM') && !startTime.startsWith('12');
        const isAM = startTime.includes('AM') && startTime.startsWith('12');
        
        let hour = parseInt(hours || '0', 10);
        if (isPM) hour += 12;
        if (isAM) hour = 0;
        
        sessionDate.setHours(hour, parseInt(minutes || '0', 10), 0, 0);
        return sessionDate.getTime() > now;
      })
      .slice(0, 5); // Limit to next 5 sessions

    return {
      stats,
      currentSession: currentSession || null,
      upcomingSessions,
      allSessions: enrichedSessions,
    };
  }, [schedules]);

  return {
    data: dashboardData,
    isLoading: schedules === undefined,
    error: null, // Convex doesn't expose errors directly
    refetch: () => {
      // Convex queries automatically refetch, but we can expose this for manual refresh
    },
  };
}
