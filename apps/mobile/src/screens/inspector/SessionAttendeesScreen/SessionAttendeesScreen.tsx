import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@shared/styles/theme';
import { SkeletonLoader, ErrorState } from '@shared/components';
import { HEADER_CONSTANTS } from '@shared/constants/header.constants';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { useSessionAttendees } from '@features/inspector/hooks';
import { AttendeeListItem } from '@features/inspector/components';
import { AttendeeWithStatus } from '@features/inspector/lib/types';

export function SessionAttendeesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    date: string;
    timeSlot: string;
    venue: string;
  }>();

  const orientationDate = Number(params.date);
  const timeSlot = params.timeSlot || '';
  const venue = params.venue || '';

  const {
    attendees,
    stats,
    searchQuery,
    setSearchQuery,
    isLoading,
    isEmpty,
    refreshing,
    handleRefresh,
  } = useSessionAttendees(orientationDate, timeSlot, venue);


  const renderAttendee = ({ item }: { item: AttendeeWithStatus }) => (
    <AttendeeListItem attendee={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="people-outline"
        size={moderateScale(64)}
        color={theme.colors.text.tertiary}
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : 'No Attendees'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'Try adjusting your search query.'
          : 'No one has registered for this session yet.'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <>
      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statText}>
            <Text style={styles.statValue}>{stats.checkedIn + stats.completed}</Text>
            {' of '}
            <Text style={styles.statValue}>{stats.total}</Text>
            {' attendees checked in'}
          </Text>
        </View>
        <View style={styles.statusBreakdown}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.semantic.success }]} />
            <Text style={styles.statusText}>{stats.completed} completed</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.semantic.warning }]} />
            <Text style={styles.statusText}>{stats.checkedIn} ongoing</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.text.tertiary }]} />
            <Text style={styles.statusText}>{stats.pending} pending</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={moderateScale(20)}
          color={theme.colors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search attendee by name..."
          placeholderTextColor={theme.colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={moderateScale(20)}
              color={theme.colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      {attendees && attendees.length > 0 && (
        <Text style={styles.resultsCount}>
          {searchQuery ? `${attendees.length} result${attendees.length !== 1 ? 's' : ''}` : `${attendees.length} attendee${attendees.length !== 1 ? 's' : ''}`}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
            <Text style={styles.title}>Session Attendees</Text>
            <Text style={styles.subtitle}>
              {timeSlot} • {venue}
            </Text>
          </View>
        </View>
      </View>

      {/* Attendees List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Loading attendees...</Text>
          <SkeletonLoader count={5} height={100} style={styles.skeletonList} />
        </View>
      ) : (
        <FlatList
          data={attendees}
          renderItem={renderAttendee}
          keyExtractor={(item) => item.applicationId}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={theme.colors.primary[500]}
            />
          }
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
    borderBottomLeftRadius: moderateScale(HEADER_CONSTANTS.BORDER_RADIUS),
    borderBottomRightRadius: moderateScale(HEADER_CONSTANTS.BORDER_RADIUS),
    paddingHorizontal: scale(HEADER_CONSTANTS.HORIZONTAL_PADDING),
    paddingTop: verticalScale(HEADER_CONSTANTS.TOP_PADDING),
    paddingBottom: verticalScale(HEADER_CONSTANTS.BOTTOM_PADDING),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: scale(12),
    padding: moderateScale(4),
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(HEADER_CONSTANTS.TITLE_FONT_SIZE),
    fontWeight: HEADER_CONSTANTS.TITLE_FONT_WEIGHT,
    color: HEADER_CONSTANTS.WHITE,
    marginBottom: verticalScale(2),
  },
  subtitle: {
    fontSize: moderateScale(HEADER_CONSTANTS.SUBTITLE_FONT_SIZE),
    color: HEADER_CONSTANTS.WHITE,
    opacity: HEADER_CONSTANTS.SUBTITLE_OPACITY,
  },
  listContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(100),
  },
  statsContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    marginBottom: verticalScale(12),
  },
  statText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statusBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(16),
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginRight: scale(6),
  },
  statusText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: scale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(15),
    color: theme.colors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: moderateScale(4),
  },
  resultsCount: {
    fontSize: moderateScale(13),
    color: theme.colors.text.tertiary,
    marginBottom: verticalScale(12),
    marginLeft: scale(4),
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
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
  loadingContainer: {
    flex: 1,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(24),
  },
  loadingTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: verticalScale(16),
  },
  skeletonList: {
    gap: verticalScale(12),
  },
});
