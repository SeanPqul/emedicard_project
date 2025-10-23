import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { AttendeeWithStatus } from '../lib/types';
import { enrichAttendeeData, filterAttendeesBySearch, sortAttendees } from '../lib/utils';

/**
 * Hook for fetching and managing attendees for a specific session
 * Provides real-time updates via Convex subscriptions
 */
export function useSessionAttendees(
  orientationDate: number,
  timeSlot: string,
  orientationVenue: string
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch attendees for the session with real-time updates
  const attendeesData = useQuery(
    api.orientations.attendance.getAttendeesForSession,
    {
      orientationDate,
      timeSlot,
      orientationVenue,
    }
  );

  // Enrich attendees with computed status
  const enrichedAttendees = useMemo<AttendeeWithStatus[] | null>(() => {
    if (!attendeesData) return null;

    return attendeesData.map((attendee: any) =>
      enrichAttendeeData({
        applicationId: attendee.applicationId,
        userId: attendee.applicationId, // Using applicationId as fallback
        fullname: attendee.fullname,
        orientationStatus: attendee.orientationStatus,
        checkInTime: attendee.checkInTime,
        checkOutTime: attendee.checkOutTime,
        qrCodeUrl: attendee.qrCodeUrl || '',
      })
    );
  }, [attendeesData]);

  // Filter and sort attendees
  const filteredAttendees = useMemo(() => {
    if (!enrichedAttendees) return null;

    let result = enrichedAttendees;

    // Apply search filter
    if (searchQuery.trim()) {
      result = filterAttendeesBySearch(result, searchQuery);
    }

    // Sort by status (completed first, then checked-in, then pending)
    result = sortAttendees(result, 'status', 'asc');

    return result;
  }, [enrichedAttendees, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!enrichedAttendees) {
      return {
        total: 0,
        completed: 0,
        checkedIn: 0,
        pending: 0,
        missed: 0,
      };
    }

    return enrichedAttendees.reduce(
      (acc, attendee) => {
        acc.total++;
        if (attendee.status === 'completed') acc.completed++;
        else if (attendee.status === 'checked-in') acc.checkedIn++;
        else if (attendee.status === 'pending') acc.pending++;
        else if (attendee.status === 'missed') acc.missed++;
        return acc;
      },
      { total: 0, completed: 0, checkedIn: 0, pending: 0, missed: 0 }
    );
  }, [enrichedAttendees]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    // Convex queries automatically refetch, so we just need to wait a bit
    setTimeout(() => setRefreshing(false), 1000);
  };

  return {
    attendees: filteredAttendees,
    allAttendees: enrichedAttendees,
    stats,
    searchQuery,
    setSearchQuery,
    isLoading: attendeesData === undefined,
    isEmpty: enrichedAttendees?.length === 0,
    refreshing,
    handleRefresh,
  };
}
