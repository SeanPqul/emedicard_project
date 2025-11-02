import { useMemo, useEffect, useState } from 'react';
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
import { calculateSessionStatus } from '@backend/convex/lib/sessionStatus';

/**
 * Hook for Inspector Dashboard data
 * Fetches orientation schedules for today and calculates statistics
 * Status (isActive/isPast/isUpcoming) is calculated CLIENT-SIDE for real-time updates
 */
export function useInspectorDashboard() {
  // Check if user is authenticated
  const { isSignedIn } = useAuth();

  // Get current server time (prevents client-side time manipulation)
  const serverTime = useQuery(
    api.lib.serverTime.getCurrentServerTime,
    isSignedIn ? {} : "skip"
  );

  // Get current date from server (prevents client-side time manipulation)
  const serverDate = useQuery(
    api.lib.serverTime.getCurrentPHTDate,
    isSignedIn ? {} : "skip"
  );

  // Fetch orientation schedules for today (all sessions including active and upcoming)
  const schedules = useQuery(
    api.orientationSchedules.getSchedulesForDate,
    isSignedIn && serverDate !== undefined ? { selectedDate: serverDate } : "skip"
  );

  // State to force recalculation of status every 10 seconds
  const [tick, setTick] = useState(0);
  
  // Track when server time was fetched to calculate accurate offset
  const [serverTimeRef, setServerTimeRef] = useState<{serverTime: number, clientTime: number} | null>(null);
  
  useEffect(() => {
    if (serverTime && !serverTimeRef) {
      // Store both server time and client time when first received
      setServerTimeRef({ serverTime, clientTime: Date.now() });
    }
  }, [serverTime, serverTimeRef]);

  // Auto-refresh timer: recalculate status every 10 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate dashboard data
  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!schedules || !serverTime || !serverTimeRef) return null;

    // Calculate current server time using the offset from when it was fetched
    const elapsedTime = Date.now() - serverTimeRef.clientTime;
    const currentTime = serverTimeRef.serverTime + elapsedTime;

    // Enrich sessions with CLIENT-SIDE calculated status (real-time!)
    const enrichedSessions: SessionWithStats[] = schedules.map((schedule: any) => {
      const baseSession = {
        _id: schedule.scheduleId,
        date: schedule.date,
        scheduledTime: schedule.time,
        venue: schedule.venue.name,
        maxCapacity: schedule.totalSlots,
        currentBookings: schedule.attendeeCount,
        attendees: schedule.attendees,
      };

      const stats = calculateSessionStats(schedule.attendees);

      // Calculate status client-side using server time for accuracy
      const status = calculateSessionStatus(
        {
          date: schedule.date,
          startMinutes: schedule.startMinutes ?? 0,
          endMinutes: schedule.endMinutes ?? 1439,
        },
        currentTime
      );

      return {
        ...baseSession,
        stats,
        isActive: status.isActive,
        isPast: status.isPast,
        isFuture: status.isUpcoming,
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

    // Find current active session (use client-calculated status)
    let currentSession = enrichedSessions.find((session) => session.isActive);

    // Get upcoming sessions (use client-calculated status)
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
  }, [schedules, serverTime, serverTimeRef, tick]); // Include tick to force recalculation every 10s

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
