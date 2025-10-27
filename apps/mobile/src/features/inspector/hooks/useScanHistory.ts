import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@backend/convex/_generated/api';
import { ScanHistoryItem, GroupedScanHistory, ScanHistoryFilters } from '../lib/types';
import { groupScanHistoryByDate } from '../lib/utils';
import { getStartOfDay, getEndOfDay } from '../lib/utils';
import { DATE_FILTER_OPTIONS } from '../lib/constants';

type DateFilterOption = 'today' | 'last-7-days' | 'last-30-days' | 'custom';

/**
 * Hook for fetching and managing scan history
 * 
 * Features:
 * - Real-time updates via Convex subscriptions
 * - Date range filtering with presets
 * - Scan type filtering (check-in/check-out)
 * - Grouped by date for better UI organization
 */
export function useScanHistory() {
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('last-7-days');
  const [scanTypeFilter, setScanTypeFilter] = useState<'check-in' | 'check-out' | 'all'>('all');
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: number;
    endDate: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    if (dateFilter === 'custom' && customDateRange) {
      return customDateRange;
    }

    const now = Date.now();
    const today = getStartOfDay(now);
    
    switch (dateFilter) {
      case 'today':
        return {
          startDate: today,
          endDate: getEndOfDay(now),
        };
      case 'last-7-days':
        return {
          startDate: today - (7 * 24 * 60 * 60 * 1000),
          endDate: getEndOfDay(now),
        };
      case 'last-30-days':
        return {
          startDate: today - (30 * 24 * 60 * 60 * 1000),
          endDate: getEndOfDay(now),
        };
      default:
        return {
          startDate: today - (7 * 24 * 60 * 60 * 1000),
          endDate: getEndOfDay(now),
        };
    }
  }, [dateFilter, customDateRange]);

  // Fetch scan history from backend
  const scanHistoryData = useQuery(
    api.orientations.attendance.getInspectorScanHistory,
    {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      scanType: scanTypeFilter === 'all' ? undefined : scanTypeFilter,
      limit: 100, // Limit to 100 most recent scans
    }
  );

  // Map and group scans by date
  const groupedHistory = useMemo<GroupedScanHistory[] | null>(() => {
    if (!scanHistoryData) return null;
    if (scanHistoryData.length === 0) return [];

    // Map the data from Convex to ScanHistoryItem format
    const mappedData: ScanHistoryItem[] = scanHistoryData.map((scan: any) => ({
      _id: `${scan.applicationId}-${scan.timestamp}`, // Generate unique ID from app + timestamp
      scanType: scan.scanType as 'check-in' | 'check-out',
      timestamp: scan.timestamp,
      applicationId: scan.applicationId,
      attendeeName: scan.attendeeName,
      sessionTimeSlot: scan.timeSlot,
      sessionVenue: scan.venue,
      sessionDate: scan.orientationDate,
      inspectorId: scan.inspectorId || ('' as any), // Inspector ID is the current user (not included in response)
      duration: scan.checkOutTime && scan.checkInTime ? scan.checkOutTime - scan.checkInTime : undefined,
    }));

    return groupScanHistoryByDate(mappedData);
  }, [scanHistoryData]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!scanHistoryData) {
      return {
        total: 0,
        checkIns: 0,
        checkOuts: 0,
      };
    }

    return scanHistoryData.reduce(
      (acc: { total: number; checkIns: number; checkOuts: number }, scan: any) => {
        acc.total++;
        if (scan.scanType === 'check-in') acc.checkIns++;
        else if (scan.scanType === 'check-out') acc.checkOuts++;
        return acc;
      },
      { total: 0, checkIns: 0, checkOuts: 0 }
    );
  }, [scanHistoryData]);

  // Change date filter
  const changeDateFilter = (filter: DateFilterOption) => {
    setDateFilter(filter);
    if (filter !== 'custom') {
      setCustomDateRange(null);
    }
  };

  // Set custom date range
  const setCustomRange = (startDate: number, endDate: number) => {
    setCustomDateRange({ startDate, endDate });
    setDateFilter('custom');
  };

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    // Convex queries automatically refetch, so we just need to wait a bit
    setTimeout(() => setRefreshing(false), 1000);
  };

  return {
    groupedHistory,
    stats,
    dateFilter,
    scanTypeFilter,
    dateRange,
    changeDateFilter,
    setScanTypeFilter,
    setCustomRange,
    isLoading: scanHistoryData === undefined,
    isEmpty: groupedHistory?.length === 0,
    refreshing,
    handleRefresh,
  };
}
