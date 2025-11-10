import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { SessionWithStats } from '../../lib/types';

interface SessionCardProps {
  session: SessionWithStats;
}

export function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();
  const hasAttendees = session.stats.totalAttendees > 0;

  const handleViewAttendees = () => {
    router.push({
      pathname: '/(screens)/(inspector)/attendees',
      params: {
        date: session.date.toString(),
        scheduledTime: session.scheduledTime,
        venue: session.venue,
        returnTo: 'sessions', // Indicate we came from sessions list
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, !hasAttendees && styles.emptyCard]}
      onPress={handleViewAttendees}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Ionicons
            name="time-outline"
            size={moderateScale(18)}
            color={theme.colors.text.primary}
          />
          <Text style={styles.timeText}>{session.scheduledTime}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={moderateScale(20)}
          color={theme.colors.text.tertiary}
        />
      </View>

      <View style={styles.venueRow}>
        <Ionicons
          name="location-outline"
          size={moderateScale(14)}
          color={theme.colors.text.secondary}
        />
        <Text style={styles.venueText}>{session.venue}</Text>
      </View>

      {hasAttendees ? (
        <Text style={styles.attendeeText}>
          {session.stats.totalAttendees} attendee{session.stats.totalAttendees !== 1 ? 's' : ''} scheduled
        </Text>
      ) : (
        <View style={styles.emptyBadge}>
          <Ionicons
            name="people-outline"
            size={moderateScale(14)}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.emptyBadgeText}>No bookings yet</Text>
        </View>
      )}

      {hasAttendees && (
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.semantic.success }]} />
            <Text style={styles.statusText}>{session.stats.completed} completed</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.semantic.warning }]} />
            <Text style={styles.statusText}>{session.stats.checkedIn - session.stats.completed} ongoing</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: theme.colors.text.tertiary }]} />
            <Text style={styles.statusText}>{session.stats.pending} pending</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  emptyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(12),
    backgroundColor: `${theme.colors.text.tertiary}10`,
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
    marginBottom: verticalScale(4),
    gap: scale(6),
  },
  emptyBadgeText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: scale(6),
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  venueText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
    marginLeft: scale(4),
  },
  attendeeText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.primary,
    marginBottom: verticalScale(12),
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(12),
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
});
