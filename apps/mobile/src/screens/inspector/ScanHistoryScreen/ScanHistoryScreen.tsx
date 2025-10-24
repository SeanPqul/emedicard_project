import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '@shared/styles/theme';
import { SkeletonLoader, ErrorState } from '@shared/components';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { useScanHistory } from '@features/inspector/hooks/useScanHistory';
import { ScanHistoryItem } from '@features/inspector/components/ScanHistoryItem';
import { formatDate } from '@features/inspector/lib/utils';

/**
 * ScanHistoryScreen
 * 
 * Displays inspector's personal scan log for accountability and reporting.
 * 
 * Features:
 * - Real-time scan history from Convex
 * - Date range filtering (Today, Last 7 days, Last 30 days, Custom)
 * - Scan type filtering (All, Check-in only, Check-out only)
 * - Grouped by date with relative date labels
 * - Pull-to-refresh
 * - Empty states
 * - Statistics summary
 */
export function ScanHistoryScreen() {
  const router = useRouter();
  const {
    groupedHistory,
    stats,
    dateFilter,
    scanTypeFilter,
    changeDateFilter,
    setScanTypeFilter,
    setCustomRange,
    isLoading,
    isEmpty,
    refreshing,
    handleRefresh,
  } = useScanHistory();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [customStartDate, setCustomStartDate] = useState(new Date());
  const [customEndDate, setCustomEndDate] = useState(new Date());

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      if (datePickerMode === 'start') {
        setCustomStartDate(selectedDate);
      } else {
        setCustomEndDate(selectedDate);
      }

      // If both dates are set, apply custom range
      if (datePickerMode === 'end' || dateFilter === 'custom') {
        const start = datePickerMode === 'start' ? selectedDate : customStartDate;
        const end = datePickerMode === 'end' ? selectedDate : customEndDate;
        setCustomRange(start.getTime(), end.getTime());
      }
    }
  };

  const openDatePicker = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="document-text" size={moderateScale(28)} color="#FFFFFF" />
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Scan History</Text>
            <Text style={styles.headerSubtitle}>My attendance scans</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Statistics Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Scan Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.semantic.info }]}>
                {stats.checkIns}
              </Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.semantic.success }]}>
                {stats.checkOuts}
              </Text>
              <Text style={styles.statLabel}>Check-outs</Text>
            </View>
          </View>
        </View>

        {/* Filter Controls */}
        <View style={styles.filtersCard}>
          <Text style={styles.filtersTitle}>Filters</Text>

          {/* Date Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.filterButtons}>
              {(['today', 'last-7-days', 'last-30-days', 'custom'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    dateFilter === filter && styles.filterButtonActive,
                  ]}
                  onPress={() => {
                    changeDateFilter(filter);
                    if (filter === 'custom') {
                      openDatePicker('start');
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      dateFilter === filter && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter === 'today' && 'Today'}
                    {filter === 'last-7-days' && 'Last 7 Days'}
                    {filter === 'last-30-days' && 'Last 30 Days'}
                    {filter === 'custom' && 'Custom'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date Range Picker */}
            {dateFilter === 'custom' && (
              <View style={styles.customDateContainer}>
                <TouchableOpacity
                  style={styles.customDateButton}
                  onPress={() => openDatePicker('start')}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={moderateScale(16)}
                    color={theme.colors.primary[500]}
                  />
                  <Text style={styles.customDateText}>
                    From: {formatDate(customStartDate.getTime())}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customDateButton}
                  onPress={() => openDatePicker('end')}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={moderateScale(16)}
                    color={theme.colors.primary[500]}
                  />
                  <Text style={styles.customDateText}>
                    To: {formatDate(customEndDate.getTime())}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Scan Type Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Scan Type</Text>
            <View style={styles.filterButtons}>
              {(['all', 'check-in', 'check-out'] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    scanTypeFilter === filter && styles.filterButtonActive,
                  ]}
                  onPress={() => setScanTypeFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      scanTypeFilter === filter && styles.filterButtonTextActive,
                    ]}
                  >
                    {filter === 'all' && 'All'}
                    {filter === 'check-in' && 'Check-in'}
                    {filter === 'check-out' && 'Check-out'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Scan History List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingTitle}>Loading scan history...</Text>
            <SkeletonLoader count={4} height={120} />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={moderateScale(64)}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No Scans Found</Text>
            <Text style={styles.emptyText}>
              No scan history for the selected filters.
            </Text>
          </View>
        ) : (
          groupedHistory?.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>
                {group.date}
              </Text>
              {group.scans.map((scan, index) => (
                <ScanHistoryItem key={`${scan.timestamp}-${index}`} scan={scan} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Scan Button */}
      {!isEmpty && (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/(inspector-tabs)/scanner')}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code" size={moderateScale(28)} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'start' ? customStartDate : customEndDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  headerIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: moderateScale(22),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    fontSize: moderateScale(13),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: scale(16),
    paddingBottom: verticalScale(100),
  },
  statsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(16),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: theme.colors.primary[500],
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border.light,
  },
  filtersCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(16),
  },
  filterGroup: {
    marginBottom: verticalScale(16),
  },
  filterLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  filterButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  filterButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  customDateContainer: {
    flexDirection: 'row',
    gap: scale(8),
    marginTop: verticalScale(8),
  },
  customDateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
  },
  customDateText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  dateGroup: {
    marginBottom: verticalScale(24),
  },
  dateHeader: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(64),
  },
  emptyTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
  },
  emptyText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: scale(16),
    bottom: verticalScale(90),
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    paddingVertical: verticalScale(24),
  },
  loadingTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(16),
  },
});
