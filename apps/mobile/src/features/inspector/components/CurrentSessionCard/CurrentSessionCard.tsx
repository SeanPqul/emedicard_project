import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { isSameDay } from 'date-fns';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { SessionWithStats } from '../../lib/types';

const PHT_TZ = 'Asia/Manila';

interface CurrentSessionCardProps {
  session: SessionWithStats | null;
  serverTime?: number; // Server time for tamper-proof calculations
}

// Parse time string to minutes since midnight
function parseTimeString(timeStr: string): number | null {
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return null;
  let hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const period = match[3];
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

// Calculate session timestamps from date and scheduledTime
function getSessionTimestamps(
  sessionDate: number,
  scheduledTime: string
): { startTs: number; endTs: number } | null {
  const [startTime, endTime] = scheduledTime.split(' - ');
  if (!startTime || !endTime) return null;

  const startMins = parseTimeString(startTime);
  const endMins = parseTimeString(endTime);
  if (startMins === null || endMins === null) return null;

  // sessionDate is already a UTC timestamp representing PHT midnight
  // Add the minutes offset directly to get session start/end in UTC
  const startTs = sessionDate + (startMins * 60 * 1000);
  const endTs = sessionDate + (endMins * 60 * 1000);

  return {
    startTs,
    endTs,
  };
}

// Helper to calculate time context using PHT
function getTimeContext(
  session: SessionWithStats,
  currentTime: number
): string {
  const timestamps = getSessionTimestamps(session.date, session.scheduledTime);
  if (!timestamps) return '';

  const { startTs, endTs } = timestamps;
  const now = currentTime;
  const nowPHT = toZonedTime(now, PHT_TZ);
  const startPHT = toZonedTime(startTs, PHT_TZ);

  // Check if session is currently running (by time, not just flag)
  const isRunningByTime = now >= startTs && now < endTs;
  
  // Trust backend isActive flag for LIVE status OR if time is within session bounds
  if (session.isActive || isRunningByTime) {
    const minsLeft = Math.max(0, Math.ceil((endTs - now) / 60000));
    if (minsLeft < 15) return `⚠️ Ending in ${minsLeft} minute${minsLeft !== 1 ? 's' : ''}`;
    if (minsLeft < 60) return `Ends in ${minsLeft} minute${minsLeft !== 1 ? 's' : ''}`;
    const hoursLeft = Math.floor(minsLeft / 60);
    const remainingMins = minsLeft % 60;
    return `Ends in ${hoursLeft}h ${remainingMins}m`;
  }

  // For upcoming sessions (before start time)
  if (now < startTs) {
    const minsUntil = Math.max(0, Math.ceil((startTs - now) / 60000));
    const todayInPHT = isSameDay(nowPHT, startPHT);

    if (todayInPHT) {
      // Show immediate transition when very close to start
      if (minsUntil === 0) return 'Starting now...';
      if (minsUntil < 60) return `Starts in ${minsUntil} minute${minsUntil !== 1 ? 's' : ''}`;
      const hoursUntil = Math.floor(minsUntil / 60);
      const remainingMins = minsUntil % 60;
      return `Starts in ${hoursUntil}h ${remainingMins}m`;
    }

    return `Starts ${formatInTimeZone(startTs, PHT_TZ, "EEE, MMM d 'at' h:mm a")}`;
  }

  // Only show "Session ended" if we're actually past the end time
  if (now >= endTs) {
    return 'Session ended';
  }
  
  // Fallback (should rarely happen)
  return '';
}

export function CurrentSessionCard({ session, serverTime }: CurrentSessionCardProps) {
  const router = useRouter();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Update timer every second for live countdown (both upcoming and active sessions)
  React.useEffect(() => {
    if (session) {
      const timer = setInterval(() => {
        forceUpdate();
      }, 1000); // Update every second for smooth countdown and instant status changes

      return () => clearInterval(timer);
    }
    return undefined;
  }, [session]);

  // Calculate time context during every render (calculation is very cheap)
  // For upcoming sessions, this will update every second due to forceUpdate
  let timeContext = '';
  if (session && serverTime) {
    // Use the serverTime prop passed from useInspectorDashboard (tamper-proof)
    // The hook already calculates accurate current time using server offset
    timeContext = getTimeContext(session, serverTime);
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>SESSION</Text>
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

  const handleViewAttendeesPress = () => {
    router.push({
      pathname: '/(screens)/(inspector)/attendees',
      params: {
        date: session.date.toString(),
        scheduledTime: session.scheduledTime,
        venue: session.venue,
        returnTo: 'dashboard', // Indicate we came from dashboard
      },
    });
  };

  // Determine if session is currently active or upcoming
  const isLive = session.isActive;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SESSION</Text>

      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Ionicons
              name="time"
              size={moderateScale(20)}
              color={theme.colors.primary[500]}
            />
            <Text style={styles.cardTimeText}>{session.scheduledTime}</Text>
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

        {/* Time Context & Capacity */}
        <View style={styles.infoRow}>
          {timeContext && (
            <View style={styles.infoChip}>
              <Ionicons
                name="time-outline"
                size={moderateScale(14)}
                color={theme.colors.primary[500]}
              />
              <Text style={styles.infoChipText}>{timeContext}</Text>
            </View>
          )}
          <View style={styles.infoChip}>
            <Ionicons
              name="people-outline"
              size={moderateScale(14)}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.infoChipText}>
              {session.currentBookings}/{session.maxCapacity} capacity
            </Text>
          </View>
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

        <TouchableOpacity
          style={styles.viewAttendeesButton}
          onPress={handleViewAttendeesPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people-outline"
            size={moderateScale(20)}
            color="#FFFFFF"
          />
          <Text style={styles.viewAttendeesButtonText}>View Attendees</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
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
    fontSize: moderateScale(11),
    fontWeight: '600',
    color: theme.colors.primary[500],
    letterSpacing: 0.3,
  },
  timezoneLabel: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: theme.colors.text.tertiary,
    letterSpacing: 0.3,
  },
  cardTimeText: {
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
    marginBottom: verticalScale(12),
  },
  venueText: {
    fontSize: moderateScale(14),
    color: theme.colors.text.secondary,
    marginLeft: scale(4),
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    marginBottom: verticalScale(16),
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  infoChipText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: theme.colors.text.secondary,
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
  viewAttendeesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    gap: scale(8),
    backgroundColor: theme.colors.primary[500],
  },
  viewAttendeesButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
