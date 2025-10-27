import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@shared/styles/theme';
import { scale, verticalScale, moderateScale } from '@shared/utils/responsive';
import { AttendeeWithStatus } from '../../lib/types';
import { AttendanceStatusBadge } from '../AttendanceStatusBadge';
import { formatTime, formatDuration } from '../../lib/utils';

interface AttendeeListItemProps {
  attendee: AttendeeWithStatus;
}

/**
 * List item component for displaying attendee information
 * Shows name, check-in/out times, status badge, and duration
 */
export function AttendeeListItem({ attendee }: AttendeeListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Ionicons
            name="person-circle-outline"
            size={moderateScale(24)}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.name}>{attendee.fullname}</Text>
        </View>
        <AttendanceStatusBadge status={attendee.status} size="small" />
      </View>

      <View style={styles.details}>
        {attendee.checkInTime && (
          <View style={styles.timeRow}>
            <View style={styles.timeLabel}>
              <Ionicons
                name="log-in-outline"
                size={moderateScale(14)}
                color={theme.colors.semantic.success}
              />
              <Text style={styles.timeLabelText}>Checked in:</Text>
            </View>
            <Text style={styles.timeValue}>{formatTime(attendee.checkInTime)}</Text>
          </View>
        )}

        {attendee.checkOutTime && (
          <View style={styles.timeRow}>
            <View style={styles.timeLabel}>
              <Ionicons
                name="log-out-outline"
                size={moderateScale(14)}
                color={theme.colors.semantic.success}
              />
              <Text style={styles.timeLabelText}>Checked out:</Text>
            </View>
            <Text style={styles.timeValue}>{formatTime(attendee.checkOutTime)}</Text>
          </View>
        )}

        {attendee.status === 'completed' && attendee.duration && (
          <View style={styles.durationRow}>
            <Ionicons
              name="time-outline"
              size={moderateScale(14)}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.durationText}>
              Duration: {formatDuration(attendee.checkInTime!, attendee.checkOutTime!)}
            </Text>
          </View>
        )}

        {attendee.status === 'checked-in' && !attendee.checkOutTime && (
          <View style={styles.statusRow}>
            <Ionicons
              name="hourglass-outline"
              size={moderateScale(14)}
              color={theme.colors.semantic.warning}
            />
            <Text style={styles.statusMessage}>Waiting for check-out</Text>
          </View>
        )}

        {attendee.status === 'pending' && (
          <View style={styles.statusRow}>
            <Ionicons
              name="alert-circle-outline"
              size={moderateScale(14)}
              color={theme.colors.text.tertiary}
            />
            <Text style={styles.statusMessage}>Not yet checked in</Text>
          </View>
        )}

        {attendee.status === 'missed' && (
          <View style={styles.statusRow}>
            <Ionicons
              name="close-circle-outline"
              size={moderateScale(14)}
              color={theme.colors.semantic.error}
            />
            <Text style={[styles.statusMessage, { color: theme.colors.semantic.error }]}>
              Did not attend
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: scale(8),
  },
  name: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: scale(8),
    flex: 1,
  },
  details: {
    gap: verticalScale(6),
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  timeLabelText: {
    fontSize: moderateScale(13),
    color: theme.colors.text.secondary,
  },
  timeValue: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(4),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  durationText: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: verticalScale(4),
  },
  statusMessage: {
    fontSize: moderateScale(12),
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
