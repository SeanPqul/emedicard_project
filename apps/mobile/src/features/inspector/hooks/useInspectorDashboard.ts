import { useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';
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
  getSessionBounds,
} from '../lib/utils';

/**
 * Hook for Inspector Dashboard data
 * Fetches orientation schedules for today and calculates statistics
 */
export function useInspectorDashboard() {
  // Check if user is authenticated
  const { isSignedIn } = useAuth();
  
  // Get current server time (prevents client-side time manipulation)
  const serverTime = useQuery(
    isSignedIn ? api.orientations.attendance.getCurrentServerTime : "skip"
  );
  
  // Get current date from server (prevents client-side time manipulation)
  const serverDate = useQuery(
    isSignedIn ? api.orientations.attendance.getCurrentPHTDate : "skip"
  );

  // Fetch orientation schedules for today
  const schedules = useQuery(
    api.orientations.attendance.getOrientationSchedulesForDate,
    isSignedIn && serverDate !== undefined ? { selectedDate: serverDate } : "skip"
  );

  // Calculate dashboard data
  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!schedules) return null;

    // Enrich sessions with computed stats and server-provided status
    const enrichedSessions: SessionWithStats[] = schedules.map((schedule: any) => {
      const baseSession = {
        _id: schedule.scheduleId,
        date: schedule.date,
        timeSlot: schedule.time,
        venue: schedule.venue.name,
        maxCapacity: schedule.totalSlots,
        currentBookings: schedule.attendeeCount,
        attendees: schedule.attendees,
      };
      
      const stats = calculateSessionStats(schedule.attendees);
      
      return {
        ...baseSession,
        stats,
        isActive: schedule.isActive ?? false,
        isPast: schedule.isPast ?? false,
        isFuture: schedule.isUpcoming ?? false,
      };
    });

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

    // Find current active session (use server-calculated status)
    let currentSession = enrichedSessions.find((session) => session.isActive);

    // Get upcoming sessions (use server-calculated status)
    const upcomingSessions = enrichedSessions
      .filter((session) => session.isFuture)
      .slice(0, 5); // Limit to next 5 sessions

    // If no active session, show the next upcoming session as current
    // Only if there are actually upcoming sessions
    if (!currentSession && upcomingSessions.length > 0) {
      currentSession = upcomingSessions[0];
    }

    // Avoid showing the same session in both current and upcoming lists
    const filteredUpcoming = currentSession
      ? upcomingSessions.filter((s) => s._id !== currentSession!._id)
      : upcomingSessions;

    return {
      stats,
      currentSession: currentSession || null,
      upcomingSessions: filteredUpcoming,
      allSessions: enrichedSessions,
    };
  }, [schedules]);

  return {
    data: dashboardData,
    serverTime: serverTime ?? Date.now(), // Fallback to client time during loading
    isLoading: serverTime === undefined || serverDate === undefined || schedules === undefined,
    error: null, // Convex doesn't expose errors directly
    refetch: () => {
      // Convex queries automatically refetch, but we can expose this for manual refresh
    },
  };
}
