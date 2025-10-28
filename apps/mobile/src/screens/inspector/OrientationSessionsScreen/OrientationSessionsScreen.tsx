import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { toZonedTime } from 'date-fns-tz';
import { theme } from '@shared/styles/theme';
import { SkeletonLoader, ErrorState } from '@shared/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { useOrientationSessions } from '@features/inspector/hooks';
import { SessionCard } from '@features/inspector/components';
import { formatDate } from '@features/inspector/lib/utils';

const PHT_TZ = 'Asia/Manila';

type FilterType = 'all' | 'upcoming' | 'completed';
type SortType = 'time-asc' | 'time-desc';

export function OrientationSessionsScreen() {
  const router = useRouter();
  const {
    sessions,
    schedules,
    selectedDate,
    changeDate,
    goToToday,
    isToday,
    sessionCounts,
    isLoading,
    isEmpty,
    error,
    refetch,
  } = useOrientationSessions();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('time-desc');

  // Convert PHT midnight timestamp to a Date for the picker display
  // This must be at the top level, not inside conditional rendering
  const datePickerValue = useMemo(() => {
    const phtDate = toZonedTime(selectedDate, PHT_TZ);
    const y = phtDate.getFullYear();
    const m = phtDate.getMonth();
    const d = phtDate.getDate();
    // Return a device-local Date at noon for stable picker display
    return new Date(y, m, d, 12, 0, 0, 0);
  }, [selectedDate]);

  const handleDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (date) {
      // Convert the device-local date picker selection to PHT
      // Extract Y-M-D from picker in device timezone, then interpret as PHT
      const y = date.getFullYear();
      const m = date.getMonth();
      const d = date.getDate();
      
      // Create a Date object at noon in device timezone to avoid DST issues
      // This represents the user's intended calendar date
      const pickerDate = new Date(y, m, d, 12, 0, 0, 0);
      
      // Pass to changeDate which will apply getStartOfDay (PHT midnight)
      changeDate(pickerDate.getTime());
    }
  };


  // Filter and sort sessions - use backend status flags directly from schedules
  const filteredSessions = React.useMemo(() => {
    if (!sessions || !schedules) return null;
    
    let filtered = sessions;
    
    // Apply filter using backend-provided status
    if (filter !== 'all') {
      filtered = sessions.filter(session => {
        // Find the corresponding schedule with backend status
        const schedule = schedules.find((s: any) => s.scheduleId === session._id);
        if (!schedule) return false;
        
        if (filter === 'upcoming') return schedule.isUpcoming === true;
        if (filter === 'completed') return schedule.isPast === true;
        return true;
      });
    }
    
    // Apply sort (already sorted by time-desc in hook, just reverse if needed)
    if (sortBy === 'time-asc') {
      filtered = [...filtered].reverse();
    }
    
    return filtered;
  }, [sessions, schedules, filter, sortBy]);

  // Build subtitle with quick stats
  const buildSubtitle = () => {
    if (isLoading) return 'Loading...';
    if (isEmpty) return 'No sessions scheduled';
    
    const parts = [];
    parts.push(`${sessionCounts.total} ${sessionCounts.total === 1 ? 'session' : 'sessions'}`);
    if (sessionCounts.upcoming > 0) parts.push(`${sessionCounts.upcoming} upcoming`);
    
    return parts.join(' • ');
  };


  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Improved Green Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Row 1: Title + Action Button */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleContainer}>
              <Ionicons
                name="calendar"
                size={HEADER_CONSTANTS.ICON_SIZE}
                color={HEADER_CONSTANTS.WHITE}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Orientation Sessions</Text>
                <Text style={styles.subtitle}>{buildSubtitle()}</Text>
              </View>
            </View>
            
            {/* Sort Button */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSortModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={HEADER_CONSTANTS.ACTION_BUTTON_ICON_SIZE}
                color={HEADER_CONSTANTS.WHITE}
              />
            </TouchableOpacity>
          </View>

          {/* Row 2: Inline Date Picker */}
          <View style={styles.datePickerRow}>
            <TouchableOpacity
              style={styles.headerDatePicker}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <View style={styles.datePickerContent}>
                <Ionicons
                  name="calendar-outline"
                  size={moderateScale(16)}
                  color={HEADER_CONSTANTS.WHITE}
                />
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              </View>
              <Ionicons
                name="chevron-down"
                size={moderateScale(16)}
                color={HEADER_CONSTANTS.WHITE_TRANSPARENT}
              />
            </TouchableOpacity>

            {!isToday && (
              <TouchableOpacity
                style={styles.todayButton}
                onPress={goToToday}
                activeOpacity={0.7}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={datePickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >

        {/* Quick Filter Chips & Metrics */}
        {!isEmpty && (
          <View style={styles.quickSection}>
            {/* Filter Chips */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}
            >
              {[{ value: 'all', label: 'All', icon: 'list' }, 
                { value: 'upcoming', label: 'Upcoming', icon: 'time' }, 
                { value: 'completed', label: 'Completed', icon: 'checkmark-circle' }].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filter === option.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilter(option.value as FilterType)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={moderateScale(16)}
                    color={filter === option.value ? theme.colors.primary[500] : theme.colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      filter === option.value && styles.filterChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Actionable Metrics */}
            <View style={styles.metricsCard}>
              <View style={styles.metricRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {sessions?.reduce((sum, s) => sum + s.currentBookings, 0) || 0}
                  </Text>
                  <Text style={styles.metricLabel}>Total Attendees</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {sessions?.reduce((sum, s) => sum + s.stats.checkedIn, 0) || 0}
                  </Text>
                  <Text style={styles.metricLabel}>Checked In</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {sessions?.reduce((sum, s) => sum + s.stats.completed, 0) || 0}
                  </Text>
                  <Text style={styles.metricLabel}>Completed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Sessions List */}
        <View style={styles.sessionsSection}>
          {isLoading ? (
            <>
              <Text style={styles.listTitle}>Loading sessions...</Text>
              <SkeletonLoader count={3} height={140} />
            </>
          ) : error ? (
            <ErrorState
              type="network"
              title="Failed to Load Sessions"
              message="Unable to fetch orientation sessions. Please check your connection and try again."
              onRetry={refetch}
              variant="card"
            />
          ) : isEmpty ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={moderateScale(64)}
                color={theme.colors.text.tertiary}
              />
              <Text style={styles.emptyTitle}>No Sessions Scheduled</Text>
              <Text style={styles.emptyText}>
                There are no orientation sessions scheduled for this date.
              </Text>
              {!isToday && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={goToToday}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyButtonText}>View Today&apos;s Sessions</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                  {filteredSessions?.length || 0} {filteredSessions?.length === 1 ? 'Session' : 'Sessions'}
                </Text>
              </View>
              {filteredSessions?.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          />
          <View style={styles.sortModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Sessions</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={moderateScale(24)} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionLabel}>Order</Text>
              <View style={styles.sortOptions}>
                {[{ value: 'time-desc', label: 'Newest First', icon: 'arrow-down' }, 
                  { value: 'time-asc', label: 'Oldest First', icon: 'arrow-up' }].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortBy === option.value && styles.sortOptionActive,
                    ]}
                    onPress={() => {
                      setSortBy(option.value as SortType);
                      setShowSortModal(false);
                    }}
                  >
                    <View style={styles.sortOptionLeft}>
                      <Ionicons
                        name={option.icon as any}
                        size={moderateScale(20)}
                        color={sortBy === option.value ? theme.colors.primary[500] : theme.colors.text.secondary}
                      />
                      <View>
                        <Text
                          style={[
                            styles.sortOptionText,
                            sortBy === option.value && styles.sortOptionTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>
                    </View>
                    {sortBy === option.value && (
                      <Ionicons
                        name="checkmark-circle"
                        size={moderateScale(22)}
                        color={theme.colors.primary[500]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
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
    borderBottomLeftRadius: moderateScale(HEADER_CONSTANTS.BORDER_RADIUS),
    borderBottomRightRadius: moderateScale(HEADER_CONSTANTS.BORDER_RADIUS),
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: HEADER_CONSTANTS.TOP_PADDING,
    paddingBottom: HEADER_CONSTANTS.BOTTOM_PADDING,
  },
  headerContent: {
    gap: verticalScale(16),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: HEADER_CONSTANTS.ICON_TEXT_GAP,
    flex: 1,
  },
  title: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    fontWeight: HEADER_CONSTANTS.TITLE_FONT_WEIGHT,
    color: HEADER_CONSTANTS.WHITE,
    lineHeight: HEADER_CONSTANTS.TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    marginTop: HEADER_CONSTANTS.TITLE_MARGIN_BOTTOM,
  },
  actionButton: {
    width: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ACTION_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ACTION_BUTTON_RADIUS,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  headerDatePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  dateText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
  },
  todayButton: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: HEADER_CONSTANTS.WHITE,
  },
  todayButtonText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  scrollView: {
    flex: 1,
  },
  quickSection: {
    paddingTop: verticalScale(16),
    gap: verticalScale(16),
  },
  filterChipsContainer: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterChipActive: {
    backgroundColor: `${theme.colors.primary[500]}10`,
    borderColor: theme.colors.primary[500],
  },
  filterChipText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.primary[500],
    fontWeight: '600',
  },
  metricsCard: {
    marginHorizontal: scale(16),
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: theme.colors.primary[500],
  },
  metricLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: theme.colors.border.light,
  },
  sessionsSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  listHeader: {
    marginBottom: verticalScale(12),
  },
  listTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filterIndicator: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: theme.colors.primary[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: verticalScale(48),
    paddingHorizontal: scale(32),
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
    lineHeight: moderateScale(20),
  },
  emptyButton: {
    marginTop: verticalScale(24),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(12),
  },
  emptyButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
  },
  quickActionSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    gap: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  scanButtonText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
  },
  bottomSpacer: {
    height: verticalScale(90),
  },
  // Filter Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sortModal: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(32),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  modalSection: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(20),
  },
  sectionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(12),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortOptions: {
    gap: verticalScale(10),
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    backgroundColor: theme.colors.background.secondary,
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sortOptionActive: {
    backgroundColor: `${theme.colors.primary[500]}10`,
    borderColor: theme.colors.primary[500],
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  sortOptionText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sortOptionTextActive: {
    color: theme.colors.primary[500],
  },
});
