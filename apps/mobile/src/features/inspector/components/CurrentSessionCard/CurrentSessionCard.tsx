import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { SessionWithStats } from '../../lib/types';

interface CurrentSessionCardProps {
  session: SessionWithStats | null;
}

export function CurrentSessionCard({ session }: CurrentSessionCardProps) {
  const router = useRouter();

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>CURRENT SESSION</Text>
        <View style={styles.emptyCard}>
          <Ionicons
            name="calendar-outline"
            size={moderateScale(48)}
            color={theme.colors.text.tertiary}
          />
          <Text style={styles.emptyText}>No active session right now</Text>
          <Text style={styles.emptySubtext}>Check upcoming sessions below</Text>
        </View>
      </View>
    );
  }

  const handleScanPress = () => {
    router.push('/(inspector-tabs)/scanner');
  };

  const handleViewAttendeesPress = () => {
    router.push({
      pathname: '/(screens)/(inspector)/attendees',
      params: {
        date: session.date.toString(),
        timeSlot: session.timeSlot,
        venue: session.venue,
      },
    });
  };

  // Determine if session is currently active or upcoming
  const isLive = session.isActive;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CURRENT SESSION</Text>
      
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Ionicons
              name="time"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.timeText}>{session.timeSlot}</Text>
          </View>
          {isLive ? (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : (
            <View style={styles.upcomingBadge}>
              <Ionicons
                name="time-outline"
                size={moderateScale(12)}
                color={theme.colors.primary[500]}
              />
              <Text style={styles.upcomingText}>UPCOMING</Text>
            </View>
          )}
        </View>

        <View style={styles.venueRow}>
          <Ionicons
            name="location"
            size={moderateScale(16)}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.venueText}>{session.venue}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{session.stats.totalAttendees}</Text>
            <Text style={styles.statLabel}>Expected</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.semantic.success }]}>
              {session.stats.checkedIn}
            </Text>
            <Text style={styles.statLabel}>Check-In</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.purple[500] }]}>
              {session.stats.completed}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressText}>
              {session.stats.checkedIn}/{session.stats.totalAttendees} ({Math.round((session.stats.checkedIn / session.stats.totalAttendees) * 100) || 0}%)
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${Math.min((session.stats.checkedIn / session.stats.totalAttendees) * 100, 100) || 0}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleScanPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="qr-code-outline"
              size={moderateScale(20)}
              color="#FFFFFF"
            />
            <Text style={styles.primaryButtonText}>Scan QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewAttendeesPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name="people-outline"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.secondaryButtonText}>View Attendees</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: verticalScale(12),
  },
  card: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  emptyCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(32),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginTop: verticalScale(12),
  },
  emptySubtext: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginTop: verticalScale(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginLeft: scale(8),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.semantic.error}15`,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
  },
  liveDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: theme.colors.semantic.error,
    marginRight: scale(6),
  },
  liveText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.semantic.error,
    letterSpacing: 0.5,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary[500]}15`,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
    gap: scale(4),
  },
  upcomingText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: theme.colors.primary[500],
    letterSpacing: 0.5,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  venueText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginLeft: scale(4),
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginBottom: verticalScale(16),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(20),
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
  progressSection: {
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  progressLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  progressText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: theme.colors.primary[500],
  },
  progressBarContainer: {
    height: moderateScale(8),
    backgroundColor: theme.colors.border.light,
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: moderateScale(4),
  },
  buttonRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    gap: scale(8),
  },
  primaryButton: {
    backgroundColor: theme.colors.primary[500],
  },
  primaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: `${theme.colors.primary[500]}15`,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  secondaryButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: theme.colors.primary[500],
  },
});
