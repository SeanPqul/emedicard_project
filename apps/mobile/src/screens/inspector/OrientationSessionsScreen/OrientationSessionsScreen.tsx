import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '@shared/styles/theme';
import { SkeletonLoader, ErrorState } from '@shared/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { useOrientationSessions } from '@features/inspector/hooks';
import { SessionCard } from '@features/inspector/components';
import { formatDate } from '@features/inspector/lib/utils';

export function OrientationSessionsScreen() {
  const router = useRouter();
  const {
    sessions,
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

  const handleDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (date) {
      changeDate(date.getTime());
    }
  };

  const handleScanPress = () => {
    router.push('/(screens)/(inspector)/orientation-attendance');
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Green Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={HEADER_CONSTANTS.ICON_SIZE}
              color={HEADER_CONSTANTS.WHITE}
            />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Orientation Sessions</Text>
            <Text style={styles.subtitle}>View sessions by date</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector */}
        <View style={styles.dateSection}>
          <View style={styles.dateHeader}>
            <Text style={styles.sectionTitle}>
              {isToday ? "TODAY'S SESSIONS" : 'SESSIONS'}
            </Text>
            {!isToday && (
              <TouchableOpacity
                style={styles.todayButton}
                onPress={goToToday}
                activeOpacity={0.7}
              >
                <Text style={styles.todayButtonText}>Go to Today</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.datePickerContent}>
              <Ionicons
                name="calendar"
                size={moderateScale(20)}
                color={theme.colors.primary[500]}
              />
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>
            <Ionicons
              name="chevron-down"
              size={moderateScale(20)}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(selectedDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* Session Stats */}
        {!isEmpty && (
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sessionCounts.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.semantic.success }]}>
                  {sessionCounts.completed}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.semantic.warning }]}>
                  {sessionCounts.active}
                </Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.blue[500] }]}>
                  {sessionCounts.upcoming}
                </Text>
                <Text style={styles.statLabel}>Upcoming</Text>
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
                  <Text style={styles.emptyButtonText}>View Today's Sessions</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.listTitle}>
                {sessionCounts.total} {sessionCounts.total === 1 ? 'Session' : 'Sessions'}
              </Text>
              {sessions?.map((session) => (
                <SessionCard key={session._id} session={session} />
              ))}
            </>
          )}
        </View>

        {/* Quick Scan Button */}
        {!isEmpty && (
          <View style={styles.quickActionSection}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name="qr-code"
                size={moderateScale(24)}
                color={HEADER_CONSTANTS.WHITE}
              />
              <Text style={styles.scanButtonText}>Scan QR Code</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    height: HEADER_CONSTANTS.ICON_BUTTON_SIZE,
    borderRadius: HEADER_CONSTANTS.ICON_BUTTON_SIZE / 2,
    backgroundColor: HEADER_CONSTANTS.WHITE_OVERLAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: HEADER_CONSTANTS.ICON_TEXT_GAP,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    fontWeight: '600',
    color: HEADER_CONSTANTS.WHITE,
    lineHeight: HEADER_CONSTANTS.TITLE_LINE_HEIGHT,
  },
  subtitle: {
    fontSize: HEADER_CONSTANTS.SUBTITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.WHITE_TRANSPARENT,
    marginTop: verticalScale(2),
  },
  scrollView: {
    flex: 1,
  },
  dateSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
  },
  todayButton: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    backgroundColor: `${theme.colors.primary[500]}15`,
  },
  todayButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  dateText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  statsSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border.light,
  },
  sessionsSection: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  listTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
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
    height: verticalScale(24),
  },
});
